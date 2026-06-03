# M3-AUTH011: Mobile Token Storage + Auto Refresh

## Metadata

| Field | Value |
|-------|-------|
| **ID** | M3-AUTH011 |
| **Milestone** | M3 — Authentication |
| **Estimate** | 3h |
| **Priority** | P0 |
| **Status** | pending |
| **Layer** | mobile |

## Description

Secure storage for tokens; Dio interceptor refresh on 401.

## Dependencies

- [M3-AUTH009](../m03-authentication/m3-auth009.md)

## Traces To

FR-AUTH-006, AC-AUTH-004

## Acceptance Criteria

- [ ] Tokens persist across app restart
- [ ] Expired access refreshes transparently
- [ ] Failed refresh redirects to login

## Affected Files

- `mobile/lib/core/network/auth_interceptor.dart`
- `mobile/lib/features/authentication/presentation/providers/**`

## Test Requirements

Unit: interceptor refresh mock; integration token persist

## Definition of Done

- [ ] Tokens persist across app restart
- [ ] Expired access refreshes transparently
- [ ] Failed refresh redirects to login
