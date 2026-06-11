# Milestone 7.5 — GenUI Completion Report (Validation)

**Date:** 2026-06-11  
**Milestone ID:** M75 (M7.5 — Generative Chat UI)  
**Validator:** Automated + code review  
**Overall verdict:** **Conditionally complete** — core GenUI path is implemented and unit-tested; several acceptance criteria are partial and one e2e test fails without seeded listings.

---

## Executive summary

M7.5 delivers server-built A2UI surfaces in AI chat: `a2ui_surface` SSE events, `ui_surface` persistence on messages, Flutter GenUI catalog rendering via `A2uiSurfaceView`, and backend safety allowlisting. All **8 task files** are marked `done` in [`PROJECT_STATUS.md`](../PROJECT_STATUS.md) (99/141 tasks, **70.2%** overall).

The **primary user journey** (search query → conversational text + property carousel when listings exist and `GENUI_ENABLED=true`) is implemented. Documentation, extended catalog widgets, interaction loops, and full P0 test coverage remain **gaps** documented below.

| Area | Result |
|------|--------|
| Task registry (8/8 done) | Pass |
| Core implementation | Pass |
| Acceptance criteria (strict) | **Partial** (see §2) |
| Unit tests | Pass (10 backend + 1 mobile) |
| E2E tests | **Fail** (empty listing DB in test env) |
| Architecture compliance | **Mostly aligned** with documented deviations |
| CI integration | Partial (unit only; no GenUI e2e in workflow) |

---

## 1. Scope delivered

### Backend

| Deliverable | Status | Location |
|-------------|--------|----------|
| A2UI surface builder (`PropertyCarousel`) | Done | `backend/src/application/chat/a2ui-surface-builder.service.ts` |
| Catalog allowlist constants | Done | `backend/src/application/chat/a2ui-catalog.constants.ts` |
| A2UI safety validator | Done | `backend/src/application/chat/a2ui-safety.validator.ts` |
| SSE `a2ui_surface` chunk type | Done | `backend/src/domain/chat/ports/llm-completion.port.ts` |
| Orchestrator emission + `GENUI_ENABLED` flag | Done | `backend/src/infrastructure/ai/gemini-orchestrator.service.ts` |
| `ui_surface` DB column + migration | Done | `backend/prisma/schema.prisma`, migration `20250611120000_add_message_ui_surface` |
| Chat service stream + persist `uiSurface` | Done | `backend/src/application/chat/chat.service.ts` |

### Mobile

| Deliverable | Status | Location |
|-------------|--------|----------|
| `genui` + `genai_primitives` dependencies | Done | `mobile/pubspec.yaml` |
| Property assistant catalog | Done | `mobile/lib/features/ai_chat/genui/property_assistant_catalog.dart` |
| A2UI surface renderer | Done | `mobile/lib/features/ai_chat/genui/a2ui_surface_view.dart` |
| SSE `a2ui_surface` handling | Done | `mobile/lib/features/ai_chat/data/repositories/chat_repository_impl.dart` |
| Message bubble GenUI + legacy fallback | Done | `mobile/lib/features/ai_chat/presentation/widgets/message_bubble.dart` |

### Documentation

| Artifact | Status |
|----------|--------|
| `features/ai_chat/genui_design.md` | Done (marked Implemented) |
| `features/ai_chat/architecture.md` §4.1 | Done |
| `architecture/flutter_architecture.md` §10.1 | Done |
| `architecture/ai_agent_architecture.md` (GenUI node) | Done |
| `features/ai_chat/api_design.md` | **Not updated** |
| `features/ai_chat/tests.md` (GenUI P0) | **Not updated** |

---

## 2. Acceptance criteria audit (by task)

Legend: **Pass** · **Partial** · **Fail** · **N/A**

### M75-GUI001 — GenUI SDD & architecture

| Criterion | Result | Notes |
|-----------|--------|-------|
| `genui_design.md` defines catalog, SSE, server strategy | Pass | |
| Chat architecture documents GenUI layer | Pass | §4.1 in `architecture.md` |
| Flutter architecture lists `genui` deps + layout | Pass | §10.1; file layout in arch doc differs slightly from repo (`property_assistant_catalog.dart` vs `catalog.dart`) |
| Agent architecture notes GenUI per agent | Partial | Diagram shows `GenUI Surfaces` node; no per-agent surface spec |
| `api_design.md` updated | **Fail** | No `a2ui_surface` / `uiSurface` references |

### M75-GUI002 — Widget catalog

| Criterion | Result | Notes |
|-----------|--------|-------|
| Registers PropertyCard, PropertyCarousel, PrimaryButton | Pass | |
| Registers FilterChipRow, BudgetPresetRow | **Fail** | Allowed on backend; **not implemented** in mobile catalog |
| Reuses ListingCardTile patterns | Partial | Inline `_PropertyCardTile` duplicates tile logic |
| Catalog schema documented | Pass | `genui_design.md` §3 |
| ar-EG / en via AppLocalizations | **Fail** | Prices shown as raw `EGP` strings |
| Widget tests per component | Partial | Catalog registration test only |

