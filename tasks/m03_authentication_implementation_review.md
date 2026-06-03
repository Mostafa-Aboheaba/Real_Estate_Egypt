# M3 Authentication — Implementation Review

**Date:** 2026-06-03  
**Scope:** Backend (`backend/src`) + Mobile (`mobile/lib/features/authentication`)  
**Reviewer:** Code review against project architecture docs and Clean Architecture / SOLID principles

---

## Executive summary

| Dimension | Backend | Mobile | Overall |
|-----------|---------|--------|---------|
| Clean Architecture | **Good** with notable gaps | **Good** | **B** |
| SOLID | **Fair–Good** | **Fair** | **B−** |
| Testability | **Fair** | **Weak** | **C+** |
| Naming conventions | **Good** | **Good** | **A−** |
| Scalability | **Good** foundation | **Good** foundation | **B** |

M3 delivers a **working vertical slice** with the right high-level shape: domain ports, Prisma adapter, thin HTTP controllers, Flutter feature folders, and token refresh. The main gaps are **layer boundary leaks** (application → infrastructure, domain → Prisma, presentation → Prisma), a **monolithic application service**, and **thin automated test coverage** relative to acceptance criteria.

---

## 1. Clean Architecture compliance

### 1.1 Backend — what aligns well

| Practice | Evidence |
|----------|----------|
| Layer folders match `PROJECT_STRUCTURE.md` | `domain/`, `application/`, `infrastructure/`, `presentation/` |
| Repository port + adapter | `AuthRepositoryPort` + `PrismaAuthRepository` |
| Token abstraction | `TokenServicePort` + `JwtTokenService` |
| Thin controllers | `AuthController` delegates to `AuthService` |
| Domain VOs | `Email`, `Password` — no Nest/Prisma imports |
| Domain errors → HTTP mapping | `AuthDomainException` + `ApiExceptionFilter` |
| DI at module boundary | `AUTH_REPOSITORY`, `TOKEN_SERVICE` symbols in `AuthModule` |

### 1.2 Backend — violations / drift

| Issue | Severity | Detail |
|-------|----------|--------|
| **Application depends on infrastructure** | High | `AuthService` imports `EmailService`, `PasswordService`, `GoogleIdTokenVerifier`, `AppleIdTokenVerifier` directly. Per `PROJECT_STRUCTURE.md`, `application/` should depend only on `domain/` and ports—not concrete infra classes. |
| **Domain depends on Prisma** | High | `auth.repository.port.ts` imports `OAuthProvider` from `@prisma/client`. Domain must not reference ORM enums. Define `domain/auth/enums/oauth-provider.enum.ts` instead. |
| **`UsersController` bypasses application layer** | High | `GET /users/me` uses `PrismaService` in presentation. Should be `GetCurrentUserUseCase` + port (or reuse `AuthRepositoryPort.findById`). |
| **NestJS in application layer** | Medium | `@Injectable()` on `AuthService` couples use cases to the framework. Docs say application has no Nest decorators; wiring belongs in modules only. |
| **`UseCase<TInput, TOutput>` unused** | Low | `use-case.interface.ts` exists but `AuthService` is one class with many methods—not per-use-case classes. |
| **`common/` utilities in application** | Low | `auth.service.ts` uses `generateSecureToken` / `hashToken` from `common/`. Acceptable as shared kernel; better as domain or infrastructure crypto port. |
| **Presentation DTO leakage** | Low | `AuthResponseDto` lives in `application/auth/auth.service.ts`; could be application output type or presentation mapper. |

**Dependency diagram (actual vs intended):**

```mermaid
flowchart TB
  subgraph intended [Intended]
    P1[presentation] --> A1[application]
    A1 --> D1[domain]
    I1[infrastructure] --> D1
  end

  subgraph actual [Actual gaps]
    A2[AuthService] --> I2[EmailService / PasswordService / OAuth verifiers]
    D2[auth.repository.port] --> Prisma[@prisma/client]
    P3[UsersController] --> Prisma2[PrismaService]
  end
```

### 1.3 Mobile — what aligns well

| Practice | Evidence |
|----------|----------|
| Feature-first layout | `domain/`, `data/`, `presentation/` under `authentication/` |
| Repository abstraction | `AuthRepository` + `AuthRepositoryImpl` |
| Remote boundary | `AuthRemoteDataSource` + `ApiClient` |
| UI does not call Dio directly | Pages → Riverpod → repository |
| Core cross-cutting | `TokenStorage`, `AuthInterceptor`, `unwrapApiData` |

### 1.4 Mobile — gaps

| Issue | Severity | Detail |
|-------|----------|--------|
| **OAuth SDKs inside repository** | Medium | `GoogleSignIn` / `SignInWithApple` in `AuthRepositoryImpl` mix platform I/O with data layer. Prefer `OAuthTokenProvider` port + infra implementation. |
| **No domain use cases** | Low | Logic split between pages, `AuthSessionNotifier`, and repository—acceptable for M3, less ideal as features grow. |
| **Register flow bypasses session notifier** | Low | Register page calls repository directly; login uses notifier—consistent UX, inconsistent pattern. |

