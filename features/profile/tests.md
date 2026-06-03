# Tests — Profile & Preferences

## Document Status

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Status | Draft |
| Last Updated | 2026-06-03 |

Test ID format: **PROF-T-###**

---

## 1. Unit tests (domain)

| ID | AC | Description |
|----|-----|-------------|
| PROF-T-001 | AC-PROF-001 | Phone VO rejects invalid Egyptian format |
| PROF-T-002 | AC-PROF-001 | Name VO rejects > 120 chars |
| PROF-T-003 | AC-PROF-004 | SearchPreferences rejects minPrice > maxPrice |
| PROF-T-004 | AC-PROF-007 | AgentProfile bio rejects > 500 chars per locale |
| PROF-T-005 | AC-PROF-006 | preferredAgentId validated against catalog enum |
| PROF-T-006 | AC-PROF-003 | Favorite add is idempotent for same user+property |

**Target:** ≥ 80% coverage `domain/users/` (NFR-MAINT-003).

---

## 2. Integration tests (API)

| ID | AC | Description |
|----|-----|-------------|
| PROF-T-010 | AC-PROF-001 | GET /users/me returns authenticated profile |
| PROF-T-011 | AC-PROF-001 | PATCH /users/me updates name and phone |
| PROF-T-012 | AC-PROF-001 | Invalid phone returns 400 VALIDATION_ERROR |
| PROF-T-013 | AC-PROF-002 | PATCH locale persists; reflected in GET /me |
| PROF-T-014 | AC-PROF-003 | POST favorite returns 201; duplicate returns 200 |
| PROF-T-015 | AC-PROF-003 | DELETE favorite removes row; second DELETE 404 |
| PROF-T-016 | AC-PROF-003 | GET favorites paginates (25 items, page 2) |
| PROF-T-017 | AC-PROF-003 | POST favorite 404 when property missing |
| PROF-T-018 | AC-PROF-004 | Search preferences round-trip in GET /me |
| PROF-T-019 | AC-PROF-004 | Invalid budget range returns 400 |
| PROF-T-020 | AC-PROF-006 | PATCH preferredAgentId; chat stub reads default |
| PROF-T-021 | AC-PROF-006 | Invalid agent id returns 400 |
| PROF-T-022 | AC-PROF-007 | Agent PATCH agentProfile; GET /agents/:id public |
| PROF-T-023 | AC-PROF-007 | GET /agents/:id 404 for buyer role user |
| PROF-T-024 | AC-PROF-007 | Buyer PATCH agentProfile returns 403 |
| PROF-T-025 | AC-PROF-005 | PATCH notification prefs; booking push suppressed |
| PROF-T-026 | AC-PROF-001 | GET /users/me 401 without token |

---

## 3. Mobile tests

| ID | AC | Type | Description |
|----|-----|------|-------------|
| PROF-T-030 | AC-PROF-001 | Widget | Edit profile form validation |
| PROF-T-031 | AC-PROF-002 | Widget | Locale switcher updates UI direction |
| PROF-T-032 | AC-PROF-003 | Widget | Favorites list renders thumbnail and price |
| PROF-T-033 | AC-PROF-003 | Widget | Heart toggle optimistic add/remove |
| PROF-T-034 | AC-PROF-004 | Widget | Search prefs form pre-fills from profile |
| PROF-T-035 | AC-PROF-006 | Widget | Default agent picker persists selection |
| PROF-T-036 | AC-PROF-007 | Widget | Agent profile edit (agent role only) |
| PROF-T-037 | AC-PROF-001 | E2E manual | Profile edit → name visible on tab |
| PROF-T-038 | AC-PROF-003 | E2E manual | Favorite persists after app restart |

---

## 4. Compliance (PDPL)

| ID | AC | Description |
|----|-----|-------------|
| PROF-T-040 | AC-PROF-008 | DELETE /users/me sets deleted_at; login fails |
| PROF-T-041 | AC-PROF-008 | Deletion revokes all refresh tokens |
| PROF-T-042 | AC-PROF-008 | Active bookings cancelled on delete (event) |
| PROF-T-043 | AC-PROF-008 | PII purge job scheduled within policy window |
| PROF-T-044 | AC-PROF-009 | POST /users/me/export returns 202 queued |
| PROF-T-045 | AC-PROF-009 | Export JSON excludes full AI prompt content |
| PROF-T-046 | AC-PROF-009 | Export delivered within 72h (P1 integration stub) |

---

## 5. AC coverage matrix (P0)

| AC-ID | Test IDs |
|-------|----------|
| AC-PROF-001 | PROF-T-001, 002, 010–012, 026, 030, 037 |
| AC-PROF-002 | PROF-T-013, 031 |
| AC-PROF-003 | PROF-T-006, 014–017, 032–033, 038 |
| AC-PROF-004 | PROF-T-003, 018, 019, 034 |
| AC-PROF-005 | PROF-T-025 |
| AC-PROF-006 | PROF-T-005, 020, 021, 035 |
| AC-PROF-007 | PROF-T-004, 022–024, 036 |
| AC-PROF-008 | PROF-T-040–043 |

### P1 coverage

| AC-ID | Test IDs |
|-------|----------|
| AC-PROF-009 | PROF-T-044–046 |
| AC-PROF-010 | Deferred to notifications feature (FR-NOTIF-004) |
| AC-PROF-011 | Deferred to booking feature (P2) |

---

## 6. CI suite

Task [M5-PRO010](../../tasks/m05-profile/m5-pro010.md) implements `backend/test/integration/profile/**` covering PROF-T-010–026 and PROF-T-040–043.

---

## Related documents

- [acceptance_criteria.md](./acceptance_criteria.md)
- [implementation_tasks.md](./implementation_tasks.md)
- [api_design.md](./api_design.md)
