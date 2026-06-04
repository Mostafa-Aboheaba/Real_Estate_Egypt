import { Injectable } from '@nestjs/common';
import { AgentCatalogPort } from '../../../domain/profile/ports/agent-catalog.port';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaAgentCatalog implements AgentCatalogPort {
  constructor(private readonly prisma: PrismaService) {}

  async isActiveAgentId(agentId: string): Promise<boolean> {
    const row = await this.prisma.aiAgent.findFirst({
      where: { id: agentId, isActive: true },
      select: { id: true },
    });
    return row != null;
  }
}
