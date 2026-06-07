import { ListingRef } from '../../../../src/domain/chat/value-objects/listing-ref.vo';

describe('ListingRef', () => {
  const validId = '550e8400-e29b-41d4-a716-446655440000';

  it('creates from valid payload', () => {
    const ref = ListingRef.create({
      propertyId: validId,
      title: '3BR Maadi',
      priceEgp: 25000,
    });
    expect(ref?.propertyId).toBe(validId);
    expect(ref?.priceEgp).toBe(25000);
  });

  it('rejects invalid propertyId', () => {
    expect(
      ListingRef.create({
        propertyId: 'not-uuid',
        title: 'x',
        priceEgp: 1,
      }),
    ).toBeNull();
  });
});
