# M3-AUTH009: Mobile Auth Screens (Register, Login, Onboarding)

## Metadata

| Field | Value |
|-------|-------|
| **ID** | M3-AUTH009 |
| **Milestone** | M3 — Authentication |
| **Estimate** | 4h |
| **Priority** | P0 |
| **Status** | done |
| **Layer** | mobile |

## Description

Replace placeholders with register/login/role selection; ar-EG + en.

## Dependencies

- [M2-PLT001](../m02-platform/m2-plt001.md)
- [M3-AUTH004](../m03-authentication/m3-auth004.md)

## Traces To

AC-AUTH-001, AC-AUTH-009, AC-AUTH-010

## Acceptance Criteria

- [ ] User can register and see verification message
- [ ] User can login and reach home
- [ ] Role selection shown for new OAuth users

## Affected Files

- `mobile/lib/features/authentication/**`
- `mobile/lib/core/routing/route_guards.dart`

## Test Requirements

Widget tests for forms; manual E2E login

## Definition of Done

- [ ] User can register and see verification message
- [ ] User can login and reach home
- [ ] Role selection shown for new OAuth users
