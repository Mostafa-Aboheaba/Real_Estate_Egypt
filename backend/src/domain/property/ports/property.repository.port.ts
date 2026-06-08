import { ListingProvider } from '../enums/listing-provider.enum';
import { ListingType } from '../enums/listing-type.enum';
import { PropertyType } from '../enums/property-type.enum';
import { Property } from '../entities/property.entity';

export const PROPERTY_REPOSITORY = Symbol('PROPERTY_REPOSITORY');

export type PropertySort =
  | 'price_asc'
  | 'price_desc'
  | 'newest'
  | 'relevance';

export interface PropertySearchFilters {
  q?: string;
  governorate?: string;
  city?: string;
  district?: string;
  minPrice?: number;
  maxPrice?: number;
  propertyType?: PropertyType;
  listingType?: ListingType;
  minBedrooms?: number;
  maxBedrooms?: number;
  minBathrooms?: number;
  maxBathrooms?: number;
  minAreaSqm?: number;
  maxAreaSqm?: number;
  provider?: ListingProvider;
  sort?: PropertySort;
  page?: number;
  pageSize?: number;
}

export interface PropertyListItem {
  id: string;
  title: string;
  priceEgp: number;
  listingType: ListingType;
  propertyType: PropertyType;
  bedrooms: number | null;
  bathrooms: number | null;
  areaSqm: number | null;
  location: {
    governorate: string;
    city: string;
    district: string;
  };
  thumbnailUrl: string | null;
  provider: ListingProvider;
  syncedAt: Date;
}

export interface PaginatedProperties {
  items: PropertyListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ProviderSyncStats {
  provider: ListingProvider;
  listingCount: number;
  activeListingCount: number;
}

export interface PropertyRepositoryPort {
  upsertMany(properties: Property[]): Promise<number>;
  deactivateStale(provider: ListingProvider, olderThan: Date): Promise<number>;
  findById(id: string): Promise<Property | null>;
  search(filters: PropertySearchFilters): Promise<PaginatedProperties>;
  countByProvider(): Promise<ProviderSyncStats[]>;
  countMockActiveByProvider(provider: ListingProvider): Promise<number>;
  listDistinctCities(limit?: number): Promise<string[]>;
}
