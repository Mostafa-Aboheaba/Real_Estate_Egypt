import { ListingType } from '../../property/enums/listing-type.enum';
import { PropertyType } from '../../property/enums/property-type.enum';
import { SearchPreferences } from './search-preferences.vo';

describe('SearchPreferences', () => {
  it('accepts valid prefs', () => {
    const p = SearchPreferences.create({
      listingType: ListingType.Rent,
      minPriceEgp: 5000,
      maxPriceEgp: 15000,
      propertyTypes: [PropertyType.Apartment],
      cities: ['Cairo'],
    });
    expect(p?.toJSON().listingType).toBe(ListingType.Rent);
  });

  it('rejects min > max', () => {
    expect(
      SearchPreferences.create({
        minPriceEgp: 20000,
        maxPriceEgp: 10000,
      }),
    ).toBeNull();
  });
});
