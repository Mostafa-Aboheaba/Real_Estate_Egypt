import { Conversation, ConversationSummary } from '../../../domain/chat/entities/conversation.entity';
import { Message, MessageMetadata } from '../../../domain/chat/entities/message.entity';
import { ListingRefProps } from '../../../domain/chat/value-objects/listing-ref.vo';
import { StoredMessage } from '../../../domain/chat/ports/conversation.repository.port';
import { MessageRole, Prisma } from '@prisma/client';

export function toConversation(row: {
  id: string;
  userId: string;
  agentId: string;
  title: string | null;
  isArchived: boolean;
  lastMessageAt: Date | null;
  summary?: Prisma.JsonValue | null;
  createdAt: Date;
  updatedAt: Date;
}): Conversation {
  return Conversation.reconstitute({
    id: row.id,
    userId: row.userId,
    agentId: row.agentId,
    title: row.title,
    isArchived: row.isArchived,
    lastMessageAt: row.lastMessageAt,
    summary: parseSummary(row.summary ?? null),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

function parseSummary(raw: Prisma.JsonValue): ConversationSummary | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return null;
  }
  const o = raw as Record<string, unknown>;
  if (
    typeof o.text === 'string' &&
    typeof o.upToMessageId === 'string' &&
    typeof o.version === 'string'
  ) {
    return {
      text: o.text,
      upToMessageId: o.upToMessageId,
      version: o.version,
    };
  }
  return null;
}

export function toStoredMessage(row: {
  id: string;
  role: MessageRole;
  content: string;
  agentId: string | null;
  listingRefs: Prisma.JsonValue;
  metadata: Prisma.JsonValue;
  createdAt: Date;
}): StoredMessage {
  return {
    id: row.id,
    role: row.role,
    content: row.content,
    agentId: row.agentId,
    listingRefs: (row.listingRefs as unknown as ListingRefProps[]) ?? [],
    metadata: (row.metadata as MessageMetadata) ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

export function messageToCreateInput(
  message: Message,
): Prisma.MessageUncheckedCreateInput {
  return {
    conversationId: message.conversationId,
    role: message.role.value as MessageRole,
    content: message.content,
    agentId: message.agentId,
    listingRefs: message.listingRefs.map((r) =>
      r.toJSON(),
    ) as unknown as Prisma.InputJsonValue,
    metadata: (message.metadata ?? undefined) as unknown as
      | Prisma.InputJsonValue
      | undefined,
    tokenCount: message.tokenCount,
  };
}
