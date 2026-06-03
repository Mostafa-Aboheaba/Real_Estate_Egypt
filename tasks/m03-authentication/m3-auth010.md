# M3-AUTH010: Mobile Google + Apple Sign-In

## Metadata

| Field | Value |
|-------|-------|
| **ID** | M3-AUTH010 |
| **Milestone** | M3 — Authentication |
| **Estimate** | 4h |
| **Priority** | P0 |
| **Status** | pending |
| **Layer** | mobile |

## Description

Integrate google_sign_in and sign_in_with Apple; wire to API.

## Dependencies

- [M3-AUTH009](../m03-authentication/m3-auth009.md)
- [M3-AUTH006](../m03-authentication/m3-auth006.md)
- [M3-AUTH007](../m03-authentication/m3-auth007.md)

## Traces To

AC-AUTH-002, AC-AUTH-003

## Acceptance Criteria

- [ ] Google sign-in completes on Android/iOS
- [ ] Apple sign-in works on iOS
- [ ] Failed OAuth shows error, no orphan account

## Affected Files

- `mobile/lib/features/authentication/data/datasources/**`
- `mobile/pubspec.yaml`

## Test Requirements

Manual E2E on simulators; widget test error states

## Definition of Done

- [ ] Google sign-in completes on Android/iOS
- [ ] Apple sign-in works on iOS
- [ ] Failed OAuth shows error, no orphan account
