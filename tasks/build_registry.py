#!/usr/bin/env python3
"""Build tasks_data.py, generate markdown files, and tasks/README.md."""

from __future__ import annotations

import pathlib
import textwrap

ROOT = pathlib.Path(__file__).parent


def m1_tasks() -> list[dict]:
    feats = [
        ("authentication", "AUT", "FR-AUTH"),
        ("property_search", "SEA", "FR-SEARCH"),
        ("profile", "PRO", "FR-PROF"),
        ("ai_chat", "CHT", "FR-CHAT"),
        ("recommendation", "REC", "FR-REC"),
        ("booking", "BOK", "FR-BOOK"),
    ]
    arts = [
        ("REQ", "requirements.md", "Requirements"),
        ("ARC", "architecture.md", "Architecture Design"),
        ("DAT", "data_model.md", "Data Model"),
        ("API", "api_design.md", "API Design"),
    ]
    out: list[dict] = []
    for feat, code, fr in feats:
        prev = "M0"
        for suffix, art, title in arts:
            tid = f"M1-{code}-{suffix}"
            out.append(
                {
                    "id": tid,
                    "folder": "m01-sdd",
                    "title": f"{feat.replace('_', ' ').title()} — {title}",
                    "milestone": "M1 — SDD Completion",
                    "estimate": "2–3h",
                    "priority": "P0",
                    "status": "pending",
                    "layer": "spec",
                    "description": (
                        f"Author `features/{feat}/{art}` aligned with SRS "
                        f"{fr}-* and architecture docs."
                    ),
                    "deps": [prev],
                    "traces": (
                        f"`features/{feat}/user_stories.md`, "
                        f"`specs/requirements.md`"
                    ),
                    "acceptance": [
                        "Artifact complete; PO + Tech Lead sign-off",
                        "All P0 stories traced to FR IDs",
                        "No TBDs blocking implementation_tasks.md",
                    ],
                    "files": [
                        f"features/{feat}/{art}",
                        f"features/{feat}/README.md",
                    ],
                    "tests": "Peer review checklist in feature README",
                }
            )
            prev = tid
        out.append(
            {
                "id": f"M1-{code}-TST",
                "folder": "m01-sdd",
                "title": (
                    f"{feat.replace('_', ' ').title()} — Tests + "
                    "Implementation Tasks"
                ),
                "milestone": "M1 — SDD Completion",
                "estimate": "2–3h",
                "priority": "P0",
                "status": "pending",
                "layer": "spec",
                "description": (
                    f"Write `tests.md` and `implementation_tasks.md` for {feat}."
                ),
                "deps": [f"M1-{code}-API"],
                "traces": f"`features/{feat}/acceptance_criteria.md`",
                "acceptance": [
                    "Each P0 AC has ≥1 test case",
                    "implementation_tasks.md chunks are ≤4h each",
                    "Written approval to implement recorded",
                ],
                "files": [
                    f"features/{feat}/tests.md",
                    f"features/{feat}/implementation_tasks.md",
                ],
                "tests": "QA Lead review",
            }
        )
    return out


