# Acceptance Criteria — Authentication & Onboarding

## Document Status

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Status | Draft |
| Last Updated | 2026-06-03 |

---

## AC-AUTH-001: Email Registration

**Maps to:** US-AUTH-001  
**Priority:** P0

**Given** I am on the registration screen  
**When** I enter a valid email, password (≥ 8 characters), select role "Buyer/Renter", and submit  
**Then** a verification email is sent  
**And** I see a message prompting me to verify my email  
**And** I cannot access chat, favorites, or booking until verified

**Given** I enter an email already registered  
**When** I submit registration  
**Then** I see an error: "An account with this email already exists"  
**And** no duplicate account is created

**Given** I enter an invalid email format  
**When** I submit  
**Then** I see inline validation error before submission completes

---

## AC-AUTH-002: Google Sign-In

**Maps to:** US-AUTH-002  
**Priority:** P0

**Given** I tap "Continue with Google"  
**When** I complete Google OAuth successfully  
**Then** I am logged in and receive JWT access and refresh tokens  
**And** if new user, I am prompted to select role (Buyer or Agent)  
**And** my profile is created with name and email from Google

**Given** Google OAuth is cancelled or fails  
**When** I return to the app  
**Then** I remain on the login screen with a clear error message  
**And** no partial account is created

---

## AC-AUTH-003: Apple Sign-In

**Maps to:** US-AUTH-003  
**Priority:** P0

**Given** I tap "Sign in with Apple" on iOS  
**When** I complete Apple authentication successfully  
**Then** I am logged in with JWT tokens  
**And** if new user, I am prompted to select role  
**And** Apple private relay emails are handled correctly

**Given** I am on Android  
**When** Sign in with Apple is available  
**Then** the flow completes via Apple web OAuth without errors

---

## AC-AUTH-004: Email Login

**Maps to:** US-AUTH-004  
**Priority:** P0

**Given** I have a verified account  
**When** I enter correct email and password  
**Then** I receive access token (≤ 15 min expiry) and refresh token  
**And** I am navigated to the home screen

**Given** I enter incorrect password  
**When** I submit login  
**Then** I see "Invalid email or password" (no hint whether email exists)  
**And** after 10 failed attempts from same IP in 1 minute, further attempts are rate-limited

---

## AC-AUTH-005: Log Out

**Maps to:** US-AUTH-005  
**Priority:** P0

**Given** I am logged in  
**When** I tap Log Out and confirm  
**Then** local tokens are cleared  
**And** refresh token is invalidated server-side  
**And** I am redirected to the login/guest screen  
**And** protected API calls return 401

---

## AC-AUTH-006: Password Reset

**Maps to:** US-AUTH-006  
**Priority:** P0

**Given** I tap "Forgot password" and enter my registered email  
**When** I submit  
**Then** I see "If an account exists, a reset link has been sent" (same message for unknown emails)  
**And** a reset email with time-limited link (≤ 1 hour) is sent

**Given** I open a valid reset link  
**When** I enter a new password (≥ 8 characters) and confirm  
**Then** my password is updated  
**And** all existing refresh tokens are invalidated  
**And** I can log in with the new password

**Given** I open an expired reset link  
**When** I attempt to reset  
**Then** I see an error and option to request a new link

---

## AC-AUTH-007: Email Verification

**Maps to:** US-AUTH-007  
**Priority:** P0

**Given** I registered but have not verified  
**When** I open the verification link from email  
**Then** my account is marked verified  
**And** full app features are unlocked

**Given** I am unverified  
**When** I attempt to use AI chat or save favorites  
**Then** I am prompted to verify my email with option to resend verification

---

## AC-AUTH-008: Agent Automated Onboarding

**Maps to:** US-AUTH-008  
**Priority:** P0

**Given** I select "Real Estate Agent" during registration  
**When** I complete registration and email verification  
**Then** my role is set to `agent` immediately  
**And** no admin approval step is required  
**And** I can access agent booking management features

---

## AC-AUTH-009: Bilingual Onboarding

**Maps to:** US-AUTH-009  
**Priority:** P0

**Given** my device language is Arabic  
**When** I open registration  
**Then** all labels, buttons, and error messages display in Arabic (RTL layout)

**Given** I switch language to English on the onboarding screen  
**When** the switch is applied  
**Then** all onboarding text updates to English (LTR) without requiring re-login

---

## AC-AUTH-010: Data Consent

**Maps to:** US-AUTH-010  
**Priority:** P0

**Given** I am on the registration screen  
**When** I attempt to register without checking the consent checkbox  
**Then** registration is blocked with a message explaining consent is required

**Given** I check consent and complete registration  
**When** my account is created  
**Then** consent timestamp and version are stored with my account record

---

## AC-AUTH-011: Duplicate Email Prevention

**Maps to:** US-AUTH-011  
**Priority:** P0

**Given** an account exists with email `user@example.com` via email/password  
**When** I attempt Google sign-in with the same email  
**Then** I am logged into the existing account (not a new duplicate)  
**And** Google provider is linked to the account

---

## AC-AUTH-012: OAuth Account Linking

**Maps to:** US-AUTH-012  
**Priority:** P1

**Given** I am logged in via email/password  
**When** I go to account settings and link Google  
**Then** Google sign-in works for the same account thereafter

**Given** Google account email differs from my registered email  
**When** I attempt to link  
**Then** linking is rejected with a clear explanation

---

## AC-AUTH-013: RBAC Enforcement

**Maps to:** US-AUTH-013  
**Priority:** P0

**Given** I am authenticated as a Buyer  
**When** I call an agent-only endpoint (e.g., confirm booking as agent)  
**Then** the API returns 403 Forbidden

**Given** I am a Guest (no token)  
**When** I call a protected endpoint  
**Then** the API returns 401 Unauthorized

**Given** I am an Admin  
**When** I call admin sync endpoints  
**Then** access is granted

---

## Related Documents

- [User Stories](./user_stories.md)
- [Requirements](../../specs/requirements.md)
