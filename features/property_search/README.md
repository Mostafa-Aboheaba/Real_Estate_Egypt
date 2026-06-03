# Property Search

> Property Catalog bounded context.

## Document Status

| Field | Value |
|-------|-------|
| Version | 0.2.0 |
| Status | Not Started |
| Priority | P0 — Phase 2 |

## Overview

Search, filter, sort, and display property listings. Supports geo-based queries, full-text search, and detailed property views.

**Listing data:** Aggregated from Egyptian property portals via sync pipeline:

| Provider | Priority |
|----------|----------|
| **Shaety (شقتي)** | Primary — first integration |
| **Aqarmap** | Secondary |
| **Property Finder Egypt** | Secondary |

Synced to PostgreSQL (canonical store) and Elasticsearch (search index). See [architecture/listing_providers.md](../../architecture/listing_providers.md).

## SDD Artifacts

| # | Artifact | File | Status |
|---|----------|------|--------|
| 1 | Requirements | [requirements.md](./requirements.md) | ⬜ Not started |
| 2 | User Stories | [user_stories.md](./user_stories.md) | ✅ Done |
| 3 | Acceptance Criteria | [acceptance_criteria.md](./acceptance_criteria.md) | ✅ Done |
| 4 | Architecture Design | [architecture.md](./architecture.md) | ⬜ Not started |
| 5 | Data Model | [data_model.md](./data_model.md) | ⬜ Not started |
| 6 | API Design | [api_design.md](./api_design.md) | ⬜ Not started |
| 7 | Implementation Tasks | [implementation_tasks.md](./implementation_tasks.md) | ⬜ Not started |
| 8 | Tests | [tests.md](./tests.md) | ⬜ Not started |

## Traceability

- **FR-002** in [specs/requirements.md](../../specs/requirements.md)
- Bounded context: Property Catalog in [architecture/system_design.md](../../architecture/system_design.md)

## Dependencies

- authentication (optional for MVP browse; required for saved searches)
- **Shaety (شقتي)** — primary listing feed (first)
- **Aqarmap** — secondary feed
- **Property Finder Egypt** — secondary feed

## Blocks

- ai_chat, recommendation, booking

## Approval Gate

Implementation blocked until specs approved.
