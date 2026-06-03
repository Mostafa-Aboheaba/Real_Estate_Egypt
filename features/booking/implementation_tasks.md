# Implementation Tasks — Booking & Notifications

## Document Status

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Status | Draft |
| Approval | Pending PO / Tech Lead / QA |

Implementation is **blocked** until this feature SDD is approved.

---

## Task list

| Order | Task ID | Title | Est. | Traces to |
|-------|---------|-------|------|-----------|
| 1 | [M9-BOK001](../../tasks/m09-booking/m9-bok001.md) | Booking domain + repository | 3h | [data_model.md](./data_model.md) |
| 2 | [M9-BOK002](../../tasks/m09-booking/m9-bok002.md) | POST /api/v1/bookings (buyer request) | 4h | FR-BOOK-001, FR-BOOK-002 |
| 3 | [M9-BOK003](../../tasks/m09-booking/m9-bok003.md) | Agent confirm / decline / cancel APIs | 3h | FR-BOOK-003, FR-BOOK-011 |
| 4 | [M9-BOK004](../../tasks/m09-booking/m9-bok004.md) | Double-booking + agent quota guards | 3h | FR-BOOK-009, FR-BOOK-010 |
| 5 | [M9-BOK005](../../tasks/m09-booking/m9-bok005.md) | NotificationsModule + BullMQ processor | 3h | FR-NOTIF-001 |
| 6 | [M9-BOK006](../../tasks/m09-booking/m9-bok006.md) | FCM push integration | 4h | FR-NOTIF-001 |
| 7 | [M9-BOK007](../../tasks/m09-booking/m9-bok007.md) | Bilingual email templates (ar/en) | 3h | FR-NOTIF-004 |
| 8 | [M9-BOK008](../../tasks/m09-booking/m9-bok008.md) | Mobile booking request from listing detail | 4h | AC-BOOK-001 |
| 9 | [M9-BOK009](../../tasks/m09-booking/m9-bok009.md) | Mobile agent booking inbox | 3h | AC-BOOK-006 |
| 10 | [M9-BOK010](../../tasks/m09-booking/m9-bok010.md) | Booking E2E lifecycle test | 3h | [tests.md](./tests.md) BOK-T-040 |

**Prerequisites:** M2-PLT003 (Prisma), M2-PLT007 (BullMQ), M3-AUTH008 (RBAC), M4-SEA007 (listings).

**Suggested order:** BOK001 → BOK002 → BOK003 → BOK004 ∥ BOK005 → BOK006 + BOK007 → BOK008 → BOK009 → BOK010.

---

## SDD authoring tasks (Sprint 001)

| Sprint ID | Artifact | Status |
|-----------|----------|--------|
| S1-090 – S1-091 | [requirements.md](./requirements.md) | ✅ Draft |
| S1-092 – S1-093, S1-100 | [architecture.md](./architecture.md) | ✅ Draft |
| S1-094 – S1-095 | [data_model.md](./data_model.md) | ✅ Draft |
| S1-096 – S1-097 | [api_design.md](./api_design.md) | ✅ Draft |
| S1-098 – S1-099 | [tests.md](./tests.md) | ✅ Draft |
| S1-101 | This file + [README.md](./README.md) | ✅ Draft |

---

## Related documents

- [tests.md](./tests.md)
- [api_design.md](./api_design.md)
- [requirements.md](./requirements.md)
