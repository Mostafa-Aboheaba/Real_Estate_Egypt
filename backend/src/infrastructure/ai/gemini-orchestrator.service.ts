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
import { PromptVersionResolver } from './prompt-version.resolver';
import { SafetyPipelineService } from '../../application/chat/safety-pipeline.service';
import { ToolExecutionLoopService } from '../../application/chat/tool-execution-loop.service';

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models';

@Injectable()
export class GeminiOrchestratorService implements LlmCompletionPort {
  private readonly logger = new Logger(GeminiOrchestratorService.name);
  private readonly apiKey: string | undefined;
  private readonly mockMode: boolean;

  constructor(
    private readonly config: ConfigService,
    private readonly prompts: PromptVersionResolver,
    private readonly safety: SafetyPipelineService,
    private readonly tools: ToolExecutionLoopService,
  ) {
    this.apiKey = this.config.get<string>('gemini.apiKey');
    this.mockMode =
      this.config.get<boolean>('gemini.mockChat') ??
      !this.config.get<string>('gemini.apiKey');
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
        metadata: {
          safetyBlocked: true,
          latencyMs: Date.now() - started,
          model: request.modelId,
          promptVersion: request.promptVersion,
        },
      };
    }

    let toolResult = {
      toolsCalled: [] as string[],
      listingRefs: [] as LlmCompletionResult['listingRefs'],
      toolSummary: '',
    };

    if (this.tools.shouldInvokeTools(pre.sanitizedContent)) {
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
      if (toolResult.listingRefs.length > 0) {
        onChunk({ type: 'listing_cards', cards: toolResult.listingRefs });
      }
    }

    const allowedIds = new Set(
      toolResult.listingRefs.map((r) => r.propertyId),
    );

    let content: string;
    if (this.mockMode) {
      content = this.mockReply(
        request.agentId,
        pre.sanitizedContent,
        toolResult,
      );
    } else {
      content = await this.callGemini(request, pre.sanitizedContent, signal);
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
      cards: post.listingRefs,
      usage: { promptTokens: 0, completionTokens: 0 },
    });

    return {
      content: post.content,
      listingRefs: post.listingRefs,
      metadata,
    };
  }

  private mockReply(
    agentId: string,
    query: string,
    tool: {
      listingRefs: LlmCompletionResult['listingRefs'];
      toolSummary: string;
    },
  ): string {
    const cards =
      tool.listingRefs.length > 0
        ? ` I found ${tool.listingRefs.length} matching listings.`
        : ' Try adjusting location or budget.';
    return (
      `[${agentId}] Here are options for your search: "${query.slice(0, 80)}".` +
      cards +
      ' AI-generated guidance — not legal or financial advice.'
    );
  }

  private async callGemini(
    request: LlmCompletionRequest,
    userContent: string,
    signal?: AbortSignal,
  ): Promise<string> {
    if (!this.apiKey) {
      throw new ChatDomainException(
        ChatErrorCode.AI_UNAVAILABLE,
        'GEMINI_API_KEY not configured',
      );
    }

    const url =
      `${GEMINI_URL}/${request.modelId}:generateContent?key=${this.apiKey}`;
    const body = {
      systemInstruction: { parts: [{ text: request.systemPrompt }] },
      contents: [
        ...request.messages.map((m) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        })),
        { role: 'user', parts: [{ text: userContent }] },
      ],
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
