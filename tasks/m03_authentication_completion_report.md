# M3 Authentication — Completion Report

**Date:** 2026-06-03  
**Milestone:** M3 — Authentication & Onboarding

## Summary

M3 delivers end-to-end authentication: NestJS auth API (register, login, refresh, logout, email verify, password reset, Google/Apple OAuth), JWT guards, `GET /users/me`, and a Flutter auth feature with secure token storage, route guards, and sign-in/register/forgot-password screens.

## Backend (`backend/`)

| Area | Status |
|------|--------|
| Domain (Email/Password VOs, AuthUser, ports, error codes) | Done |
| Prisma repo + email verification tokens migration | Done |
| JWT token service, password hashing, email (log links in dev) | Done |
| Auth use cases (`AuthService`) | Done |
| `AuthController`, DTOs, throttling | Done |
| `JwtAuthGuard`, `RolesGuard`, `UsersController` (`/users/me`) | Done |
| Global `{ data }` transform + API exception filter | Done |
| Unit tests (domain VOs, platform, auth service with mocks) | Done |

### Key endpoints (prefix `/api/v1`)

- `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`
- `GET /auth/verify-email?token=…`
- `POST /auth/forgot-password`, `POST /auth/reset-password`
- `POST /auth/google`, `POST /auth/apple`
- `GET /users/me` (Bearer)

### Run locally

```bash
cd backend
docker compose up -d
cp .env.example .env   # set JWT_SECRET, DATABASE_URL
npx prisma migrate deploy
npm run start:dev
```

Verification links and reset links are logged to the console in development (`EmailService`).

## Mobile (`mobile/`)

| Area | Status |
|------|--------|
| `TokenStorage` + `AuthInterceptor` (`{ data }` unwrap) | Done |
| Auth repository + remote datasource | Done |
| Riverpod `authSessionProvider` + GoRouter refresh | Done |
| Login, register, forgot password, verify-email-pending UI | Done |
| Google / Apple sign-in (device-dependent) | Done |
| Route guards (guest vs authenticated) | Done |

### Run locally

```bash
cd mobile
flutter pub get
dart run build_runner build --delete-conflicting-outputs
flutter run -t lib/main_dev.dart
```

Android emulator API base: `http://10.0.2.2:3000/api/v1` (see `app_config.dart`).

## Verification checklist

1. Register → check server logs for verification URL → open link → login.
2. `GET /api/v1/users/me` with access token returns profile.
3. Mobile: register → verify pending screen → login → home shows email → sign out.

## Post-review refinements (2026-06-03)

- Domain `OAuthProvider` enum (no Prisma in `domain/`)
- Ports: `EmailSenderPort`, `PasswordHasherPort`, `OAuthVerifierPort`
- `GetCurrentUserUseCase` + `EmailVerifiedGuard` on `/users/me`
- Login returns `403 EMAIL_NOT_VERIFIED` until email verified
- `POST /auth/register` returns **201**
- E2E: `test/auth.e2e-spec.ts` (requires `DATABASE_URL`)
- Mobile: `SessionExpiredNotifier` clears session on failed refresh → login redirect

## Notes

- OAuth requires valid `GOOGLE_CLIENT_ID` / Apple config in backend `.env`.
- Apple/Google buttons need platform setup (iOS/Android client IDs, entitlements).
- Resend-verification and deep-link email verify on mobile are deferred (web link flow works).
