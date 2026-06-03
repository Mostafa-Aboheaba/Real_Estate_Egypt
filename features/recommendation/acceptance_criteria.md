# Acceptance Criteria — Recommendations

## Document Status

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Status | Draft |
| Last Updated | 2026-06-03 |

---

## AC-REC-001: Home Feed

**Maps to:** US-REC-001  
**Priority:** P0

**Given** I am logged in with search history  
**When** I open the home screen  
**Then** I see "Properties you might like" section with at least 5 listings  
**And** initial load p95 ≤ 2 seconds

**Given** I am a new user with no history  
**When** I open home  
**Then** I see popular listings in Greater Cairo as cold-start recommendations

---

## AC-REC-002: Behavior-Based Scoring

**Maps to:** US-REC-002  
**Priority:** P0

**Given** I searched for 3-bedroom rentals in Zamalek and favorited two listings  
**When** recommendations regenerate  
**Then** feed prioritizes similar rentals in Zamalek and nearby areas  
**And** favorited listings are excluded from feed (already saved)

---

## AC-REC-003: Like and Dislike

**Maps to:** US-REC-003  
**Priority:** P0

**Given** I view a recommended property  
**When** I tap dislike (thumbs down)  
**Then** property is removed from feed immediately  
**And** feedback is persisted to my profile  
**When** I tap like (thumbs up)  
**Then** similar properties rank higher in future feeds

---

## AC-REC-004: Preference Boundaries

**Maps to:** US-REC-004  
**Priority:** P0

**Given** my preferences: rent, max 15,000 EGP/month, Cairo governorate  
**When** recommendations load  
**Then** no listing exceeds 15,000 EGP or is outside Cairo unless I explicitly expanded filters in search

---

## AC-REC-005: Disliked Exclusion

**Maps to:** US-REC-005  
**Priority:** P0

**Given** I disliked property ID `abc-123`  
**When** any subsequent recommendation request runs  
**Then** `abc-123` never appears in results

---

## AC-REC-006: Pagination

**Maps to:** US-REC-006  
**Priority:** P0

**Given** recommendation engine has 40 matches  
**When** I scroll to end of first page  
**Then** next page loads (default 10 per page) without duplicates

---

## AC-REC-007: Chat Signals

**Maps to:** US-REC-007  
**Priority:** P1

**Given** I discussed "New Cairo compounds" in AI chat today  
**When** home feed refreshes within 24 hours  
**Then** at least 30% of recommendations relate to New Cairo or compounds

---

## AC-REC-008: Fair Housing

**Maps to:** US-REC-008  
**Priority:** P0

**Given** recommendation model inputs  
**When** scoring runs  
**Then** nationality, religion, ethnicity, and family status are not used as features  
**And** automated test suite verifies no discriminatory weight vectors

---

## AC-REC-009: Guest Popular Listings

**Maps to:** US-REC-009  
**Priority:** P0

**Given** I am a guest  
**When** I open home  
**Then** I see "Popular in Cairo" instead of personalized feed  
**And** CTA to register for personalized recommendations is visible

---

## Related Documents

- [User Stories](./user_stories.md)
- [Requirements](../../specs/requirements.md)
