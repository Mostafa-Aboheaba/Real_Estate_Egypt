# Acceptance Criteria — Booking

## Document Status

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Status | Draft |
| Last Updated | 2026-06-03 |

---

## AC-BOOK-001: Request Viewing

**Maps to:** US-BOOK-001  
**Priority:** P0

**Given** I am logged in as Buyer viewing listing detail  
**When** I tap "Book viewing", select date/time, add optional message, and submit  
**Then** booking is created with status `requested`  
**And** I see confirmation screen with booking reference  
**And** assigned agent receives notification within 60 seconds

**Given** I am not logged in  
**When** I tap "Book viewing"  
**Then** I am prompted to log in or register

---

## AC-BOOK-002: Book from Chat

**Maps to:** US-BOOK-002  
**Priority:** P1

**Given** I am in AI chat with a listing card displayed  
**When** I tap "Book viewing" on the card  
**Then** booking flow opens with property pre-selected

---

## AC-BOOK-003: Buyer Status Tracking

**Maps to:** US-BOOK-003  
**Priority:** P0

**Given** I have bookings in various states  
**When** I open "My Bookings"  
**Then** I see list with status badges: Requested, Confirmed, Completed, Cancelled  
**When** I tap a booking  
**Then** I see property summary, date/time, agent contact, and status timeline

---

## AC-BOOK-004: Agent Notification

**Maps to:** US-BOOK-004  
**Priority:** P0

**Given** a buyer submits booking for my assigned listing  
**When** booking is created  
**Then** I receive push notification on mobile  
**And** I receive email with property, buyer name, requested time, and message

---

## AC-BOOK-005: Agent Respond to Booking

**Maps to:** US-BOOK-005  
**Priority:** P0

**Given** I am agent with a `requested` booking  
**When** I tap Confirm with selected time  
**Then** status changes to `confirmed` and buyer is notified  
**When** I propose alternative time  
**Then** buyer receives notification with new proposed time to accept/decline  
**When** I decline with reason  
**Then** status changes to `cancelled` and buyer is notified with reason

---

## AC-BOOK-006: Agent Booking List

**Maps to:** US-BOOK-006  
**Priority:** P0

**Given** I am agent with 10 bookings  
**When** I open agent bookings screen  
**Then** I can filter by status: All, Requested, Confirmed, Completed, Cancelled  
**And** requested bookings appear first by default

---

## AC-BOOK-007: Cancel Booking

**Maps to:** US-BOOK-007  
**Priority:** P0

**Given** confirmed booking scheduled for tomorrow  
**When** buyer cancels with optional reason  
**Then** status becomes `cancelled`  
**And** agent receives notification  
**And** time slot becomes available again

**Given** viewing time has passed  
**When** user attempts cancel  
**Then** cancel is blocked; option to mark completed instead

---

## AC-BOOK-008: Push on Status Change

**Maps to:** US-BOOK-008  
**Priority:** P0

**Given** booking status changes from requested to confirmed  
**When** update is saved  
**Then** buyer receives push within 60 seconds  
**And** notification text matches user's language preference

---

## AC-BOOK-009: No Double Booking

**Maps to:** US-BOOK-009  
**Priority:** P0

**Given** agent has confirmed booking at Tuesday 3:00 PM  
**When** another buyer requests Tuesday 3:00 PM with same agent  
**Then** system rejects confirmation with "Time slot unavailable"  
**And** agent can propose alternative time

---

## AC-BOOK-010: Agent Availability

**Maps to:** US-BOOK-010  
**Priority:** P1

**Given** I set availability Mon–Fri 10:00–18:00  
**When** buyer selects booking time  
**Then** only slots within availability windows are selectable  
**And** times outside window are greyed out

---

## AC-BOOK-011: Free Tier Limit

**Maps to:** US-BOOK-011  
**Priority:** P1

**Given** I am agent on free tier with 5 bookings received this calendar month  
**When** 6th booking request arrives  
**Then** agent sees warning banner on booking list  
**And** new requests still arrive (soft limit for MVP — hard block TBD in open items)

---

## AC-BOOK-012: Email Confirmation

**Maps to:** US-BOOK-012  
**Priority:** P0

**Given** booking is confirmed  
**When** confirmation is saved  
**Then** both buyer and agent receive email with: property title, address, date/time, booking ID  
**And** email is in recipient's preferred language

---

## Related Documents

- [User Stories](./user_stories.md)
- [Requirements](../../specs/requirements.md)
