import { ListingProvider } from '../enums/listing-provider.enum';

export const SYNC_RUN_REPOSITORY = Symbol('SYNC_RUN_REPOSITORY');

export type SyncRunStatus = 'running' | 'success' | 'failed';

export interface SyncRunRecord {
  id: string;
  provider: ListingProvider;
  status: SyncRunStatus;
  startedAt: Date;
  finishedAt: Date | null;
  listingsFetched: number;
  listingsUpserted: number;
  listingsDeactivated: number;
  errorMessage: string | null;
  attemptNumber: number;
}

export interface CreateSyncRunInput {
  provider: ListingProvider;
  attemptNumber?: number;
}

export interface CompleteSyncRunInput {
  id: string;
  status: 'success' | 'failed';
  listingsFetched: number;
  listingsUpserted: number;
  listingsDeactivated: number;
  errorMessage?: string | null;
}

export interface SyncRunRepositoryPort {
  create(input: CreateSyncRunInput): Promise<SyncRunRecord>;
  complete(input: CompleteSyncRunInput): Promise<void>;
  findLatestByProvider(provider: ListingProvider): Promise<SyncRunRecord | null>;
  findRecentByProvider(
    provider: ListingProvider,
    limit: number,
  ): Promise<SyncRunRecord[]>;
  isRunning(provider: ListingProvider): Promise<boolean>;
}
