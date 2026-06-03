# M3-AUTH012: PDPL Consent on Onboarding

## Metadata

| Field | Value |
|-------|-------|
| **ID** | M3-AUTH012 |
| **Milestone** | M3 — Authentication |
| **Estimate** | 2h |
| **Priority** | P0 |
| **Status** | done |
| **Layer** | mobile |

## Description

Consent checkbox; store consent_at on user.

## Dependencies

- [M3-AUTH009](../m03-authentication/m3-auth009.md)

## Traces To

FR-AUTH-010, AC-AUTH-010

## Acceptance Criteria

- [ ] Cannot proceed without consent
- [ ] consent_at sent to API on register

## Affected Files

- `mobile/lib/features/authentication/presentation/pages/onboarding_page.dart`
- `backend/src/application/auth/register.use-case.ts`

## Test Requirements

Widget: submit disabled without consent

## Definition of Done

- [ ] Cannot proceed without consent
- [ ] consent_at sent to API on register
