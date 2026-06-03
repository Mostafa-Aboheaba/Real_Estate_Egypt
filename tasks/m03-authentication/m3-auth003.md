# M3-AUTH003: POST /auth/register + Email Verification

## Metadata

| Field | Value |
|-------|-------|
| **ID** | M3-AUTH003 |
| **Milestone** | M3 — Authentication |
| **Estimate** | 4h |
| **Priority** | P0 |
| **Status** | pending |
| **Layer** | backend |

## Description

Register endpoint, duplicate email check, verification email job.

## Dependencies

- [M3-AUTH002](../m03-authentication/m3-auth002.md)

## Traces To

FR-AUTH-001, FR-AUTH-009, AC-AUTH-001, AC-AUTH-007

## Acceptance Criteria

- [ ] Valid registration returns 201 + verification pending
- [ ] Duplicate email returns 409
- [ ] Unverified user blocked from protected routes

## Affected Files

- `backend/src/modules/auth/**`
- `backend/src/application/auth/register.use-case.ts`

## Test Requirements

Integration: register happy path + duplicate + unverified guard

## Definition of Done

- [ ] Valid registration returns 201 + verification pending
- [ ] Duplicate email returns 409
- [ ] Unverified user blocked from protected routes
