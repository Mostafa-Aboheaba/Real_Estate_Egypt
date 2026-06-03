# Profile

> User Profile bounded context.

## Document Status

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Status | SDD Complete |
| Priority | P0 — Phase 3 (M5) |
| Last Updated | 2026-06-03 |

## Overview

User profile management, notification preferences, saved favorites, persistent search preferences, agent public profiles, and PDPL account deletion/export.

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

- **FR-PROF-*** in [specs/requirements.md](../../specs/requirements.md) — 8 P0 user stories (US-PROF-001–008)
- Bounded context: User Profile in [architecture/system_design.md](../../architecture/system_design.md)
- Backend: [UsersModule](../../architecture/backend_architecture.md) — profile, favorites, account delete
- Mobile: Profile tab in [flutter_architecture.md](../../architecture/flutter_architecture.md)
- Schema: [postgresql_schema.md](../../architecture/postgresql_schema.md) — `users`, `favorites`, preference JSON

## Dependencies

- [authentication](../authentication/) — JWT, verified user, roles
- property_search — listing IDs for favorites

## Blocks

- recommendation (preference and favorites data)

## Approval Gate

SDD complete — pending PO / Tech Lead / QA sign-off before M5 implementation begins.
