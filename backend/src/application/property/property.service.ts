import { Inject, Injectable, Logger, OnModuleInit, Optional } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { mapRawListingToProperty } from '../../infrastructure/listing/listing-normalizer';
import { Property } from '../../domain/property/entities/property.entity';
import {
  PropertyDomainException,
  PropertyErrorCode,
} from '../../domain/property/failures/property.failures';
import { ListingProvider, PROVIDER_LABELS } from '../../domain/property/enums/listing-provider.enum';
import {
  LISTING_PROVIDER,
  ListingProviderPort,
} from '../../domain/property/ports/listing-provider.port';
import {
  PROPERTY_REPOSITORY,
  PropertyRepositoryPort,
  PropertySearchFilters,
} from '../../domain/property/ports/property.repository.port';
import {
  SYNC_RUN_REPOSITORY,
  SyncRunRepositoryPort,
} from '../../domain/property/ports/sync-run.repository.port';
import {
  EMBED_LISTING_JOB,
  EMBED_LISTING_QUEUE,
  LISTING_SYNC_JOB,
  LISTING_SYNC_QUEUE,
} from '../../infrastructure/queue/queue.constants';

const STALE_HOURS = 24;

@Injectable()
export class PropertyService implements OnModuleInit {
  private readonly logger = new Logger(PropertyService.name);

  constructor(
    @Inject(PROPERTY_REPOSITORY)
    private readonly properties: PropertyRepositoryPort,
    @Inject(SYNC_RUN_REPOSITORY)
    private readonly syncRuns: SyncRunRepositoryPort,
    @Inject(LISTING_PROVIDER)
    private readonly listingProvider: ListingProviderPort,
    @InjectQueue(LISTING_SYNC_QUEUE)
    private readonly syncQueue: Queue,
    @Optional()
    @InjectQueue(EMBED_LISTING_QUEUE)
    private readonly embedQueue?: Queue,
  ) {}

  async onModuleInit(): Promise<void> {
    const shaetyStats = await this.properties
      .countByProvider()
      .then((stats) =>
        stats.find((s) => s.provider === ListingProvider.Shaety),
      );
    const activeCount = shaetyStats?.activeListingCount ?? 0;
    const mockCount = await this.properties.countMockActiveByProvider(
      ListingProvider.Shaety,
    );
    const needsShaetySync =
      activeCount === 0 || (mockCount > 0 && mockCount === activeCount);

    if (needsShaetySync) {
      this.logger.log(
        activeCount === 0
          ? 'No active listings — enqueueing initial Shaety sync'
          : 'Only mock Shaety listings in DB — enqueueing live Shaety sync',
      );
      try {
        await this.enqueueSync(ListingProvider.Shaety);
      } catch (error) {
        if (
          error instanceof PropertyDomainException &&
          error.code === PropertyErrorCode.INVALID_FILTERS
        ) {
          this.logger.log('Shaety sync already queued or running — skipping');
        } else {
          throw error;
        }
      }
    } else {
      await this.enqueueEmbeddingBatch();
    }
  }

  async getFilterOptions() {
    const cities = await this.properties.listDistinctCities(20);
    return {
      listingTypes: [
        { value: null, label: 'Any' },
        { value: 'sale', label: 'Sale' },
        { value: 'rent', label: 'Rent' },
      ],
      propertyTypes: [
        { value: 'apartment', label: 'Apartment' },
        { value: 'villa', label: 'Villa' },
        { value: 'duplex', label: 'Duplex' },
        { value: 'townhouse', label: 'Townhouse' },
        { value: 'commercial', label: 'Commercial' },
        { value: 'land', label: 'Land' },
        { value: 'other', label: 'Other' },
      ],
      sortOptions: [
        { value: 'newest', label: 'Newest' },
        { value: 'price_asc', label: 'Price: Low to High' },
        { value: 'price_desc', label: 'Price: High to Low' },
        { value: 'relevance', label: 'Relevance' },
      ],
      bedroomOptions: [
        { value: null, label: 'Any' },
        { value: '1', label: '1+' },
        { value: '2', label: '2+' },
        { value: '3', label: '3+' },
        { value: '4', label: '4+' },
        { value: '5', label: '5+' },
      ],
      cities: cities.map((city) => ({ value: city, label: city })),
      pricePresets: [
        { value: '500000', label: 'Up to 500K' },
        { value: '1000000', label: 'Up to 1M' },
        { value: '2000000', label: 'Up to 2M' },
        { value: '5000000', label: 'Up to 5M' },
      ],
    };
  }

  async search(filters: PropertySearchFilters) {
    const result = await this.properties.search(filters);
    return {
      items: result.items.map((item) => ({
        ...item,
        providerLabel: PROVIDER_LABELS[item.provider],
        syncedAt: item.syncedAt.toISOString(),
      })),
      meta: {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: Math.ceil(result.total / result.pageSize) || 0,
      },
    };
  }

  async getDetail(id: string) {
    const property = await this.properties.findById(id);
    if (!property) {
      throw new PropertyDomainException(
        PropertyErrorCode.LISTING_NOT_FOUND,
        'Listing not found',
      );
    }
    return this.toDetailDto(property);
  }

