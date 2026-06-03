# M3-AUTH005: Password Reset Flow

## Metadata

| Field | Value |
|-------|-------|
| **ID** | M3-AUTH005 |
| **Milestone** | M3 — Authentication |
| **Estimate** | 3h |
| **Priority** | P0 |
| **Status** | done |
| **Layer** | backend |

## Description

forgot-password and reset-password endpoints with email link.

## Dependencies

- [M3-AUTH004](../m03-authentication/m3-auth004.md)

## Traces To

FR-AUTH-005, AC-AUTH-006

## Acceptance Criteria

- [ ] Reset email sent for known email
- [ ] Unknown email returns same response (no leak)
- [ ] Reset token single-use

## Affected Files

- `backend/src/application/auth/forgot-password.use-case.ts`
- `backend/src/application/auth/reset-password.use-case.ts`

## Test Requirements

Integration: full reset flow with mock email

## Definition of Done

- [ ] Reset email sent for known email
- [ ] Unknown email returns same response (no leak)
- [ ] Reset token single-use
