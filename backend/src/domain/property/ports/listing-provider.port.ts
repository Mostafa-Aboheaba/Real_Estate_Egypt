import { ListingProvider } from '../enums/listing-provider.enum';
import { Property } from '../entities/property.entity';

export const LISTING_PROVIDER = Symbol('LISTING_PROVIDER');

export interface RawListing {
  externalId: string;
  title: string;
  description?: string | null;
  priceEgp: number;
  propertyType: string;
  listingType: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  areaSqm?: number | null;
  location: {
    governorate: string;
    city: string;
    district: string;
    latitude?: number;
    longitude?: number;
  };
  amenities?: string[];
  images?: string[];
  sourceUrl?: string | null;
}

export type ListingBatchHandler = (
  listings: RawListing[],
  page: number,
) => Promise<void>;

export interface ListingProviderPort {
  readonly provider: ListingProvider;
  fetchListings(since?: Date): Promise<RawListing[]>;
  /** Incremental ingest — persist each API page before fetching the next. */
  fetchListingsInBatches?(
    onBatch: ListingBatchHandler,
    since?: Date,
  ): Promise<number>;
}
