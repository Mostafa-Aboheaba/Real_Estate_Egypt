# Requirements — AI Chat

## Document Status

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Status | Draft |
| Last Updated | 2026-06-03 |
| Traces to | FR-CHAT-* in [specs/requirements.md](../../specs/requirements.md) |

---

## 1. Purpose

Define functional and non-functional requirements for conversational AI: multi-agent chat, session persistence, RAG-grounded property answers, streaming responses, safety guardrails, and graceful degradation when the LLM provider is unavailable.

---

## 2. Scope

### In scope (MVP — P0)

- Authenticated chat only (Buyer, Agent roles)
- Platform agent catalog and per-session agent selection
- Mid-session agent switch with history preserved
- Non-streaming and SSE streaming message endpoints
- Google Gemini via pluggable provider ports ([gemini_integration_layer.md](../../architecture/gemini_integration_layer.md))
- RAG grounding for property-related questions ([rag_architecture.md](../../architecture/rag_architecture.md))
- Fair housing pre/post guardrails and PII redaction outbound to Gemini
- Bilingual input/output (ar-EG, en)
- Conversation and message persistence
- Default agent preference on user profile (`users.preferred_agent_id`)
- Disabled-agent fallback to platform default
- AI unavailable UX (search and booking remain usable)

### In scope (P1)

- Book viewing deep link from chat (`FR-CHAT-017`)
- Free tier: 10 AI user messages per calendar day (`FR-CHAT-018`)

### Out of scope (MVP)

- Guest chat
- User-defined custom agents
- Voice input/output
- Multi-device real-time sync of typing indicators
- Admin agent CRUD UI (admin API only per FR-ADMIN-001)

---

## 3. Personas

| Persona | Role ID | Chat access |
|---------|---------|-------------|
| Guest | — | Blocked; login prompt |
| Buyer / Renter | `buyer` | Full chat |
| Real Estate Agent | `agent` | Full chat |
| Platform Admin | `admin` | Toggle agents via admin API |

---

## 4. Functional requirements

Canonical IDs from SRS §3.3. Story mapping in [user_stories.md](./user_stories.md).

| ID | Requirement | Priority | Stories |
|----|-------------|----------|---------|
| FR-CHAT-001 | Authenticated users converse with AI agents via chat UI | P0 | US-CHAT-001, 014 |
| FR-CHAT-002 | Platform-defined agent catalog fetchable via API | P0 | US-CHAT-002 |
| FR-CHAT-003 | MVP ships ≥3 specialized agents | P0 | US-CHAT-002 |
| FR-CHAT-004 | User selects agent when starting or continuing a session | P0 | US-CHAT-002 |
| FR-CHAT-005 | Switch agents mid-session without losing history | P0 | US-CHAT-003 |
| FR-CHAT-006 | Each assistant message records generating `agentId` | P0 | US-CHAT-003 |
| FR-CHAT-007 | Property answers grounded in real listing data (RAG) | P0 | US-CHAT-004 |
| FR-CHAT-008 | User sets default AI agent on profile | P0 | US-CHAT-005 |
| FR-CHAT-009 | Disabled agent → platform default + user notice | P0 | US-CHAT-010 |
| FR-CHAT-010 | Arabic and English input and responses | P0 | US-CHAT-001, 007 |
| FR-CHAT-011 | Persist chat session history per user | P0 | US-CHAT-006 |
| FR-CHAT-012 | Create new sessions and view past sessions | P0 | US-CHAT-006 |
| FR-CHAT-013 | Pluggable provider architecture; **Gemini** MVP adapter | P0 | — |
| FR-CHAT-014 | Fair housing guardrails — no discriminatory advice/filtering | P0 | US-CHAT-009 |
| FR-CHAT-015 | Redact PII from prompts sent to external LLM where feasible | P0 | — |
| FR-CHAT-016 | Clear error when AI unavailable; search/booking still usable | P0 | US-CHAT-008 |
| FR-CHAT-017 | Initiate booking from chat (listing deep link) | P1 | US-CHAT-011 |
| FR-CHAT-018 | Free tier: 10 AI messages per day | P1 | US-CHAT-012 |

### 4.1 Agent catalog (FR-CHAT-002, FR-CHAT-003)

MVP seeds **four** platform agents (exceeds minimum of three):

| Agent ID | Name (EN) | Primary capability |
|----------|-----------|-------------------|
| `search-agent` | Search Agent | Property discovery, semantic search, listing cards |
| `recommendation-agent` | Recommendation Agent | Personalized suggestions, feedback |
| `booking-agent` | Booking Agent | Viewing requests, availability |
| `follow-up-agent` | Follow-up Agent | Post-booking follow-up, reminders |

Details: [ai_agent_architecture.md](../../architecture/ai_agent_architecture.md).  
Default platform agent: `search-agent` (`isDefault: true` in `ai_agents` seed).

User stories reference legacy persona names (Property Assistant, Neighborhood Guide, Buying Advisor). Acceptance criteria and mobile copy may use friendly aliases; **API and persistence use `agent_id` values above**.

---

## 5. Non-functional requirements

| ID | Application |
|----|-------------|
| NFR-AVAIL-002 | Degraded mode when Gemini unavailable (FR-CHAT-016) |
| NFR-COMP-005 | Fair housing compliance (FR-CHAT-014) |
| NFR-PERF | First SSE token p95 ≤ 3s (AC-CHAT-001) |
| NFR-SEC | JWT on all chat routes; user may only access own conversations |
| NFR-OBS-001 | Log `agentId`, `toolsCalled`, safety blocks with correlation ID |
| NFR-MAINT-001 | SDD approved before implementation |

Rate limits: [api_conventions.md](../../architecture/api_conventions.md) — 30 messages/min per user; P1 daily quota 10.

---

## 6. Dependencies

| Dependency | Required for |
|------------|--------------|
| authentication | JWT, `users.preferred_agent_id` |
| property_search / listings sync | RAG property source, listing cards |
| M6 RAG pipeline | `semantic_search`, embeddings (FR-CHAT-007) |
| profile | Default agent preference (FR-CHAT-008) |
| booking (P1) | `FR-CHAT-017` deep link |

**Blocks:** recommendation signals from chat (FR-REC-004, P1).

---

## 7. Assumptions

- Gemini `gemini-2.0-flash` for chat; Vertex in staging/prod (ASM in deployment docs).
- Conversation memory window: last 20 turns unless summarized ([gemini_integration_layer.md §6](../../architecture/gemini_integration_layer.md)).
- Admin disables agents via `PATCH /api/v1/admin/agents/:id` (FR-ADMIN-001), not delete.

---

## 8. Open questions

| # | Question | Owner | Resolution |
|---|----------|-------|------------|
| 1 | Partial assistant message on SSE client abort | Tech Lead | MVP: do not persist partial (gemini §3.6) |
| 2 | `conversations.summary` column for compaction | DBA | Optional JSON column; add in M7 if inline summarize slow |

---

## Related documents

- [user_stories.md](./user_stories.md)
- [acceptance_criteria.md](./acceptance_criteria.md)
- [architecture.md](./architecture.md)
- [gemini_integration_layer.md](../../architecture/gemini_integration_layer.md)
- [rag_architecture.md](../../architecture/rag_architecture.md)
