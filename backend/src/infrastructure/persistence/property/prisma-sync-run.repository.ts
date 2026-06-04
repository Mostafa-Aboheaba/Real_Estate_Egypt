import { Injectable } from '@nestjs/common';
import { SyncRunStatus as PrismaSyncStatus } from '@prisma/client';
import { ListingProvider } from '../../../domain/property/enums/listing-provider.enum';
import {
  CompleteSyncRunInput,
  CreateSyncRunInput,
  SyncRunRecord,
  SyncRunRepositoryPort,
} from '../../../domain/property/ports/sync-run.repository.port';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaSyncRunRepository implements SyncRunRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateSyncRunInput): Promise<SyncRunRecord> {
    const row = await this.prisma.syncRun.create({
      data: {
        provider: input.provider,
        status: PrismaSyncStatus.running,
        startedAt: new Date(),
        attemptNumber: input.attemptNumber ?? 1,
      },
    });
    return this.toRecord(row);
  }

  async complete(input: CompleteSyncRunInput): Promise<void> {
    await this.prisma.syncRun.update({
      where: { id: input.id },
      data: {
        status:
          input.status === 'success'
            ? PrismaSyncStatus.success
            : PrismaSyncStatus.failed,
        finishedAt: new Date(),
        listingsFetched: input.listingsFetched,
        listingsUpserted: input.listingsUpserted,
        listingsDeactivated: input.listingsDeactivated,
        errorMessage: input.errorMessage ?? null,
      },
    });
  }

  async findLatestByProvider(
    provider: ListingProvider,
  ): Promise<SyncRunRecord | null> {
    const row = await this.prisma.syncRun.findFirst({
      where: { provider },
      orderBy: { startedAt: 'desc' },
    });
    return row ? this.toRecord(row) : null;
  }

  async findRecentByProvider(
    provider: ListingProvider,
    limit: number,
  ): Promise<SyncRunRecord[]> {
    const rows = await this.prisma.syncRun.findMany({
      where: { provider },
      orderBy: { startedAt: 'desc' },
      take: limit,
    });
    return rows.map((r) => this.toRecord(r));
  }

  async isRunning(provider: ListingProvider): Promise<boolean> {
    const running = await this.prisma.syncRun.findFirst({
      where: { provider, status: PrismaSyncStatus.running },
    });
    return Boolean(running);
  }

  private toRecord(row: {
    id: string;
    provider: string;
    status: string;
    startedAt: Date;
    finishedAt: Date | null;
    listingsFetched: number;
    listingsUpserted: number;
    listingsDeactivated: number;
    errorMessage: string | null;
    attemptNumber: number;
  }): SyncRunRecord {
    return {
      id: row.id,
      provider: row.provider as ListingProvider,
      status: row.status as SyncRunRecord['status'],
      startedAt: row.startedAt,
      finishedAt: row.finishedAt,
      listingsFetched: row.listingsFetched,
      listingsUpserted: row.listingsUpserted,
      listingsDeactivated: row.listingsDeactivated,
      errorMessage: row.errorMessage,
      attemptNumber: row.attemptNumber,
    };
  }
}