  async runListingSync(
    provider: ListingProvider,
    attemptNumber = 1,
  ): Promise<void> {
    const run = await this.syncRuns.create({ provider, attemptNumber });

    try {
      let rawListings: Awaited<
        ReturnType<ListingProviderPort['fetchListings']>
      > = [];
      let upserted = 0;

      if (this.listingProvider.fetchListingsInBatches) {
        rawListings = [];
        const fetched = await this.listingProvider.fetchListingsInBatches(
          async (batch) => {
            rawListings.push(...batch);
            const domainListings = batch.map((raw) =>
              mapRawListingToProperty(raw, provider),
            );
            upserted += await this.properties.upsertMany(domainListings);
          },
        );
        if (fetched === 0) {
          throw new Error('Listing provider returned no listings');
        }
      } else {
        rawListings = await this.listingProvider.fetchListings();
        const domainListings = rawListings.map((raw) =>
          mapRawListingToProperty(raw, provider),
        );
        upserted = await this.properties.upsertMany(domainListings);
      }
      const staleBefore = new Date(Date.now() - STALE_HOURS * 60 * 60 * 1000);
      const deactivated = await this.properties.deactivateStale(
        provider,
        staleBefore,
      );

      await this.syncRuns.complete({
        id: run.id,
        status: 'success',
        listingsFetched: rawListings.length,
        listingsUpserted: upserted,
        listingsDeactivated: deactivated,
      });

      this.logger.log(
        `Sync ${provider}: fetched=${rawListings.length} upserted=${upserted} deactivated=${deactivated}`,
      );

      // RAG/chat semantic_search reads embeddings built from these listings.
      await this.enqueueEmbeddingBatch();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown sync error';
      await this.syncRuns.complete({
        id: run.id,
        status: 'failed',
        listingsFetched: 0,
        listingsUpserted: 0,
        listingsDeactivated: 0,
        errorMessage: message.slice(0, 2000),
      });
      throw error;
    }
  }

  async getSyncStatus() {
    const providers = Object.values(ListingProvider);
    const counts = await this.properties.countByProvider();
    const generatedAt = new Date().toISOString();

    const providerStatuses = await Promise.all(
      providers.map(async (provider) => {
        const stats = counts.find((c) => c.provider === provider);
        const recent = await this.syncRuns.findRecentByProvider(provider, 5);
        const latest = recent[0] ?? null;
        const lastSuccess = recent.find((r) => r.status === 'success') ?? null;

        const consecutiveFailures = countConsecutiveFailures(recent);
        const status = deriveHealthStatus(consecutiveFailures, lastSuccess);

        return {
          provider,
          status,
          lastRunAt: latest?.startedAt.toISOString() ?? null,
          lastSuccessAt: lastSuccess?.finishedAt?.toISOString() ?? null,
          listingCount: stats?.listingCount ?? 0,
          activeListingCount: stats?.activeListingCount ?? 0,
          errorCount: recent.filter((r) => r.status === 'failed').length,
          consecutiveFailures,
          lastError: latest?.status === 'failed' ? latest.errorMessage : null,
        };
      }),
    );

    return { providers: providerStatuses, generatedAt };
  }

  private async enqueueEmbeddingBatch(): Promise<void> {
    if (!this.embedQueue) {
      return;
    }
    await this.embedQueue.add(EMBED_LISTING_JOB, { batchMissing: true });
  }

  async enqueueSync(provider: ListingProvider): Promise<string> {
    const running = await this.syncRuns.isRunning(provider);
    if (running) {
      throw new PropertyDomainException(
        PropertyErrorCode.INVALID_FILTERS,
        'Sync already running for provider',
      );
    }

    const job = await this.syncQueue.add(LISTING_SYNC_JOB, { provider });
    return job.id ?? 'unknown';
  }

  private toDetailDto(property: Property) {
    return {
      id: property.id,
      title: property.title,
      description: property.description,
      priceEgp: property.priceEgp,
      listingType: property.listingType,
      propertyType: property.propertyType,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      areaSqm: property.areaSqm,
      location: property.location.toJSON(),
      amenities: property.amenities,
      images: property.images,
      provider: property.provider,
      providerLabel: PROVIDER_LABELS[property.provider],
      sourceUrl: property.sourceUrl,
      syncedAt: property.syncedAt.toISOString(),
      isActive: property.isActive,
    };
  }
}

function countConsecutiveFailures(
  runs: { status: string }[],
): number {
  let count = 0;
  for (const run of runs) {
    if (run.status === 'failed') {
      count += 1;
    } else {
      break;
    }
  }
  return count;
}

function deriveHealthStatus(
  consecutiveFailures: number,
  lastSuccess: { finishedAt: Date | null } | null,
): 'healthy' | 'degraded' | 'failed' {
  if (consecutiveFailures >= 3) {
    return 'failed';
  }
  if (consecutiveFailures > 0 || !lastSuccess) {
    return 'degraded';
  }
  return 'healthy';
}