def m2_m3_tasks() -> list[dict]:
    """M2 platform + M3 auth (unchanged IDs, fixed M1 deps)."""
    return [
        {
            "id": "M2-PLT001",
            "folder": "m02-platform",
            "title": "Flutter Platform Bootstrap",
            "milestone": "M2 — Platform Bootstrap",
            "estimate": "4h",
            "priority": "P0",
            "status": "done",
            "layer": "mobile",
            "description": (
                "Initialize Flutter app with flavors, Riverpod, GoRouter, "
                "Dio, Freezed, Injectable, CI."
            ),
            "deps": ["M1-AUT-TST"],
            "traces": "`architecture/flutter_architecture.md`",
            "acceptance": [
                "`flutter analyze` passes",
                "`flutter test` passes",
                "`flutter run --flavor dev` works on iOS/Android",
            ],
            "files": [
                "mobile/lib/**",
                "mobile/pubspec.yaml",
                ".github/workflows/mobile-ci.yml",
            ],
            "tests": (
                "`flutter test`; see mobile_platform_bootstrap_completion_report.md"
            ),
        },
        {
            "id": "M2-PLT002",
            "folder": "m02-platform",
            "title": "NestJS Scaffold + Clean Architecture Folders",
            "milestone": "M2 — Platform Bootstrap",
            "estimate": "3h",
            "priority": "P0",
            "layer": "backend",
            "description": (
                "Create NestJS app with domain/application/infrastructure/"
                "presentation layers per PROJECT_STRUCTURE."
            ),
            "deps": ["M1-AUT-TST"],
            "traces": (
                "`backend/PROJECT_STRUCTURE.md`, "
                "`architecture/clean_architecture.md`"
            ),
            "acceptance": [
                "`npm run build` succeeds",
                "Domain folder has zero NestJS imports",
                "AppModule boots without feature logic",
            ],
            "files": [
                "backend/src/main.ts",
                "backend/src/app.module.ts",
                "backend/src/domain/**",
                "backend/package.json",
            ],
            "tests": "Unit: AppModule compiles; lint passes",
        },
        {
            "id": "M2-PLT003",
            "folder": "m02-platform",
            "title": "Prisma Schema + Initial Migration",
            "milestone": "M2 — Platform Bootstrap",
            "estimate": "3h",
            "priority": "P0",
            "layer": "backend",
            "description": (
                "Implement Prisma schema from postgresql_schema.md; "
                "enable pgvector extension."
            ),
            "deps": ["M2-PLT002"],
            "traces": "`architecture/postgresql_schema.md`",
            "acceptance": [
                "`prisma migrate dev` applies on clean DB",
                "vector extension enabled",
                "Seed script stub runs",
            ],
            "files": [
                "backend/prisma/schema.prisma",
                "backend/prisma/migrations/**",
                "backend/prisma/seed/**",
            ],
            "tests": (
                "Integration: migration + pg_extension extname='vector'"
            ),
        },
        {
            "id": "M2-PLT004",
            "folder": "m02-platform",
            "title": "Docker Compose Local Stack",
            "milestone": "M2 — Platform Bootstrap",
            "estimate": "2h",
            "priority": "P0",
            "layer": "infra",
            "description": "Postgres (pgvector), Redis, API container for local dev.",
            "deps": ["M2-PLT003"],
            "traces": "`architecture/deployment_architecture.md` §12",
            "acceptance": [
                "`docker compose up` starts all services",
                "Postgres reachable from API",
                "Redis reachable from API",
            ],
            "files": [
                "backend/docker-compose.yml",
                "backend/Dockerfile",
                "backend/.env.example",
            ],
            "tests": "Smoke: curl /health after compose up",
        },
        {
            "id": "M2-PLT005",
            "folder": "m02-platform",
            "title": "Health Endpoints + Logging Interceptor",
            "milestone": "M2 — Platform Bootstrap",
            "estimate": "2h",
            "priority": "P0",
            "layer": "backend",
            "description": (
                "GET /health and /health/ready; Pino JSON logs with "
                "correlation ID."
            ),
            "deps": ["M2-PLT002"],
            "traces": "NFR-OBS-001, `architecture/monitoring_strategy.md`",
            "acceptance": [
                "/health returns 200",
                "/health/ready fails when DB down",
                "Logs include correlationId field",
            ],
            "files": [
                "backend/src/presentation/health/**",
                "backend/src/common/interceptors/logging.interceptor.ts",
            ],
            "tests": "Integration: supertest health; ready probe with stopped DB",
        },
        {
            "id": "M2-PLT006",
            "folder": "m02-platform",
            "title": "Backend CI Pipeline Skeleton",
            "milestone": "M2 — Platform Bootstrap",
            "estimate": "2h",
            "priority": "P0",
            "layer": "ci",
            "description": "GitHub Actions: lint, test, docker build on PR.",
            "deps": ["M2-PLT002"],
            "traces": "`architecture/deployment_architecture.md` §6.2",
            "acceptance": [
                "backend-ci.yml runs on PR",
                "Fails on lint errors",
                "Builds Docker image (no push on PR)",
            ],
            "files": [".github/workflows/backend-ci.yml"],
            "tests": "Push PR and verify CI green",
        },
        {
            "id": "M2-PLT007",
            "folder": "m02-platform",
            "title": "Redis + BullMQ Module Wiring",
            "milestone": "M2 — Platform Bootstrap",
            "estimate": "3h",
            "priority": "P0",
            "layer": "backend",
            "description": (
                "Register BullMQ root module and empty worker bootstrap."
            ),
            "deps": ["M2-PLT004"],
            "traces": "`architecture/backend_architecture.md`",
            "acceptance": [
                "Redis connection from env",
                "Sample queue job enqueues and processes",
                "Worker entrypoint starts",
            ],
            "files": [
                "backend/src/infrastructure/queue/**",
                "backend/src/worker.ts",
            ],
            "tests": "Integration: enqueue ping job, assert completed",
        },
        {
            "id": "M3-AUTH001",
            "folder": "m03-authentication",
            "title": "Auth Domain Layer (entities, ports, VOs)",
            "milestone": "M3 — Authentication",
            "estimate": "3h",
            "priority": "P0",
            "layer": "backend",
            "description": (
                "User role enum, Email/Password VOs, auth repository port, "
                "token service port."
            ),
            "deps": ["M2-PLT003", "M1-AUT-REQ"],
            "traces": "FR-AUTH-*, `features/authentication/data_model.md`",
            "acceptance": [
                "Domain unit tests ≥80% for auth domain",
                "No framework imports in domain/",
                "Password VO enforces min length 8",
            ],
            "files": [
                "backend/src/domain/auth/**",
                "backend/test/unit/domain/auth/**",
            ],
            "tests": "Unit: email validation, password rules, role enum",
        },
        {
            "id": "M3-AUTH002",
            "folder": "m03-authentication",
            "title": "JWT + Refresh Token Service",
            "milestone": "M3 — Authentication",
            "estimate": "3h",
            "priority": "P0",
            "layer": "backend",
            "description": (
                "Issue access (15m) and refresh tokens with rotation; "
                "Prisma refresh_tokens table."
            ),
            "deps": ["M3-AUTH001"],
            "traces": "FR-AUTH-006, AC-AUTH-004",
            "acceptance": [
                "Access token expires per config",
                "Refresh rotation invalidates old token",
                "Tampered token rejected",
            ],
            "files": [
                "backend/src/infrastructure/auth/jwt-token.service.ts",
                "backend/src/infrastructure/persistence/auth/**",
            ],
            "tests": "Unit: sign/verify; Integration: refresh flow",
        },
        {
            "id": "M3-AUTH003",
            "folder": "m03-authentication",
            "title": "POST /auth/register + Email Verification",
            "milestone": "M3 — Authentication",
            "estimate": "4h",
            "priority": "P0",
            "layer": "backend",
            "description": (
                "Register endpoint, duplicate email check, verification email job."
            ),
            "deps": ["M3-AUTH002"],
            "traces": "FR-AUTH-001, FR-AUTH-009, AC-AUTH-001, AC-AUTH-007",
            "acceptance": [
                "Valid registration returns 201 + verification pending",
                "Duplicate email returns 409",
                "Unverified user blocked from protected routes",
            ],
            "files": [
                "backend/src/modules/auth/**",
                "backend/src/application/auth/register.use-case.ts",
            ],
            "tests": (
                "Integration: register happy path + duplicate + unverified guard"
            ),
        },
        {
            "id": "M3-AUTH004",
            "folder": "m03-authentication",
            "title": "POST /auth/login + Logout",
            "milestone": "M3 — Authentication",
            "estimate": "3h",
            "priority": "P0",
            "layer": "backend",
            "description": (
                "Login with email/password; logout invalidates refresh token."
            ),
            "deps": ["M3-AUTH003"],
            "traces": "FR-AUTH-004, AC-AUTH-004, AC-AUTH-005",
            "acceptance": [
                "Correct credentials return token pair",
                "Wrong password returns 401",
                "Logout returns 204 and revokes refresh",
            ],
            "files": [
                "backend/src/application/auth/login.use-case.ts",
                "backend/src/application/auth/logout.use-case.ts",
            ],
            "tests": "Integration: login/logout; wrong password",
        },
        {
            "id": "M3-AUTH005",
            "folder": "m03-authentication",
            "title": "Password Reset Flow",
            "milestone": "M3 — Authentication",
            "estimate": "3h",
            "priority": "P0",
            "layer": "backend",
            "description": (
                "forgot-password and reset-password endpoints with email link."
            ),
            "deps": ["M3-AUTH004"],
            "traces": "FR-AUTH-005, AC-AUTH-006",
            "acceptance": [
                "Reset email sent for known email",
                "Unknown email returns same response (no leak)",
                "Reset token single-use",
            ],
            "files": [
                "backend/src/application/auth/forgot-password.use-case.ts",
                "backend/src/application/auth/reset-password.use-case.ts",
            ],
            "tests": "Integration: full reset flow with mock email",
        },
        {
            "id": "M3-AUTH006",
            "folder": "m03-authentication",
            "title": "Google OAuth Backend",
            "milestone": "M3 — Authentication",
            "estimate": "4h",
            "priority": "P0",
            "layer": "backend",
            "description": (
                "POST /auth/google with Passport; oauth_accounts linking."
            ),
            "deps": ["M3-AUTH004"],
            "traces": "FR-AUTH-002, AC-AUTH-002",
            "acceptance": [
                "Valid Google token creates/links user",
                "Cancelled flow returns 400",
                "New user prompted for role in response metadata",
            ],
            "files": [
                "backend/src/infrastructure/auth/google.strategy.ts",
                "backend/src/presentation/auth/auth.controller.ts",
            ],
            "tests": "Integration: mock Google token",
        },
        {
            "id": "M3-AUTH007",
            "folder": "m03-authentication",
            "title": "Apple Sign-In Backend",
            "milestone": "M3 — Authentication",
            "estimate": "4h",
            "priority": "P0",
            "layer": "backend",
            "description": "POST /auth/apple; handle private relay emails.",
            "deps": ["M3-AUTH006"],
            "traces": "FR-AUTH-003, AC-AUTH-003",
            "acceptance": [
                "Valid Apple identity token logs user in",
                "Private relay email stored correctly",
            ],
            "files": ["backend/src/infrastructure/auth/apple.strategy.ts"],
            "tests": "Integration: mock Apple JWT",
        },
        {
            "id": "M3-AUTH008",
            "folder": "m03-authentication",
            "title": "RBAC Guards + JWT Passport",
            "milestone": "M3 — Authentication",
            "estimate": "3h",
            "priority": "P0",
            "layer": "backend",
            "description": (
                "JwtAuthGuard, RolesGuard, @Roles() decorator on protected routes."
            ),
            "deps": ["M3-AUTH002"],
            "traces": "FR-AUTH-013, AC-AUTH-013",
            "acceptance": [
                "Buyer cannot access agent-only endpoint (403)",
                "Missing token returns 401",
                "Valid token attaches user to request",
            ],
            "files": [
                "backend/src/presentation/guards/**",
                "backend/src/presentation/decorators/roles.decorator.ts",
            ],
            "tests": "Integration: protected route role matrix",
        },
        {
            "id": "M3-AUTH009",
            "folder": "m03-authentication",
            "title": "Mobile Auth Screens (Register, Login, Onboarding)",
            "milestone": "M3 — Authentication",
            "estimate": "4h",
            "priority": "P0",
            "layer": "mobile",
            "description": (
                "Replace placeholders with register/login/role selection; "
                "ar-EG + en."
            ),
            "deps": ["M2-PLT001", "M3-AUTH004"],
            "traces": "AC-AUTH-001, AC-AUTH-009, AC-AUTH-010",
            "acceptance": [
                "User can register and see verification message",
                "User can login and reach home",
                "Role selection shown for new OAuth users",
            ],
            "files": [
                "mobile/lib/features/authentication/**",
                "mobile/lib/core/routing/route_guards.dart",
            ],
            "tests": "Widget tests for forms; manual E2E login",
        },
        {
            "id": "M3-AUTH010",
            "folder": "m03-authentication",
            "title": "Mobile Google + Apple Sign-In",
            "milestone": "M3 — Authentication",
            "estimate": "4h",
            "priority": "P0",
            "layer": "mobile",
            "description": (
                "Integrate google_sign_in and sign_in_with Apple; wire to API."
            ),
            "deps": ["M3-AUTH009", "M3-AUTH006", "M3-AUTH007"],
            "traces": "AC-AUTH-002, AC-AUTH-003",
            "acceptance": [
                "Google sign-in completes on Android/iOS",
                "Apple sign-in works on iOS",
                "Failed OAuth shows error, no orphan account",
            ],
            "files": [
                "mobile/lib/features/authentication/data/datasources/**",
                "mobile/pubspec.yaml",
            ],
            "tests": "Manual E2E on simulators; widget test error states",
        },
        {
            "id": "M3-AUTH011",
            "folder": "m03-authentication",
            "title": "Mobile Token Storage + Auto Refresh",
            "milestone": "M3 — Authentication",
            "estimate": "3h",
            "priority": "P0",
            "layer": "mobile",
            "description": (
                "Secure storage for tokens; Dio interceptor refresh on 401."
            ),
            "deps": ["M3-AUTH009"],
            "traces": "FR-AUTH-006, AC-AUTH-004",
            "acceptance": [
                "Tokens persist across app restart",
                "Expired access refreshes transparently",
                "Failed refresh redirects to login",
            ],
            "files": [
                "mobile/lib/core/network/auth_interceptor.dart",
                "mobile/lib/features/authentication/presentation/providers/**",
            ],
            "tests": "Unit: interceptor refresh mock; integration token persist",
        },
        {
            "id": "M3-AUTH012",
            "folder": "m03-authentication",
            "title": "PDPL Consent on Onboarding",
            "milestone": "M3 — Authentication",
            "estimate": "2h",
            "priority": "P0",
            "layer": "mobile",
            "description": "Consent checkbox; store consent_at on user.",
            "deps": ["M3-AUTH009"],
            "traces": "FR-AUTH-010, AC-AUTH-010",
            "acceptance": [
                "Cannot proceed without consent",
                "consent_at sent to API on register",
            ],
            "files": [
                "mobile/lib/features/authentication/presentation/pages/onboarding_page.dart",
                "backend/src/application/auth/register.use-case.ts",
            ],
            "tests": "Widget: submit disabled without consent",
        },
    ]