---

## 2. SOLID compliance

### Single Responsibility Principle (SRP)

| Component | Assessment |
|-----------|------------|
| `AuthService` | **Weak.** ~270 lines, 10+ responsibilities (register, verify, login, refresh, logout, forgot/reset, Google, Apple). Should split into use cases: `RegisterUser`, `LoginUser`, `RefreshSession`, etc. |
| `PrismaAuthRepository` | **Good.** Persistence only; maps Prisma → `AuthUser`. |
| `JwtTokenService` | **Good.** Token issue/verify + refresh persistence via port. |
| `AuthController` | **Good.** HTTP mapping only. |
| `AuthRepositoryImpl` (mobile) | **Fair.** HTTP + token storage + OAuth orchestration. |

### Open/Closed Principle (OCP)

| Area | Assessment |
|------|------------|
| New auth methods | Adding endpoints requires editing `AuthService`—closed for extension without modification. Ports help for new storage/token strategies. |
| OAuth providers | New provider = new verifier class + new `AuthService` method—acceptable; registry/strategy would improve OCP. |

### Liskov Substitution Principle (LSP)

| Area | Assessment |
|------|------------|
| `AuthRepositoryPort` / `PrismaAuthRepository` | **Good.** Interface contract is honored. |
| `TokenServicePort` / `JwtTokenService` | **Good.** |

### Interface Segregation Principle (ISP)

| Area | Assessment |
|------|------------|
| `AuthRepositoryPort` | **Fair.** One wide port (user CRUD + tokens + OAuth + email/reset tokens). Could split: `UserRepository`, `RefreshTokenRepository`, `VerificationTokenRepository`. |
| Mobile `AuthRepository` | **Good** for client needs—focused surface. |

### Dependency Inversion Principle (DIP)

| Area | Assessment |
|------|------------|
| Repository / tokens | **Good** — depend on abstractions via symbols. |
| Email / password / OAuth in `AuthService` | **Violated** — depends on concrete infrastructure classes. |
| `UsersController` → `PrismaService` | **Violated** — depends on lowest-level detail. |

---

## 3. Testability

### Backend

| Asset | Status |
|-------|--------|
| `email.vo.spec.ts`, `password.vo.spec.ts` | Present |
| `auth.service.spec.ts` | 3 cases; mocks OAuth at module boundary |
| `app.module.spec.ts` | Platform smoke only (avoids full graph) |
| Integration / E2E auth | **Missing** (`test/integration/`, `test/e2e/` not used for auth flows) |
| `PrismaAuthRepository` tests | **Missing** |
| `JwtTokenService` / guards / filter tests | **Missing** |

**Blockers to testing:**

1. `AuthService` constructor needs 6 collaborators—wide mock setup; splitting use cases would shrink fixtures.
2. `jwks-rsa` / ESM forces jest mocks for Apple verifier (already worked around in specs).
3. No test database harness for register → verify → login integration.

**M3 task target:** domain unit tests ≥80% for auth domain — **only VOs covered**, not entities/ports/failures.

### Mobile

| Asset | Status |
|-------|--------|
| Auth unit tests | **None** |
| Auth widget tests | **None** |
| `failure_mapper_test.dart` | Exists (core only) |

**Blockers:**

1. OAuth SDKs instantiated inside repository—hard to unit test without platform channels.
2. `getIt` in providers—testable via overrides but not set up yet.

### Testability score rationale

Ports and DI enable testing **in principle**; **practice** lags (few tests, fat service, direct Prisma in controller).

---

## 4. Naming conventions

### Backend

| Convention | Compliance | Examples |
|------------|------------|----------|
| `*.vo.ts` value objects | Yes | `email.vo.ts`, `password.vo.ts` |
| `*.port.ts` interfaces | Yes | `auth.repository.port.ts`, `token.service.port.ts` |
| `*.entity.ts` entities | Yes | `auth-user.entity.ts` |
| `*.failures.ts` domain errors | Yes | `auth.failures.ts` |
| Symbol tokens | Yes | `AUTH_REPOSITORY`, `TOKEN_SERVICE` |
| DTOs in presentation | Yes | `register.dto.ts`, `login.dto.ts` |
| Nest suffixes | Yes | `AuthController`, `AuthModule`, `JwtAuthGuard` |
| Prisma in domain port | **No** | `OAuthProvider` from Prisma — rename to domain enum |

Minor: `AuthResponseDto` in application layer blurs “DTO” (usually HTTP) vs “response model.”

### Mobile

| Convention | Compliance | Examples |
|------------|------------|----------|
| `snake_case` files | Yes | `auth_repository_impl.dart` |
| `PascalCase` types | Yes | `AuthUser`, `AuthSession` |
| `*Page`, `*Provider` | Yes | `LoginPage`, `authSessionProvider` |
| Feature folder | Yes | `features/authentication/` |

---

## 5. Scalability

### Strengths

