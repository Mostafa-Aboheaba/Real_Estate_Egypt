# Tests — AI Chat

## Document Status

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Status | Draft |
| Last Updated | 2026-06-03 |

Test ID format: **CHT-T-###**

---

## 1. Unit tests (domain)

| ID | AC | Description |
|----|-----|-------------|
| CHT-T-001 | AC-CHAT-003 | `MessageRole` rejects invalid enum |
| CHT-T-002 | AC-CHAT-006 | Assistant message requires `agentId` |
| CHT-T-003 | AC-CHAT-003 | Conversation invariant: `userId` immutable |
| CHT-T-004 | — | `ListingRef` validates UUID `propertyId` |

**Target:** ≥ 80% coverage `domain/chat/` (NFR-MAINT-003).

---

## 2. Unit tests (SafetyPipeline)

| ID | AC | FR | Description |
|----|-----|-----|-------------|
| CHT-T-010 | AC-CHAT-009 | FR-CHAT-014 | Discriminatory phrase matrix → refusal template |
| CHT-T-011 | AC-CHAT-009 | FR-CHAT-014 | Religion/ethnicity/nationality prompts blocked |
| CHT-T-012 | AC-CHAT-009 | FR-CHAT-014 | **No Gemini call** when pre-call blocks (metric `safety.fair_housing_block`) |
| CHT-T-013 | — | FR-CHAT-015 | Phone/email/national ID redacted in outbound prompt |
| CHT-T-014 | — | FR-CHAT-015 | Redaction preserves semantic intent (placeholders) |
| CHT-T-015 | AC-CHAT-004 | FR-CHAT-007 | Post-call strips listing IDs not in `toolsCalled` results |
| CHT-T-016 | — | — | Prompt injection patterns neutralized |
| CHT-T-017 | AC-CHAT-012 | FR-CHAT-018 | Daily quota counter at 10 → block |

---

## 3. Integration tests (API)

| ID | AC | Description |
|----|-----|-------------|
| CHT-T-020 | AC-CHAT-001 | POST message returns assistant reply (mock Gemini) |
| CHT-T-021 | AC-CHAT-002 | GET `/agents` returns ≥3 active agents |
| CHT-T-022 | AC-CHAT-002 | Disabled agent excluded from catalog |
| CHT-T-023 | AC-CHAT-006 | POST `/conversations` 201 |
| CHT-T-024 | AC-CHAT-006 | GET `/conversations` lists owned sessions only |
| CHT-T-025 | AC-CHAT-003 | PATCH agent switch; history unchanged |
| CHT-T-026 | AC-CHAT-003 | New assistant message has new `agentId` |
| CHT-T-027 | AC-CHAT-004 | `metadata.toolsCalled` includes `semantic_search` |
| CHT-T-028 | AC-CHAT-004 | Empty search → no fabricated `listingRefs` |
| CHT-T-029 | AC-CHAT-010 | Disabled session agent → default + notice |
| CHT-T-030 | AC-CHAT-014 | Guest 401 on `/conversations` |
| CHT-T-031 | AC-CHAT-008 | Gemini 503 → `AI_UNAVAILABLE` envelope |
| CHT-T-032 | AC-CHAT-012 | Message 11 on free tier → 403 `AI_QUOTA_EXCEEDED` |
| CHT-T-033 | AC-CHAT-013 | Admin PATCH disables agent for users |

---

## 4. Integration tests (SSE streaming)

| ID | AC | FR | Description |
|----|-----|-----|-------------|
| CHT-T-040 | AC-CHAT-001 | — | SSE sequence: `text_delta`* → `done` |
| CHT-T-041 | AC-CHAT-004 | — | `listing_cards` event after tool execution |
| CHT-T-042 | — | — | Client disconnect cancels upstream (no orphan row) |
| CHT-T-043 | AC-CHAT-008 | FR-CHAT-016 | Stream `error` event on provider timeout |
| CHT-T-044 | AC-CHAT-009 | FR-CHAT-014 | Fair housing block returns refusal without stream to Gemini |

---

## 5. Integration tests (fair housing & PII)

| ID | AC | Description |
|----|-----|-------------|
| CHT-T-050 | AC-CHAT-009 | "Christian families only" → polite refusal + policy text |
| CHT-T-051 | AC-CHAT-009 | No discriminatory filter applied to `search_properties` tool args |
| CHT-T-052 | AC-CHAT-009 | Audit log contains `fair_housing_block` reason |
| CHT-T-053 | — | User message with phone → redacted in Gemini request fixture |
| CHT-T-054 | — | Assistant reply with email → redacted inbound before persist (if applicable) |

---

## 6. Integration tests (bilingual & degradation)

| ID | AC | FR | Description |
|----|-----|-----|-------------|
| CHT-T-060 | AC-CHAT-007 | FR-CHAT-010 | Arabic input → Arabic response (mock locale) |
| CHT-T-061 | AC-CHAT-007 | FR-CHAT-010 | English input → English response |
| CHT-T-062 | AC-CHAT-008 | FR-CHAT-016 | 503 does not break unrelated routes (search health stub) |

---

## 7. Mobile tests

| ID | AC | Type | Description |
|----|-----|------|-------------|
| CHT-T-070 | AC-CHAT-001 | Widget | Composer validation |
| CHT-T-071 | AC-CHAT-001 | Widget | Stream renders incremental `text_delta` |
| CHT-T-072 | AC-CHAT-002 | Widget | Agent picker shows catalog |
| CHT-T-073 | AC-CHAT-003 | Widget | Agent switch preserves list items |
| CHT-T-074 | AC-CHAT-004 | Widget | Listing card tap callback |
| CHT-T-075 | AC-CHAT-014 | Widget | Guest sees login prompt |
| CHT-T-076 | AC-CHAT-008 | Widget | AI unavailable banner |
| CHT-T-077 | — | Manual | ar-EG RTL chat layout |
| CHT-T-078 | AC-CHAT-011 | Manual | Book viewing deep link (P1) |

---

## 8. Performance

| ID | AC | Description |
|----|-----|-------------|
| CHT-T-080 | AC-CHAT-001 | First SSE `text_delta` p95 < 3s under load test profile |

---

## 9. AC coverage matrix (P0)

| AC-ID | Test IDs |
|-------|----------|
| AC-CHAT-001 | CHT-T-020, 040, 070, 071, 080 |
| AC-CHAT-002 | CHT-T-021, 022, 072 |
| AC-CHAT-003 | CHT-T-025, 026, 073 |
| AC-CHAT-004 | CHT-T-027, 028, 041, 074 |
| AC-CHAT-005 | CHT-T-029 (via profile API in M5) |
| AC-CHAT-006 | CHT-T-023, 024 |
| AC-CHAT-007 | CHT-T-060, 061, 077 |
| AC-CHAT-008 | CHT-T-031, 043, 062, 076 |
| AC-CHAT-009 | CHT-T-010–012, 050–052, 044 |
| AC-CHAT-010 | CHT-T-029, 033 |
| AC-CHAT-013 | CHT-T-033 |
| AC-CHAT-014 | CHT-T-030, 075 |

P1: AC-CHAT-011 → CHT-T-078; AC-CHAT-012 → CHT-T-017, 032.

---

## Related documents

- [acceptance_criteria.md](./acceptance_criteria.md)
- [implementation_tasks.md](./implementation_tasks.md)
- [architecture.md](./architecture.md)