def _t(
    id: str,
    folder: str,
    title: str,
    milestone: str,
    estimate: str,
    layer: str,
    description: str,
    deps: list[str],
    traces: str,
    acceptance: list[str],
    files: list[str],
    tests: str,
    priority: str = "P0",
    status: str = "pending",
) -> dict:
    return {
        "id": id,
        "folder": folder,
        "title": title,
        "milestone": milestone,
        "estimate": estimate,
        "priority": priority,
        "status": status,
        "layer": layer,
        "description": description,
        "deps": deps,
        "traces": traces,
        "acceptance": acceptance,
        "files": files,
        "tests": tests,
    }


def m4_tasks() -> list[dict]:
    m = "M4 — Property Search & Listing Sync"
    return [
        _t(
            "M4-SEA001",
            "m04-property-search",
            "Listing Provider Port + Property Domain",
            m,
            "3h",
            "backend",
            "Define ListingProviderPort, Property entity, normalization rules.",
            ["M2-PLT003", "M1-SEA-REQ"],
            "FR-SEARCH-*, FR-SYNC-*, `features/property_search/data_model.md`",
            [
                "Domain ports have no NestJS imports",
                "Property entity maps to Prisma schema",
                "Unit tests for normalization edge cases",
            ],
            [
                "backend/src/domain/property/**",
                "backend/test/unit/domain/property/**",
            ],
            "Unit: mapper tests with fixture JSON",
        ),
        _t(
            "M4-SEA002",
            "m04-property-search",
            "Shaety Listing Adapter (with mock fallback)",
            m,
            "4h",
            "backend",
            "HTTP client for Shaety API; mock adapter when credentials absent.",
            ["M4-SEA001"],
            "`architecture/listing_providers.md`, FR-SYNC-001",
            [
                "Adapter implements ListingProviderPort",
                "Mock returns ≥10 listings for local dev",
                "Rate limit and retry on 429/5xx",
            ],
            ["backend/src/infrastructure/listing/shaety/**"],
            "Integration: mock adapter ingest sample",
        ),
        _t(
            "M4-SEA003",
            "m04-property-search",
            "Properties Prisma Repository",
            m,
            "3h",
            "backend",
            "Upsert listings by external_id; soft-delete inactive after 24h.",
            ["M4-SEA001"],
            "`architecture/postgresql_schema.md` properties table",
            [
                "Upsert idempotent on external_id",
                "Inactive listings excluded from search",
                "Integration test with test DB",
            ],
            ["backend/src/infrastructure/persistence/property/**"],
            "Integration: upsert + query active only",
        ),
        _t(
            "M4-SEA004",
            "m04-property-search",
            "Listing Sync BullMQ Worker",
            m,
            "4h",
            "backend",
            "Scheduled listing-sync job; sync_run audit rows; failure counter.",
            ["M4-SEA002", "M4-SEA003", "M2-PLT007"],
            "FR-SYNC-002, FR-SYNC-004",
            [
                "Worker processes sync queue job",
                "sync_runs row created per run",
                "3 failures increment alert metric",
            ],
            [
                "backend/src/infrastructure/queue/listing-sync.processor.ts",
                "backend/src/worker.ts",
            ],
            "Integration: trigger job, assert property count",
        ),
        _t(
            "M4-SEA005",
            "m04-property-search",
            "Full-Text Search (tsvector) + Query Builder",
            m,
            "3h",
            "backend",
            "GIN index on search_vector; bilingual query support.",
            ["M4-SEA003"],
            "FR-SEARCH-003, architecture (pgvector + tsvector)",
            [
                "Arabic and English queries return results",
                "tsvector updated on upsert",
                "Explain plan acceptable on 10k rows (local)",
            ],
            ["backend/src/infrastructure/search/**"],
            "Integration: search 'Maadi' and 'المعادي'",
        ),
        _t(
            "M4-SEA006",
            "m04-property-search",
            "GET /api/v1/properties (filter, sort, paginate)",
            m,
            "4h",
            "backend",
            "Public search endpoint with city, price, beds, type filters.",
            ["M4-SEA005"],
            "FR-SEARCH-001–011, `features/property_search/api_design.md`",
            [
                "Pagination metadata correct",
                "Invalid filter returns 400",
                "Guest access allowed (P1 browse)",
            ],
            [
                "backend/src/modules/properties/**",
                "backend/src/application/property/search.use-case.ts",
            ],
            "Integration: filter matrix + pagination",
        ),
        _t(
            "M4-SEA007",
            "m04-property-search",
            "GET /api/v1/properties/:id",
            m,
            "2h",
            "backend",
            "Detail endpoint with provider attribution and image URLs.",
            ["M4-SEA003"],
            "FR-SEARCH-012, FR-SEARCH-014",
            [
                "404 for unknown/inactive id",
                "provider_name and source_url in response",
                "OpenAPI/contract matches api_design.md",
            ],
            ["backend/src/presentation/properties/properties.controller.ts"],
            "Integration: detail happy path + 404",
        ),
        _t(
            "M4-SEA008",
            "m04-property-search",
            "Admin Sync Status Endpoint",
            m,
            "2h",
            "backend",
            "GET /admin/sync/status for last run, counts, errors (agent/admin).",
            ["M4-SEA004", "M3-AUTH008"],
            "FR-SYNC-006",
            [
                "Returns last sync timestamp and row counts",
                "403 for non-admin/agent roles",
            ],
            ["backend/src/presentation/admin/sync.controller.ts"],
            "Integration: RBAC + response shape",
        ),
        _t(
            "M4-SEA009",
            "m04-property-search",
            "Mobile Search Screen + Results List",
            m,
            "4h",
            "mobile",
            "Search bar, results ListView, empty/error states, ar-EG + en.",
            ["M2-PLT001", "M4-SEA006"],
            "AC-SEARCH-001, AC-SEARCH-002",
            [
                "Guest can browse results",
                "Pull-to-refresh triggers reload",
                "Widget tests for empty/error",
            ],
            ["mobile/lib/features/property_search/**"],
            "Widget tests; manual guest browse",
        ),
        _t(
            "M4-SEA010",
            "m04-property-search",
            "Mobile Filters Bottom Sheet",
            m,
            "3h",
            "mobile",
            "Price range, beds, property type, city filters applied to API.",
            ["M4-SEA009"],
            "FR-SEARCH-004, AC-SEARCH-003",
            [
                "Applied filters reflected in query params",
                "Clear filters resets list",
            ],
            ["mobile/lib/features/property_search/presentation/widgets/**"],
            "Widget: filter apply/clear",
        ),
        _t(
            "M4-SEA011",
            "m04-property-search",
            "Mobile Listing Detail Screen",
            m,
            "4h",
            "mobile",
            "Image carousel, attributes, provider badge, share stub.",
            ["M4-SEA009", "M4-SEA007"],
            "FR-SEARCH-012, AC-SEARCH-004",
            [
                "Opens from search result tap",
                "Image error placeholder shown",
                "Provider attribution visible",
            ],
            ["mobile/lib/features/property_search/presentation/pages/detail/**"],
            "Widget + manual navigation from list",
        ),
        _t(
            "M4-SEA012",
            "m04-property-search",
            "Property Search Integration Test Pack",
            m,
            "3h",
            "backend",
            "Supertest pack for sync + search + detail per tests.md P0 AC.",
            ["M4-SEA006", "M4-SEA007", "M4-SEA004"],
            "`features/property_search/tests.md`",
            [
                "All P0 API AC covered",
                "CI runs search integration suite",
            ],
            ["backend/test/integration/properties/**"],
            "`npm run test:integration` green",
        ),
    ]


