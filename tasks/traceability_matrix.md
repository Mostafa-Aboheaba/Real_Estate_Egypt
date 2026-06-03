# Traceability Matrix (P0)

> Story → AC → FR → API → Test. Sprint 001 / M1.

## Document Status

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Last Updated | 2026-06-03 |
| Coverage | P0 user stories |

---

## Column definitions

| Column | Description |
|--------|-------------|
| Feature | Bounded context folder |
| US-ID | User story ID |
| AC-ID | Primary acceptance criterion |
| FR-ID | SRS functional requirement |
| API | Endpoint or `mobile` / `system` |
| Test-ID | Feature test plan ID |

---

## Authentication (sample — full P0)

| Feature | US-ID | AC-ID | FR-ID | API | Test-ID |
|---------|-------|-------|-------|-----|---------|
| authentication | US-AUTH-001 | AC-AUTH-001 | FR-AUTH-001 | POST /auth/register | AUTH-T-010 |
| authentication | US-AUTH-002 | AC-AUTH-002 | FR-AUTH-002 | POST /auth/google | AUTH-T-019 |
| authentication | US-AUTH-003 | AC-AUTH-003 | FR-AUTH-003 | POST /auth/apple | AUTH-T-020 |
| authentication | US-AUTH-004 | AC-AUTH-004 | FR-AUTH-006 | POST /auth/login | AUTH-T-012 |
| authentication | US-AUTH-005 | AC-AUTH-005 | FR-AUTH-004 | POST /auth/logout | AUTH-T-015 |
| authentication | US-AUTH-006 | AC-AUTH-006 | FR-AUTH-005 | POST /auth/reset-password | AUTH-T-016 |
| authentication | US-AUTH-007 | AC-AUTH-007 | FR-AUTH-009 | GET /auth/verify-email | AUTH-T-018 |
| authentication | US-AUTH-008 | AC-AUTH-008 | FR-AUTH-008 | POST /auth/register | AUTH-T-010 |
| authentication | US-AUTH-009 | AC-AUTH-009 | FR-AUTH-010 | mobile | AUTH-T-032 |
| authentication | US-AUTH-010 | AC-AUTH-010 | FR-AUTH-010 | POST /auth/register | AUTH-T-040 |
| authentication | US-AUTH-011 | AC-AUTH-011 | FR-AUTH-011 | POST /auth/google | AUTH-T-021 |
| authentication | US-AUTH-013 | AC-AUTH-013 | FR-AUTH-013 | *protected* | AUTH-T-022 |

---

## Other features

Detailed AC → Test mappings live in each feature `tests.md`:

| Feature | Test plan | P0 stories |
|---------|-----------|------------|
| property_search | [tests.md](../features/property_search/tests.md) | 13 |
| profile | [tests.md](../features/profile/tests.md) | 8 |
| ai_chat | [tests.md](../features/ai_chat/tests.md) | 12 |
| recommendation | [tests.md](../features/recommendation/tests.md) | 8 |
| booking | [tests.md](../features/booking/tests.md) | 9 |

---

## Verification

- [ ] PO confirms 100% P0 stories have FR-ID in feature `requirements.md`
- [ ] QA confirms 100% P0 AC have Test-ID in feature `tests.md`
