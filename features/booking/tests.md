# Tests — Booking & Notifications

## Document Status

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Status | Draft |
| Last Updated | 2026-06-03 |

Test ID format: **BOK-T-###**

---

## 1. Unit tests (domain)

| ID | AC | Description |
|----|-----|-------------|
| BOK-T-001 | AC-BOOK-009 | Status machine rejects invalid transitions |
| BOK-T-002 | AC-BOOK-009 | `requested` → `confirmed` allowed for assigned agent |
| BOK-T-003 | AC-BOOK-011 | Cancel blocked after `scheduled_at` |
| BOK-T-004 | AC-BOOK-009 | Conflict policy detects overlapping confirmed slots |
| BOK-T-005 | AC-BOOK-011 | Quota policy blocks 6th booking for free-tier agent |
| BOK-T-006 | AC-BOOK-008 | Notification enqueue idempotent within 5 min window |

**Target:** ≥ 80% coverage `domain/booking/` and `domain/notifications/` (NFR-MAINT-003).

---

## 2. Integration tests (API)

| ID | AC | Description |
|----|-----|-------------|
| BOK-T-010 | AC-BOOK-001 | Buyer POST creates booking with `requested` |
| BOK-T-011 | AC-BOOK-001 | Inactive property returns 404 |
| BOK-T-012 | AC-BOOK-001 | Idempotency-Key prevents duplicate create |
| BOK-T-013 | AC-BOOK-003 | Buyer GET list returns own bookings only |
| BOK-T-014 | AC-BOOK-006 | Agent GET inbox filters by status |
| BOK-T-015 | AC-BOOK-005 | Agent confirm sets `confirmed` + `scheduled_at` |
| BOK-T-016 | AC-BOOK-005 | Agent propose updates `preferred_at`, stays `requested` |
| BOK-T-017 | AC-BOOK-005 | Agent decline sets `declined` |
| BOK-T-018 | AC-BOOK-007 | Buyer cancel before viewing succeeds |
| BOK-T-019 | AC-BOOK-007 | Cancel after viewing time returns 409 |
| BOK-T-020 | AC-BOOK-009 | Second confirm same slot returns 409 `SLOT_UNAVAILABLE` |
| BOK-T-021 | AC-BOOK-011 | 6th booking in month returns 403 `AGENT_QUOTA_EXCEEDED` |
| BOK-T-022 | AC-BOOK-004 | Agent receives notification job on create |
| BOK-T-023 | AC-BOOK-008 | Buyer receives push job on confirm |
| BOK-T-024 | AC-BOOK-012 | Confirmation enqueues email jobs for buyer and agent |
| BOK-T-025 | — | Buyer 403 on agent-only confirm endpoint |
| BOK-T-026 | — | Agent 403 on another agent's booking |

---

## 3. Notification processor tests

| ID | FR | Description |
|----|-----|-------------|
| BOK-T-030 | FR-NOTIF-001 | Mock FCM receives bookingId in data payload |
| BOK-T-031 | FR-NOTIF-001 | Invalid device token marks token inactive, job completes |
| BOK-T-032 | FR-NOTIF-002 | Mock SendGrid receives booking-confirmed template |
| BOK-T-033 | FR-NOTIF-003 | Push skipped when user pref disabled |
| BOK-T-034 | FR-NOTIF-001 | Failed job retries with backoff (max 5) |
| BOK-T-042 | FR-NOTIF-004 | Email snapshot ar-EG and en templates |

---

## 4. E2E lifecycle tests

| ID | AC | Type | Description |
|----|-----|------|-------------|
| BOK-T-040 | AC-BOOK-001, 005, 008, 012 | E2E | **Full lifecycle:** buyer request → agent confirm → buyer notified → complete |
| BOK-T-041 | AC-BOOK-007 | E2E | Confirm → buyer cancel → agent notified → slot freed |
| BOK-T-043 | AC-BOOK-005 | E2E | Request → agent decline → buyer notified |
| BOK-T-044 | AC-BOOK-009 | E2E | Double-book attempt rejected; agent proposes alternative |

**BOK-T-040 steps (primary MVP gate):**

1. Seed buyer, agent, active property.
2. Buyer POST `/bookings` → 201, `status: requested`.
3. Assert `notification_jobs` row for agent push + email.
4. Process BullMQ jobs (test worker) → mock FCM/SendGrid called.
5. Agent PATCH confirm → 200, `status: confirmed`.
6. Assert buyer push job enqueued within 60s window.
7. Agent PATCH complete (after scheduled time mock) → `completed`.

Maps to [M9-BOK010](../../tasks/m09-booking/m9-bok010.md).

---

## 5. Mobile tests

| ID | AC | Type | Description |
|----|-----|------|-------------|
| BOK-T-050 | AC-BOOK-001 | Widget | Date/time validation on booking form |
| BOK-T-051 | AC-BOOK-001 | Widget | Submit disabled when preferredAt missing |
| BOK-T-052 | AC-BOOK-006 | Widget | Agent inbox status filter chips |
| BOK-T-053 | AC-BOOK-001 | E2E manual | Buyer request from listing detail |
| BOK-T-054 | AC-BOOK-005 | E2E manual | Agent confirm on second simulator |
| BOK-T-055 | AC-BOOK-002 | E2E manual | Book from chat card (P1, if M7 done) |

---

## 6. AC coverage matrix (P0)

| AC-ID | Test IDs |
|-------|----------|
| AC-BOOK-001 | BOK-T-010, 011, 012, 050, 051, 053, BOK-T-040 |
| AC-BOOK-003 | BOK-T-013, BOK-T-040 |
| AC-BOOK-004 | BOK-T-022, BOK-T-040 |
| AC-BOOK-005 | BOK-T-015, 016, 017, 043, 044, 054, BOK-T-040 |
| AC-BOOK-006 | BOK-T-014, 052 |
| AC-BOOK-007 | BOK-T-018, 019, 041 |
| AC-BOOK-008 | BOK-T-023, 030, BOK-T-040 |
| AC-BOOK-009 | BOK-T-004, 020, 044 |
| AC-BOOK-012 | BOK-T-024, 032, 042, BOK-T-040 |

P1 coverage:

| AC-ID | Test IDs |
|-------|----------|
| AC-BOOK-002 | BOK-T-055 |
| AC-BOOK-010 | Add BOK-T-060 (availability slot filter) before P1 sprint |
| AC-BOOK-011 | BOK-T-021 |

---

## Related documents

- [acceptance_criteria.md](./acceptance_criteria.md)
- [implementation_tasks.md](./implementation_tasks.md)
- [api_design.md](./api_design.md)
