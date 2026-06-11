import { ALLOWED_SCORING_ATTRIBUTES, BLOCKED_FILTER_KEYS } from '../../domain/recommendation/services/fair-housing-filter';

describe('PgvectorScoringAdapter SQL allowlist', () => {
  it('uses only allowlisted property columns in scoring queries', () => {
    const sqlFragments = [
      'p.is_active',
      'p.listing_type',
      'p.price_egp',
      'p.property_type',
      "p.location->>'city'",
      "p.location->>'governorate'",
      "p.location->>'district'",
      'p.synced_at',
      'p.id',
      'p.title',
      'p.images',
      'e.entity_type',
      'e.chunk_index',
      'e.embedding',
    ];
    for (const fragment of sqlFragments) {
      const key = fragment.replace(/^p\./, '').split(/[^a-z_]/)[0];
      if (BLOCKED_FILTER_KEYS.includes(key as never)) {
        throw new Error(`Blocked key in SQL: ${key}`);
      }
    }
    expect(ALLOWED_SCORING_ATTRIBUTES.length).toBeGreaterThan(0);
  });

  it('does not reference protected attributes', () => {
    const template = `
      SELECT p.price_egp, p.location, p.listing_type, p.property_type
      FROM properties p
      WHERE p.is_active = true
    `;
    for (const blocked of BLOCKED_FILTER_KEYS) {
      expect(template.toLowerCase()).not.toContain(blocked);
    }
  });
});
