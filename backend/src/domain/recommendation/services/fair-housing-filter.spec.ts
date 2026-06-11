import {
  ALLOWED_SCORING_ATTRIBUTES,
  BLOCKED_FILTER_KEYS,
  FairHousingFilter,
} from './fair-housing-filter';

describe('FairHousingFilter', () => {
  it('rejects protected filter keys', () => {
    expect(() =>
      FairHousingFilter.assertAllowedFilterKeys(['maxPriceEgp', 'nationality']),
    ).toThrow('BLOCKED_FILTER_KEY:nationality');
  });

  it('allowlist excludes protected attributes', () => {
    for (const blocked of BLOCKED_FILTER_KEYS) {
      expect(ALLOWED_SCORING_ATTRIBUTES).not.toContain(blocked);
    }
  });

  it('detects blocked columns in SQL strings', () => {
    expect(() =>
      FairHousingFilter.assertSqlUsesAllowlist(
        'SELECT * FROM properties WHERE religion = $1',
      ),
    ).toThrow('BLOCKED_SQL_ATTRIBUTE:religion');
  });
});
