# Implementation Tasks — AI Chat

## Document Status

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Status | Draft |
| Approval | Pending PO / Tech Lead / QA |

Implementation is **blocked** until this feature SDD is approved.

**Prerequisites:** M1 SDD complete; M3 auth; M4 listings; M5 profile (`preferred_agent_id`); M6 RAG pipeline.

---

## Task list (M7 — AI Chat)

| Order | Task ID | Title | Est. |
|-------|---------|-------|------|
| 1 | [M7-CHT001](../../tasks/m07-ai-chat/m7-cht001.md) | Conversation domain + repositories | 3h |
| 2 | [M7-CHT002](../../tasks/m07-ai-chat/m7-cht002.md) | AiModule + agents catalog API | 2h |
| 3 | [M7-CHT003](../../tasks/m07-ai-chat/m7-cht003.md) | GeminiOrchestrator + prompt version loader | 4h |
| 4 | [M7-CHT004](../../tasks/m07-ai-chat/m7-cht004.md) | SafetyPipeline + fair housing rules | 3h |
| 5 | [M7-CHT005](../../tasks/m07-ai-chat/m7-cht005.md) | ToolExecutionLoop (semantic_search, etc.) | 4h |
| 6 | [M7-CHT006](../../tasks/m07-ai-chat/m7-cht006.md) | POST /conversations + /messages (non-stream) | 4h |
| 7 | [M7-CHT007](../../tasks/m07-ai-chat/m7-cht007.md) | SSE streaming endpoint | 4h |
| 8 | [M7-CHT008](../../tasks/m07-ai-chat/m7-cht008.md) | Conversation memory compaction job | 3h |
| 9 | [M7-CHT009](../../tasks/m07-ai-chat/m7-cht009.md) | Mobile chat UI + stream rendering | 4h |
| 10 | [M7-CHT010](../../tasks/m07-ai-chat/m7-cht010.md) | Mobile agent picker + listing cards | 3h |
| 11 | [M7-CHT011](../../tasks/m07-ai-chat/m7-cht011.md) | AI chat P0 test pack | 3h |

**Total estimate:** ~37h backend + mobile + tests.

---

## SDD → task traceability

| SDD artifact | Primary tasks |
|--------------|---------------|
| data_model.md | M7-CHT001 |
| architecture.md (AiModule, orchestrator) | M7-CHT002, M7-CHT003 |
| architecture.md (SafetyPipeline) | M7-CHT004 |
| rag + FR-CHAT-007 | M7-CHT005, M6-RAG* |
| api_design.md (CRUD + messages) | M7-CHT006 |
| api_design.md (SSE) | M7-CHT007 |
| gemini §6 memory | M7-CHT008 |
| tests.md | M7-CHT011 |

---

## Related documents

- [tests.md](./tests.md)
- [api_design.md](./api_design.md)
- [requirements.md](./requirements.md)
- [master_execution_plan.md](../../tasks/master_execution_plan.md) — M7 milestone
