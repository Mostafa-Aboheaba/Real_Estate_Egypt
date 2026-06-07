import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  ChatAgentCatalogPort,
  ChatAgentDto,
} from '../../../domain/chat/ports/chat-agent-catalog.port';
import { PrismaService } from '../prisma/prisma.service';

function pickLocale(
  i18n: Prisma.JsonValue,
  locale: string,
): string {
  if (!i18n || typeof i18n !== 'object' || Array.isArray(i18n)) {
    return '';
  }
  const map = i18n as Record<string, string>;
  return map[locale] ?? map.en ?? map.ar ?? Object.values(map)[0] ?? '';
}

@Injectable()
export class PrismaChatAgentCatalog implements ChatAgentCatalogPort {
  constructor(private readonly prisma: PrismaService) {}

  async listActive(locale: string): Promise<ChatAgentDto[]> {
    const loc = locale.startsWith('ar') ? 'ar' : 'en';
    const rows = await this.prisma.aiAgent.findMany({
      where: { isActive: true },
      orderBy: [{ isDefault: 'desc' }, { id: 'asc' }],
    });
    return rows.map((r) => ({
      id: r.id,
      name: pickLocale(r.nameI18n, loc),
      description: r.description
        ? pickLocale(r.description, loc)
        : null,
      isDefault: r.isDefault,
    }));
  }

  async resolveAgentId(
    requestedId: string | undefined,
    preferredUserAgentId: string | null,
  ): Promise<{ agentId: string; notice: string | null }> {
    const candidates = [
      requestedId,
      preferredUserAgentId,
    ].filter((id): id is string => Boolean(id));

    for (const id of candidates) {
      const active = await this.prisma.aiAgent.findFirst({
        where: { id, isActive: true },
      });
      if (active) {
        const notice =
          requestedId && requestedId !== id
            ? `Using ${active.id} — requested agent unavailable`
            : preferredUserAgentId &&
                preferredUserAgentId !== id &&
                !requestedId
              ? `Using default agent ${active.id}`
              : null;
        return { agentId: active.id, notice };
      }
    }

    const fallback = await this.prisma.aiAgent.findFirst({
      where: { isActive: true, isDefault: true },
    });
    if (fallback) {
      return {
        agentId: fallback.id,
        notice: 'Using platform default agent',
      };
    }

    const any = await this.prisma.aiAgent.findFirst({
      where: { isActive: true },
    });
    if (!any) {
      throw new Error('No active AI agents configured');
    }
    return { agentId: any.id, notice: 'Using fallback agent' };
  }

  async getById(agentId: string): Promise<{
    id: string;
    modelId: string;
    isActive: boolean;
  } | null> {
    const row = await this.prisma.aiAgent.findUnique({
      where: { id: agentId },
    });
    if (!row) {
      return null;
    }
    return { id: row.id, modelId: row.modelId, isActive: row.isActive };
  }

  async setActive(agentId: string, isActive: boolean): Promise<void> {
    await this.prisma.aiAgent.update({
      where: { id: agentId },
      data: { isActive },
    });
  }
}