### M75-GUI003 — Mobile GenUI integration

| Criterion | Result | Notes |
|-----------|--------|-------|
| Assistant text + GenUI Surface per message | Pass | Via `MessageBubble` + `A2uiSurfaceView` |
| `isWaiting` / progress during surface gen | **Fail** | Not implemented |
| Surface interactions → chat pipeline | **Fail** | `PrimaryButton` `onPressed` is no-op; no `onSubmit` wiring |
| Fallback to ListingCardTile without A2UI | Pass | When `uiSurface == null` |
| Widget test: text + surface from SSE | **Fail** | No chat integration widget test |

### M75-GUI004 — SSE A2UI contract

| Criterion | Result | Notes |
|-----------|--------|-------|
| `a2ui_surface` event implemented | Pass | `{ surfaceId, a2ui }` via chat service |
| `done` unchanged; legacy `listing_cards` when flag off | Pass | |
| Message list returns `uiSurface` | Pass | `StoredMessage.uiSurface` + mapper |
| Documented in `api_design.md` | **Fail** | |
| ar/en examples in API docs | **Fail** | |

### M75-GUI005 — Orchestrator A2UI emission

| Criterion | Result | Notes |
|-----------|--------|-------|
| `a2ui_surface` with PropertyCarousel after search | Pass | When listings exist |
| Gemini catalog context; mock deterministic builder | Partial | Mock uses builder; Gemini gets text context only (not A2UI JSON from model) |
| Listing IDs ⊆ tool results | Pass | `A2uiSafetyValidator` |
| Empty search → no empty carousel | Pass | Builder returns null |
| `listing_cards` until GUI006 | Partial | GUI006 disables cards when GenUI on (intended) |

### M75-GUI006 — Migrate listing cards

| Criterion | Result | Notes |
|-----------|--------|-------|
| No duplicate cards when GenUI surface present | Pass | `message_bubble.dart` |
| History reload from `uiSurface` | Pass | Remote datasource maps field |
| `GENUI_ENABLED` backend flag | Pass | `configuration.ts`, default on in dev |
| `GENUI_ENABLED` mobile flag | **Fail** | Backend-only; mobile follows API payload |
| E2E: single presentation per message | **Fail** | E2e fails without seeded properties |

### M75-GUI007 — Safety allowlist

| Criterion | Result | Notes |
|-----------|--------|-------|
| Unknown components rejected | Pass | Unit tests |
| Discriminatory filter props blocked | Partial | Key-name block list; no FilterChipRow surfaces yet |
| Property IDs validated | Pass | Unit tests |
| Extended `SafetyPipeline` | Partial | Separate `A2uiSafetyValidator` (acceptable separation) |
| Documented in `genui_design.md` | Pass | §5 |

### M75-GUI008 — P0 test pack

| Criterion | Result | Notes |
|-----------|--------|-------|
| E2E: text_delta + a2ui_surface + done (SSE) | **Fail** | No SSE stream e2e; POST-only test |
| E2E: fair housing surface blocked | **Fail** | Not implemented |
| Mobile catalog test | Pass | `genui_catalog_test.dart` |
| `tests.md` GenUI section | **Fail** | |
| CI runs GenUI e2e on PR | **Fail** | `backend-ci.yml` runs `npm test` only |

**Strict acceptance score:** ~18 Pass · ~10 Partial · ~12 Fail (across 40 checked items)

---

## 3. Test execution results

Run on **2026-06-11**:

### Backend unit tests (pass)

```bash
npm test -- --testPathPattern="a2ui|search-intent|agent-reply"
```

| Suite | Tests | Result |
|-------|-------|--------|
| `a2ui-safety.validator.spec.ts` | 3 | Pass |
| `a2ui-surface-builder.service.spec.ts` | 1 | Pass |
| `agent-reply-composer.service.spec.ts` | 3 | Pass |
| `search-intent.parser.spec.ts` | 3 | Pass |
| **Total** | **10** | **Pass** |

### Backend e2e (fail — data dependency)

```bash
npm run test:e2e -- --testPathPattern=chat-genui
```

| Test | Result | Root cause |
|------|--------|------------|
| `POST message persists uiSurface when search runs` | **Fail** | No properties in test DB → search returns 0 listings → no `uiSurface` and no `listingRefs` |

**Note:** `chat-genui.e2e-spec.ts` sets `GENUI_ENABLED=true` but does not seed properties. Fix: seed at least one apartment in Maadi before assertion, or mock property repository.

### Mobile tests (pass)

```bash
flutter test test/features/ai_chat/
```

