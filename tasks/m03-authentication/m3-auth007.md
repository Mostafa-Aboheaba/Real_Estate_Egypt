# M3-AUTH007: Apple Sign-In Backend

## Metadata

| Field | Value |
|-------|-------|
| **ID** | M3-AUTH007 |
| **Milestone** | M3 — Authentication |
| **Estimate** | 4h |
| **Priority** | P0 |
| **Status** | pending |
| **Layer** | backend |

## Description

POST /auth/apple; handle private relay emails.

## Dependencies

- [M3-AUTH006](../m03-authentication/m3-auth006.md)

## Traces To

FR-AUTH-003, AC-AUTH-003

## Acceptance Criteria

- [ ] Valid Apple identity token logs user in
- [ ] Private relay email stored correctly

## Affected Files

- `backend/src/infrastructure/auth/apple.strategy.ts`

## Test Requirements

Integration: mock Apple JWT

## Definition of Done

- [ ] Valid Apple identity token logs user in
- [ ] Private relay email stored correctly
