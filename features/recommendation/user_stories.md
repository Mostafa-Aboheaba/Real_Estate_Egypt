# User Stories — Recommendations

## Document Status

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Status | Draft |
| Last Updated | 2026-06-03 |
| Traces to | FR-REC-* in [specs/requirements.md](../../specs/requirements.md) |

---

## US-REC-001: Personalized Home Feed

**Priority:** P0  
**Role:** Buyer, Agent  
**Traces to:** FR-REC-001

**As a** logged-in user  
**I want** to see a "Properties you might like" feed on my home screen  
**So that** I discover relevant listings without searching manually every time

---

## US-REC-002: Recommendations from Behavior

**Priority:** P0  
**Role:** Buyer, Agent  
**Traces to:** FR-REC-002

**As a** user  
**I want** recommendations based on my search history, favorites, and likes/dislikes  
**So that** suggestions improve the more I use the app

---

## US-REC-003: Like and Dislike Properties

**Priority:** P0  
**Role:** Buyer, Agent  
**Traces to:** FR-REC-003

**As a** user  
**I want** to like or dislike recommended and searched properties  
**So that** the app learns my taste and shows better matches

---

## US-REC-004: Respect Search Preferences

**Priority:** P0  
**Role:** Buyer, Agent  
**Traces to:** FR-REC-005

**As a** user who set budget and area preferences  
**I want** recommendations to stay within my stated preferences by default  
**So that** I am not shown irrelevant or out-of-budget properties

---

## US-REC-005: Exclude Disliked Properties

**Priority:** P0  
**Role:** Buyer, Agent  
**Traces to:** FR-REC-006

**As a** user  
**I want** properties I disliked to never appear in my recommendation feed  
**So that** I do not see the same unwanted listings repeatedly

---

## US-REC-006: Paginated Recommendations

**Priority:** P0  
**Role:** Buyer, Agent  
**Traces to:** FR-REC-007

**As a** user  
**I want** to scroll through more recommended properties  
**So that** I can explore beyond the first few suggestions

---

## US-REC-007: Chat-Informed Recommendations

**Priority:** P1  
**Role:** Buyer, Agent  
**Traces to:** FR-REC-004

**As a** user who discussed properties in AI chat  
**I want** those interests reflected in my recommendations  
**So that** the home feed aligns with what I asked the assistant about

---

## US-REC-008: Non-Discriminatory Recommendations

**Priority:** P0  
**Role:** System  
**Traces to:** FR-REC-008, NFR-COMP-005

**As the** platform  
**I want** recommendation scoring to exclude protected characteristics  
**So that** we comply with fair housing requirements

---

## US-REC-009: Guest No Recommendations

**Priority:** P0  
**Role:** Guest  
**Traces to:** FR-REC-001

**As a** guest  
**I want** to see generic popular listings instead of personalized recommendations  
**So that** I am encouraged to register for a tailored experience

---

## Summary

| Priority | Count |
|----------|-------|
| P0 | 8 |
| P1 | 1 |
| P2 | 0 |
| **Total** | **9** |

## Related Documents

- [Acceptance Criteria](./acceptance_criteria.md)
- [Requirements](../../specs/requirements.md)
