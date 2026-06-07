import { Conversation, ConversationSummary } from '../entities/conversation.entity';
import { Message, MessageMetadata } from '../entities/message.entity';
import { ListingRefProps } from '../value-objects/listing-ref.vo';

export const CONVERSATION_REPOSITORY = Symbol('CONVERSATION_REPOSITORY');

export interface ConversationListItem {
  id: string;
  agentId: string;
  title: string | null;
  preview: string | null;
  lastMessageAt: string | null;
  isArchived: boolean;
}

export interface PaginatedConversations {
  items: ConversationListItem[];
  page: number;
  pageSize: number;
  total: number;
}

export interface StoredMessage {
  id: string;
  role: string;
  content: string;
  agentId: string | null;
  listingRefs: ListingRefProps[];
  metadata: MessageMetadata | null;
  createdAt: string;
}

export interface PaginatedMessages {
  items: StoredMessage[];
  nextCursor: string | null;
}

export interface ConversationRepositoryPort {
  create(conversation: Conversation): Promise<Conversation>;
  findByIdForUser(id: string, userId: string): Promise<Conversation | null>;
  listForUser(
    userId: string,
    page: number,
    pageSize: number,
    archived: boolean,
  ): Promise<PaginatedConversations>;
  update(
    id: string,
    userId: string,
    patch: {
      agentId?: string;
      title?: string | null;
      isArchived?: boolean;
      summary?: ConversationSummary | null;
    },
  ): Promise<Conversation>;
  delete(id: string, userId: string): Promise<boolean>;
  saveMessage(message: Message): Promise<StoredMessage>;
  listMessages(
    conversationId: string,
    userId: string,
    cursor: string | undefined,
    limit: number,
  ): Promise<PaginatedMessages>;
  getContextMessages(
    conversationId: string,
    limit: number,
  ): Promise<StoredMessage[]>;
  countMessages(conversationId: string): Promise<number>;
  getUserPreferredAgentId(userId: string): Promise<string | null>;
}
