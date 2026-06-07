import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  ChatDomainException,
  ChatErrorCode,
} from '../../domain/chat/failures/chat.failures';
import { Conversation } from '../../domain/chat/entities/conversation.entity';
import { Message } from '../../domain/chat/entities/message.entity';
import {
  CHAT_AGENT_CATALOG,
  ChatAgentCatalogPort,
} from '../../domain/chat/ports/chat-agent-catalog.port';
import {
  CONVERSATION_REPOSITORY,
  ConversationRepositoryPort,
  StoredMessage,
} from '../../domain/chat/ports/conversation.repository.port';
import {
  LLM_COMPLETION,
  LlmCompletionPort,
  LlmMessage,
} from '../../domain/chat/ports/llm-completion.port';
import { PromptVersionResolver } from '../../infrastructure/ai/prompt-version.resolver';
import {
  CHAT_COMPACTION_JOB,
  CHAT_COMPACTION_QUEUE,
} from '../../infrastructure/queue/queue.constants';

const CONTEXT_LIMIT = 20;
const COMPACTION_THRESHOLD = 30;
const AI_DISCLAIMER =
  'AI-generated guidance — not legal or financial advice.';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @Inject(CONVERSATION_REPOSITORY)
    private readonly conversations: ConversationRepositoryPort,
    @Inject(CHAT_AGENT_CATALOG)
    private readonly agents: ChatAgentCatalogPort,
    @Inject(LLM_COMPLETION)
    private readonly llm: LlmCompletionPort,
    private readonly prompts: PromptVersionResolver,
    @Optional()
    @InjectQueue(CHAT_COMPACTION_QUEUE)
    private readonly compactionQueue?: Queue,
  ) {}

  async listAgents(locale: string) {
    return this.agents.listActive(locale);
  }

  async createConversation(
    userId: string,
    agentId: string | undefined,
    title: string | undefined,
    locale: string,
  ) {
    const preferred =
      await this.conversations.getUserPreferredAgentId(userId);
    const resolved = await this.agents.resolveAgentId(agentId, preferred);
    const conv = Conversation.create(userId, resolved.agentId, title);
    const saved = await this.conversations.create(conv);
    return {
      conversation: this.toConversationDto(saved),
      agentSwitchedNotice: resolved.notice,
      locale,
    };
  }

  async listConversations(
    userId: string,
    page: number,
    pageSize: number,
    archived: boolean,
  ) {
    return this.conversations.listForUser(userId, page, pageSize, archived);
  }

  async getConversation(userId: string, id: string) {
    const conv = await this.requireConversation(userId, id);
    return this.toConversationDto(conv);
  }

  async patchConversation(
    userId: string,
    id: string,
    patch: {
      agentId?: string;
      title?: string;
      isArchived?: boolean;
    },
  ) {
    await this.requireConversation(userId, id);
    if (patch.agentId) {
      const agent = await this.agents.getById(patch.agentId);
      if (!agent?.isActive) {
        throw new ChatDomainException(
          ChatErrorCode.INVALID_AGENT_ID,
          'Agent not found or inactive',
        );
      }
    }
    const updated = await this.conversations.update(id, userId, patch);
    return this.toConversationDto(updated);
  }

  async deleteConversation(userId: string, id: string): Promise<void> {
    const ok = await this.conversations.delete(id, userId);
    if (!ok) {
      throw new ChatDomainException(ChatErrorCode.NOT_FOUND);
    }
  }

  async listMessages(
    userId: string,
    conversationId: string,
    cursor: string | undefined,
    limit: number,
  ) {
    await this.requireConversation(userId, conversationId);
    const page = await this.conversations.listMessages(
      conversationId,
      userId,
      cursor,
      limit,
    );
    return {
      data: page.items.filter((m) => m.role !== 'system'),
      nextCursor: page.nextCursor,
    };
  }

  async sendMessage(
    userId: string,
    conversationId: string,
    content: string,
    locale: string,
  ) {
    const conv = await this.requireConversation(userId, conversationId);
    const userMsg = Message.createUser(conversationId, content);
    if (!userMsg) {
      throw new ChatDomainException(
        ChatErrorCode.VALIDATION_ERROR,
        'Invalid message content',
      );
    }
    const savedUser = await this.conversations.saveMessage(userMsg);

    const assistant = await this.generateAssistant(
      conversationId,
      conv,
      userId,
      locale,
    );

    if (!conv.title && content.trim().length > 0) {
      await this.conversations.update(conversationId, userId, {
        title: content.trim().slice(0, 200),
      });
    }

    await this.maybeEnqueueCompaction(conversationId, userId);

    return {
      userMessageId: savedUser.id,
      assistantMessage: {
        ...assistant,
        disclaimer: AI_DISCLAIMER,
      },
      agentSwitchedNotice: null,
    };
  }

  async streamMessage(
    userId: string,
    conversationId: string,
    content: string,
    locale: string,
    onEvent: (event: string, data: Record<string, unknown>) => void,
    signal?: AbortSignal,
  ): Promise<void> {
    const conv = await this.requireConversation(userId, conversationId);
    const userMsg = Message.createUser(conversationId, content);
    if (!userMsg) {
      throw new ChatDomainException(
        ChatErrorCode.VALIDATION_ERROR,
        'Invalid message content',
      );
    }
    await this.conversations.saveMessage(userMsg);

    const request = await this.buildLlmRequest(conv, userId, locale);
    let fullText = '';
    let listingRefs: Array<{
      propertyId: string;
      title: string;
      priceEgp: number;
    }> = [];

    try {
      const result = await this.llm.stream(
        request,
        (chunk) => {
          if (chunk.type === 'text_delta' && chunk.text) {
            fullText += chunk.text;
            onEvent('text_delta', { text: chunk.text });
          }
          if (chunk.type === 'tool_call' && chunk.name) {
            onEvent('tool_call', { name: chunk.name, args: chunk.args ?? {} });
          }
          if (chunk.type === 'tool_result' && chunk.name) {
            onEvent('tool_result', {
              name: chunk.name,
              summary: chunk.summary ?? '',
            });
          }
          if (chunk.type === 'listing_cards' && chunk.cards) {
            listingRefs = chunk.cards;
            onEvent('listing_cards', { cards: chunk.cards });
          }
        },
        signal,
      );
      fullText = result.content;
      listingRefs = result.listingRefs;

      const assistant = Message.createAssistant(
        conversationId,
        fullText,
        conv.agentId,
        listingRefs,
        result.metadata,
      );
      if (!assistant) {
        throw new ChatDomainException(
          ChatErrorCode.AI_UNAVAILABLE,
          'Failed to persist assistant message',
        );
      }
      const saved = await this.conversations.saveMessage(assistant);
      onEvent('done', {
        messageId: saved.id,
        agentId: conv.agentId,
        usage: { promptTokens: 0, completionTokens: 0 },
        agentSwitchedNotice: null,
      });

      if (!conv.title && content.trim()) {
        await this.conversations.update(conversationId, userId, {
          title: content.trim().slice(0, 200),
        });
      }
      await this.maybeEnqueueCompaction(conversationId, userId);
    } catch (err) {
      if (err instanceof ChatDomainException) {
        onEvent('error', { code: err.code, message: err.message });
        return;
      }
      this.logger.warn(`stream failed: ${String(err)}`);
      onEvent('error', {
        code: ChatErrorCode.AI_UNAVAILABLE,
        message: 'AI assistant is temporarily unavailable',
      });
    }
  }

  async setAgentActive(agentId: string, isActive: boolean): Promise<void> {
    const agent = await this.agents.getById(agentId);
    if (!agent) {
      throw new ChatDomainException(ChatErrorCode.NOT_FOUND, 'Agent not found');
    }
    await this.agents.setActive(agentId, isActive);
  }

  private async generateAssistant(
    conversationId: string,
    conv: Conversation,
    userId: string,
    locale: string,
  ) {
    const request = await this.buildLlmRequest(conv, userId, locale);
    const result = await this.llm.complete(request);
    const assistant = Message.createAssistant(
      conversationId,
      result.content,
      conv.agentId,
      result.listingRefs,
      result.metadata,
    );
    if (!assistant) {
      throw new ChatDomainException(
        ChatErrorCode.AI_UNAVAILABLE,
        'Failed to create assistant message',
      );
    }
    const saved = await this.conversations.saveMessage(assistant);
    return {
      id: saved.id,
      content: saved.content,
      agentId: saved.agentId,
      listingRefs: saved.listingRefs,
      metadata: saved.metadata,
    };
  }

  private async buildLlmRequest(
    conv: Conversation,
    userId: string,
    locale: string,
  ) {
    const agent = await this.agents.getById(conv.agentId);
    if (!agent?.isActive) {
      const resolved = await this.agents.resolveAgentId(
        undefined,
        await this.conversations.getUserPreferredAgentId(userId),
      );
      await this.conversations.update(conv.id!, userId, {
        agentId: resolved.agentId,
      });
      conv = Conversation.reconstitute({
        ...conv,
        agentId: resolved.agentId,
      });
    }

    const { promptVersion, systemPrompt } = this.prompts.resolve(
      conv.agentId,
      locale,
    );

    const history = await this.conversations.getContextMessages(
      conv.id!,
      CONTEXT_LIMIT,
    );

    const messages: LlmMessage[] = history.map((m) => ({
      role: m.role as LlmMessage['role'],
      content: m.content,
      agentId: m.agentId,
    }));

    if (conv.summary) {
      messages.unshift({
        role: 'system',
        content: `Conversation summary: ${conv.summary.text}`,
      });
    }

    const active = await this.agents.getById(conv.agentId);
    return {
      agentId: conv.agentId,
      modelId: active?.modelId ?? 'gemini-2.0-flash',
      promptVersion,
      systemPrompt,
      messages,
      locale,
      userId,
      conversationId: conv.id!,
    };
  }

  private async requireConversation(userId: string, id: string) {
    const conv = await this.conversations.findByIdForUser(id, userId);
    if (!conv) {
      throw new ChatDomainException(ChatErrorCode.NOT_FOUND);
    }
    return conv;
  }

  private async maybeEnqueueCompaction(
    conversationId: string,
    userId: string,
  ): Promise<void> {
    const count = await this.conversations.countMessages(conversationId);
    if (count >= COMPACTION_THRESHOLD && this.compactionQueue) {
      await this.compactionQueue.add(CHAT_COMPACTION_JOB, {
        conversationId,
        userId,
      });
    }
  }

  private toConversationDto(conv: Conversation) {
    return {
      id: conv.id,
      agentId: conv.agentId,
      title: conv.title,
      isArchived: conv.isArchived,
      lastMessageAt: conv.lastMessageAt?.toISOString() ?? null,
      createdAt: conv.createdAt.toISOString(),
    };
  }
}
