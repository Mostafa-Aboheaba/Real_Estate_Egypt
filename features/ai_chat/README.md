# AI Chat

> Conversational AI bounded context.

## Document Status

| Field | Value |
|-------|-------|
| Version | 0.1.0 |
| Status | Not Started |
| Priority | P1 — Phase 4 |

## Overview

Natural-language assistant for property discovery, neighborhood questions, and buying/renting guidance. Responses grounded in listing data via retrieval-augmented generation (RAG).

**AI agents:** Search, Recommendation, Booking, Follow-up. RAG: Property, FAQ, Projects, Contracts — see [architecture/rag_architecture.md](../../architecture/rag_architecture.md).

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

- **FR-003** in [specs/requirements.md](../../specs/requirements.md)
- Bounded context: Conversational AI in [architecture/system_design.md](../../architecture/system_design.md)

## Dependencies

- property_search (listing data for RAG grounding)
- authentication (user sessions and context)

## Approval Gate

Implementation blocked until specs approved.
