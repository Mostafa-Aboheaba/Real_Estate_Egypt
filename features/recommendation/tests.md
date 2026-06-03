# Tests — Recommendations

## Document Status

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Status | Draft |
| Last Updated | 2026-06-03 |

Test ID format: **REC-T-###**

---

## 1. Unit tests (domain)

| ID | AC | Description |
|----|-----|-------------|
| REC-T-001 | AC-REC-003 | `FeedbackSentiment` rejects invalid enum |
| REC-T-002 | AC-REC-003 | Upsert policy: one feedback per user + property |
| REC-T-003 | AC-REC-005 | Disliked ID added to exclusion set |
| REC-T-004 | AC-REC-002 | Favorited ID added to exclusion set |
| REC-T-005 | AC-REC-004 | `search_preferences` maps to SQL filter DTO (max price, cities) |
| REC-T-006 | AC-REC-008 | `FairHousingFilter` rejects protected filter keys |
| REC-T-007 | AC-REC-008 | Scoring allowlist excludes nationality, religion, ethnicity, family status |
| REC-T-008 | AC-REC-002 | `BuildPreferenceVector` returns unit-normalized 768-vector |
| REC-T-009 | AC-REC-001 | Cold-start detector returns popular when `signalCount = 0` |
| REC-T-010 | AC-REC-002 | Mean of two like embeddings equals manual fixture average |

**Target:** ≥ 80% coverage `domain/recommendation/` (NFR-MAINT-003).

---

## 2. Fair housing and non-discrimination (compliance)

| ID | AC / NFR | Description |
|----|----------|-------------|
| REC-T-050 | AC-REC-008, NFR-COMP-005 | Static analysis: no protected column names in `pgvector-scoring.adapter` SQL strings |
| REC-T-051 | AC-REC-008 | Property fixture set differing only by blocked attributes → identical ranking when price/location/type held constant |
| REC-T-052 | AC-REC-008 | User preference vector unchanged when optional protected metadata added to liked listing payload |
| REC-T-053 | AC-REC-008 | Attempt to pass `nationality` filter via API → 400 + audit log event |
| REC-T-054 | AC-REC-008 | Regression: weight vector for blend uses only allowlisted feature keys (snapshot test) |
| REC-T-055 | AC-REC-008 | Recommendation Agent system prompt includes fair housing rule (config snapshot) |

These tests run in CI on every PR touching `domain/recommendation/` or `infrastructure/vector/`.

---

## 3. Integration tests (API)

| ID | AC | Description |
|----|-----|-------------|
| REC-T-010 | AC-REC-001 | Authenticated GET returns ≥ 5 items when corpus allows |
| REC-T-011 | AC-REC-001 | Cold-start user receives `mode: popular` |
| REC-T-012 | AC-REC-009 | Guest GET without token returns `popular_in_cairo` + CTA |
| REC-T-013 | AC-REC-006 | Page 2 has no IDs from page 1 |
| REC-T-014 | AC-REC-006 | Default `pageSize=10` honored |
| REC-T-015 | AC-REC-005 | After dislike POST, property absent on next GET |
| REC-T-016 | AC-REC-003 | Like POST increases rank of similar listing (top-5 overlap) |
| REC-T-017 | AC-REC-002 | Favorited property excluded from feed |
| REC-T-018 | AC-REC-004 | Rent max 15,000 EGP + Cairo → no violating listing in results |
| REC-T-019 | AC-REC-003 | Duplicate like POST is idempotent 200 |
| REC-T-020 | AC-REC-003 | Dislike → like transition updates sentiment |
| REC-T-021 | AC-REC-001 | Initial feed p95 ≤ 2 s under seed dataset (perf smoke) |
| REC-T-022 | — | Guest rate limit 429 after threshold |

---

## 4. Integration tests (preference vector + pgvector)

| ID | AC | Description |
|----|-----|-------------|
| REC-T-030 | AC-REC-002 | Like three listings → `user_preference_vectors` row updated |
| REC-T-031 | AC-REC-002 | Vector distance to liked listings < distance to random listings |
| REC-T-032 | AC-REC-007 | P1: chat `listing_refs` shifts feed toward referenced area (≥ 30% match) |
| REC-T-033 | AC-REC-001 | `recompute-user` job completes within 30 s of feedback |

---

## 5. Mobile tests

| ID | AC | Type | Description |
|----|-----|------|-------------|
| REC-T-040 | AC-REC-001 | Widget | Home section title "Properties you might like" when logged in |
| REC-T-041 | AC-REC-009 | Widget | Guest sees "Popular in Cairo" + register CTA |
| REC-T-042 | AC-REC-003 | Widget | Dislike removes card from carousel |
| REC-T-043 | AC-REC-006 | Widget | Scroll end triggers load more |
| REC-T-044 | AC-REC-003 | E2E manual | Like → pull-to-refresh → feed composition changes |

---

## 6. AC coverage matrix (P0)

| AC-ID | Test IDs |
|-------|----------|
| AC-REC-001 | REC-T-009, 010, 011, 021, 040 |
| AC-REC-002 | REC-T-004, 008, 010, 017, 030, 031 |
| AC-REC-003 | REC-T-001, 002, 015, 016, 019, 020, 042, 044 |
| AC-REC-004 | REC-T-005, 018 |
| AC-REC-005 | REC-T-015 |
| AC-REC-006 | REC-T-013, 014, 043 |
| AC-REC-008 | REC-T-006, 007, 050–055 |
| AC-REC-009 | REC-T-012, 041 |

**P1:** AC-REC-007 → REC-T-032 (enable when M7 chat signals ship).

---

## Related documents

- [acceptance_criteria.md](./acceptance_criteria.md)
- [implementation_tasks.md](./implementation_tasks.md)
- [requirements.md](./requirements.md)
