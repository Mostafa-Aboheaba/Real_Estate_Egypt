# Requirements — Booking & Notifications

## Document Status

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Status | Draft |
| Last Updated | 2026-06-03 |
| Traces to | FR-BOOK-*, FR-NOTIF-* in [specs/requirements.md](../../specs/requirements.md) |
| Notifications scope | **Option A** — FR-NOTIF-* documented here and in [api_design.md](./api_design.md) § Notifications (no separate `features/notifications/` folder) |

---

## 1. Purpose

Define functional and non-functional requirements for property viewing appointment scheduling (buyer requests, agent responses, lifecycle tracking) and booking-related notifications (push and email) for the AI Property Assistant platform.

---

## 2. Scope

### In scope (MVP)

- Buyer viewing request from listing detail (P0)
- Booking request payload: property ID, preferred date/time, optional message
- Status lifecycle: `requested` → `confirmed` → `completed` | `cancelled` | `declined`
- Agent confirm, propose alternative time, or decline
- Buyer and agent booking lists with status filters
- Cancel before scheduled viewing time
- Double-booking prevention for confirmed agent slots
- Agent free-tier quota: **hard block** at 5 booking requests per calendar month (P1)
- Push notifications on booking status changes (FCM/APNs)
- Email notifications on booking confirmation and new request (SendGrid)
- Bilingual notification content (ar-EG, en) for booking events (P1)
- Respect user notification preferences from profile (FR-NOTIF-003)

### Out of scope (MVP)

- Separate `features/notifications/` bounded context (Option B)
- Password-reset email (owned by [authentication](../authentication/requirements.md); FR-NOTIF-002 split)
- SMS / WhatsApp notifications
- In-app notification center UI (push + email only)
- Agent license verification before accepting bookings
- Payment / Pro tier upgrade flow (quota message only)
- Chat-initiated booking deep link (P1 — depends on ai_chat)
- Agent availability windows UI (P1 — FR-BOOK-012)

---

## 3. Personas

| Persona | Role ID | Booking needs |
|---------|---------|---------------|
| Buyer / Renter | `buyer` | Request viewings, track status, cancel |
| Real Estate Agent | `agent` | Inbox, confirm/decline/propose, manage schedule |
| Platform | — | Enforce slot conflicts and monthly quota |

---

## 4. Functional requirements — Booking

| ID | Requirement | Priority | Stories |
|----|-------------|----------|---------|
| FR-BOOK-001 | Authenticated buyers request a viewing from listing detail or AI chat | P0 | US-BOOK-001, US-BOOK-002 |
| FR-BOOK-002 | Request includes property ID, preferred date/time, optional message | P0 | US-BOOK-001 |
| FR-BOOK-003 | Assigned agent receives push and/or email on new request | P0 | US-BOOK-004 |
| FR-BOOK-004 | Agents confirm, propose alternative times, or decline | P0 | US-BOOK-005 |
| FR-BOOK-005 | Buyers track status: Requested → Confirmed → Completed → Cancelled | P0 | US-BOOK-003 |
| FR-BOOK-006 | Both parties notified on booking status changes | P0 | US-BOOK-008 |
| FR-BOOK-007 | Agents view bookings filtered by status | P0 | US-BOOK-006 |
| FR-BOOK-008 | Buyers view booking history | P0 | US-BOOK-003 |
| FR-BOOK-009 | Free-tier agents limited to **5 booking requests per calendar month** (hard block on 6th) | P1 | US-BOOK-011 |
| FR-BOOK-010 | Prevent double-booking of same time slot for an agent | P0 | US-BOOK-009 |
| FR-BOOK-011 | Users cancel a booking before viewing time | P0 | US-BOOK-007 |
| FR-BOOK-012 | Agents set basic availability windows (days and hours) | P1 | US-BOOK-010 |

---

## 5. Functional requirements — Notifications (Option A)

Booking owns booking-related notification delivery. Cross-feature items note their primary owner.