def m5_tasks() -> list[dict]:
    m = "M5 — User Profile & Preferences"
    return [
        _t(
            "M5-PRO001",
            "m05-profile",
            "Profile Domain + Repository Port",
            m,
            "3h",
            "backend",
            "UserProfile entity, favorites port, preferences VOs.",
            ["M3-AUTH001", "M1-PRO-REQ"],
            "FR-PROF-*, `features/profile/data_model.md`",
            [
                "Domain tests ≥80% for profile module",
                "No NestJS in domain/",
            ],
            [
                "backend/src/domain/profile/**",
                "backend/test/unit/domain/profile/**",
            ],
            "Unit: preference validation",
        ),
        _t(
            "M5-PRO002",
            "m05-profile",
            "GET/PATCH /api/v1/users/me",
            m,
            "3h",
            "backend",
            "Profile read/update with locale, name, phone validation.",
            ["M5-PRO001", "M3-AUTH008"],
            "FR-PROF-001, FR-PROF-002",
            [
                "PATCH partial update works",
                "401 without token",
            ],
            [
                "backend/src/modules/users/**",
                "backend/src/application/profile/update-profile.use-case.ts",
            ],
            "Integration: me read/update",
        ),
        _t(
            "M5-PRO003",
            "m05-profile",
            "Favorites CRUD API",
            m,
            "3h",
            "backend",
            "POST/DELETE/GET favorites linked to property_id.",
            ["M5-PRO001", "M4-SEA003"],
            "FR-PROF-003, FR-PROF-004",
            [
                "Idempotent add favorite",
                "404 if property missing",
            ],
            ["backend/src/application/profile/favorites/**"],
            "Integration: add/list/remove",
        ),
        _t(
            "M5-PRO004",
            "m05-profile",
            "Search Preferences API",
            m,
            "2h",
            "backend",
            "Persist budget, areas, property types on user preferences JSON.",
            ["M5-PRO002"],
            "FR-PROF-005",
            [
                "Preferences round-trip in GET /me",
                "Invalid budget returns 400",
            ],
            ["backend/src/application/profile/preferences/**"],
            "Integration: update prefs reflected in GET /me",
        ),
        _t(
            "M5-PRO005",
            "m05-profile",
            "Default AI Agent Preference",
            m,
            "2h",
            "backend",
            "PATCH default_agent_id; validate against ai_agents seed.",
            ["M5-PRO002"],
            "FR-PROF-007",
            [
                "Invalid agent id returns 400",
                "Default used by chat module (stub ok)",
            ],
            ["backend/src/application/profile/set-default-agent.use-case.ts"],
            "Integration: set + get default agent",
        ),
        _t(
            "M5-PRO006",
            "m05-profile",
            "Account Deletion + Data Export Stub",
            m,
            "3h",
            "backend",
            "DELETE /me with cascade; export job stub for PDPL.",
            ["M5-PRO002"],
            "FR-PROF-009, FR-PROF-010",
            [
                "Deletion returns 204",
                "PII removed per policy window documented",
            ],
            ["backend/src/application/profile/delete-account.use-case.ts"],
            "Integration: delete then login fails",
        ),
        _t(
            "M5-PRO007",
            "m05-profile",
            "Agent Public Profile GET /agents/:id",
            m,
            "2h",
            "backend",
            "Public agent card: name, agency, languages, rating stub.",
            ["M5-PRO001"],
            "FR-PROF-008",
            ["200 for agent role user", "404 for non-agent"],
            ["backend/src/presentation/agents/agents.controller.ts"],
            "Integration: agent profile",
        ),
        _t(
            "M5-PRO008",
            "m05-profile",
            "Mobile Profile Tab + Edit Profile",
            m,
            "4h",
            "mobile",
            "Profile screen, edit form, locale switcher.",
            ["M3-AUTH009", "M5-PRO002"],
            "AC-PROF-001, AC-PROF-002",
            [
                "User updates name and sees change",
                "ar-EG and en UI strings",
            ],
            ["mobile/lib/features/profile/**"],
            "Widget tests; manual profile edit",
        ),
        _t(
            "M5-PRO009",
            "m05-profile",
            "Mobile Favorites Screen",
            m,
            "3h",
            "mobile",
            "Favorites list with navigation to listing detail.",
            ["M5-PRO008", "M5-PRO003", "M4-SEA011"],
            "FR-PROF-003",
            [
                "Add/remove favorite from detail",
                "Favorites persist after restart",
            ],
            ["mobile/lib/features/profile/presentation/pages/favorites/**"],
            "Widget + manual favorite flow",
        ),
        _t(
            "M5-PRO010",
            "m05-profile",
            "Profile P0 Integration Tests",
            m,
            "3h",
            "backend",
            "Test pack for profile + favorites per tests.md.",
            ["M5-PRO003", "M5-PRO006"],
            "`features/profile/tests.md`",
            ["All P0 profile AC pass in CI"],
            ["backend/test/integration/profile/**"],
            "`npm run test:integration` profile suite green",
        ),
    ]


def m6_tasks() -> list[dict]:
    m = "M6 — Embeddings, RAG & Knowledge"
    return [
        _t(
            "M6-RAG001",
            "m06-rag",
            "Gemini Embedding Adapter",
            m,
            "3h",
            "backend",
            "Vertex/AI Studio embedding client with batching and retries.",
            ["M2-PLT007", "M4-SEA003"],
            "`architecture/rag_architecture.md`, FR-SYNC-002",
            [
                "768-dim vectors returned",
                "Retries on transient errors",
                "Unit tests with mocked HTTP",
            ],
            ["backend/src/infrastructure/ai/embedding.service.ts"],
            "Unit: mock embed response",
        ),
        _t(
            "M6-RAG002",
            "m06-rag",
            "embed-listing BullMQ Worker",
            m,
            "4h",
            "backend",
            "Queue job embeds new/updated listings into embeddings table.",
            ["M6-RAG001", "M4-SEA004"],
            "FR-SYNC-002, `architecture/postgresql_schema.md`",
            [
                "New listing gets embedding within worker run",
                "Upsert on listing id",
            ],
            ["backend/src/infrastructure/queue/embed-listing.processor.ts"],
            "Integration: listing → embedding row",
        ),
        _t(
            "M6-RAG003",
            "m06-rag",
            "HNSW Index Migration + pgvector Tuning",
            m,
            "2h",
            "backend",
            "Create HNSW index on embeddings; document ef_search settings.",
            ["M6-RAG002"],
            "`architecture/postgresql_schema.md`",
            [
                "Migration applies on staging DB",
                "Similarity query uses index",
            ],
            ["backend/prisma/migrations/**"],
            "SQL: EXPLAIN shows index usage",
        ),
        _t(
            "M6-RAG004",
            "m06-rag",
            "RAG Orchestrator (hybrid vector + SQL + tsvector)",
            m,
            "4h",
            "backend",
            "Retrieve top-k chunks with metadata filters (price, city).",
            ["M6-RAG003", "M4-SEA005"],
            "`architecture/rag_architecture.md` §4",
            [
                "Hybrid query returns ranked results",
                "Empty retrieval logged",
                "p95 < 400ms on 1k listings (local)",
            ],
            ["backend/src/application/rag/rag-orchestrator.ts"],
            "Integration: golden query set sample",
        ),
        _t(
            "M6-RAG005",
            "m06-rag",
            "POST /api/v1/ai/rag/retrieve (dev/admin)",
            m,
            "2h",
            "backend",
            "Debug retrieve endpoint returning chunks + listing IDs.",
            ["M6-RAG004", "M3-AUTH008"],
            "M6 independently runnable verification",
            [
                "Returns cited listing IDs",
                "403 for unauthorized roles if restricted",
            ],
            ["backend/src/presentation/ai/rag.controller.ts"],
            "curl retrieve smoke test",
        ),
        _t(
            "M6-RAG006",
            "m06-rag",
            "Redis RAG Result Cache",
            m,
            "3h",
            "backend",
            "Cache identical queries; TTL 15m; cache hit metric.",
            ["M6-RAG004", "M2-PLT007"],
            "`architecture/rag_architecture.md` §6",
            [
                "Second identical query < 20ms",
                "Cache invalidates on listing update",
            ],
            ["backend/src/infrastructure/cache/rag-cache.service.ts"],
            "Integration: cache hit timing",
        ),
        _t(
            "M6-RAG007",
            "m06-rag",
            "Project Knowledge Ingest (FAQ chunks)",
            m,
            "3h",
            "backend",
            "Ingest project FAQ markdown into embeddable chunks.",
            ["M6-RAG001"],
            "FR-CHAT-007 (knowledge grounding)",
            [
                "Chunks stored with source metadata",
                "Retrieve includes project context",
            ],
            ["backend/src/infrastructure/knowledge/**"],
            "Integration: ingest + retrieve FAQ",
        ),
        _t(
            "M6-RAG008",
            "m06-rag",
            "RAG Metrics Instrumentation",
            m,
            "2h",
            "backend",
            "Prometheus: retrieve duration, empty rate, embed lag.",
            ["M6-RAG004"],
            "`architecture/monitoring_strategy.md`",
            [
                "Metrics exposed on /metrics",
                "Grafana panel JSON stub committed",
            ],
            ["backend/src/infrastructure/observability/metrics/**"],
            "Integration: metric increments on retrieve",
        ),
        _t(
            "M6-RAG009",
            "m06-rag",
            "RAG Golden-Set Evaluation Script",
            m,
            "3h",
            "backend",
            "CLI/script measuring recall@5 on labeled queries.",
            ["M6-RAG005"],
            "`architecture/rag_architecture.md` §8",
            [
                "Recall@5 ≥ target on golden set",
                "Report artifact in CI optional job",
            ],
            ["backend/scripts/rag-eval.ts"],
            "Run script locally; document baseline",
        ),
    ]