| Area | Why it scales |
|------|----------------|
| Modular monolith + bounded context | Auth isolated in module; can extract microservice later if needed |
| Port-based persistence | Swap Prisma or shard users without touching use cases (once boundaries fixed) |
| Refresh token rotation | Revoke-on-refresh limits replay; `revokeAllRefreshTokens` on password reset |
| Rate limiting | `@Throttle` on auth controller |
| Stateless API | JWT access tokens; horizontal scale behind load balancer |
| Token hashing | Verification/reset/refresh stored hashed |
| Mobile token refresh queue | `QueuedInterceptor` avoids refresh stampedes |

### Risks as load / features grow

| Risk | Impact | Mitigation |
|------|--------|------------|
| Monolithic `AuthService` | Merge conflicts, hard to test/deploy partial changes | Split use cases per `UseCase` interface |
| Wide `AuthRepositoryPort` | Hard to mock/cache partial concerns | Segregate ports |
| Email via console logger | No real delivery at scale | Plug SES/SendGrid behind `EmailPort` |
| No email-verified gate on login | Unverified users get tokens (error code exists but unused) | Enforce `EMAIL_NOT_VERIFIED` in `login` if spec requires |
| `UsersController` Prisma | Duplicated user mapping logic | Single `UserProfile` query use case |
| OAuth in mobile repository | Blocks multi-flavor/testing | Extract platform auth adapter |
| Missing integration tests | Regressions on schema/API changes | Add `test/e2e/auth.e2e-spec.ts` with Testcontainers |

### Horizontal scaling checklist (future)

- [ ] Redis-backed refresh/session denylist (optional)
- [ ] Distributed rate limit (Redis throttler storage)
- [ ] Idempotent register (client retry safety)
- [ ] Audit log for auth events

---

## 6. Security & correctness (review adjunct)

| Item | Status |
|------|--------|
| Password hashing (bcrypt) | Implemented via `PasswordService` |
| Refresh token stored hashed | Yes |
| Generic forgot-password response | Yes (no user enumeration in controller message) |
| JWT secret validation (min 16) | Joi schema |
| CORS / HTTPS | Not in M3 scope |
| `EMAIL_NOT_VERIFIED` on login | **Not enforced** despite error code + filter mapping |
| Logout without Bearer | Accepts refresh body only—OK for mobile |

---

## 7. Recommendations (prioritized)

### P0 — Architecture integrity

1. **Remove `@prisma/client` from `domain/`** — add `OAuthProvider` domain enum; map in `PrismaAuthRepository`.
2. **Introduce ports for email, password hashing, OAuth verification** — inject into use cases; remove infra imports from `AuthService`.
3. **Refactor `GET /users/me`** — `GetCurrentUserQuery` + repository port; remove `PrismaService` from controller.

### P1 — SOLID & tests

4. **Split `AuthService`** into one class per use case implementing `UseCase<TIn, TOut>`.
5. **Add E2E test:** register → verify (token from test helper) → login → `/users/me`.
6. **Add `JwtTokenService` unit tests** (mock `AUTH_REPOSITORY`).
7. **Mobile:** extract `GoogleSignIn` / Apple behind `OAuthSignInPort`; add `auth_repository_impl_test.dart` with mocked remote + storage.

### P2 — Product & scale

8. **Enforce email verification on login** if required by `features/authentication` spec.
9. **Segregate `AuthRepositoryPort`** when adding notifications or admin user APIs.
10. **Map API error codes in mobile** (`DUPLICATE_EMAIL`, `EMAIL_NOT_VERIFIED`) instead of generic Dio messages.

---

## 8. Strengths (keep doing)

- Clear bounded context and module wiring (`AuthModule` exports guards + ports).
- Value objects for email/password at domain boundary.
- Typed `AuthErrorCode` mapped consistently in `ApiExceptionFilter`.
- Refresh rotation + revoke-all on password reset.
- Flutter respects `{ data }` envelope and secure token storage.
- Throttling and correlation IDs on auth routes.

---

## 9. Conclusion

M3 authentication is **structurally on the right track** for a modular monolith and feature-based Flutter app, but **not yet strict Clean Architecture** due to application→infrastructure coupling, Prisma in domain ports, and `UsersController` skipping the application layer. **SOLID** is strongest at the persistence/token adapters and weakest in `AuthService` (SRP/DIP). **Testability** and **coverage** are below M3 task claims. **Naming** is consistent with project docs. **Scalability** is adequate for early production with the listed P2 mitigations.

**Suggested next engineering slice:** P0 items (1–3) + one E2E auth spec—small diff, high architectural payoff.

---

## Appendix — files reviewed

**Backend:** `auth.service.ts`, `auth.repository.port.ts`, `prisma-auth.repository.ts`, `jwt-token.service.ts`, `auth.controller.ts`, `users.controller.ts`, `auth.module.ts`, domain VOs/entities/failures, guards, `api-exception.filter.ts`, `validation.schema.ts`

**Mobile:** `auth_repository_impl.dart`, `auth_remote_datasource.dart`, `auth_provider.dart`, auth pages, `token_storage.dart`, `auth_interceptor.dart`, `route_guards.dart`, `app_router.dart`

**Docs:** `backend/PROJECT_STRUCTURE.md`, `architecture/backend_architecture.md`, `features/authentication/api_design.md`
