# Acceptance Criteria — Profile & Preferences

## Document Status

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Status | Draft |
| Last Updated | 2026-06-03 |

---

## AC-PROF-001: Edit Personal Info

**Maps to:** US-PROF-001  
**Priority:** P0

**Given** I am on profile settings  
**When** I update name, phone, and upload avatar image (≤ 5 MB, JPG/PNG)  
**Then** changes save successfully  
**And** updated info appears on profile and booking confirmations

**Given** I enter invalid phone format  
**When** I save  
**Then** inline validation error is shown (Egyptian mobile format)

---

## AC-PROF-002: Language Preference

**Maps to:** US-PROF-002  
**Priority:** P0

**Given** I select Arabic in settings  
**When** I save and return to home  
**Then** entire app switches to RTL Arabic without logout  
**Given** I switch to English  
**Then** app switches to LTR English immediately

---

## AC-PROF-003: Favorites

**Maps to:** US-PROF-003  
**Priority:** P0

**Given** I am on listing detail  
**When** I tap heart icon  
**Then** listing is added to favorites  
**When** I open Favorites tab  
**Then** listing appears with thumbnail, price, location  
**When** I tap heart again on same listing  
**Then** it is removed from favorites

**Given** I have 25 favorites  
**When** I scroll favorites list  
**Then** pagination loads additional items

---

## AC-PROF-004: Search Preferences

**Maps to:** US-PROF-004  
**Priority:** P0

**Given** I set preferences: rent, apartment, Cairo, 8,000–15,000 EGP  
**When** I open search  
**Then** filters are pre-applied to saved values  
**And** recommendations respect these bounds

---

## AC-PROF-005: Notification Settings

**Maps to:** US-PROF-005  
**Priority:** P0

**Given** I disable push for "Booking updates"  
**When** booking status changes  
**Then** no push is sent but email still sends (if email enabled)  
**Given** I disable all non-essential notifications  
**Then** only security emails (password reset) still deliver

---

## AC-PROF-006: Default AI Agent

**Maps to:** US-PROF-006  
**Priority:** P0

**Given** I select Buying Advisor as default in profile  
**When** I start new chat  
**Then** Buying Advisor is pre-selected  
**And** setting persists across app restarts

---

## AC-PROF-007: Agent Profile

**Maps to:** US-PROF-007  
**Priority:** P0

**Given** I am agent  
**When** I edit bio (≤ 500 chars), service areas (multi-select governorates), phone, photo  
**Then** profile saves and is visible to buyers on booking confirmation screen

---

## AC-PROF-008: Account Deletion

**Maps to:** US-PROF-008  
**Priority:** P0

**Given** I am on account settings  
**When** I tap Delete Account, confirm with password/biometric  
**Then** account is deactivated immediately  
**And** I am logged out  
**And** PII is scheduled for purge within 30 days  
**And** active bookings are cancelled with notifications to agents

---

## AC-PROF-009: Data Export

**Maps to:** US-PROF-009  
**Priority:** P1

**Given** I request data export  
**When** request is submitted  
**Then** I receive email with JSON download link within 72 hours  
**And** export includes: profile, favorites, preferences, booking history, chat metadata (not full AI prompts)

---

## AC-PROF-010: Bilingual Notifications

**Maps to:** US-PROF-010  
**Priority:** P1

**Given** my language is Arabic  
**When** booking is confirmed  
**Then** push notification body is in Arabic  
**Given** my language is English  
**Then** push and email use English templates

---

## AC-PROF-011: View Agent as Buyer

**Maps to:** US-PROF-011  
**Priority:** P2

**Given** I am buyer with confirmed booking  
**When** I view booking detail  
**Then** I see agent photo, name, bio snippet, and phone (tap to call)

---

## Related Documents

- [User Stories](./user_stories.md)
- [Requirements](../../specs/requirements.md)
