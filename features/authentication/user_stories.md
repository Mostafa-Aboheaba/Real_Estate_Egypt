# User Stories — Authentication & Onboarding

## Document Status

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Status | Draft |
| Last Updated | 2026-06-03 |
| Traces to | FR-AUTH-* in [specs/requirements.md](../../specs/requirements.md) |

---

## US-AUTH-001: Register with Email and Password

**Priority:** P0  
**Role:** New user  
**Traces to:** FR-AUTH-001, FR-AUTH-007, FR-AUTH-009, FR-AUTH-011

**As a** new user  
**I want** to register with my email and password and choose my role (Buyer/Renter or Real Estate Agent)  
**So that** I can access the app with an account tailored to my needs

---

## US-AUTH-002: Sign In with Google

**Priority:** P0  
**Role:** Returning user  
**Traces to:** FR-AUTH-002, FR-AUTH-011

**As a** user  
**I want** to sign in with my Google account  
**So that** I can access the app quickly without creating a separate password

---

## US-AUTH-003: Sign In with Apple

**Priority:** P0  
**Role:** Returning user (especially iOS)  
**Traces to:** FR-AUTH-003, FR-AUTH-011

**As a** user  
**I want** to sign in with my Apple ID  
**So that** I can log in securely with minimal friction on my iPhone

---

## US-AUTH-004: Log In with Email and Password

**Priority:** P0  
**Role:** Returning user  
**Traces to:** FR-AUTH-001, FR-AUTH-006

**As a** registered user  
**I want** to log in with my email and password  
**So that** I can access my saved preferences, favorites, and bookings

---

## US-AUTH-005: Log Out

**Priority:** P0  
**Role:** Authenticated user  
**Traces to:** FR-AUTH-004

**As an** authenticated user  
**I want** to log out of the app  
**So that** my account is protected when I share or stop using my device

---

## US-AUTH-006: Reset Forgotten Password

**Priority:** P0  
**Role:** User who forgot password  
**Traces to:** FR-AUTH-005

**As a** user who forgot my password  
**I want** to receive a password reset link by email  
**So that** I can regain access to my account without contacting support

---

## US-AUTH-007: Verify Email Address

**Priority:** P0  
**Role:** New user  
**Traces to:** FR-AUTH-009

**As a** newly registered user  
**I want** to verify my email address via a confirmation link  
**So that** the platform confirms my identity and unlocks full account features

---

## US-AUTH-008: Automated Agent Onboarding

**Priority:** P0  
**Role:** Real estate agent  
**Traces to:** FR-AUTH-007, FR-AUTH-008

**As a** real estate agent  
**I want** to register and immediately receive agent capabilities without waiting for manual approval  
**So that** I can start receiving booking requests as soon as I complete onboarding

---

## US-AUTH-009: Bilingual Onboarding

**Priority:** P0  
**Role:** New user  
**Traces to:** FR-AUTH-010

**As a** user in Egypt  
**I want** to complete registration and onboarding in Arabic or English  
**So that** I can use the app in the language I am most comfortable with

---

## US-AUTH-010: Grant Data Processing Consent

**Priority:** P0  
**Role:** New user  
**Traces to:** FR-PROF-011, NFR-COMP-002

**As a** new user  
**I want** to explicitly consent to data processing during registration  
**So that** I understand and agree to how my personal data is used (Egypt PDPL)

---

## US-AUTH-011: Prevent Duplicate Accounts

**Priority:** P0  
**Role:** System  
**Traces to:** FR-AUTH-011

**As the** platform  
**I want** to prevent the same email from being registered twice across different auth methods  
**So that** users do not end up with fragmented accounts

---

## US-AUTH-012: Link OAuth to Existing Account

**Priority:** P1  
**Role:** Existing email/password user  
**Traces to:** FR-AUTH-012

**As a** user who registered with email and password  
**I want** to link my Google or Apple account when the email matches  
**So that** I can sign in with either method using one unified account

---

## US-AUTH-013: Role-Based Access Control

**Priority:** P0  
**Role:** System  
**Traces to:** FR-AUTH-013

**As the** platform  
**I want** to enforce role-based permissions on every protected API endpoint  
**So that** buyers, agents, and admins can only access features appropriate to their role

---

## Summary

| Priority | Count |
|----------|-------|
| P0 | 12 |
| P1 | 1 |
| P2 | 0 |
| **Total** | **13** |

## Related Documents

- [Acceptance Criteria](./acceptance_criteria.md)
- [Requirements](../../specs/requirements.md)
