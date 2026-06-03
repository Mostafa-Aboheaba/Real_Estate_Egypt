# M3-AUTH002: JWT + Refresh Token Service

## Metadata

| Field | Value |
|-------|-------|
| **ID** | M3-AUTH002 |
| **Milestone** | M3 — Authentication |
| **Estimate** | 3h |
| **Priority** | P0 |
| **Status** | done |
| **Layer** | backend |

## Description

Issue access (15m) and refresh tokens with rotation; Prisma refresh_tokens table.

## Dependencies

- [M3-AUTH001](../m03-authentication/m3-auth001.md)

## Traces To

FR-AUTH-006, AC-AUTH-004

## Acceptance Criteria

- [ ] Access token expires per config
- [ ] Refresh rotation invalidates old token
- [ ] Tampered token rejected

## Affected Files

- `backend/src/infrastructure/auth/jwt-token.service.ts`
- `backend/src/infrastructure/persistence/auth/**`

## Test Requirements

Unit: sign/verify; Integration: refresh flow

## Definition of Done

- [ ] Access token expires per config
- [ ] Refresh rotation invalidates old token
- [ ] Tampered token rejected
