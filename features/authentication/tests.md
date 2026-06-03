# Tests — Authentication & Onboarding

## Document Status

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Status | Draft |
| Last Updated | 2026-06-03 |

Test ID format: **AUTH-T-###**

---

## 1. Unit tests (domain)

| ID | AC | Description |
|----|-----|-------------|
| AUTH-T-001 | AC-AUTH-001 | Email VO rejects invalid format |
| AUTH-T-002 | AC-AUTH-001 | Password VO rejects < 8 chars |
| AUTH-T-003 | AC-AUTH-011 | Duplicate email policy in domain service |
| AUTH-T-004 | AC-AUTH-013 | Role enum allows only buyer/agent/admin |

**Target:** ≥ 80% coverage `domain/auth/` (NFR-MAINT-003).

---

## 2. Integration tests (API)

| ID | AC | Description |
|----|-----|-------------|
| AUTH-T-010 | AC-AUTH-001 | Register 201 + verification pending |
| AUTH-T-011 | AC-AUTH-001 | Duplicate email 409 |
| AUTH-T-012 | AC-AUTH-004 | Login success returns token pair |
| AUTH-T-013 | AC-AUTH-004 | Wrong password 401 generic message |
| AUTH-T-014 | AC-AUTH-004 | Rate limit 429 after 10 attempts |
| AUTH-T-015 | AC-AUTH-005 | Logout revokes refresh |
| AUTH-T-016 | AC-AUTH-006 | Full password reset flow |
| AUTH-T-017 | AC-AUTH-006 | Expired reset token 400 |
| AUTH-T-018 | AC-AUTH-007 | Verify email unlocks features |
| AUTH-T-019 | AC-AUTH-002 | Google mock token creates/links user |
| AUTH-T-020 | AC-AUTH-003 | Apple mock token + relay email |
| AUTH-T-021 | AC-AUTH-011 | Google same email no duplicate |
| AUTH-T-022 | AC-AUTH-013 | Buyer 403 on agent endpoint |
| AUTH-T-023 | AC-AUTH-013 | Guest 401 on protected route |
| AUTH-T-024 | AC-AUTH-006 | Refresh rotation invalidates old token |

---

## 3. Mobile tests

| ID | AC | Type | Description |
|----|-----|------|-------------|
| AUTH-T-030 | AC-AUTH-001 | Widget | Register form validation |
| AUTH-T-031 | AC-AUTH-010 | Widget | Submit disabled without consent |
| AUTH-T-032 | AC-AUTH-009 | Widget | RTL labels when locale ar-EG |
| AUTH-T-033 | AC-AUTH-004 | E2E manual | Login → home navigation |
| AUTH-T-034 | AC-AUTH-002 | E2E manual | Google sign-in simulators |

---

## 4. Compliance (PDPL)

| ID | AC | Description |
|----|-----|-------------|
| AUTH-T-040 | AC-AUTH-010 | consent_at persisted on register |
| AUTH-T-041 | AC-AUTH-010 | Registration blocked without consent |

---

## 5. AC coverage matrix (P0)

| AC-ID | Test IDs |
|-------|----------|
| AC-AUTH-001 | AUTH-T-001, 002, 010, 011, 030 |
| AC-AUTH-002 | AUTH-T-019, 034 |
| AC-AUTH-003 | AUTH-T-020 |
| AC-AUTH-004 | AUTH-T-012–014, 024, 033 |
| AC-AUTH-005 | AUTH-T-015 |
| AC-AUTH-006 | AUTH-T-016, 017 |
| AC-AUTH-007 | AUTH-T-018 |
| AC-AUTH-008 | AUTH-T-010 (role agent) |
| AC-AUTH-009 | AUTH-T-032 |
| AC-AUTH-010 | AUTH-T-031, 040, 041 |
| AC-AUTH-011 | AUTH-T-003, 021 |
| AC-AUTH-013 | AUTH-T-022, 023 |

P1 AC-AUTH-012: AUTH-T-025 (integration link OAuth) — add before P1 sprint.

---

## Related documents

- [acceptance_criteria.md](./acceptance_criteria.md)
- [implementation_tasks.md](./implementation_tasks.md)
