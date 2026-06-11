# AI Chat

> Conversational AI bounded context.

## Document Status

| Field | Value |
|-------|-------|
| Version | 0.1.0 |
| Status | SDD Complete — Pending Approval |
| Priority | P0 — Phase 4 (M7) |

## Overview

Natural-language assistant for property discovery, recommendations, booking guidance, and follow-up. Responses are grounded in listing and knowledge data via RAG. MVP uses **Google Gemini** with SSE streaming, fair housing guardrails, and bilingual (ar-EG / en) chat.

**AI agents (MVP seed — four):** `search-agent`, `recommendation-agent`, `booking-agent`, `follow-up-agent` — see [ai_agent_architecture.md](../../architecture/ai_agent_architecture.md).  
**RAG sources:** Property, FAQ, Projects, Contracts — [rag_architecture.md](../../architecture/rag_architecture.md).

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
| 9 | GenUI Design | [genui_design.md](./genui_design.md) | 🔄 M7.5 planning |

## Traceability

- **FR-CHAT-*** in [specs/requirements.md](../../specs/requirements.md) (§3.3 AI Chat)
- Bounded context: Conversational AI in [architecture/system_design.md](../../architecture/system_design.md)
- Integration: [gemini_integration_layer.md](../../architecture/gemini_integration_layer.md)

## Dependencies

- authentication (JWT, sessions)
- property_search (listings for RAG and cards)
- profile (`preferred_agent_id` for FR-CHAT-008)
- M6 RAG pipeline (FR-CHAT-007)

## Blocks

- recommendation (chat interaction signals, P1)

## Approval Gate

Implementation in `backend/` and `mobile/` is **blocked** until all SDD artifacts are complete and approved.
