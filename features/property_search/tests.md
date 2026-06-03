# Tests — Property Search & Listing Sync

## Document Status

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Status | Draft |
| Last Updated | 2026-06-03 |

Test ID format: **SEA-T-###**

---

## 1. Unit tests (domain)

| ID | AC | Description |
|----|-----|-------------|
| SEA-T-001 | AC-SEARCH-003 | Canonical mapper maps Shaety fixture to Property entity |
| SEA-T-002 | AC-SEARCH-012 | Deactivation rule: missing 24h+ → isActive false |
| SEA-T-003 | AC-SEARCH-003 | Location VO rejects empty governorate/city |
| SEA-T-004 | AC-SEARCH-003 | Provider enum accepts only shaety, aqarmap, property_finder |
| SEA-T-005 | AC-SEARCH-014 | Normalizer strips invalid price and defaults amenities to [] |

**Target:** ≥ 80% coverage `domain/property/` (NFR-MAINT-003).

---

## 2. Integration tests (API + sync)

| ID | AC | Description |
|----|-----|-------------|
| SEA-T-010 | AC-SEARCH-001 | Search returns active listings from mock Shaety ingest |
| SEA-T-011 | AC-SEARCH-002 | Location filter governorate + city + district |
| SEA-T-012 | AC-SEARCH-003 | Combined price, type, beds, listingType filters |
| SEA-T-013 | AC-SEARCH-005 | Sort price_asc and newest |
| SEA-T-014 | AC-SEARCH-005 | Sort relevance uses ts_rank when q present |
| SEA-T-015 | AC-SEARCH-006 | Pagination metadata; no duplicate across pages |
| SEA-T-016 | AC-SEARCH-006 | Guest page 1 OK; page 2 returns 401 |
| SEA-T-017 | AC-SEARCH-007 | Detail 200 with images, amenities, location |
| SEA-T-018 | AC-SEARCH-007 | Detail 404 for inactive listing |
| SEA-T-019 | AC-SEARCH-008 | Response includes providerLabel and sourceUrl |
| SEA-T-020 | AC-SEARCH-010 | Keyword search q=Maadi and Arabic query |
| SEA-T-021 | AC-SEARCH-012 | Inactive listing excluded after deactivation job |
| SEA-T-022 | AC-SEARCH-013 | Search with only Shaety adapter returns shaety provider only |
| SEA-T-023 | AC-SEARCH-014 | Sync job upserts properties and updates search_vector |
| SEA-T-024 | AC-SEARCH-014 | sync_runs row created with success status |
| SEA-T-025 | AC-SEARCH-015 | Provider 503 retries; failed sync_runs recorded |
| SEA-T-026 | AC-SEARCH-015 | 3 consecutive failures set provider status failed + alert metric |
| SEA-T-027 | AC-SEARCH-017 | Admin GET sync/status shape and RBAC |
| SEA-T-028 | AC-SEARCH-017 | Agent allowed; buyer 403 on sync status |
| SEA-T-029 | AC-SEARCH-003 | Invalid filter combination returns 400 |

---

## 3. Mobile tests

| ID | AC | Type | Description |
|----|-----|------|-------------|
| SEA-T-030 | AC-SEARCH-001 | Widget | Results list renders cards from mock API |
| SEA-T-031 | AC-SEARCH-010 | Widget | RTL search bar when locale ar-EG |
| SEA-T-032 | AC-SEARCH-006 | Widget | Empty and error states |
| SEA-T-033 | AC-SEARCH-003 | Widget | Filters bottom sheet applies query params |
| SEA-T-034 | AC-SEARCH-007 | Widget | Detail placeholder when image fails |
| SEA-T-035 | AC-SEARCH-008 | Widget | Provider badge and source link visible |
| SEA-T-036 | AC-SEARCH-009 | E2E manual | Guest browse page 1; auth prompt on page 2 |

---

## 4. Performance smoke

| ID | AC | Description |
|----|-----|-------------|
| SEA-T-040 | AC-SEARCH-001 | Search p95 ≤ 2s on 10k seed rows (local) |
| SEA-T-041 | AC-SEARCH-007 | Detail p95 ≤ 1.5s |

---

## 5. AC coverage matrix (P0)

| AC-ID | Test IDs |
|-------|----------|
| AC-SEARCH-001 | SEA-T-010, 030, 040 |
| AC-SEARCH-002 | SEA-T-011 |
| AC-SEARCH-003 | SEA-T-012, 029, 033 |
| AC-SEARCH-005 | SEA-T-013, 014, 020 |
| AC-SEARCH-006 | SEA-T-015, 016, 032 |
| AC-SEARCH-007 | SEA-T-017, 018, 034, 041 |
| AC-SEARCH-008 | SEA-T-019, 035 |
| AC-SEARCH-010 | SEA-T-020, 031 |
| AC-SEARCH-012 | SEA-T-002, 021 |
| AC-SEARCH-013 | SEA-T-022 |
| AC-SEARCH-014 | SEA-T-023, 024 |
| AC-SEARCH-015 | SEA-T-025, 026 |
| AC-SEARCH-017 | SEA-T-027, 028 |

**P1 coverage (post-MVP sprint):**

| AC-ID | Test IDs |
|-------|----------|
| AC-SEARCH-004 | SEA-T-050 (amenity filter integration) |
| AC-SEARCH-009 | SEA-T-036 |
| AC-SEARCH-011 | SEA-T-051 (geo radius) |
| AC-SEARCH-016 | SEA-T-052 (manual sync RBAC) |

---

## Related documents

- [acceptance_criteria.md](./acceptance_criteria.md)
- [implementation_tasks.md](./implementation_tasks.md)