def m7_tasks() -> list[dict]:
    m = "M7 — AI Chat"
    return [
        _t(
            "M7-CHT001",
            "m07-ai-chat",
            "Conversation Domain + Repositories",
            m,
            "3h",
            "backend",
            "Conversation, Message entities; ports for persistence.",
            ["M2-PLT003", "M1-CHT-REQ"],
            "`features/ai_chat/data_model.md`",
            [
                "Domain unit tests pass",
                "Maps to conversations/messages tables",
            ],
            [
                "backend/src/domain/chat/**",
                "backend/test/unit/domain/chat/**",
            ],
            "Unit: message role validation",
        ),
        _t(
            "M7-CHT002",
            "m07-ai-chat",
            "AiModule + Agents Catalog API",
            m,
            "2h",
            "backend",
            "GET /ai/agents from seed; disabled agent flag.",
            ["M7-CHT001"],
            "FR-CHAT-009",
            [
                "Returns 4 seeded agents",
                "Disabled agent excluded or flagged",
            ],
            ["backend/src/modules/ai/**"],
            "Integration: agents list",
        ),
        _t(
            "M7-CHT003",
            "m07-ai-chat",
            "GeminiOrchestrator + Prompt Version Loader",
            m,
            "4h",
            "backend",
            "Load active prompt_template_version; call Vertex generate.",
            ["M7-CHT002", "M6-RAG004"],
            "`architecture/gemini_integration_layer.md`",
            [
                "Uses pinned prompt version id",
                "Structured logging of model id",
            ],
            ["backend/src/infrastructure/ai/gemini-orchestrator.ts"],
            "Integration: mock Vertex response",
        ),
        _t(
            "M7-CHT004",
            "m07-ai-chat",
            "SafetyPipeline + Fair Housing Rules",
            m,
            "3h",
            "backend",
            "Pre-filter blocked topics; refuse without model call.",
            ["M7-CHT003"],
            "FR-CHAT-014, AC fair housing",
            [
                "Discriminatory query returns refusal",
                "No Gemini call on blocked input (metric)",
            ],
            ["backend/src/application/chat/safety-pipeline.ts"],
            "Unit: blocked phrase matrix",
        ),
        _t(
            "M7-CHT005",
            "m07-ai-chat",
            "ToolExecutionLoop (semantic_search, etc.)",
            m,
            "4h",
            "backend",
            "Execute tools from Gemini function calls; audit toolsCalled.",
            ["M7-CHT003", "M6-RAG004"],
            "FR-CHAT-008, gemini integration §5",
            [
                "semantic_search returns listings",
                "Tool errors surfaced to user safely",
            ],
            ["backend/src/application/chat/tool-execution.loop.ts"],
            "Integration: tool invoke metadata",
        ),
        _t(
            "M7-CHT006",
            "m07-ai-chat",
            "POST /conversations + /messages (non-stream)",
            m,
            "4h",
            "backend",
            "Create session, send message, persist user/assistant messages.",
            ["M7-CHT005", "M3-AUTH008"],
            "FR-CHAT-001, FR-CHAT-002",
            [
                "201 on new conversation",
                "Assistant message stored with citations stub",
            ],
            [
                "backend/src/presentation/ai/conversations.controller.ts",
                "backend/src/application/chat/send-message.use-case.ts",
            ],
            "Integration: send message happy path",
        ),
        _t(
            "M7-CHT007",
            "m07-ai-chat",
            "SSE Streaming Endpoint",
            m,
            "4h",
            "backend",
            "POST .../messages/stream with token chunks and done event.",
            ["M7-CHT006"],
            "FR-CHAT streaming, gemini integration §3",
            [
                "Stream completes with done event",
                "Client disconnect cancels upstream",
            ],
            ["backend/src/presentation/ai/chat-stream.controller.ts"],
            "Integration: SSE event sequence",
        ),
        _t(
            "M7-CHT008",
            "m07-ai-chat",
            "Conversation Memory Compaction Job",
            m,
            "3h",
            "backend",
            "Summarize history when token budget exceeded.",
            ["M7-CHT006"],
            "`architecture/gemini_integration_layer.md` §4",
            [
                "Compaction preserves last N turns",
                "Job runs via BullMQ",
            ],
            ["backend/src/infrastructure/queue/chat-compaction.processor.ts"],
            "Unit: compaction threshold",
        ),
        _t(
            "M7-CHT009",
            "m07-ai-chat",
            "Mobile Chat UI + Stream Rendering",
            m,
            "4h",
            "mobile",
            "Message list, composer, SSE client, loading states.",
            ["M3-AUTH011", "M7-CHT007"],
            "AC-CHAT-001, AC-CHAT-002",
            [
                "Stream renders incrementally",
                "AI disclaimer on every assistant bubble",
            ],
            ["mobile/lib/features/ai_chat/**"],
            "Widget tests; manual stream on dev API",
        ),
        _t(
            "M7-CHT010",
            "m07-ai-chat",
            "Mobile Agent Picker + Listing Cards",
            m,
            "3h",
            "mobile",
            "Switch agent mid-session; tap card opens M4 detail.",
            ["M7-CHT009", "M4-SEA011", "M5-PRO005"],
            "FR-CHAT-005, FR-CHAT-012",
            [
                "Agent switch preserves history",
                "Listing card navigates to detail",
            ],
            ["mobile/lib/features/ai_chat/presentation/widgets/**"],
            "Widget: agent switch; manual card tap",
        ),
        _t(
            "M7-CHT011",
            "m07-ai-chat",
            "AI Chat P0 Test Pack",
            m,
            "3h",
            "backend",
            "Integration tests for chat AC including fair housing.",
            ["M7-CHT007", "M7-CHT004"],
            "`features/ai_chat/tests.md`",
            [
                "All P0 chat AC covered",
                "Fair housing test passes",
            ],
            ["backend/test/integration/ai/**"],
            "CI: ai chat integration green",
        ),
    ]


