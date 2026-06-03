# M3-AUTH001: Auth Domain Layer (entities, ports, VOs)

## Metadata

| Field | Value |
|-------|-------|
| **ID** | M3-AUTH001 |
| **Milestone** | M3 — Authentication |
| **Estimate** | 3h |
| **Priority** | P0 |
| **Status** | done |
| **Layer** | backend |

## Description

User role enum, Email/Password VOs, auth repository port, token service port.

## Dependencies

- [M2-PLT003](../m02-platform/m2-plt003.md)
- [M1-AUT-REQ](../m01-sdd/m1-aut-req.md)

## Traces To

FR-AUTH-*, `features/authentication/data_model.md`

## Acceptance Criteria

- [ ] Domain unit tests ≥80% for auth domain
- [ ] No framework imports in domain/
- [ ] Password VO enforces min length 8

## Affected Files

- `backend/src/domain/auth/**`
- `backend/test/unit/domain/auth/**`

## Test Requirements

Unit: email validation, password rules, role enum

## Definition of Done

- [ ] Domain unit tests ≥80% for auth domain
- [ ] No framework imports in domain/
- [ ] Password VO enforces min length 8