| ID | Requirement | Priority | Owner in MVP | Stories |
|----|-------------|----------|--------------|---------|
| FR-NOTIF-001 | Push notifications for booking status changes | P0 | Booking | US-BOOK-004, US-BOOK-008 |
| FR-NOTIF-002 | Email for booking confirmations; password reset email in auth | P0 | Booking (confirmations); Auth (reset) | US-BOOK-012 |
| FR-NOTIF-003 | Users opt out of non-essential notifications via profile | P0 | Profile (prefs); Booking (enforce) | — |
| FR-NOTIF-004 | Bilingual notification content (ar-EG, en) | P1 | Booking | US-BOOK-012 |

### Notification events (booking)

| Event | Channels | Recipients |
|-------|----------|------------|
| `booking.requested` | push, email | Agent |
| `booking.confirmed` | push, email | Buyer, Agent |
| `booking.proposed` | push | Buyer |
| `booking.declined` | push, email | Buyer |
| `booking.cancelled` | push, email | Other party |
| `booking.completed` | push | Buyer, Agent |

Non-essential events (e.g. marketing) respect FR-NOTIF-003; booking lifecycle events are **essential** and cannot be fully disabled.

---

## 6. User story → FR traceability

| Story | FR IDs |
|-------|--------|
| US-BOOK-001 | FR-BOOK-001, FR-BOOK-002 |
| US-BOOK-002 | FR-BOOK-001, FR-CHAT-017 |
| US-BOOK-003 | FR-BOOK-005, FR-BOOK-008 |
| US-BOOK-004 | FR-BOOK-003, FR-NOTIF-001 |
| US-BOOK-005 | FR-BOOK-004 |
| US-BOOK-006 | FR-BOOK-007 |
| US-BOOK-007 | FR-BOOK-011 |
| US-BOOK-008 | FR-BOOK-006, FR-NOTIF-001 |
| US-BOOK-009 | FR-BOOK-010 |
| US-BOOK-010 | FR-BOOK-012 |
| US-BOOK-011 | FR-BOOK-009 |
| US-BOOK-012 | FR-NOTIF-002, FR-NOTIF-004 |

---

## 7. Non-functional requirements

| ID | Application |
|----|-------------|
| NFR-PERF-003 | Agent push/email within 60s of booking create or status change |
| NFR-REL-002 | Notification jobs retry with exponential backoff (BullMQ) |
| NFR-SEC-004 | Buyers/agents access only their own bookings |
| NFR-UX-001 | ar-EG RTL + en LTR booking screens and notification copy |
| NFR-MAINT-001 | SDD approved before implementation |
| NFR-DATA-001 | Store datetimes in UTC; display in user locale |

---

## 8. Dependencies

| Dependency | Required for |
|------------|--------------|
| [authentication](../authentication/) | JWT, buyer/agent roles |
| [property_search](../property_search/) | Active listing + assigned agent |
| [profile](../profile/) | Notification preferences (FR-NOTIF-003), locale |
| PostgreSQL `bookings`, `notification_jobs` | Persistence |
| Redis + BullMQ | Async notification dispatch |
| FCM (Firebase) | Mobile push |
| SendGrid | Transactional email |
| M2-PLT007 | BullMQ platform setup |

**Blocks:** None (terminal consumer feature for MVP slice).

---

## 9. Assumptions

- Property has a single assigned agent at booking time (from listing sync).
- Idempotency-Key on POST prevents duplicate requests on network retry ([api_conventions.md](../../architecture/api_conventions.md)).
- Device tokens registered via profile/mobile after login (see [architecture.md](./architecture.md)).
- Agent tier defaults to `free` until billing module exists.

---

## 10. Open questions

| # | Question | Owner | Resolution |
|---|----------|-------|------------|
| 1 | Email provider | Tech Lead | SendGrid (see [architecture.md](./architecture.md)) |
| 2 | Free tier: soft vs hard block | PO | **Hard block** at 5/month per sprint plan §3.3 |
| 3 | Propose-alternative acceptance flow | Tech Lead | Buyer accepts via PATCH `confirm` on proposed time; status stays `requested` until buyer confirms |

---

## Related documents

- [User stories](./user_stories.md)
- [Acceptance criteria](./acceptance_criteria.md)
- [Architecture](./architecture.md)
- [API design](./api_design.md)
