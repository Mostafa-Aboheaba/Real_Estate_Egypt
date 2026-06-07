import { ListingRefProps } from '../value-objects/listing-ref.vo';
import { MessageMetadata } from '../entities/message.entity';

export const LLM_COMPLETION = Symbol('LLM_COMPLETION');

export interface LlmMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  agentId?: string | null;
}

export interface LlmCompletionRequest {
  agentId: string;
  modelId: string;
  promptVersion: string;
  systemPrompt: string;
  messages: LlmMessage[];
  locale: string;
  userId: string;
  conversationId: string;
}

export interface LlmCompletionResult {
  content: string;
  listingRefs: ListingRefProps[];
  metadata: MessageMetadata;
}

export interface LlmStreamChunk {
  type: 'text_delta' | 'tool_call' | 'tool_result' | 'listing_cards' | 'done' | 'error';
  text?: string;
  name?: string;
  args?: Record<string, unknown>;
  summary?: string;
  cards?: ListingRefProps[];
  messageId?: string;
  agentId?: string;
  usage?: { promptTokens: number; completionTokens: number };
  code?: string;
  message?: string;
}

export interface LlmCompletionPort {
  complete(request: LlmCompletionRequest): Promise<LlmCompletionResult>;
  stream(
    request: LlmCompletionRequest,
    onChunk: (chunk: LlmStreamChunk) => void,
    signal?: AbortSignal,
  ): Promise<LlmCompletionResult>;
}