def m8_tasks() -> list[dict]:
    m = "M8 — Recommendations"
    return [
        _t(
            "M8-REC001",
            "m08-recommendations",
            "Recommendation Domain + Scoring Port",
            m,
            "3h",
            "backend",
            "RecommendationCandidate, Feedback VO, scoring port.",
            ["M1-REC-REQ", "M6-RAG003"],
            "`features/recommendation/data_model.md`",
            ["Domain tests pass", "No discriminatory attribute filters"],
            [
                "backend/src/domain/recommendation/**",
                "backend/test/unit/domain/recommendation/**",
            ],
            "Unit: fair housing filter test",
        ),
        _t(
            "M8-REC002",
            "m08-recommendations",
            "User Preference Vector Builder",
            m,
            "3h",
            "backend",
            "Mean embedding of liked listings + preference weights.",
            ["M8-REC001", "M5-PRO003"],
            "FR-REC-003",
            [
                "Vector updates on like",
                "Cold start returns popular listings",
            ],
            ["backend/src/application/recommendation/preference-vector.ts"],
            "Integration: like → vector change",
        ),
        _t(
            "M8-REC003",
            "m08-recommendations",
            "GET /api/v1/recommendations",
            m,
            "4h",
            "backend",
            "Personalized feed with pagination and explain stub.",
            ["M8-REC002", "M4-SEA006"],
            "FR-REC-001, FR-REC-007",
            [
                "Authenticated user gets non-empty feed",
                "Disliked listings excluded",
            ],
            ["backend/src/modules/recommendations/**"],
            "Integration: feed pagination",
        ),
        _t(
            "M8-REC004",
            "m08-recommendations",
            "POST /recommendations/feedback",
            m,
            "2h",
            "backend",
            "Like/dislike endpoints updating preference vector.",
            ["M8-REC003"],
            "FR-REC-006",
            ["Idempotent feedback", "Next page reflects dislike"],
            ["backend/src/application/recommendation/feedback.use-case.ts"],
            "Integration: like/dislike flow",
        ),
        _t(
            "M8-REC005",
            "m08-recommendations",
            "Mobile Home Recommendations Section",
            m,
            "4h",
            "mobile",
            "Horizontal feed on home; like/dislike gestures.",
            ["M8-REC003", "M2-PLT001"],
            "AC-REC-001",
            [
                "Cold start shows popular",
                "Like refreshes recommendations",
            ],
            ["mobile/lib/features/recommendation/**"],
            "Widget + manual home feed",
        ),
        _t(
            "M8-REC006",
            "m08-recommendations",
            "Recommendation P0 Test Pack",
            m,
            "3h",
            "backend",
            "Integration + compliance tests per tests.md.",
            ["M8-REC004"],
            "`features/recommendation/tests.md`",
            ["All P0 REC AC pass", "No discriminatory filters test"],
            ["backend/test/integration/recommendations/**"],
            "CI green",
        ),
    ]


def m9_tasks() -> list[dict]:
    m = "M9 — Booking & Notifications"
    return [
        _t(
            "M9-BOK001",
            "m09-booking",
            "Booking Domain + Repository",
            m,
            "3h",
            "backend",
            "Booking entity, status machine, repository port.",
            ["M2-PLT003", "M1-BOK-REQ"],
            "`features/booking/data_model.md`",
            [
                "Status transitions validated in domain",
                "Unit tests for quota rules stub",
            ],
            [
                "backend/src/domain/booking/**",
                "backend/test/unit/domain/booking/**",
            ],
            "Unit: status machine",
        ),
        _t(
            "M9-BOK002",
            "m09-booking",
            "POST /api/v1/bookings (buyer request)",
            m,
            "4h",
            "backend",
            "Create viewing request linked to property and agent.",
            ["M9-BOK001", "M4-SEA007", "M3-AUTH008"],
            "FR-BOOK-001, FR-BOOK-002",
            [
                "status requested on create",
                "404 if property inactive",
            ],
            ["backend/src/application/booking/create-booking.use-case.ts"],
            "Integration: buyer creates booking",
        ),
        _t(
            "M9-BOK003",
            "m09-booking",
            "Agent Confirm / Decline / Cancel APIs",
            m,
            "3h",
            "backend",
            "PATCH transitions; notifications enqueued.",
            ["M9-BOK002"],
            "FR-BOOK-003, FR-BOOK-011",
            [
                "Agent confirm sets confirmed",
                "Buyer cancel before viewing works",
            ],
            ["backend/src/application/booking/update-booking.use-case.ts"],
            "Integration: lifecycle transitions",
        ),
        _t(
            "M9-BOK004",
            "m09-booking",
            "Double-Booking + Agent Quota Guards",
            m,
            "3h",
            "backend",
            "Prevent overlapping slots; 5 free bookings/month for agents.",
            ["M9-BOK003"],
            "FR-BOOK-009, FR-BOOK-010",
            [
                "Double-book returns 409",
                "Quota exceeded returns 403",
            ],
            ["backend/src/domain/booking/booking-policy.service.ts"],
            "Integration: conflict + quota tests",
        ),
        _t(
            "M9-BOK005",
            "m09-booking",
            "NotificationsModule + BullMQ Processor",
            m,
            "3h",
            "backend",
            "notification_jobs table; processor dispatches push/email.",
            ["M2-PLT007", "M9-BOK003"],
            "FR-NOTIF-001",
            [
                "Job enqueued on booking status change",
                "Failed job retries with backoff",
            ],
            ["backend/src/modules/notifications/**"],
            "Integration: job processed mock",
        ),
        _t(
            "M9-BOK006",
            "m09-booking",
            "FCM Push Integration",
            m,
            "4h",
            "backend",
            "Send push to agent on new request; buyer on confirm.",
            ["M9-BOK005"],
            "FR-NOTIF-002",
            [
                "Push payload includes booking id",
                "Invalid token handled gracefully",
            ],
            ["backend/src/infrastructure/notifications/fcm.service.ts"],
            "Integration: mock FCM server",
        ),
        _t(
            "M9-BOK007",
            "m09-booking",
            "Bilingual Email Templates (ar/en)",
            m,
            "3h",
            "backend",
            "MJML/HTML templates for booking events.",
            ["M9-BOK005"],
            "FR-NOTIF-004",
            [
                "Snapshot tests for both locales",
                "Variables substituted correctly",
            ],
            ["backend/src/infrastructure/notifications/templates/**"],
            "Snapshot: template render",
        ),
        _t(
            "M9-BOK008",
            "m09-booking",
            "Mobile Booking Request from Listing Detail",
            m,
            "4h",
            "mobile",
            "Date/time picker, notes, submit to API.",
            ["M4-SEA011", "M9-BOK002", "M3-AUTH011"],
            "AC-BOOK-001",
            [
                "Buyer submits request",
                "Validation errors shown inline",
            ],
            ["mobile/lib/features/booking/**"],
            "Widget + manual booking request",
        ),
        _t(
            "M9-BOK009",
            "m09-booking",
            "Mobile Agent Booking Inbox",
            m,
            "3h",
            "mobile",
            "List requests; confirm/decline actions.",
            ["M9-BOK008", "M9-BOK003"],
            "AC-BOOK-003",
            [
                "Agent confirm updates status in UI",
                "Push opens correct booking (deep link stub)",
            ],
            ["mobile/lib/features/booking/presentation/agent/**"],
            "Manual agent flow on two simulators",
        ),
        _t(
            "M9-BOK010",
            "m09-booking",
            "Booking E2E Lifecycle Test",
            m,
            "3h",
            "backend",
            "Buyer request → agent confirm → notification asserted.",
            ["M9-BOK006", "M9-BOK004"],
            "`features/booking/tests.md`",
            [
                "Full P0 booking AC pass",
                "Notification job completed",
            ],
            ["backend/test/e2e/booking/**"],
            "E2E green in CI",
        ),
    ]


