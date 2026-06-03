# Recommendation

> Personalization bounded context.

## Document Status

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Status | SDD Complete — Pending Approval |
| Priority | P1 — Phase 5 (M8) |

## Overview

Personalized property suggestions based on user preferences, search history, favorites, and explicit feedback. Home feed uses embedding similarity (pgvector) and a per-user preference vector; guests receive popular listings in Greater Cairo.

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

- **FR-REC-*** in [specs/requirements.md](../../specs/requirements.md) §3.4
- **NFR-COMP-005** fair housing
- Bounded context: Personalization in [architecture/system_design.md](../../architecture/system_design.md)

## Dependencies

- [authentication](../authentication/) — JWT
- [profile](../profile/) — preferences, favorites
- [property_search](../property_search/) — listings, embeddings, search history port
- M6 RAG / embeddings pipeline

## Blocks

- None (enhances home UX after auth + listings exist)

## Approval Gate

Implementation in `backend/` and `mobile/` is **blocked** until all SDD artifacts are complete and approved by PO / Tech Lead / QA.
