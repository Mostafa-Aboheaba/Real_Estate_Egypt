import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readFileSync } from 'fs';
import { join } from 'path';
import { ListingProvider } from '../../../domain/property/enums/listing-provider.enum';
import {
  ListingProviderPort,
  RawListing,
} from '../../../domain/property/ports/listing-provider.port';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 500;

@Injectable()
export class ShaetyAdapter implements ListingProviderPort {
  readonly provider = ListingProvider.Shaety;
  private readonly logger = new Logger(ShaetyAdapter.name);

  constructor(private readonly config: ConfigService) {}

  async fetchListings(_since?: Date): Promise<RawListing[]> {
    const apiKey = this.config.get<string>('listing.shaetyApiKey');
    const apiUrl = this.config.get<string>('listing.shaetyApiUrl');

    if (!apiKey?.trim()) {
      this.logger.log('SHAETY_API_KEY not set — using mock listings');
      return this.loadMockListings();
    }

    return this.fetchFromApi(apiUrl ?? 'https://api.shaety.com/v1/listings', apiKey);
  }

  private loadMockListings(): RawListing[] {
    const path = join(__dirname, 'mock-listings.json');
    const raw = readFileSync(path, 'utf-8');
    return JSON.parse(raw) as RawListing[];
  }

  private async fetchFromApi(url: string, apiKey: string): Promise<RawListing[]> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            Accept: 'application/json',
          },
        });

        if (response.status === 429 || response.status >= 500) {
          throw new Error(`Shaety API ${response.status}`);
        }

        if (!response.ok) {
          this.logger.warn(
            `Shaety API ${response.status} — falling back to mock listings`,
          );
          return this.loadMockListings();
        }

        const body = (await response.json()) as {
          data?: RawListing[];
          listings?: RawListing[];
        };
        return body.data ?? body.listings ?? [];
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < MAX_RETRIES) {
          await sleep(RETRY_DELAY_MS * attempt);
        }
      }
    }

    this.logger.warn(
      `Shaety fetch failed after retries: ${lastError?.message} — mock fallback`,
    );
    return this.loadMockListings();
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
