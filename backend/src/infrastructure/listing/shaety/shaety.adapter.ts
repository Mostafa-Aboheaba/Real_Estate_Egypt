import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readFileSync } from 'fs';
import { join } from 'path';
import { ListingProvider } from '../../../domain/property/enums/listing-provider.enum';
import {
  ListingBatchHandler,
  ListingProviderPort,
  RawListing,
} from '../../../domain/property/ports/listing-provider.port';
import {
  SHAETY_DEFAULT_BASE_URL,
  SHAETY_DEFAULT_PER_PAGE,
  SHAETY_MAX_SYNC_PAGES,
  SHAETY_PROPERTIES_SEGMENT,
  normalizeShaetyApiRoot,
} from './shaety.constants';
import { ShaetyGuestAuthService } from './shaety-guest-auth.service';
import {
  mapShaetyPropertyToRawListing,
  ShaetyPropertyRecord,
} from './shaety-listing.mapper';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 500;

interface ShaetyPropertiesResponse {
  status?: boolean;
  message?: string;
  status_code?: number;
  total?: number;
  page?: number | string;
  per_page?: number;
  data?: ShaetyPropertyRecord[];
}

type ShaetyAuthMode = 'configured' | 'guest-fcm';

@Injectable()
export class ShaetyAdapter implements ListingProviderPort {
  readonly provider = ListingProvider.Shaety;
  private readonly logger = new Logger(ShaetyAdapter.name);

  constructor(
    private readonly config: ConfigService,
    private readonly guestAuth: ShaetyGuestAuthService,
  ) {}

  async fetchListings(_since?: Date): Promise<RawListing[]> {
    try {
      const listings: RawListing[] = [];
      const fetched = await this.fetchListingsInBatches(async (batch) => {
        listings.push(...batch);
      });
      if (fetched === 0) {
        return this.loadMockListings();
      }
      return listings;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const baseUrl =
        this.config.get<string>('listing.shaetyApiUrl') ??
        SHAETY_DEFAULT_BASE_URL;
      this.logger.warn(
        `Shaety fetch failed (${baseUrl}): ${message} — mock fallback`,
      );
      return this.loadMockListings();
    }
  }

  async fetchListingsInBatches(
    onBatch: ListingBatchHandler,
    _since?: Date,
  ): Promise<number> {
    const baseUrl =
      this.config.get<string>('listing.shaetyApiUrl') ??
      SHAETY_DEFAULT_BASE_URL;
    const apiRoot = normalizeShaetyApiRoot(baseUrl);
    const { resolveToken, mode, refreshOnUnauthorized } =
      this.buildTokenStrategy(apiRoot);
    return this.iteratePropertyPages(
      apiRoot,
      resolveToken,
      mode,
      refreshOnUnauthorized,
      onBatch,
    );
  }

  private buildTokenStrategy(apiRoot: string): {
    resolveToken: () => Promise<string>;
    mode: ShaetyAuthMode;
    refreshOnUnauthorized: boolean;
  } {
    const configuredKey = this.config
      .get<string>('listing.shaetyApiKey')
      ?.trim();
    if (configuredKey) {
      return {
        resolveToken: async () => configuredKey,
        mode: 'configured',
        refreshOnUnauthorized: false,
      };
    }

    return {
      resolveToken: () => this.guestAuth.getToken(apiRoot),
      mode: 'guest-fcm',
      refreshOnUnauthorized: true,
    };
  }

  private loadMockListings(): RawListing[] {
    const path = join(__dirname, 'mock-listings.json');
    const raw = readFileSync(path, 'utf-8');
    return JSON.parse(raw) as RawListing[];
  }

  private buildRequestHeaders(bearerToken: string): Record<string, string> {
    return {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${bearerToken}`,
    };
  }

  private async iteratePropertyPages(
    apiRoot: string,
    resolveToken: () => Promise<string>,
    mode: ShaetyAuthMode,
    refreshOnUnauthorized: boolean,
    onBatch: ListingBatchHandler,
  ): Promise<number> {
    let page = 1;
    let total = Number.POSITIVE_INFINITY;
    let fetched = 0;

    this.logger.log(
      `Shaety ${mode} sync starting — ${apiRoot}/${SHAETY_PROPERTIES_SEGMENT}`,
    );

    while (page <= SHAETY_MAX_SYNC_PAGES && fetched < total) {
      const batch = await this.fetchPropertiesPage(
        apiRoot,
        resolveToken,
        refreshOnUnauthorized,
        page,
      );
      if (batch.items.length === 0) {
        break;
      }

      const mapped: RawListing[] = [];
      for (const record of batch.items) {
        const listing = mapShaetyPropertyToRawListing(record, apiRoot);
        if (listing) {
          mapped.push(listing);
        }
      }

      if (mapped.length > 0) {
        await onBatch(mapped, page);
        fetched += mapped.length;
        this.logger.log(
          `Shaety page ${page}: persisted ${mapped.length} listings (${fetched} total so far)`,
        );
      }

      total = batch.total;
      const perPage = batch.perPage || SHAETY_DEFAULT_PER_PAGE;
      if (batch.items.length < perPage) {
        break;
      }
      page += 1;
    }

    if (fetched === 0) {
      this.logger.warn(
        `Shaety ${apiRoot}/${SHAETY_PROPERTIES_SEGMENT} returned no mappable listings`,
      );
      return 0;
    }

    this.logger.log(
      `Shaety sync: fetched ${fetched} listings (${mode}) from ${apiRoot}`,
    );
    return fetched;
  }

  private async fetchPropertiesPage(
    apiRoot: string,
    resolveToken: () => Promise<string>,
    refreshOnUnauthorized: boolean,
    page: number,
  ): Promise<{
    items: ShaetyPropertyRecord[];
    total: number;
    perPage: number;
  }> {
    const url = new URL(`${apiRoot}/${SHAETY_PROPERTIES_SEGMENT}`);
    url.searchParams.set('page', String(page));

    let lastError: Error | null = null;
    let bearerToken = await resolveToken();
    let unauthorizedRetried = false;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await fetch(url.toString(), {
          headers: this.buildRequestHeaders(bearerToken),
          redirect: 'manual',
        });

        if (
          response.status === 401 &&
          refreshOnUnauthorized &&
          !unauthorizedRetried
        ) {
          this.logger.warn('Shaety guest token expired — refreshing via fcm-hash');
          this.guestAuth.invalidate();
          bearerToken = await resolveToken();
          unauthorizedRetried = true;
          continue;
        }

        if (response.status >= 300 && response.status < 400) {
          const location = response.headers.get('location') ?? 'unknown';
          throw new Error(
            `Shaety API redirect ${response.status} → ${location}`,
          );
        }

        if (response.status === 429 || response.status >= 500) {
          throw new Error(`Shaety API ${response.status}`);
        }

        if (response.status < 200 || response.status >= 300) {
          throw new Error(
            `Shaety API ${response.status} ${response.statusText}`,
          );
        }

        const body = (await response.json()) as ShaetyPropertiesResponse;
        if (body.status === false) {
          throw new Error(body.message ?? 'Shaety API returned status false');
        }

        const items = Array.isArray(body.data) ? body.data : [];
        const total = Number(body.total ?? items.length);
        const perPage = Number(body.per_page ?? SHAETY_DEFAULT_PER_PAGE);

        return { items, total, perPage };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < MAX_RETRIES) {
          await sleep(RETRY_DELAY_MS * attempt);
        }
      }
    }

    throw lastError ?? new Error('Shaety properties fetch failed');
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
