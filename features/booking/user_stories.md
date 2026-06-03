# User Stories — Booking

## Document Status

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Status | Draft |
| Last Updated | 2026-06-03 |
| Traces to | FR-BOOK-*, FR-NOTIF-* in [specs/requirements.md](../../specs/requirements.md) |

---

## US-BOOK-001: Request Property Viewing

**Priority:** P0  
**Role:** Buyer  
**Traces to:** FR-BOOK-001, FR-BOOK-002

**As a** buyer  
**I want** to request a viewing appointment for a property from listing detail  
**So that** I can schedule a visit without calling an agent manually

---

## US-BOOK-002: Request Viewing from AI Chat

**Priority:** P1  
**Role:** Buyer  
**Traces to:** FR-BOOK-001, FR-CHAT-017

**As a** buyer  
**I want** to start a booking from a property discussed in AI chat  
**So that** I can act immediately on assistant suggestions

---

## US-BOOK-003: Track Booking Status

**Priority:** P0  
**Role:** Buyer  
**Traces to:** FR-BOOK-005, FR-BOOK-008

**As a** buyer  
**I want** to see the status of my viewing requests (Requested, Confirmed, Completed, Cancelled)  
**So that** I know when to expect confirmation and attend the viewing

---

## US-BOOK-004: Agent Receive Booking Notification

**Priority:** P0  
**Role:** Agent  
**Traces to:** FR-BOOK-003, FR-NOTIF-001

**As a** real estate agent  
**I want** to receive push and email notifications when a buyer requests a viewing  
**So that** I can respond quickly and not lose the lead

---

## US-BOOK-005: Agent Confirm or Decline Booking

**Priority:** P0  
**Role:** Agent  
**Traces to:** FR-BOOK-004

**As a** real estate agent  
**I want** to confirm, propose an alternative time, or decline booking requests  
**So that** I control my schedule while keeping buyers informed

---

## US-BOOK-006: Agent View Booking List

**Priority:** P0  
**Role:** Agent  
**Traces to:** FR-BOOK-007

**As a** real estate agent  
**I want** to see all my bookings filtered by status  
**So that** I can manage upcoming viewings efficiently

---

## US-BOOK-007: Cancel Booking

**Priority:** P0  
**Role:** Buyer, Agent  
**Traces to:** FR-BOOK-011

**As a** buyer or agent  
**I want** to cancel a booking before the viewing time  
**So that** both parties are not waiting for a cancelled appointment

---

## US-BOOK-008: Booking Status Notifications

**Priority:** P0  
**Role:** Buyer, Agent  
**Traces to:** FR-BOOK-006, FR-NOTIF-001

**As a** user  
**I want** push notifications when booking status changes  
**So that** I am informed without opening the app

---

## US-BOOK-009: Prevent Double Booking

**Priority:** P0  
**Role:** System  
**Traces to:** FR-BOOK-010

**As the** platform  
**I want** to prevent two confirmed bookings at the same time slot for one agent  
**So that** agents are not over-scheduled

---

## US-BOOK-010: Agent Availability Windows

**Priority:** P1  
**Role:** Agent  
**Traces to:** FR-BOOK-012

**As a** real estate agent  
**I want** to set my available days and hours for viewings  
**So that** buyers only request times when I am free

---

## US-BOOK-011: Agent Free Tier Limit

**Priority:** P1  
**Role:** Agent  
**Traces to:** FR-BOOK-009

**As an** agent on the free tier  
**I want** to know when I reach my monthly booking limit (5 requests)  
**So that** I can upgrade to Pro for unlimited bookings (post-MVP)

---

## US-BOOK-012: Email Booking Confirmation

**Priority:** P0  
**Role:** Buyer, Agent  
**Traces to:** FR-NOTIF-002

**As a** user  
**I want** email confirmation when a booking is confirmed  
**So that** I have a record in my inbox with date, time, and property address

---

## Summary

| Priority | Count |
|----------|-------|
| P0 | 10 |
| P1 | 2 |
| P2 | 0 |
| **Total** | **12** |

## Related Documents

- [Acceptance Criteria](./acceptance_criteria.md)
- [Requirements](../../specs/requirements.md)
