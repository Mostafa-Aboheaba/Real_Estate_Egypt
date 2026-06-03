# Property Search

> Property Catalog bounded context.

## Document Status

| Field | Value |
|-------|-------|
| Version | 0.3.0 |
| Status | SDD Complete (Pending Approval) |
| Priority | P0 — Phase 2 |

## Overview

Search, filter, sort, and display property listings. Supports geo-based queries, full-text search, and detailed property views.

**Listing data:** Aggregated from Egyptian property portals via sync pipeline:

| Provider | Priority |
|----------|----------|
| **Shaety (شقتي)** | Primary — first integration |
| **Aqarmap** | Secondary |
| **Property Finder Egypt** | Secondary |

Synced to **PostgreSQL** (canonical store). Search uses **tsvector** full-text + **pgvector** semantic embeddings per [architecture/postgresql_schema.md](../../architecture/postgresql_schema.md). See [architecture/listing_providers.md](../../architecture/listing_providers.md).

## SDD Artifacts

| # | Artifact | File | Status |
|---|----------|------|--------|
| 1 | Requirements | [requirements.md](./requirements.md) | ✅ Done |
| 2 | User Stories | [user_stories.md](./user_stories.md) | ✅ Done |
| 3 | Acceptance Criteria | [acceptance_criteria.md](./acceptance_criteria.md) | ✅ Done |
| 4 | Architecture Design | [architecture.md](./architecture.md) | ✅ Done |
| 5 | Data Model | [data_model.md](./data_model.md) | ✅ Done |
| 6 | API Design | [api_design.md](./api_design.md) | ✅ Done |
| 7 | Implementation Tasks | [implementation_tasks.md](./implementation_tasks.md) | ✅ Done |
| 8 | Tests | [tests.md](./tests.md) | ✅ Done |

## Traceability

- **FR-SEARCH-***, **FR-SYNC-*** in [specs/requirements.md](../../specs/requirements.md)
- Bounded context: Property Catalog in [architecture/system_design.md](../../architecture/system_design.md)

## Dependencies

- authentication (optional for MVP browse; required for saved searches)
- **Shaety (شقتي)** — primary listing feed (first)
- **Aqarmap** — secondary feed
- **Property Finder Egypt** — secondary feed

## Blocks

- ai_chat, recommendation, booking

## Approval Gate

Implementation blocked until PO / Tech Lead / QA approve SDD artifacts.
