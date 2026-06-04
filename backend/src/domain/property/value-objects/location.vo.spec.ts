import { Location } from './location.vo';

describe('Location', () => {
  it('creates with required fields', () => {
    const loc = Location.create({
      governorate: 'Cairo',
      city: 'Maadi',
      district: 'Degla',
    });
    expect(loc.governorate).toBe('Cairo');
    expect(loc.city).toBe('Maadi');
    expect(loc.district).toBe('Degla');
  });

  it('rejects missing district', () => {
    expect(() =>
      Location.create({
        governorate: 'Cairo',
        city: 'Maadi',
        district: '  ',
      }),
    ).toThrow();
  });
});
