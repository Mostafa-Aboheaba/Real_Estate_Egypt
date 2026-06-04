import { Property } from '../../domain/property/entities/property.entity';
import { ListingProvider } from '../../domain/property/enums/listing-provider.enum';
import { ListingType } from '../../domain/property/enums/listing-type.enum';
import { PropertyType } from '../../domain/property/enums/property-type.enum';
import { RawListing } from '../../domain/property/ports/listing-provider.port';

const PROPERTY_TYPES = new Set(Object.values(PropertyType));
const LISTING_TYPES = new Set(Object.values(ListingType));

export function mapRawListingToProperty(
  raw: RawListing,
  provider: ListingProvider,
): Property {
  const propertyType = normalizePropertyType(raw.propertyType);
  const listingType = normalizeListingType(raw.listingType);

  return Property.create({
    externalId: String(raw.externalId),
    provider,
    title: raw.title,
    description: raw.description,
    priceEgp: Number(raw.priceEgp),
    propertyType,
    listingType,
    bedrooms: raw.bedrooms ?? null,
    bathrooms: raw.bathrooms ?? null,
    areaSqm: raw.areaSqm ?? null,
    location: raw.location,
    amenities: normalizeAmenities(raw.amenities),
    images: raw.images ?? [],
    sourceUrl: raw.sourceUrl,
    isActive: true,
    syncedAt: new Date(),
  });
}

function normalizePropertyType(value: string): PropertyType {
  const normalized = value.toLowerCase().replace(/\s+/g, '_') as PropertyType;
  if (PROPERTY_TYPES.has(normalized)) {
    return normalized;
  }
  return PropertyType.Other;
}

function normalizeListingType(value: string): ListingType {
  const normalized = value.toLowerCase() as ListingType;
  if (LISTING_TYPES.has(normalized)) {
    return normalized;
  }
  return ListingType.Sale;
}

function normalizeAmenities(amenities?: string[]): string[] {
  if (!amenities?.length) {
    return [];
  }
  return [...new Set(amenities.map((a) => a.trim().toLowerCase()).filter(Boolean))];
}
