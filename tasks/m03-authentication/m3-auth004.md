# M3-AUTH004: POST /auth/login + Logout

## Metadata

| Field | Value |
|-------|-------|
| **ID** | M3-AUTH004 |
| **Milestone** | M3 — Authentication |
| **Estimate** | 3h |
| **Priority** | P0 |
| **Status** | pending |
| **Layer** | backend |

## Description

Login with email/password; logout invalidates refresh token.

## Dependencies

- [M3-AUTH003](../m03-authentication/m3-auth003.md)

## Traces To

FR-AUTH-004, AC-AUTH-004, AC-AUTH-005

## Acceptance Criteria

- [ ] Correct credentials return token pair
- [ ] Wrong password returns 401
- [ ] Logout returns 204 and revokes refresh

## Affected Files

- `backend/src/application/auth/login.use-case.ts`
- `backend/src/application/auth/logout.use-case.ts`

## Test Requirements

Integration: login/logout; wrong password

## Definition of Done

- [ ] Correct credentials return token pair
- [ ] Wrong password returns 401
- [ ] Logout returns 204 and revokes refresh
