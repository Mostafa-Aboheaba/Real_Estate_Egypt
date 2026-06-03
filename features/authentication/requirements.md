# Requirements — Authentication & Onboarding

## Document Status

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Status | Draft |
| Last Updated | 2026-06-03 |
| Traces to | FR-AUTH-* in [specs/requirements.md](../../specs/requirements.md) |

---

## 1. Purpose

Define functional and non-functional requirements for user identity, onboarding, session management, and role-based access control for the AI Property Assistant mobile app and REST API.

---

## 2. Scope

### In scope (MVP)

- Email/password registration and login
- Google OAuth and Sign in with Apple
- Email verification before full feature access
- JWT access + refresh token rotation
- Password reset via email
- Role selection: `buyer`, `agent` (automated agent onboarding)
- RBAC on protected API routes
- Bilingual onboarding UI (ar-EG, en)
- PDPL consent capture at registration
- OAuth account linking when email matches (P1)

### Out of scope (MVP)

- Admin user CRUD UI
- Agent license verification
- MFA / TOTP
- WhatsApp or SMS OTP login
- Session management across multiple devices UI

---

## 3. Personas

| Persona | Role ID | Auth needs |
|---------|---------|------------|
| Guest | — | No token; limited browse |
| Buyer / Renter | `buyer` | Full consumer features after verify |
| Real Estate Agent | `agent` | Automated onboarding; booking inbox |
| Platform Admin | `admin` | API-only admin routes |

---

## 4. Functional requirements

| ID | Requirement | Priority | Stories |
|----|-------------|----------|---------|
| FR-AUTH-001 | Register with email and password | P0 | US-AUTH-001 |
| FR-AUTH-002 | Google OAuth login | P0 | US-AUTH-002 |
| FR-AUTH-003 | Sign in with Apple | P0 | US-AUTH-003 |
| FR-AUTH-004 | Logout; invalidate session | P0 | US-AUTH-005 |
| FR-AUTH-005 | Password reset via email | P0 | US-AUTH-006 |
| FR-AUTH-006 | JWT access + refresh rotation | P0 | US-AUTH-004 |
| FR-AUTH-007 | Role selection at onboarding | P0 | US-AUTH-001, 008 |
| FR-AUTH-008 | Automated agent onboarding | P0 | US-AUTH-008 |
| FR-AUTH-009 | Email verification gate | P0 | US-AUTH-007 |
| FR-AUTH-010 | Bilingual onboarding | P0 | US-AUTH-009 |
| FR-AUTH-011 | No duplicate email across providers | P0 | US-AUTH-011 |
| FR-AUTH-012 | Link OAuth to existing account | P1 | US-AUTH-012 |
| FR-AUTH-013 | RBAC on API endpoints | P0 | US-AUTH-013 |

---

## 5. Non-functional requirements

| ID | Application |
|----|-------------|
| NFR-SEC-002 | bcrypt cost ≥ 12 for passwords |
| NFR-SEC-003 | Access token ≤ 15 min; refresh rotation |
| NFR-SEC-005 | Auth rate limit 10/min per IP |
| NFR-COMP-001 | Egypt PDPL compliance |
| NFR-COMP-002 | Explicit consent at registration |
| NFR-COMP-007 | Google and Apple provider guidelines |
| NFR-UX-001 | ar-EG RTL + en LTR onboarding |
| NFR-MAINT-001 | SDD approved before implementation |

---

## 6. Dependencies

| Dependency | Required for |
|------------|--------------|
| Email provider (SMTP/API) | Verification, password reset |
| Google OAuth credentials | Google sign-in |
| Apple Sign In | iOS App Store compliance |
| PostgreSQL `users` table | Account storage |

**Blocks:** profile, ai_chat, recommendation, booking (all require auth).

---

## 7. Assumptions

- Email delivery available before auth launch (ASM-005).
- Apple Sign In required on iOS when Google offered (CON-REG-002).
- Agent license validation is post-MVP (ASM-011).

---

## 8. Open questions

| # | Question | Owner | Resolution |
|---|----------|-------|------------|
| 1 | Email provider: SendGrid vs SES | Tech Lead | booking/architecture.md default SendGrid |
| 2 | Verification email sync vs async queue | Tech Lead | BullMQ async (MVP) |

---

## Related documents

- [User stories](./user_stories.md)
- [Acceptance criteria](./acceptance_criteria.md)
- [Architecture](./architecture.md)