def m10_tasks() -> list[dict]:
    m = "M10 — Quality, Security & E2E"
    return [
        _t(
            "M10-QLT001",
            "m10-quality",
            "MVP Launch Checklist Document",
            m,
            "2h",
            "docs",
            "Create tasks/mvp_launch_checklist.md from master plan M10.",
            ["M9-BOK010", "M7-CHT011"],
            "`tasks/master_execution_plan.md` M10",
            [
                "Checklist covers P0 FR modules",
                "Owners assigned per line item",
            ],
            ["tasks/mvp_launch_checklist.md"],
            "PO review sign-off",
        ),
        _t(
            "M10-QLT002",
            "m10-quality",
            "Flutter integration_test P0 Journey",
            m,
            "4h",
            "mobile",
            "auth → search → chat → booking on dev flavor.",
            ["M9-BOK009", "M7-CHT010"],
            "M10 E2E requirements",
            [
                "integration_test passes on CI macOS runner",
                "Screenshots on failure",
            ],
            ["mobile/integration_test/**"],
            "`flutter test integration_test`",
        ),
        _t(
            "M10-QLT003",
            "m10-quality",
            "API E2E Suite (supertest)",
            m,
            "4h",
            "backend",
            "Chained API test: register → sync → chat → book.",
            ["M9-BOK010"],
            "NFR-MAINT-004",
            [
                "All public REST P0 paths hit",
                "Runs in CI with docker services",
            ],
            ["backend/test/e2e/full-journey/**"],
            "`npm run test:e2e` green",
        ),
        _t(
            "M10-QLT004",
            "m10-quality",
            "Domain Coverage Gate ≥80%",
            m,
            "3h",
            "backend",
            "Jest coverage threshold on domain/ and application/.",
            ["M10-QLT003"],
            "NFR-MAINT-003",
            [
                "CI fails below 80% domain coverage",
                "Report uploaded as artifact",
            ],
            ["backend/jest.config.js", ".github/workflows/backend-ci.yml"],
            "CI coverage job",
        ),
        _t(
            "M10-QLT005",
            "m10-quality",
            "Prometheus Metrics + Grafana Dashboards",
            m,
            "4h",
            "infra",
            "API, RAG, AI dashboards per monitoring_strategy.md.",
            ["M6-RAG008", "M7-CHT003"],
            "`architecture/monitoring_strategy.md`",
            [
                "Dashboards importable JSON committed",
                "Staging soak shows data",
            ],
            ["infra/grafana/**", "backend/src/infrastructure/observability/**"],
            "Manual: Grafana panels populate",
        ),
        _t(
            "M10-QLT006",
            "m10-quality",
            "Firebase Analytics + Crashlytics",
            m,
            "3h",
            "mobile",
            "Wire events for funnel; crash reports in Firebase.",
            ["M2-PLT001"],
            "`architecture/monitoring_strategy.md` §3",
            [
                "Key events fire on auth/search/chat/book",
                "Crashlytics symbolication configured",
            ],
            [
                "mobile/lib/core/analytics/**",
                "mobile/ios/Runner/GoogleService-Info.plist",
            ],
            "Manual: Firebase debug view",
        ),
        _t(
            "M10-QLT007",
            "m10-quality",
            "AI Quality Metrics (hallucination, citations)",
            m,
            "3h",
            "backend",
            "Log invalid listing IDs; weekly hallucination rate query.",
            ["M7-CHT011"],
            "monitoring_strategy AI §",
            [
                "Metric exported",
                "Alert when rate > 3% over 7d",
            ],
            ["backend/src/infrastructure/observability/ai-quality/**"],
            "Integration: strip invalid listing id",
        ),
        _t(
            "M10-QLT008",
            "m10-quality",
            "Security Review Checklist (OWASP + PDPL)",
            m,
            "3h",
            "docs",
            "Complete security checklist; fix P0 findings.",
            ["M3-AUTH012"],
            "NFR-SEC-*",
            [
                "No secrets in repo scan clean",
                "JWT/OAuth/PDPL items checked",
            ],
            ["docs/security_review_checklist.md"],
            "Security sign-off recorded",
        ),
        _t(
            "M10-QLT009",
            "m10-quality",
            "Load Test Report (search + chat)",
            m,
            "4h",
            "infra",
            "k6 or Artillery scripts; p95 targets documented.",
            ["M4-SEA012", "M7-CHT007"],
            "NFR-PERF-002, NFR-PERF chat",
            [
                "Search p95 < 2s at 10k listings",
                "Chat p95 < 3s at target RPS",
            ],
            ["infra/loadtests/**"],
            "Report committed with results",
        ),
        _t(
            "M10-QLT010",
            "m10-quality",
            "PO MVP Sign-Off Artifact",
            m,
            "2h",
            "docs",
            "Sign-off against specs/vision.md success metrics.",
            ["M10-QLT001", "M10-QLT009"],
            "`specs/vision.md`",
            [
                "Written PO acceptance",
                "P0 defects = 0",
            ],
            ["tasks/mvp_signoff.md"],
            "PO signature in doc",
        ),
    ]


def m11_tasks() -> list[dict]:
    m = "M11 — Staging on GCP"
    return [
        _t(
            "M11-DEP001",
            "m11-staging-gcp",
            "GCP Staging Project + WIF for GitHub",
            m,
            "4h",
            "infra",
            "Create re-agent-staging; workload identity federation.",
            ["M10-QLT010"],
            "`architecture/deployment_architecture.md` §4",
            [
                "GitHub Actions can authenticate without keys",
                "Least-privilege SA roles documented",
            ],
            ["infra/terraform/staging/**", ".github/workflows/deploy-staging.yml"],
            "gh workflow dry-run auth",
        ),
        _t(
            "M11-DEP002",
            "m11-staging-gcp",
            "Cloud SQL PostgreSQL + pgvector",
            m,
            "4h",
            "infra",
            "Private IP Cloud SQL; run Prisma migrate on deploy.",
            ["M11-DEP001", "M2-PLT003"],
            "deployment_architecture §5",
            [
                "Migrations apply via CD job",
                "vector extension enabled",
            ],
            ["infra/terraform/staging/cloudsql.tf"],
            "CD migrate job success",
        ),
        _t(
            "M11-DEP003",
            "m11-staging-gcp",
            "Cloud Run API + Worker Services",
            m,
            "4h",
            "infra",
            "Deploy api-staging and worker-staging from Artifact Registry.",
            ["M11-DEP002", "M2-PLT004"],
            "deployment_architecture §6",
            [
                "/health/ready returns 200",
                "Worker processes listing-sync queue",
            ],
            ["infra/terraform/staging/cloudrun.tf", "backend/Dockerfile"],
            "Post-deploy smoke curl",
        ),
        _t(
            "M11-DEP004",
            "m11-staging-gcp",
            "Secret Manager Wiring",
            m,
            "3h",
            "infra",
            "DB URL, Redis, JWT, provider keys in Secret Manager.",
            ["M11-DEP003"],
            "deployment_architecture §7",
            [
                "No secrets in GitHub vars except WIF",
                "Cloud Run mounts secrets",
            ],
            ["infra/terraform/staging/secrets.tf"],
            "API boots with secrets only from SM",
        ),
        _t(
            "M11-DEP005",
            "m11-staging-gcp",
            "Vertex AI Gemini Staging Config",
            m,
            "3h",
            "backend",
            "GEMINI_PROVIDER=vertex; service account IAM.",
            ["M11-DEP004", "M7-CHT003"],
            "`architecture/ai_provider_strategy.md`",
            [
                "Chat stream completes on staging",
                "No API key in mobile client",
            ],
            ["backend/src/infrastructure/ai/vertex.config.ts"],
            "Staging integration: one chat message",
        ),
        _t(
            "M11-DEP006",
            "m11-staging-gcp",
            "GitHub Actions deploy-staging Workflow",
            m,
            "3h",
            "ci",
            "On main: build, migrate, deploy Cloud Run.",
            ["M11-DEP003"],
            "deployment_architecture §6.2",
            [
                "Workflow runs on merge to main",
                "Failed deploy blocks without rollback doc",
            ],
            [".github/workflows/deploy-staging.yml"],
            "Merge PR → staging updated",
        ),
        _t(
            "M11-DEP007",
            "m11-staging-gcp",
            "Flutter Staging → Staging API URL",
            m,
            "2h",
            "mobile",
            "staging flavor baseUrl; Firebase App Distribution.",
            ["M11-DEP003", "M2-PLT001"],
            "deployment_architecture §8",
            [
                "Staging APK/IPA hits staging API",
                "App Distribution testers can install",
            ],
            [
                "mobile/lib/core/config/flavor.dart",
                "mobile/lib/main_staging.dart",
            ],
            "Manual: staging build full journey",
        ),
        _t(
            "M11-DEP008",
            "m11-staging-gcp",
            "Cloud Monitoring Alerts",
            m,
            "3h",
            "infra",
            "Critical alerts: 5xx rate, DB CPU, AI cost daily.",
            ["M10-QLT005", "M11-DEP003"],
            "monitoring_strategy §5",
            [
                "Alert policies deployed",
                "Test notification received",
            ],
            ["infra/terraform/staging/alerts.tf"],
            "Dry-run alert firing",
        ),
        _t(
            "M11-DEP009",
            "m11-staging-gcp",
            "Staging Smoke + Rollback Drill",
            m,
            "3h",
            "ops",
            "Document and execute rollback to previous Cloud Run revision.",
            ["M11-DEP006", "M11-DEP007"],
            "M11 DoD",
            [
                "QA sign-off on staging build",
                "Rollback < 5 minutes documented",
            ],
            ["docs/runbooks/staging_rollback.md"],
            "Ops drill log attached",
        ),
    ]


