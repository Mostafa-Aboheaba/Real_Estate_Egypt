import { Phone } from './phone.vo';

describe('Phone', () => {
  it('accepts +20 format', () => {
    const p = Phone.create('+201012345678');
    expect(p?.value).toBe('+201012345678');
  });

  it('normalizes leading 0', () => {
    const p = Phone.create('01012345678');
    expect(p?.value).toBe('+201012345678');
  });

  it('rejects invalid', () => {
    expect(Phone.create('123')).toBeNull();
  });
});
