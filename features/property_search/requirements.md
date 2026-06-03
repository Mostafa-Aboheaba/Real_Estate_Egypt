# Requirements — Property Search & Listing Sync

## Document Status

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Status | Draft |
| Last Updated | 2026-06-03 |
| Traces to | FR-SEARCH-*, FR-SYNC-* in [specs/requirements.md](../../specs/requirements.md) |

---

## 1. Purpose

Define functional and non-functional requirements for unified property search, listing detail, provider ingestion, and admin sync observability for the AI Property Assistant mobile app and REST API.

---

## 2. Scope

### In scope (MVP)

- Unified catalog from Shaety (شقتي), Aqarmap, Property Finder Egypt
- Shaety-first provider rollout; secondary providers in phases 2–3
- Scheduled listing sync (15–60 minutes per provider) via BullMQ workers
- PostgreSQL canonical store with **tsvector** keyword search and **pgvector** embeddings (no Elasticsearch)
- Search filters: location, price (EGP), property type, listing type, beds, baths, area
- Full-text keyword search on title and description
- Pagination (default page size 20) and sort by price, date listed, relevance
- Listing detail with photos, attributes, provider attribution, source URL
- Inactive listings after 24h absence from provider feed
- Admin sync status API
- Bilingual search UI (ar-EG, en)
- Guest first-page browse (P1)

### Out of scope (MVP)

- Cross-provider deduplication UI
- Elasticsearch or external search cluster
- Aqarmap / Property Finder adapters before Shaety is production-ready (code may stub ports)
- Manual sync trigger UI (API only, P1)
- Saved searches and favorites (profile feature)
- Map-first search UX (geo filter API P1)

---

## 3. Personas

| Persona | Role ID | Search needs |
|---------|---------|--------------|
| Guest | — | First page browse; detail view; auth prompt for page 2+ |
| Buyer / Renter | `buyer` | Full search, filters, detail, booking entry point |
| Real Estate Agent | `agent` | Same search; sync status visibility |
| Platform Admin | `admin` | Sync health, manual sync (P1) |

---

## 4. Functional requirements — Search

| ID | Requirement | Priority | Stories |
|----|-------------|----------|---------|
| FR-SEARCH-001 | Aggregate listings from Shaety, Aqarmap, Property Finder into one catalog | P0 | US-SEARCH-001 |
| FR-SEARCH-002 | Sync listings on scheduled interval (15–60 min per provider) | P0 | US-SEARCH-012 |
| FR-SEARCH-003 | Shaety integrated first; others follow rollout order | P0 | US-SEARCH-013 |
| FR-SEARCH-004 | Search by governorate, city, district | P0 | US-SEARCH-002 |
| FR-SEARCH-005 | Filter by price range in EGP | P0 | US-SEARCH-003 |
| FR-SEARCH-006 | Filter by property type | P0 | US-SEARCH-003 |
| FR-SEARCH-007 | Filter by listing type (sale / rent) | P0 | US-SEARCH-003 |
| FR-SEARCH-008 | Filter by bedrooms, bathrooms, area (sqm) | P0 | US-SEARCH-003 |
| FR-SEARCH-009 | Filter by normalized amenities | P1 | US-SEARCH-004 |
| FR-SEARCH-010 | Keyword / full-text search on title and description | P0 | US-SEARCH-001 |
| FR-SEARCH-011 | Paginated results (default page size 20) | P0 | US-SEARCH-006 |
| FR-SEARCH-012 | Sort by price, date listed, relevance | P0 | US-SEARCH-005 |
| FR-SEARCH-013 | Detail: photos, price, area, beds, location, description, amenities | P0 | US-SEARCH-007 |
| FR-SEARCH-014 | Detail: provider attribution and original listing URL | P0 | US-SEARCH-008 |
| FR-SEARCH-015 | Listings missing from provider 24h+ marked inactive; excluded from search | P0 | US-SEARCH-012 |
| FR-SEARCH-016 | Guest access to first page without auth | P1 | US-SEARCH-009 |
| FR-SEARCH-017 | Geo-proximity search when coordinates available | P1 | US-SEARCH-011 |
| FR-SEARCH-018 | Arabic and English search UI and listing display | P0 | US-SEARCH-010 |

---

## 5. Functional requirements — Listing sync

| ID | Requirement | Priority | Stories |
|----|-------------|----------|---------|
| FR-SYNC-001 | Provider-specific adapters normalize to canonical model | P0 | US-SEARCH-014 |
| FR-SYNC-002 | Store in PostgreSQL with tsvector + pgvector embeddings | P0 | US-SEARCH-014 |
| FR-SYNC-003 | Retry with exponential backoff on provider failure | P0 | US-SEARCH-015 |
| FR-SYNC-004 | Alert admins after 3 consecutive sync failures per provider | P0 | US-SEARCH-015 |
| FR-SYNC-005 | Admin manual sync trigger per provider | P1 | US-SEARCH-016 |
| FR-SYNC-006 | Admin API for sync status (last run, counts, errors) | P0 | US-SEARCH-017 |

---

## 6. Non-functional requirements

| ID | Application |
|----|-------------|
| NFR-PERF-001 | Search API p95 ≤ 2 seconds |
| NFR-PERF-002 | Listing detail p95 ≤ 1.5 seconds |
| NFR-AVAIL-003 | Listing data freshness ≤ 1 hour after successful sync |
| NFR-COMP-006 | Provider attribution and source links per ToS |
| NFR-UX-001 | ar-EG RTL + en LTR search UI |
| NFR-MAINT-001 | SDD approved before implementation |
| NFR-MAINT-003 | Domain layer unit test coverage ≥ 80% |

---

## 7. Dependencies

| Dependency | Required for |
|------------|--------------|
| PostgreSQL 16 + pgvector | Listings, search_vector, embeddings |
| Redis + BullMQ | Scheduled `listing-sync` jobs |
| Shaety API or mock adapter | Phase 1 catalog |
| authentication (M3) | Guest vs authenticated page limits; admin RBAC |
| M2 platform (NestJS, Prisma) | API and persistence |

**Blocks:** ai_chat (RAG over listings), recommendation, booking.

---

## 8. Assumptions

- Shaety API credentials or mock adapter available for local dev (ASM listing providers).
- Images hotlink to provider URLs for MVP; CDN proxy deferred.
- Relevance sort uses PostgreSQL `ts_rank` on `search_vector`; semantic sort uses pgvector when `semantic` query param is used (post-MVP enhancement in search API).
- `sync_runs` audit table added per [data_model.md](./data_model.md) (extends core schema in [postgresql_schema.md](../../architecture/postgresql_schema.md)).

---

## 9. Open questions

| # | Question | Owner | Resolution |
|---|----------|-------|------------|
| 1 | Official Shaety API contract and rate limits | Product + Tech Lead | Pending partnership |
| 2 | Aqarmap / Property Finder API vs feed access | Tech Lead | Phase 2–3 |
| 3 | Embedding generation: inline in sync job vs separate queue | Tech Lead | Separate `embed-listings` job per backend_architecture |

---

## Related documents

- [User stories](./user_stories.md)
- [Acceptance criteria](./acceptance_criteria.md)
- [Architecture](./architecture.md)
- [Listing providers](../../architecture/listing_providers.md)