def m12_tasks() -> list[dict]:
    m = "M12 — Production Release"
    return [
        _t(
            "M12-PRD001",
            "m12-production",
            "GCP Production Project + IAM",
            m,
            "4h",
            "infra",
            "re-agent-prod project; separate SA and VPC.",
            ["M11-DEP009"],
            "deployment_architecture §9",
            [
                "Prod isolated from staging",
                "IAM least privilege documented",
            ],
            ["infra/terraform/production/**"],
            "Terraform plan review",
        ),
        _t(
            "M12-PRD002",
            "m12-production",
            "Production CD (canary + traffic shift)",
            m,
            "4h",
            "ci",
            "Tag backend/v* deploy with canary revision.",
            ["M12-PRD001", "M11-DEP006"],
            "deployment_architecture §6.3",
            [
                "Canary 10% → 100% promotion",
                "Automated rollback on health fail",
            ],
            [".github/workflows/deploy-production.yml"],
            "Tag deploy dry-run on staging first",
        ),
        _t(
            "M12-PRD003",
            "m12-production",
            "Custom Domain + Managed SSL",
            m,
            "3h",
            "infra",
            "api.propertyassistant.eg mapped to Cloud Run.",
            ["M12-PRD002"],
            "M12 deliverables",
            [
                "HTTPS only",
                "Certificate provisioned",
            ],
            ["infra/terraform/production/domain.tf"],
            "curl https://api.../health",
        ),
        _t(
            "M12-PRD004",
            "m12-production",
            "Fastlane App Store + Play Release",
            m,
            "4h",
            "mobile",
            "mobile/v* tag triggers store upload (phased rollout).",
            ["M11-DEP007", "M10-QLT002"],
            "deployment_architecture §8.3",
            [
                "Fastlane lanes run on CI macOS",
                "Phased rollout 10% documented",
            ],
            ["mobile/fastlane/**", ".github/workflows/release-mobile.yml"],
            "TestFlight / internal track upload",
        ),
        _t(
            "M12-PRD005",
            "m12-production",
            "Production Vertex Quotas + Budget Alerts",
            m,
            "2h",
            "infra",
            "Billing budget and Vertex quota limits.",
            ["M12-PRD001"],
            "ai_provider_strategy cost §",
            [
                "Budget alert at 80% threshold",
                "Quota documented in runbook",
            ],
            ["infra/terraform/production/billing.tf"],
            "GCP console budget verified",
        ),
        _t(
            "M12-PRD006",
            "m12-production",
            "Incident Runbook + On-Call Rotation",
            m,
            "3h",
            "ops",
            "Pager/on-call schedule; incident severity matrix.",
            ["M11-DEP009"],
            "M12 DoD",
            [
                "Runbook covers API/AI/DB failures",
                "On-call rotation staffed",
            ],
            ["docs/runbooks/incident_response.md"],
            "Tabletop exercise completed",
        ),
        _t(
            "M12-PRD007",
            "m12-production",
            "Production Smoke + Hypercare Dashboard",
            m,
            "3h",
            "ops",
            "Post-release smoke on real devices; 24h dashboard.",
            ["M12-PRD003", "M12-PRD004"],
            "M12 verification",
            [
                "3 device smoke tests pass",
                "Week-1 metrics baseline documented",
            ],
            ["tasks/production_launch_report.md"],
            "PO hypercare sign-off",
        ),
    ]


def all_tasks() -> list[dict]:
    return (
        m1_tasks()
        + m2_m3_tasks()
        + m4_tasks()
        + m5_tasks()
        + m6_tasks()
        + m7_tasks()
        + m8_tasks()
        + m9_tasks()
        + m10_tasks()
        + m11_tasks()
        + m12_tasks()
    )


def write_tasks_data(tasks: list[dict]) -> None:
    lines = [
        '"""Auto-generated task registry. Regenerate: python3 build_registry.py"""',
        "",
        "TASKS = [",
    ]
    for t in tasks:
        lines.append("    {")
        for key in (
            "id",
            "folder",
            "title",
            "milestone",
            "estimate",
            "priority",
            "status",
            "layer",
            "description",
            "deps",
            "traces",
            "acceptance",
            "files",
            "tests",
        ):
            if key == "status" and "status" not in t:
                continue
            val = t[key]
            lines.append(f'        "{key}": {repr(val)},')
        lines.append("    },")
    lines.append("]")
    lines.append("")
    (ROOT / "tasks_data.py").write_text("\n".join(lines))


def write_readme(tasks: list[dict], by_folder: dict[str, list[dict]]) -> None:
    total = len(tasks)
    done = sum(1 for t in tasks if t.get("status") == "done")
    sections = []
    for folder in sorted(by_folder.keys()):
        rows = []
        for t in by_folder[folder]:
            link = f"[{t['id']}](./{folder}/{t['id'].lower()}.md)"
            deps = ", ".join(t.get("deps", [])) or "—"
            rows.append(
                f"| {link} | {t['title'][:50]} | {t['estimate']} | "
                f"{t.get('status', 'pending')} | {deps} |"
            )
        sections.append(
            f"### {folder}\n\n"
            f"| Task | Title | Est. | Status | Dependencies |\n"
            f"|------|-------|------|--------|--------------|\n"
            + "\n".join(rows)
        )

    content = textwrap.dedent(
        f"""\
        # Task Registry

        > **{total}** implementation tasks (each **≤ 4 hours**), derived from
        > `/specs`, `/architecture`, `/features`, and
        > [master_execution_plan.md](./master_execution_plan.md).

        ## Conventions

        | Rule | Detail |
        |------|--------|
        | **Estimate** | Wall-clock for one engineer; max 4h |
        | **Testable alone** | Task has its own tests/verification without finishing the milestone |
        | **ID format** | `M{{milestone}}-{{AREA}}{{nnn}}` (e.g. `M4-SEA006`) |
        | **Status** | `pending` · `in_progress` · `done` |
        | **Regenerate** | `python3 tasks/build_registry.py` |

        ## Progress

        | Metric | Value |
        |--------|-------|
        | Total tasks | {total} |
        | Done | {done} |
        | Pending | {total - done} |

        ## Milestone Folders

        | Folder | Milestone |
        |--------|-----------|
        | `m01-sdd/` | M1 — SDD Completion (specs only) |
        | `m02-platform/` | M2 — Platform Bootstrap |
        | `m03-authentication/` | M3 — Authentication |
        | `m04-property-search/` | M4 — Property Search & Sync |
        | `m05-profile/` | M5 — User Profile |
        | `m06-rag/` | M6 — Embeddings & RAG |
        | `m07-ai-chat/` | M7 — AI Chat |
        | `m08-recommendations/` | M8 — Recommendations |
        | `m09-booking/` | M9 — Booking & Notifications |
        | `m10-quality/` | M10 — Quality & E2E |
        | `m11-staging-gcp/` | M11 — Staging on GCP |
        | `m12-production/` | M12 — Production Release |

        ## Dependency Graph (milestones)

        ```mermaid
        flowchart LR
            M0[M0 Done] --> M1[M1 SDD]
            M1 --> M2[M2 Platform]
            M2 --> M3[M3 Auth]
            M3 --> M4[M4 Search]
            M3 --> M5[M5 Profile]
            M4 --> M6[M6 RAG]
            M4 --> M7[M7 Chat]
            M5 --> M7
            M6 --> M7
            M4 --> M8[M8 Recs]
            M5 --> M8
            M4 --> M9[M9 Booking]
            M7 --> M10[M10 Quality]
            M9 --> M10
            M10 --> M11[M11 Staging]
            M11 --> M12[M12 Prod]
        ```

        ## Critical Path (suggested)

        1. Complete **M1** `authentication` + `property_search` SDD first (gates M2 backend).
        2. **M2-PLT002** → **M2-PLT007** (platform).
        3. **M3** auth vertical slice.
        4. **M4** search (enables M6, M8, M9).
        5. **M6** RAG before **M7** chat.
        6. **M10** → **M11** → **M12**.

        ## All Tasks by Folder

        """
    ).replace("        ", "")
    content += "\n\n".join(sections)
    content += """

## Related

- [Master Execution Plan](./master_execution_plan.md)
- [Roadmap](./roadmap.md)
- [Mobile bootstrap report](./mobile_platform_bootstrap_completion_report.md)
"""
    (ROOT / "README.md").write_text(content)


def main() -> None:
    tasks = all_tasks()
    by_id = {t["id"]: t for t in tasks}
    write_tasks_data(tasks)

    # Patch generate_task_files dep links
    import generate_task_files as gen

    def dep_list(deps: list[str]) -> str:
        if not deps:
            return "- None"
        lines = []
        for d in deps:
            if d == "M0":
                lines.append("- M0 (architecture baseline — no task file)")
                continue
            ref = by_id.get(d)
            if ref:
                folder = ref["folder"]
                lines.append(
                    f"- [{d}](../{folder}/{d.lower()}.md)"
                )
            else:
                lines.append(f"- `{d}`")
        return "\n".join(lines)

    gen.dep_list = dep_list  # type: ignore[attr-defined]
    gen.write_tasks(tasks)

    by_folder: dict[str, list[dict]] = {}
    for t in tasks:
        by_folder.setdefault(t["folder"], []).append(t)

    write_readme(tasks, by_folder)
    print(f"Registry: {len(tasks)} tasks")
    print(f"Generated markdown in {ROOT}")


if __name__ == "__main__":
    main()
