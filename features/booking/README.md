# Booking

> Scheduling bounded context.

## Document Status

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Status | SDD Complete — Pending Approval |
| Priority | P1 — Phase 6 |

## Overview

Property viewing appointment scheduling. Buyers request viewings from listing detail; agents manage an inbox, confirm or decline requests, and receive notifications.

**Notifications (Option A):** FR-NOTIF-* requirements for booking lifecycle (push via FCM, email via SendGrid, BullMQ processor) are documented in this feature folder — not a separate `features/notifications/` context. Password-reset email remains in [authentication](../authentication/).

## SDD Artifacts

Complete each document before implementation. Status reflects current progress.

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

- **FR-BOOK-***, **FR-NOTIF-*** (booking slice) in [specs/requirements.md](../../specs/requirements.md)
- Bounded context: Scheduling in [architecture/system_design.md](../../architecture/system_design.md)
- Backend modules: `BookingsModule`, `NotificationsModule` in [architecture/backend_architecture.md](../../architecture/backend_architecture.md)

## Dependencies

- [authentication](../authentication/) — buyer and agent roles, JWT
- [property_search](../property_search/) — active listing and assigned agent
- [profile](../profile/) — notification preferences (FR-NOTIF-003), locale, device tokens

## Blocks

- None (terminal MVP vertical slice)

## Approval Gate

Implementation in `backend/` and `mobile/` is **blocked** until all SDD artifacts are complete and approved.
