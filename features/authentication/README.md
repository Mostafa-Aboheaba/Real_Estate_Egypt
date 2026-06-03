# Authentication

> Identity & Access bounded context.

## Document Status

| Field | Value |
|-------|-------|
| Version | 0.1.0 |
| Status | Not Started |
| Priority | P0 — Phase 1 |

## Overview

Handles user registration, login, logout, password recovery, session management, and role-based access control for Buyers, Agents, and Admins.

**Auth methods at launch:** email/password, Google OAuth, Sign in with Apple.

**Real estate agent onboarding:** Automated self-service — agents register and receive agent role without manual admin approval (automated email verification; license validation rules defined in feature spec).

## SDD Artifacts

Complete each document before implementation. Status reflects current progress.

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

- **FR-001** in [specs/requirements.md](../../specs/requirements.md)
- Bounded context: Identity & Access in [architecture/system_design.md](../../architecture/system_design.md)

## Dependencies

- None (foundational feature)

## Blocks

- property_search (optional auth for saved searches)
- ai_chat, recommendation, booking, profile (all require authenticated users)

## Approval Gate

Implementation in `backend/` and `mobile/` is **blocked** until all SDD artifacts are complete and approved.
