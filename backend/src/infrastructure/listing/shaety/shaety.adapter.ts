import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readFileSync } from 'fs';
import { join } from 'path';
import { ListingProvider } from '../../../domain/property/enums/listing-provider.enum';
import {
  ListingProviderPort,
  RawListing,
} from '../../../domain/property/ports/listing-provider.port';
import {
  SHAETY_DEFAULT_BASE_URL,
  SHAETY_DEFAULT_PER_PAGE,
  SHAETY_MAX_SYNC_PAGES,
  SHAETY_PROPERTIES_PATH,
} from './shaety.constants';
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

@Injectable()
export class ShaetyAdapter implements ListingProviderPort {
  readonly provider = ListingProvider.Shaety;
  private readonly logger = new Logger(ShaetyAdapter.name);

  constructor(private readonly config: ConfigService) {}

  async fetchListings(_since?: Date): Promise<RawListing[]> {
    const apiKey = this.config.get<string>('listing.shaetyApiKey');
    const baseUrl =
      this.config.get<string>('listing.shaetyApiUrl') ??
      SHAETY_DEFAULT_BASE_URL;

    if (!apiKey?.trim()) {
      this.logger.log(
        'SHAETY_API_KEY not set — using mock listings (set key + ' +
          `SHAETY_API_URL=${SHAETY_DEFAULT_BASE_URL} for live RAG ingest)`,
      );
      return this.loadMockListings();
    }

    try {
      return await this.fetchAllProperties(baseUrl, apiKey);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `Shaety fetch failed (${baseUrl}): ${message} — mock fallback`,
      );
      return this.loadMockListings();
    }
  }

  private loadMockListings(): RawListing[] {
    const path = join(__dirname, 'mock-listings.json');
    const raw = readFileSync(path, 'utf-8');
    return JSON.parse(raw) as RawListing[];
  }

  private async fetchAllProperties(
    baseUrl: string,
    apiKey: string,
  ): Promise<RawListing[]> {
    const normalizedBase = baseUrl.replace(/\/$/, '');
    const listings: RawListing[] = [];
    let page = 1;
    let total = Number.POSITIVE_INFINITY;

    while (page <= SHAETY_MAX_SYNC_PAGES && listings.length < total) {
      const batch = await this.fetchPropertiesPage(
        normalizedBase,
        apiKey,
        page,
      );
      if (batch.items.length === 0) {
        break;
      }

      for (const record of batch.items) {
        const mapped = mapShaetyPropertyToRawListing(record, normalizedBase);
        if (mapped) {
          listings.push(mapped);
        }
      }

      total = batch.total;
      const perPage = batch.perPage || SHAETY_DEFAULT_PER_PAGE;
      if (batch.items.length < perPage) {
        break;
      }
      page += 1;
    }

    if (listings.length === 0) {
      this.logger.warn(
        `Shaety ${normalizedBase}${SHAETY_PROPERTIES_PATH} returned no mappable listings — mock fallback`,
      );
      return this.loadMockListings();
    }

    this.logger.log(
      `Shaety sync: fetched ${listings.length} listings from ${normalizedBase}`,
    );
    return listings;
  }

  private async fetchPropertiesPage(
    baseUrl: string,
    apiKey: string,
    page: number,
  ): Promise<{
    items: ShaetyPropertyRecord[];
    total: number;
    perPage: number;
  }> {
    const url = new URL(`${baseUrl}${SHAETY_PROPERTIES_PATH}`);
    url.searchParams.set('page', String(page));

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await fetch(url.toString(), {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            Accept: 'application/json',
          },
        });

        if (response.status === 429 || response.status >= 500) {
          throw new Error(`Shaety API ${response.status}`);
        }

        if (!response.ok) {
          throw new Error(
            `Shaety API ${response.status} ${response.statusText}`,
          );
        }

        const body = (await response.json()) as ShaetyPropertiesResponse;
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
