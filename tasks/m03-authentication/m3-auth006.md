# M3-AUTH006: Google OAuth Backend

## Metadata

| Field | Value |
|-------|-------|
| **ID** | M3-AUTH006 |
| **Milestone** | M3 — Authentication |
| **Estimate** | 4h |
| **Priority** | P0 |
| **Status** | done |
| **Layer** | backend |

## Description

POST /auth/google with Passport; oauth_accounts linking.

## Dependencies

- [M3-AUTH004](../m03-authentication/m3-auth004.md)

## Traces To

FR-AUTH-002, AC-AUTH-002

## Acceptance Criteria

- [ ] Valid Google token creates/links user
- [ ] Cancelled flow returns 400
- [ ] New user prompted for role in response metadata

## Affected Files

- `backend/src/infrastructure/auth/google.strategy.ts`
- `backend/src/presentation/auth/auth.controller.ts`

## Test Requirements

Integration: mock Google token

## Definition of Done

- [ ] Valid Google token creates/links user
- [ ] Cancelled flow returns 400
- [ ] New user prompted for role in response metadata
