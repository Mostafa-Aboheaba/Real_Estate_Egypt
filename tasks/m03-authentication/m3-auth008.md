# M3-AUTH008: RBAC Guards + JWT Passport

## Metadata

| Field | Value |
|-------|-------|
| **ID** | M3-AUTH008 |
| **Milestone** | M3 — Authentication |
| **Estimate** | 3h |
| **Priority** | P0 |
| **Status** | pending |
| **Layer** | backend |

## Description

JwtAuthGuard, RolesGuard, @Roles() decorator on protected routes.

## Dependencies

- [M3-AUTH002](../m03-authentication/m3-auth002.md)

## Traces To

FR-AUTH-013, AC-AUTH-013

## Acceptance Criteria

- [ ] Buyer cannot access agent-only endpoint (403)
- [ ] Missing token returns 401
- [ ] Valid token attaches user to request

## Affected Files

- `backend/src/presentation/guards/**`
- `backend/src/presentation/decorators/roles.decorator.ts`

## Test Requirements

Integration: protected route role matrix

## Definition of Done

- [ ] Buyer cannot access agent-only endpoint (403)
- [ ] Missing token returns 401
- [ ] Valid token attaches user to request
