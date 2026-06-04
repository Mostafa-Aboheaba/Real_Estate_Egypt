import { ListingProvider } from '../../domain/property/enums/listing-provider.enum';
import { ListingType } from '../../domain/property/enums/listing-type.enum';
import { PropertyType } from '../../domain/property/enums/property-type.enum';
import { mapRawListingToProperty } from './listing-normalizer';

describe('mapRawListingToProperty', () => {
  it('normalizes unknown property type to other', () => {
    const property = mapRawListingToProperty(
      {
        externalId: 'x1',
        title: 'Test',
        priceEgp: 1000000,
        propertyType: 'studio',
        listingType: 'sale',
        location: {
          governorate: 'Cairo',
          city: 'Maadi',
          district: 'Degla',
        },
      },
      ListingProvider.Shaety,
    );
    expect(property.propertyType).toBe(PropertyType.Other);
  });

  it('deduplicates amenities', () => {
    const property = mapRawListingToProperty(
      {
        externalId: 'x2',
        title: 'Test 2',
        priceEgp: 500000,
        propertyType: 'apartment',
        listingType: 'rent',
        location: {
          governorate: 'Cairo',
          city: 'Dokki',
          district: 'Dokki',
        },
        amenities: ['Parking', 'parking', ' Elevator '],
      },
      ListingProvider.Shaety,
    );
    expect(property.amenities).toEqual(['parking', 'elevator']);
    expect(property.listingType).toBe(ListingType.Rent);
  });
});
