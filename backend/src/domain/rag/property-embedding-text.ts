import { Property } from '../property/entities/property.entity';

export function buildPropertyEmbeddingText(property: Property): string {
  const loc = property.location;
  const amenities =
    property.amenities.length > 0 ? property.amenities.join(', ') : 'none';
  const desc = (property.description ?? '').trim().slice(0, 2000);

  return [
    '[PROPERTY]',
    `Title: ${property.title}`,
    `Type: ${property.propertyType} | ${property.listingType} | ${property.bedrooms ?? '?'} BR | ${property.areaSqm ?? '?'} sqm`,
    `Price: ${property.priceEgp} EGP`,
    `Location: ${loc.district}, ${loc.city}, ${loc.governorate}`,
    `Description: ${desc}`,
    `Amenities: ${amenities}`,
    `Provider: ${property.provider} | ID: ${property.id ?? property.externalId}`,
  ].join('\n');
}

export function propertyEmbeddingMetadata(
  property: Property,
): Record<string, unknown> {
  return {
    source_type: 'property',
    listing_id: property.id,
    governorate: property.location.governorate,
    city: property.location.city,
    listing_type: property.listingType,
    property_type: property.propertyType,
    price_egp: property.priceEgp,
    bedrooms: property.bedrooms,
    provider: property.provider,
    is_active: property.isActive,
  };
}
