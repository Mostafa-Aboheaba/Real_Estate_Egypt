import { Property as PrismaProperty, Prisma } from '@prisma/client';
import { Property } from '../../../domain/property/entities/property.entity';
import { ListingProvider } from '../../../domain/property/enums/listing-provider.enum';
import { ListingType } from '../../../domain/property/enums/listing-type.enum';
import { PropertyType } from '../../../domain/property/enums/property-type.enum';
import { LocationProps } from '../../../domain/property/value-objects/location.vo';
import {
  PropertyListItem,
  PropertySearchFilters,
} from '../../../domain/property/ports/property.repository.port';

export function toDomainProperty(row: PrismaProperty): Property {
  const location = row.location as unknown as LocationProps;
  return Property.create({
    id: row.id,
    externalId: row.externalId,
    provider: row.provider as ListingProvider,
    title: row.title,
    description: row.description,
    priceEgp: Number(row.priceEgp),
    propertyType: row.propertyType as PropertyType,
    listingType: row.listingType as ListingType,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    areaSqm: row.areaSqm != null ? Number(row.areaSqm) : null,
    location,
    amenities: (row.amenities as string[]) ?? [],
    images: (row.images as string[]) ?? [],
    sourceUrl: row.sourceUrl,
    isActive: row.isActive,
    syncedAt: row.syncedAt,
    projectId: row.projectId,
    agentId: row.agentId,
  });
}

export function toListItem(row: PrismaProperty): PropertyListItem {
  const location = row.location as unknown as LocationProps;
  const images = (row.images as string[]) ?? [];
  return {
    id: row.id,
    title: row.title,
    priceEgp: Number(row.priceEgp),
    listingType: row.listingType as ListingType,
    propertyType: row.propertyType as PropertyType,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    areaSqm: row.areaSqm != null ? Number(row.areaSqm) : null,
    location: {
      governorate: location.governorate,
      city: location.city,
      district: location.district,
    },
    thumbnailUrl: images[0] ?? null,
    provider: row.provider as ListingProvider,
    syncedAt: row.syncedAt,
  };
}

export function toPrismaUpsertData(
  property: Property,
): Prisma.PropertyCreateInput {
  return {
    externalId: property.externalId,
    provider: property.provider,
    listingType: property.listingType,
    propertyType: property.propertyType,
    title: property.title,
    description: property.description ?? undefined,
    priceEgp: property.priceEgp,
    bedrooms: property.bedrooms ?? undefined,
    bathrooms: property.bathrooms ?? undefined,
    areaSqm: property.areaSqm ?? undefined,
    location: property.location.toJSON() as unknown as Prisma.InputJsonValue,
    amenities: property.amenities,
    images: property.images,
    sourceUrl: property.sourceUrl ?? undefined,
    isActive: property.isActive,
    syncedAt: property.syncedAt,
  };
}

export function normalizeSearchFilters(
  filters: PropertySearchFilters,
): Required<Pick<PropertySearchFilters, 'page' | 'pageSize' | 'sort'>> &
  PropertySearchFilters {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, filters.pageSize ?? 20));
  const sort = filters.sort ?? (filters.q ? 'relevance' : 'newest');
  return { ...filters, page, pageSize, sort };
}
