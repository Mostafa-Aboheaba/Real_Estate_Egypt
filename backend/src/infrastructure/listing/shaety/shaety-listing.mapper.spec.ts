import {
  mapShaetyPropertyToRawListing,
  parsePriceEgp,
} from './shaety-listing.mapper';

describe('shaety-listing.mapper', () => {
  const baseUrl = 'https://shaety.pountech.com/api';

  it('maps a Shaety property record to RawListing', () => {
    const raw = mapShaetyPropertyToRawListing(
      {
        id: 65008,
        code: '121957',
        title: 'شقة للبيع 155م الإبراهيمية',
        content: '<div>3 غرف</div>',
        property_type: 'شقة',
        property_status: 'للبيع',
        property_price: 3_200_000,
        property_size: '155',
        property_bedrooms: '3',
        property_bathrooms: '2',
        city: 'الإسكندرية',
        property_area: 'الإبراهيمية',
        image: 'https://shaety.com/wp-content/uploads/2020/07/1-17.jpg',
      },
      baseUrl,
    );

    expect(raw?.externalId).toBe('65008');
    expect(raw?.priceEgp).toBe(3_200_000);
    expect(raw?.listingType).toBe('sale');
    expect(raw?.propertyType).toBe('apartment');
    expect(raw?.location.city).toBe('الإسكندرية');
    expect(raw?.sourceUrl).toContain(
      'shaety.pountech.com/api/properties/65008',
    );
  });

  it('parses Arabic million price strings', () => {
    expect(parsePriceEgp('3 مليون و 200 الف جنيه')).toBe(3_200_000);
  });

  it('maps rent status', () => {
    const raw = mapShaetyPropertyToRawListing(
      {
        id: 1,
        title: 'شقة للإيجار',
        property_status: 'للإيجار',
        property_price: 15000,
        city: 'القاهرة',
      },
      baseUrl,
    );
    expect(raw?.listingType).toBe('rent');
  });
});
