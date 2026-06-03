# API Design — Authentication & Onboarding

## Document Status

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Status | Draft |
| Last Updated | 2026-06-03 |
| Conventions | [api_conventions.md](../../architecture/api_conventions.md) |

---

## 1. Endpoint summary

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| POST | `/auth/register` | None | — | Register email/password |
| POST | `/auth/login` | None | — | Login |
| POST | `/auth/refresh` | None | — | Rotate tokens |
| POST | `/auth/logout` | Bearer | all | Revoke refresh |
| GET | `/auth/verify-email` | None | — | Verify token from email |
| POST | `/auth/resend-verification` | Bearer | unverified | Resend email |
| POST | `/auth/forgot-password` | None | — | Request reset |
| POST | `/auth/reset-password` | None | — | Set new password |
| POST | `/auth/google` | None | — | Google ID token exchange |
| POST | `/auth/apple` | None | — | Apple identity token exchange |

---

## 2. POST /auth/register

**Request:**

```json
{
  "email": "user@example.com",
  "password": "securePass1",
  "role": "buyer",
  "locale": "ar-EG",
  "consentVersion": "2026-06-01",
  "consentAccepted": true
}
```

**Response 201:**

```json
{
  "data": {
    "userId": "uuid",
    "email": "user@example.com",
    "role": "buyer",
    "emailVerified": false,
    "message": "verification_email_sent"
  }
}
```

**Errors:** 400 validation, 409 duplicate email, 429 rate limit.

---

## 3. POST /auth/login

**Request:**

```json
{
  "email": "user@example.com",
  "password": "securePass1"
}
```

**Response 200:**

```json
{
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "opaque-refresh-token",
    "expiresIn": 900,
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "buyer",
      "emailVerified": true,
      "locale": "ar-EG"
    }
  }
}
```

**Errors:** 401 `INVALID_CREDENTIALS`, 403 `EMAIL_NOT_VERIFIED` (optional strict mode).

---

## 4. POST /auth/refresh

**Request:**

```json
{
  "refreshToken": "opaque-refresh-token"
}
```

**Response 200:** New access + refresh pair. Old refresh invalidated.

**Errors:** 401 invalid/expired/reused refresh.

---

## 5. POST /auth/logout

**Auth:** Bearer access token.

**Request:**

```json
{
  "refreshToken": "opaque-refresh-token"
}
```

**Response 204** No body.

---

## 6. POST /auth/google | /auth/apple

**Request (Google example):**

```json
{
  "idToken": "google-id-token",
  "role": "buyer"
}
```

**Response 200:** Same shape as login. `isNewUser: true` when account created.

**Errors:** 400 cancelled/invalid token, 409 email conflict (rare).

---

## 7. Password reset

**POST /auth/forgot-password**

```json
{ "email": "user@example.com" }
```

**Response 200:** Always `{ "message": "reset_email_sent_if_exists" }`.

**POST /auth/reset-password**

```json
{
  "token": "reset-token-from-email",
  "password": "newSecurePass1"
}
```

**Response 200:** Success. All refresh tokens revoked.

---

## 8. RBAC

Protected routes use `JwtAuthGuard` + `RolesGuard`. Example:

- `POST /bookings/:id/confirm` → `@Roles('agent')`
- `GET /admin/sync/status` → `@Roles('admin', 'agent')` per property_search spec

---

## Related documents

- [acceptance_criteria.md](./acceptance_criteria.md)
- [tests.md](./tests.md)
