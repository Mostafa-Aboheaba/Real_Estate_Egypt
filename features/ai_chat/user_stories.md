# User Stories — AI Chat

## Document Status

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Status | Draft |
| Last Updated | 2026-06-03 |
| Traces to | FR-CHAT-*, FR-ADMIN-001 in [specs/requirements.md](../../specs/requirements.md) |

---

## US-CHAT-001: Chat with AI Property Assistant

**Priority:** P0  
**Role:** Buyer, Agent  
**Traces to:** FR-CHAT-001, FR-CHAT-010

**As a** property seeker  
**I want** to ask questions about properties in natural language via chat  
**So that** I can find suitable homes without learning complex filters

---

## US-CHAT-002: Choose AI Agent

**Priority:** P0  
**Role:** Buyer, Agent  
**Traces to:** FR-CHAT-002, FR-CHAT-003, FR-CHAT-004

**As a** user  
**I want** to choose from specialized AI agents (Property Assistant, Neighborhood Guide, Buying Advisor)  
**So that** I get help tailored to my current question

---

## US-CHAT-003: Switch Agent Mid-Session

**Priority:** P0  
**Role:** Buyer, Agent  
**Traces to:** FR-CHAT-005, FR-CHAT-006

**As a** user in an active chat  
**I want** to switch to a different AI agent without losing my conversation  
**So that** I can get neighborhood advice mid-conversation without starting over

---

## US-CHAT-004: Grounded Property Answers

**Priority:** P0  
**Role:** Buyer, Agent  
**Traces to:** FR-CHAT-007

**As a** user  
**I want** AI answers about properties backed by real listings from the platform  
**So that** I trust the recommendations and can tap through to actual properties

---

## US-CHAT-005: Set Default AI Agent

**Priority:** P0  
**Role:** Buyer, Agent  
**Traces to:** FR-CHAT-008

**As a** user  
**I want** to set a default AI agent in my profile  
**So that** new chat sessions start with my preferred assistant automatically

---

## US-CHAT-006: Manage Chat Sessions

**Priority:** P0  
**Role:** Buyer, Agent  
**Traces to:** FR-CHAT-011, FR-CHAT-012

**As a** user  
**I want** to start new chats and view my past conversation history  
**So that** I can continue previous searches or begin fresh topics

---

## US-CHAT-007: Bilingual Chat

**Priority:** P0  
**Role:** Buyer, Agent  
**Traces to:** FR-CHAT-010

**As an** Egyptian user  
**I want** to chat in Arabic or English and receive replies in the same language  
**So that** I communicate naturally in my preferred language

---

## US-CHAT-008: AI Unavailable Graceful Degradation

**Priority:** P0  
**Role:** All users  
**Traces to:** FR-CHAT-016, NFR-AVAIL-002

**As a** user  
**I want** a clear message when AI is temporarily unavailable  
**So that** I know to use search or booking instead and am not left confused

---

## US-CHAT-009: Fair Housing Guardrails

**Priority:** P0  
**Role:** System  
**Traces to:** FR-CHAT-014, NFR-COMP-005

**As the** platform  
**I want** AI agents to refuse discriminatory requests (e.g., filter by religion or ethnicity)  
**So that** we comply with fair housing principles and protect users

---

## US-CHAT-010: Disabled Agent Fallback

**Priority:** P0  
**Role:** System  
**Traces to:** FR-CHAT-009

**As a** user whose selected agent was disabled by admin  
**I want** to be automatically switched to the default agent with a notification  
**So that** my chat continues without interruption

---

## US-CHAT-011: Book Viewing from Chat

**Priority:** P1  
**Role:** Buyer  
**Traces to:** FR-CHAT-017

**As a** user discussing a property in chat  
**I want** to jump directly to book a viewing for that listing  
**So that** I can act on AI suggestions without searching again

---

## US-CHAT-012: Daily Message Limit (Free Tier)

**Priority:** P1  
**Role:** Buyer, Agent  
**Traces to:** FR-CHAT-018

**As a** free-tier user  
**I want** to know when I reach my daily AI message limit  
**So that** I understand usage constraints and can upgrade later

---

## US-CHAT-013: Admin Disable AI Agent

**Priority:** P0  
**Role:** Admin  
**Traces to:** FR-ADMIN-001

**As a** platform admin  
**I want** to enable or disable AI agents without deleting their configuration  
**So that** I can respond to issues or seasonal changes quickly

---

## US-CHAT-014: Guest Cannot Access Chat

**Priority:** P0  
**Role:** Guest  
**Traces to:** FR-CHAT-001

**As a** guest  
**I want** to be prompted to log in when I try to use AI chat  
**So that** chat history and personalization are tied to my account

---

## Summary

| Priority | Count |
|----------|-------|
| P0 | 12 |
| P1 | 2 |
| P2 | 0 |
| **Total** | **14** |

## Related Documents

- [Acceptance Criteria](./acceptance_criteria.md)
- [AI Provider Strategy](../../architecture/ai_provider_strategy.md)
