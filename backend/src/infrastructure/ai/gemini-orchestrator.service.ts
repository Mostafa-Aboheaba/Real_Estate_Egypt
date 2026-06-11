import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ChatDomainException,
  ChatErrorCode,
} from '../../domain/chat/failures/chat.failures';
import {
  LlmCompletionPort,
  LlmCompletionRequest,
  LlmCompletionResult,
  LlmStreamChunk,
} from '../../domain/chat/ports/llm-completion.port';
import { UiSurfacePayload } from '../../domain/chat/entities/message.entity';
import { PromptVersionResolver } from './prompt-version.resolver';
import { SafetyPipelineService } from '../../application/chat/safety-pipeline.service';
import {
  ToolExecutionLoopService,
  ToolRunResult,
} from '../../application/chat/tool-execution-loop.service';
import {
  AgentReplyComposerService,
  ComposeReplyInput,
} from '../../application/chat/agent-reply-composer.service';
import { parseSearchIntent } from '../../application/chat/search-intent.parser';
import { A2uiSurfaceBuilderService } from '../../application/chat/a2ui-surface-builder.service';
import { A2uiSafetyValidator } from '../../application/chat/a2ui-safety.validator';

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models';

@Injectable()
export class GeminiOrchestratorService implements LlmCompletionPort {
  private readonly logger = new Logger(GeminiOrchestratorService.name);
  private readonly apiKey: string | undefined;
  private readonly mockMode: boolean;
  private readonly genuiEnabled: boolean;

  constructor(
    private readonly config: ConfigService,
    private readonly prompts: PromptVersionResolver,
    private readonly safety: SafetyPipelineService,
    private readonly tools: ToolExecutionLoopService,
    private readonly composer: AgentReplyComposerService,
    private readonly surfaceBuilder: A2uiSurfaceBuilderService,
    private readonly a2uiSafety: A2uiSafetyValidator,
  ) {
    this.apiKey = this.config.get<string>('gemini.apiKey');
    this.mockMode =
      this.config.get<boolean>('gemini.mockChat') ??
      !this.config.get<string>('gemini.apiKey');
    this.genuiEnabled = this.config.get<boolean>('genui.enabled', true);
  }

  async complete(request: LlmCompletionRequest): Promise<LlmCompletionResult> {
    const chunks: string[] = [];
    let result: LlmCompletionResult | undefined;
    await this.stream(request, (chunk) => {
      if (chunk.type === 'text_delta' && chunk.text) {
        chunks.push(chunk.text);
      }
      if (chunk.type === 'done' && result === undefined) {
        result = {
          content: chunks.join(''),
          listingRefs: chunk.cards ?? [],
          uiSurface: chunk.a2ui ?? null,
          metadata: {
            toolsCalled: [],
            latencyMs: 0,
            model: request.modelId,
            promptVersion: request.promptVersion,
          },
        };
      }
    });
    if (!result) {
      throw new ChatDomainException(
        ChatErrorCode.AI_UNAVAILABLE,
        'Empty model response',
      );
    }
    return result;
  }

