# Booking

> Scheduling bounded context.

## Document Status

| Field | Value |
|-------|-------|
| Version | 0.1.0 |
| Status | Not Started |
| Priority | P1 — Phase 6 |

## Overview

Property viewing appointment scheduling. Buyers request viewings; agents manage availability and confirm appointments.

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

- **FR-005** in [specs/requirements.md](../../specs/requirements.md)
- Bounded context: Scheduling in [architecture/system_design.md](../../architecture/system_design.md)

## Dependencies

- authentication (buyer and agent roles)
- property_search (property reference)
- Notification service (email/SMS/push)

## Approval Gate

Implementation blocked until specs approved.
