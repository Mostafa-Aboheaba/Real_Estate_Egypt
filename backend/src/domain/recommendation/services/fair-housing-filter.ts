export const ALLOWED_SCORING_ATTRIBUTES = [
  'price_egp',
  'location',
  'bedrooms',
  'bathrooms',
  'area_sqm',
  'amenities',
  'listing_type',
  'property_type',
  'is_active',
] as const;

export const BLOCKED_FILTER_KEYS = [
  'nationality',
  'religion',
  'ethnicity',
  'family_status',
  'race',
  'gender',
  'disability',
  'marital_status',
] as const;

export class FairHousingFilter {
  static assertAllowedFilterKeys(keys: string[]): void {
    for (const key of keys) {
      if (
        BLOCKED_FILTER_KEYS.includes(
          key as (typeof BLOCKED_FILTER_KEYS)[number],
        )
      ) {
        throw new Error(`BLOCKED_FILTER_KEY:${key}`);
      }
    }
  }

  static assertSqlUsesAllowlist(sql: string): void {
    const lower = sql.toLowerCase();
    for (const blocked of BLOCKED_FILTER_KEYS) {
      if (lower.includes(blocked)) {
        throw new Error(`BLOCKED_SQL_ATTRIBUTE:${blocked}`);
      }
    }
  }
}