| Test | Result |
|------|--------|
| `genui_catalog_test.dart` — catalog registers components | Pass |

### Static analysis

```bash
dart analyze lib/features/ai_chat
```

No issues found.

---

## 4. Architecture compliance

### Aligned with design

| Principle (`genui_design.md`) | Implementation |
|------------------------------|----------------|
| Server-side A2UI generation | `A2uiSurfaceBuilderService` + orchestrator |
| A2UI v0.9 protocol | `version: 'v0.9'`, `createSurface` + `updateComponents` |
| Catalog allowlist | Backend `ALLOWED_A2UI_COMPONENTS` + mobile `Catalog` |
| SSE `a2ui_surface` event | Implemented end-to-end |
| `ui_surface` persistence | Prisma column + message entity |
| `GENUI_ENABLED` gradual rollout | Backend flag; legacy `listing_cards` when off |
| Fair housing on generated UI | ID allowlist + discriminatory key filter |
| Clean architecture (mobile) | GenUI isolated under `features/ai_chat/genui/` |
| NestJS layering | Application services; orchestrator in infrastructure |

### Deviations

| Doc reference | Actual | Severity |
|---------------|--------|----------|
| `architecture.md` file `catalog.dart`, `components/**` | Single `property_assistant_catalog.dart` | Low |
| `architecture.md` `genui_chat_controller.dart` | Logic in `A2uiSurfaceView` + `chat_provider` | Low |
| Catalog includes FilterChipRow, BudgetPresetRow | Backend allowlist only | Medium |
| `Conversation` facade (GenUI README) | Direct `SurfaceController` (valid for server-driven A2UI) | Low — intentional |
| `api_design.md` as contract source | Not updated | Medium |
| Per-agent GenUI surfaces | Only search carousel path | Low — MVP scope |

---

## 5. Runnable verification

### Prerequisites

```bash
cd backend
docker compose up -d postgres redis
npx prisma migrate deploy
# Ensure listings exist (worker sync or seed)
GENUI_ENABLED=true GEMINI_MOCK_CHAT=true npm run start:dev
```

```bash
cd mobile
flutter run -t lib/main_dev.dart
```

### Expected behavior (when DB has listings)

1. Login → Chat (Search Agent).
2. Send: `apartment in Maadi under 1 million`.
3. **Assistant:** conversational text (mock or Gemini).
4. **GenUI:** horizontal property carousel (`PropertyCarousel`).
5. **No** duplicate static listing cards below the same message (`GENUI_ENABLED=true`).
6. Reload conversation → carousel restored from `uiSurface`.

### Flag comparison

| `GENUI_ENABLED` | Backend behavior | Mobile behavior |
|-----------------|------------------|-----------------|
| `true` (dev default) | `a2ui_surface` emitted; empty `listingRefs` in response | Renders `A2uiSurfaceView` |
| `false` | `listing_cards` SSE; `listingRefs` populated | Renders `ListingCardTile` list |

---

## 6. Gaps and recommendations (post-M7.5)

| Priority | Item | Suggested action |
|----------|------|------------------|
| P0 | Failing `chat-genui.e2e-spec.ts` | Seed property fixtures in e2e `beforeAll` |
| P0 | Update `features/ai_chat/api_design.md` | Document `a2ui_surface`, `uiSurface` on messages |
| P1 | Update `features/ai_chat/tests.md` | Add GenUI P0 matrix |
| P1 | Add FilterChipRow / BudgetPresetRow to mobile catalog | Match backend allowlist |
| P1 | Wire surface `onSubmit` → chat `send()` | Complete interaction loop (GUI003) |
| P2 | SSE stream e2e for `a2ui_surface` | Extend chat e2e or integration test |
| P2 | Add `chat-genui` to `backend-ci.yml` e2e job | After fixture seeding |
| P2 | AppLocalizations for catalog labels | ar-EG / en price formatting |
| P3 | Align `architecture.md` file tree with repo | Doc-only |

---

## 7. Sign-off recommendation

| Role | Recommendation |
|------|----------------|
| **Engineering** | Accept M7.5 as **MVP complete** for search-result carousels; track §6 as M7.5 hardening backlog |
| **QA** | Manual sign-off blocked until listings synced in dev/staging |
| **Product** | GenUI fulfills “human agent + visual results” for search; filter/booking surfaces deferred |

**Milestone M75 registry status:** Complete (8/8 tasks)  
**Validation status:** **Conditionally complete** — ship with documented gaps; do not treat strict acceptance checklist as 100% green.

---

## Related documents

- [genui_design.md](../features/ai_chat/genui_design.md)
- [m075_genui_completion_report.md](./m075_genui_completion_report.md) (implementation summary)
- [PROJECT_STATUS.md](../PROJECT_STATUS.md)
- [m07_chat_completion_report.md](./m07_chat_completion_report.md)