  async stream(
    request: LlmCompletionRequest,
    onChunk: (chunk: LlmStreamChunk) => void,
    signal?: AbortSignal,
  ): Promise<LlmCompletionResult> {
    const started = Date.now();
    const lastUser = [...request.messages]
      .reverse()
      .find((m) => m.role === 'user');
    const userText = lastUser?.content ?? '';

    const pre = this.safety.preCheckUserInput(userText);
    if (pre.blocked) {
      const refusal = pre.refusalContent ?? 'Request blocked by safety policy.';
      onChunk({ type: 'text_delta', text: refusal });
      onChunk({
        type: 'done',
        agentId: request.agentId,
        usage: { promptTokens: 0, completionTokens: 0 },
      });
      return {
        content: refusal,
        listingRefs: [],
        uiSurface: null,
        metadata: {
          safetyBlocked: true,
          latencyMs: Date.now() - started,
          model: request.modelId,
          promptVersion: request.promptVersion,
        },
      };
    }

    let toolResult: ToolRunResult = {
      toolsCalled: [],
      listingRefs: [],
      listingNarrations: [],
      intent: parseSearchIntent(pre.sanitizedContent),
      toolSummary: '',
    };

    const invokeTools = this.tools.shouldInvokeTools(
      pre.sanitizedContent,
      request.messages,
    );

    if (invokeTools) {
      onChunk({
        type: 'tool_call',
        name: 'semantic_search',
        args: { query: pre.sanitizedContent },
      });
      toolResult = await this.tools.runSemanticSearch(pre.sanitizedContent);
      onChunk({
        type: 'tool_result',
        name: 'semantic_search',
        summary: toolResult.toolSummary,
      });
    }

    const allowedIds = new Set(
      toolResult.listingRefs.map((r) => r.propertyId),
    );

    let uiSurface: UiSurfacePayload | null = null;
    if (this.genuiEnabled && toolResult.listingNarrations.length > 0) {
      uiSurface = this.a2uiSafety.validate(
        this.surfaceBuilder.buildPropertyCarousel(toolResult.listingNarrations),
        allowedIds,
      );
      if (uiSurface) {
        onChunk({
          type: 'a2ui_surface',
          surfaceId: uiSurface.surfaceId,
          a2ui: uiSurface,
        });
      }
    }

    if (!this.genuiEnabled && toolResult.listingRefs.length > 0) {
      onChunk({ type: 'listing_cards', cards: toolResult.listingRefs });
    }

    const composeInput = {
      locale: request.locale,
      agentId: request.agentId,
      userMessage: pre.sanitizedContent,
      toolsInvoked: invokeTools,
      listings: toolResult.listingNarrations,
      intent: toolResult.intent,
      recentMessages: request.messages,
    };

    let content: string;
    if (this.mockMode) {
      content = this.composer.compose(composeInput);
    } else {
      content = await this.callGemini(request, composeInput, signal);
    }

    const post = this.safety.postCheckAssistant({
      content,
      listingRefs: toolResult.listingRefs,
      allowedPropertyIds: allowedIds,
    });

    for (const word of post.content.split(/(\s+)/)) {
      if (signal?.aborted) {
        throw new ChatDomainException(
          ChatErrorCode.AI_UNAVAILABLE,
          'Stream aborted',
        );
      }
      if (word) {
        onChunk({ type: 'text_delta', text: word });
      }
    }

    const metadata = {
      toolsCalled: toolResult.toolsCalled,
      latencyMs: Date.now() - started,
      model: request.modelId,
      promptVersion: request.promptVersion,
    };

    onChunk({
      type: 'done',
      agentId: request.agentId,
      cards: this.genuiEnabled ? [] : post.listingRefs,
      a2ui: uiSurface ?? undefined,
      usage: { promptTokens: 0, completionTokens: 0 },
    });

    return {
      content: post.content,
      listingRefs: this.genuiEnabled ? [] : post.listingRefs,
      uiSurface,
      metadata,
    };
  }

  private async callGemini(
    request: LlmCompletionRequest,
    composeInput: ComposeReplyInput,
    signal?: AbortSignal,
  ): Promise<string> {
    if (!this.apiKey) {
      throw new ChatDomainException(
        ChatErrorCode.AI_UNAVAILABLE,
        'GEMINI_API_KEY not configured',
      );
    }

    const toolContext = this.composer.buildGeminiContextBlock(composeInput);
    const summaryMessage = request.messages.find((m) => m.role === 'system');
    const systemText = [
      request.systemPrompt,
      summaryMessage ? `\n\n${summaryMessage.content}` : '',
      toolContext,
    ].join('');

    const url =
      `${GEMINI_URL}/${request.modelId}:generateContent?key=${this.apiKey}`;
    const body = {
      systemInstruction: { parts: [{ text: systemText }] },
      contents: request.messages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        })),
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    });

    if (!res.ok) {
      this.logger.warn(`Gemini HTTP ${res.status}`);
      throw new ChatDomainException(
        ChatErrorCode.AI_UNAVAILABLE,
        'Gemini request failed',
      );
    }

    const json = (await res.json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
      }>;
    };
    const text =
      json.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';
    if (!text) {
      throw new ChatDomainException(
        ChatErrorCode.AI_UNAVAILABLE,
        'Empty Gemini response',
      );
    }
    return text;
  }
}
