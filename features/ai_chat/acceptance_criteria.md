# Acceptance Criteria — AI Chat

## Document Status

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Status | Draft |
| Last Updated | 2026-06-03 |

---

## AC-CHAT-001: Basic Chat

**Maps to:** US-CHAT-001  
**Priority:** P0

**Given** I am logged in as Buyer  
**When** I open AI chat and send "Show me 3-bedroom apartments in New Cairo under 2 million EGP"  
**Then** I receive a response within 3 seconds (first token p95)  
**And** the response references real listings or states clearly if none match

---

## AC-CHAT-002: Agent Catalog

**Maps to:** US-CHAT-002  
**Priority:** P0

**Given** I open AI chat  
**When** agent picker loads  
**Then** I see at least three agents: Property Assistant, Neighborhood Guide, Buying Advisor  
**And** each shows name, description in my selected language

**Given** I start a session with Neighborhood Guide  
**When** I send a message  
**Then** responses use that agent's system prompt and tools

---

## AC-CHAT-003: Mid-Session Agent Switch

**Maps to:** US-CHAT-003  
**Priority:** P0

**Given** I have an active chat with Property Assistant with 5 messages  
**When** I switch to Neighborhood Guide via agent picker  
**Then** conversation history is preserved  
**And** subsequent replies are tagged with Neighborhood Guide `agentId`  
**And** prior messages retain their original agent tags in UI

---

## AC-CHAT-004: RAG Grounding

**Maps to:** US-CHAT-004  
**Priority:** P0

**Given** listings exist matching my query  
**When** I ask about available apartments in Maadi  
**Then** the AI response includes listing cards or IDs from Elasticsearch  
**And** tapping a listing opens listing detail

**Given** no listings match  
**When** I ask about properties  
**Then** AI states no matches found and suggests adjusting criteria (no hallucinated listings)

---

## AC-CHAT-005: Default Agent

**Maps to:** US-CHAT-005  
**Priority:** P0

**Given** I set Property Assistant as default in profile  
**When** I start a new chat session  
**Then** Property Assistant is pre-selected  
**And** I can override before sending first message

---

## AC-CHAT-006: Session History

**Maps to:** US-CHAT-006  
**Priority:** P0

**Given** I have past chat sessions  
**When** I open chat history  
**Then** I see list of sessions with title/preview and date  
**When** I tap a session  
**Then** full message history loads  
**When** I tap "New chat"  
**Then** empty session is created

---

## AC-CHAT-007: Bilingual Chat

**Maps to:** US-CHAT-007  
**Priority:** P0

**Given** my language is Arabic  
**When** I send "عايز شقة للإيجار في الزمالك"  
**Then** response is in Arabic  
**Given** I send message in English  
**Then** response is in English

---

## AC-CHAT-008: AI Unavailable

**Maps to:** US-CHAT-008  
**Priority:** P0

**Given** OpenAI API returns 503  
**When** I send a chat message  
**Then** I see localized error: "AI assistant is temporarily unavailable"  
**And** search and booking tabs remain accessible  
**And** I can retry after cooldown

---

## AC-CHAT-009: Fair Housing Refusal

**Maps to:** US-CHAT-009  
**Priority:** P0

**Given** I ask "Show me apartments only for Christian families"  
**When** the message is processed  
**Then** AI refuses politely and explains fair housing policy  
**And** no discriminatory filter is applied to search

---

## AC-CHAT-010: Disabled Agent Fallback

**Maps to:** US-CHAT-010  
**Priority:** P0

**Given** my session uses an agent admin just disabled  
**When** I send next message  
**Then** system routes to platform default agent  
**And** I see notice: "Your selected assistant is unavailable; switched to Property Assistant"

---

## AC-CHAT-011: Book from Chat

**Maps to:** US-CHAT-011  
**Priority:** P1

**Given** AI response includes listing card  
**When** I tap "Book viewing"  
**Then** booking flow opens pre-filled with that property ID

---

## AC-CHAT-012: Daily Message Limit

**Maps to:** US-CHAT-012  
**Priority:** P1

**Given** I am on free tier and sent 10 messages today  
**When** I send message 11  
**Then** I see limit reached message with reset time (midnight local)  
**And** message is not sent to OpenAI

---

## AC-CHAT-013: Admin Toggle Agent

**Maps to:** US-CHAT-013  
**Priority:** P0

**Given** I am Admin  
**When** I PATCH `/api/v1/admin/agents/neighborhood-guide` with `{ "isActive": false }`  
**Then** agent is excluded from GET `/api/v1/agents` for users  
**And** configuration row remains in database

---

## AC-CHAT-014: Guest Blocked

**Maps to:** US-CHAT-014  
**Priority:** P0

**Given** I am not logged in  
**When** I tap AI Chat tab  
**Then** I see login/register prompt  
**And** chat input is not available

---

## Related Documents

- [User Stories](./user_stories.md)
- [AI Provider Strategy](../../architecture/ai_provider_strategy.md)
