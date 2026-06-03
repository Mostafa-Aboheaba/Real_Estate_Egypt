# Requirements — Recommendations

## Document Status

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Status | Draft |
| Last Updated | 2026-06-03 |
| Traces to | FR-REC-* in [specs/requirements.md](../../specs/requirements.md) |

---

## 1. Purpose

Define functional and non-functional requirements for personalized property recommendations on the home screen and via the Recommendation Agent, including explicit feedback, preference-bound scoring, fair housing compliance, and guest cold-start behavior.

---

## 2. Scope

### In scope (MVP — P0)

- Authenticated **"Properties you might like"** home feed
- Embedding-based scoring via **pgvector** and a per-user **preference vector**
- Signal ingestion: search preferences, favorites, like/dislike feedback
- Hard exclusion of disliked listings and favorited listings (already saved)
- Respect `users.search_preferences` (budget, areas, listing/property type)
- Paginated feed API and mobile home section
- Guest **"Popular in Cairo"** cold-start substitute (no personalization)
- Fair housing: no discriminatory features in scoring or filters (FR-REC-008)

### In scope (P1)

- Chat-informed signals from `messages.listing_refs` (discussed/viewed listings)
- Recommendation Agent tool parity (`get_recommendations`, `record_feedback`)

### Out of scope (MVP)

- Separate ML training pipeline or external vector DB
- User-selectable recommendation models
- Explainability beyond a short stub reason per card
- Collaborative filtering across users
- Email/push digests of recommendations

---

## 3. Personas

| Persona | Role ID | Recommendation behavior |
|---------|---------|-------------------------|
| Guest | — | Popular listings only; register CTA |
| Buyer / Renter | `buyer` | Full personalized feed + feedback |
| Real Estate Agent | `agent` | Same feed mechanics as buyer (own usage) |
| Platform | — | Enforces fair housing guardrails |

---

## 4. Functional requirements

| ID | Requirement | Priority | User stories | Acceptance criteria |
|----|-------------|----------|--------------|---------------------|
| FR-REC-001 | Authenticated users receive **"Properties you might like"** on home; guests see popular listings | P0 | [US-REC-001](./user_stories.md#us-rec-001-personalized-home-feed), [US-REC-009](./user_stories.md#us-rec-009-guest-no-recommendations) | [AC-REC-001](./acceptance_criteria.md#ac-rec-001-home-feed), [AC-REC-009](./acceptance_criteria.md#ac-rec-009-guest-popular-listings) |
| FR-REC-002 | Scoring considers **search history**, **favorites**, and **explicit feedback** | P0 | [US-REC-002](./user_stories.md#us-rec-002-recommendations-from-behavior) | [AC-REC-002](./acceptance_criteria.md#ac-rec-002-behavior-based-scoring) |
| FR-REC-003 | Users **like or dislike** properties to refine future recommendations | P0 | [US-REC-003](./user_stories.md#us-rec-003-like-and-dislike-properties) | [AC-REC-003](./acceptance_criteria.md#ac-rec-003-like-and-dislike) |
| FR-REC-004 | Incorporate **AI chat** signals (viewed/discussed listings) | P1 | [US-REC-007](./user_stories.md#us-rec-007-chat-informed-recommendations) | [AC-REC-007](./acceptance_criteria.md#ac-rec-007-chat-signals) |
| FR-REC-005 | Respect **search preferences** (budget, areas, property type) by default | P0 | [US-REC-004](./user_stories.md#us-rec-004-respect-search-preferences) | [AC-REC-004](./acceptance_criteria.md#ac-rec-004-preference-boundaries) |
| FR-REC-006 | **Exclude disliked** listings from all subsequent feeds | P0 | [US-REC-005](./user_stories.md#us-rec-005-exclude-disliked-properties) | [AC-REC-005](./acceptance_criteria.md#ac-rec-005-disliked-exclusion) |
| FR-REC-007 | Feed is **paginated** without duplicates across pages | P0 | [US-REC-006](./user_stories.md#us-rec-006-paginated-recommendations) | [AC-REC-006](./acceptance_criteria.md#ac-rec-006-pagination) |
| FR-REC-008 | No **discriminatory filtering** on protected characteristics | P0 | [US-REC-008](./user_stories.md#us-rec-008-non-discriminatory-recommendations) | [AC-REC-008](./acceptance_criteria.md#ac-rec-008-fair-housing) |

---

## 5. Non-functional requirements

| ID | Application |
|----|-------------|
| NFR-COMP-005 | Fair housing — protected characteristics never used as scoring features or hard filters |
| NFR-PERF-003 | Home recommendation initial load p95 ≤ 2 s (AC-REC-001) |
| NFR-SEC-008 | JWT required on personalized endpoints; guests use unauthenticated popular feed |
| NFR-MAINT-001 | SDD approved before implementation |
| NFR-MAINT-003 | Domain layer unit coverage ≥ 80% for `domain/recommendation/` |

---

## 6. Dependencies

| Dependency | Required for |
|------------|--------------|
| [authentication](../authentication/) | JWT, verified user for personalized feed |
| [profile](../profile/) | `search_preferences`, favorites |
| [property_search](../property_search/) | Active listings, embeddings, search history port |
| M6 RAG / embeddings | Property vectors in `embeddings` (pgvector) |
| M7 AI chat (P1) | Chat listing refs as signals |

**Blocks:** None downstream of auth; recommendation enhances home UX.

**Blocked by:** M1 SDD approval, M3 auth, M4 listings + embeddings, M5 profile.

---

## 7. Assumptions

- Listing embeddings exist for active properties (`embeddings`, chunk_index = 0).
- Cold-start users with no likes use **popular listings in Greater Cairo** (views/bookings proxy or admin-curated query).
- Favorited properties are excluded from the feed but remain accessible in profile favorites.
- Search history is available via a read port from property search (recent filter payloads or detail views); stub empty array until search telemetry ships.
- Feed mode uses **embedding similarity only** — no LLM call per home refresh ([ai_services_architecture.md](../../architecture/ai_services_architecture.md) §9).

---

## 8. Open questions

| # | Question | Owner | Resolution |
|---|----------|-------|------------|
| 1 | Popular-listings algorithm: views vs manual seed | Product | Default: top active rentals in Cairo governorate by `synced_at` recency until analytics exist |
| 2 | Search history storage: dedicated table vs Redis | Tech Lead | Defer to property_search SDD; recommendation consumes port only |
| 3 | Chat signal weight vs like/dislike | AI Lead | P1: chat refs at 0.3× weight of explicit like in vector blend |

---

## Related documents

- [User stories](./user_stories.md)
- [Acceptance criteria](./acceptance_criteria.md)
- [Architecture](./architecture.md)
- [Data model](./data_model.md)
- [API design](./api_design.md)
- [Tests](./tests.md)
- [Implementation tasks](./implementation_tasks.md)
