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
  SHAETY_PROPERTIES_SEGMENT,
  normalizeShaetyApiRoot,
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
    const apiKey = this.config.get<string>('listing.shaetyApiKey')?.trim();
    const baseUrl =
      this.config.get<string>('listing.shaetyApiUrl') ??
      SHAETY_DEFAULT_BASE_URL;

    try {
      return await this.fetchAllProperties(baseUrl, apiKey || undefined);
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

  /** Mirrors Shaety mobile `ApiClient.get()` headers (guest: no Bearer). */
  private buildRequestHeaders(apiKey?: string): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };
    if (apiKey) {
      headers.Authorization = `Bearer ${apiKey}`;
    }
    return headers;
  }

  private async fetchAllProperties(
    baseUrl: string,
    apiKey?: string,
  ): Promise<RawListing[]> {
    const apiRoot = normalizeShaetyApiRoot(baseUrl);
    const listings: RawListing[] = [];
    let page = 1;
    let total = Number.POSITIVE_INFINITY;

    const mode = apiKey ? 'authenticated' : 'guest';
    this.logger.log(
      `Shaety ${mode} sync starting — ${apiRoot}/${SHAETY_PROPERTIES_SEGMENT}`,
    );

    while (page <= SHAETY_MAX_SYNC_PAGES && listings.length < total) {
      const batch = await this.fetchPropertiesPage(apiRoot, apiKey, page);
      if (batch.items.length === 0) {
        break;
      }

      for (const record of batch.items) {
        const mapped = mapShaetyPropertyToRawListing(record, apiRoot);
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
        `Shaety ${apiRoot}/${SHAETY_PROPERTIES_SEGMENT} returned no mappable listings — mock fallback`,
      );
      return this.loadMockListings();
    }

    this.logger.log(
      `Shaety sync: fetched ${listings.length} listings (${mode}) from ${apiRoot}`,
    );
    return listings;
  }

  private async fetchPropertiesPage(
    baseUrl: string,
    apiKey: string | undefined,
    page: number,
  ): Promise<{
    items: ShaetyPropertyRecord[];
    total: number;
    perPage: number;
  }> {
    const url = new URL(`${baseUrl}/${SHAETY_PROPERTIES_SEGMENT}`);
    url.searchParams.set('page', String(page));

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await fetch(url.toString(), {
          headers: this.buildRequestHeaders(apiKey),
          redirect: 'manual',
        });

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
