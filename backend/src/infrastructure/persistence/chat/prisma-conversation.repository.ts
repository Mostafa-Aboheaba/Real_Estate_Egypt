import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Conversation } from '../../../domain/chat/entities/conversation.entity';
import { Message } from '../../../domain/chat/entities/message.entity';
import {
  ConversationListItem,
  ConversationRepositoryPort,
  PaginatedConversations,
  PaginatedMessages,
  StoredMessage,
} from '../../../domain/chat/ports/conversation.repository.port';
import { ConversationSummary } from '../../../domain/chat/entities/conversation.entity';
import { PrismaService } from '../prisma/prisma.service';
import {
  messageToCreateInput,
  toConversation,
  toStoredMessage,
} from './chat.mapper';

@Injectable()
export class PrismaConversationRepository implements ConversationRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(conversation: Conversation): Promise<Conversation> {
    const row = await this.prisma.conversation.create({
      data: {
        userId: conversation.userId,
        agentId: conversation.agentId,
        title: conversation.title,
        isArchived: conversation.isArchived,
      },
    });
    return toConversation(row);
  }

  async findByIdForUser(
    id: string,
    userId: string,
  ): Promise<Conversation | null> {
    const row = await this.prisma.conversation.findFirst({
      where: { id, userId },
    });
    return row ? toConversation(row) : null;
  }

  async listForUser(
    userId: string,
    page: number,
    pageSize: number,
    archived: boolean,
  ): Promise<PaginatedConversations> {
    const where = { userId, isArchived: archived };
    const [rows, total] = await Promise.all([
      this.prisma.conversation.findMany({
        where,
        orderBy: { lastMessageAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: { content: true },
          },
        },
      }),
      this.prisma.conversation.count({ where }),
    ]);

    const items: ConversationListItem[] = rows.map((r) => ({
      id: r.id,
      agentId: r.agentId,
      title: r.title,
      preview: r.messages[0]?.content?.slice(0, 120) ?? null,
      lastMessageAt: r.lastMessageAt?.toISOString() ?? null,
      isArchived: r.isArchived,
    }));

    return { items, page, pageSize, total };
  }

  async update(
    id: string,
    userId: string,
    patch: {
      agentId?: string;
      title?: string | null;
      isArchived?: boolean;
      summary?: ConversationSummary | null;
    },
  ): Promise<Conversation> {
    const data: Prisma.ConversationUpdateInput = {};
    if (patch.agentId !== undefined) {
      data.agentId = patch.agentId;
    }
    if (patch.title !== undefined) {
      data.title = patch.title;
    }
    if (patch.isArchived !== undefined) {
      data.isArchived = patch.isArchived;
    }
    if (patch.summary !== undefined) {
      data.summary =
        patch.summary === null
          ? Prisma.JsonNull
          : (patch.summary as unknown as Prisma.InputJsonValue);
    }

    const row = await this.prisma.conversation.update({
      where: { id, userId },
      data,
    });
    return toConversation(row);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await this.prisma.conversation.deleteMany({
      where: { id, userId },
    });
    return result.count > 0;
  }

  async saveMessage(message: Message): Promise<StoredMessage> {
    const row = await this.prisma.$transaction(async (tx) => {
      const created = await tx.message.create({
        data: messageToCreateInput(message),
      });
      await tx.conversation.update({
        where: { id: message.conversationId },
        data: { lastMessageAt: created.createdAt },
      });
      return created;
    });
    return toStoredMessage(row);
  }

  async listMessages(
    conversationId: string,
    userId: string,
    cursor: string | undefined,
    limit: number,
  ): Promise<PaginatedMessages> {
    const owned = await this.prisma.conversation.findFirst({
      where: { id: conversationId, userId },
      select: { id: true },
    });
    if (!owned) {
      return { items: [], nextCursor: null };
    }

    const safeLimit = Math.min(50, Math.max(1, limit));
    const rows = await this.prisma.message.findMany({
      where: {
        conversationId,
        ...(cursor
          ? {
              createdAt: {
                gt: (
                  await this.prisma.message.findUniqueOrThrow({
                    where: { id: cursor },
                    select: { createdAt: true },
                  })
                ).createdAt,
              },
            }
          : {}),
      },
      orderBy: { createdAt: 'asc' },
      take: safeLimit + 1,
    });

    const hasMore = rows.length > safeLimit;
    const page = hasMore ? rows.slice(0, safeLimit) : rows;
    const nextCursor = hasMore ? page[page.length - 1]?.id ?? null : null;

    return {
      items: page.map(toStoredMessage),
      nextCursor,
    };
  }

  async getContextMessages(
    conversationId: string,
    limit: number,
  ): Promise<StoredMessage[]> {
    const rows = await this.prisma.message.findMany({
      where: {
        conversationId,
        role: { not: 'system' },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return rows.reverse().map(toStoredMessage);
  }

  async countMessages(conversationId: string): Promise<number> {
    return this.prisma.message.count({ where: { conversationId } });
  }

  async getUserPreferredAgentId(userId: string): Promise<string | null> {
    const ctx = await this.getUserChatContext(userId);
    return ctx.preferredAgentId;
  }

  async getUserChatContext(
    userId: string,
  ): Promise<{ preferredAgentId: string | null; name: string | null }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { preferredAgentId: true, name: true },
    });
    return {
      preferredAgentId: user?.preferredAgentId ?? null,
      name: user?.name ?? null,
    };
  }
}
