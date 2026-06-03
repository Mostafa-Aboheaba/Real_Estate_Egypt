# Sprint 001 — Implementation Plan

> **Status:** Implemented (2026-06-03) — SDD artifacts written; pending PO/Tech/QA sign-off in [m1_approval_signoff.md](./m1_approval_signoff.md).  
> **Scope:** Specification documents only (Milestone 1). No `backend/` or `mobile/` feature code.

---

## 1. Executive summary

Sprint 001 completes **Milestone 1 (SDD Completion Gate)** by producing **36 new feature spec files**, **4 cross-cutting task/architecture docs**, and **updates to 8 existing README/index files**. All content is derived from existing sources:

| Source | Role |
|--------|------|
| [specs/vision.md](../specs/vision.md) | Product scope, personas, success metrics |
| [specs/requirements.md](../specs/requirements.md) | Authoritative FR-*, NFR-*, constraints, open items |
| [specs/user_stories_index.md](../specs/user_stories_index.md) | Cross-feature story index |
| [architecture/*.md](../architecture/) | Stack, schema, modules, RAG, Gemini, providers |
| [features/*/user_stories.md](../features/) | Per-feature stories (✅ exist) |
| [features/*/acceptance_criteria.md](../features/) | Per-feature AC (✅ exist) |
| [tasks/sprint_001.md](./sprint_001.md) | 74 micro-tasks, phase order, DoD |

**Estimated delivery:** 6 phases of spec writing + closeout (~70h), executed in **7 batches** after approval (see §5).

---

## 2. Current state (gap analysis)

| Asset | Exists | Missing |
|-------|--------|---------|
| Product vision + SRS | ✅ | PO/Tech/QA signatures pending |
| Architecture (13 docs) | ✅ | `api_conventions.md` |
| Feature user stories (6) | ✅ | — |
| Feature acceptance criteria (6) | ✅ | — |
| Feature requirements (6) | ❌ | 6 files |
| Feature architecture (6) | ❌ | 6 files |
| Feature data_model (6) | ❌ | 6 files |
| Feature api_design (6) | ❌ | 6 files |
| Feature tests (6) | ❌ | 6 files |
| Feature implementation_tasks (6) | ❌ | 6 files |
| Traceability matrix | ❌ | P0 rows for ~70 stories |
| SDD templates checklist | ❌ | — |
| M1 approval record | ❌ | — |

**Known doc drift to fix during sprint:**

- [features/property_search/README.md](../features/property_search/README.md) — mentions Elasticsearch (contradicts SRS + pgvector).
- [features/ai_chat/README.md](../features/ai_chat/README.md) — traceability cites `FR-003` (should be `FR-CHAT-*`).

**P0 story counts (for traceability workload):**

| Feature | P0 stories (approx.) | P0 AC |
|---------|----------------------|-------|
| authentication | 12 | 12 |
| property_search | 13 | 13 |
| profile | 8 | 8 |
| ai_chat | 12 | 12 |
| recommendation | 8 | 8 |
| booking | 9 | 9 |

---

## 3. Implementation approach

### 3.1 Principles

1. **SRS is source of truth** for FR/NFR IDs; stories/AC must map 1:1 for P0.
2. **Architecture docs are source of truth** for stack, schema, module boundaries — feature specs reference, not redefine.
3. **api_conventions.md first** — all `api_design.md` files link to it (S1-002 before feature APIs).
4. **authentication → property_search first** — gates M2 backend per master plan.
5. **Each artifact uses a standard template** ([sdd_artifact_checklist.md](./sdd_artifact_checklist.md) — created in Phase 0).
6. **implementation_tasks.md** references existing `tasks/m03-*` … `m09-*` registry IDs (no new code tasks invented ad hoc).

### 3.2 Notifications scope decision (for approval)

| Option | Recommendation |
|--------|----------------|
| A. FR-NOTIF in `booking/*` only | **Default** — fewer folders; `booking/api_design.md` § Notifications |
| B. New `features/notifications/` | Use if PO wants separate bounded context doc |

**Plan assumes Option A** unless you prefer B.

### 3.3 Open SRS items (§9) — resolution in specs

| # | Resolution in sprint artifact |
|---|-------------------------------|
| 1 | Shaety credentials | `property_search/requirements.md` — MVP mock adapter + ASM-001 |
| 2 | Gemini model per agent | `ai_chat/architecture.md` — default `gemini-2.0-flash`, pro for advisor TBD |
| 3 | Maps provider | `property_search/requirements.md` — P1 geo; Google Maps assumed |
| 4 | Email/push provider | `booking/architecture.md` — SendGrid + FCM/APNs abstracted |
| 5 | Event bus | `authentication/architecture.md` — in-process events MVP |
| 6 | Agent booking quota | `booking/requirements.md` — hard block at 5 (FR-BOOK-009 P1) |

---

## 4. Artifact content outlines (what each file will contain)

### 4.1 `requirements.md` (per feature)

- Document status, version, approval table
- Purpose & scope (in / out)
- Personas & roles
- Functional requirements table (FR-* from SRS, P0/P1)
- User story → FR traceability table
- NFRs applicable to feature
- Dependencies & assumptions
- Open questions (empty or owned)

### 4.2 `architecture.md` (per feature)

- Backend: NestJS module name, use cases, ports, adapters
- Links: [backend_architecture.md](../architecture/backend_architecture.md), [clean_architecture.md](../architecture/clean_architecture.md)
- Mobile: feature folder structure under `mobile/lib/features/<name>/`
- Links: [flutter_architecture.md](../architecture/flutter_architecture.md)
- Cross-cutting: queues, cache, external services
- Mermaid diagram(s) where helpful

### 4.3 `data_model.md` (per feature)

- Domain entities, VOs, enums
- Aggregates & invariants
- Prisma table mapping → [postgresql_schema.md](../architecture/postgresql_schema.md)
- Indexes, FKs, soft-delete rules
- Migration notes (if any field not yet in global schema)

### 4.4 `api_design.md` (per feature)

- Link to [api_conventions.md](../architecture/api_conventions.md)
- Endpoint table: method, path, auth, roles
- Request/response JSON examples (P0 only)
- Error codes per endpoint
- SSE section (ai_chat only)
- Admin/sync endpoints (property_search)

### 4.5 `tests.md` (per feature)

- Test ID convention: `<FEAT>-T-###`
- Unit (domain), integration (API), E2E/mobile tables
- AC-ID → Test-ID mapping (100% P0)
- Compliance section (ai_chat: fair housing + PII; recommendation: non-discrimination; auth/profile: PDPL)

### 4.6 `implementation_tasks.md` (per feature)

- Ordered list of tasks with links to `tasks/m0X-*/*.md`
- Each chunk ≤4h, matches registry
- Prerequisites & approval gate reminder

---

## 5. Execution batches (after approval)

Execute in order; batches can be separate PRs or one doc PR per your preference.

| Batch | Sprint phase | Tasks | Deliverables |
|-------|--------------|-------|--------------|
| **0** | Phase 0 | S1-001 – S1-005 | Cross-cutting docs + README fixes |
| **1** | Phase 1 | S1-010 – S1-022 | `features/authentication/*` (6 artifacts) + README |
| **2** | Phase 2 | S1-030 – S1-043 | `features/property_search/*` (6 artifacts) + README |
| **3a** | Phase 3 | S1-050 – S1-058 | `features/profile/*` |
| **3b** | Phase 4 | S1-060 – S1-072 | `features/ai_chat/*` |
| **3c** | Phase 6 | S1-090 – S1-101 | `features/booking/*` (+ FR-NOTIF) |
| **3d** | Phase 5 | S1-080 – S1-088 | `features/recommendation/*` (after profile) |
| **4** | Phase 7 | S1-110 – S1-115 | Traceability fill, reviews, sign-off |

**Parallelization after Batch 2:** 3a, 3b, 3c in parallel; 3d after 3a.

---

## 6. Files to create (42 new)

### 6.1 Cross-cutting / tasks (4)

| File | Batch | Purpose |
|------|-------|---------|
| `architecture/api_conventions.md` | 0 | Global REST conventions |
| `tasks/sdd_artifact_checklist.md` | 0 | Required headings per artifact |
| `tasks/traceability_matrix.md` | 0 | Template + filled P0 rows (incremental) |
| `tasks/m1_approval_signoff.md` | 4 | PO / Tech Lead / QA signatures per feature |

### 6.2 Feature artifacts (36)

| Feature | requirements | architecture | data_model | api_design | tests | implementation_tasks |
|---------|:------------:|:------------:|:----------:|:----------:|:-----:|:--------------------:|
| authentication | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| property_search | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| profile | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| ai_chat | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| recommendation | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| booking | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

Full paths pattern: `features/<feature>/<artifact>.md`

---

## 7. Files to update (10)

| File | Batch | Changes |
|------|-------|---------|
| `features/authentication/README.md` | 1 | SDD table ✅ all rows; approval table |
| `features/property_search/README.md` | 0+2 | Remove Elasticsearch; pgvector/tsvector; SDD ✅ |
| `features/profile/README.md` | 3a | SDD ✅; traceability FR-PROF-* |
| `features/ai_chat/README.md` | 3b | Fix FR-003 → FR-CHAT-*; SDD ✅; agent list align SRS |
| `features/recommendation/README.md` | 3d | SDD ✅ |
| `features/booking/README.md` | 3c | SDD ✅; note FR-NOTIF coverage |
| `docs/README.md` | 0 | Link `architecture/api_conventions.md` |
| `architecture/system_design.md` | 0 | Add row in architecture table → api_conventions |
| `tasks/README.md` | 4 | Sprint 001 progress note |
| `tasks/m01-sdd/*.md` (30 files) | 4 | Status `pending` → `done` per feature (optional metadata) |

**Explicitly not updating in this sprint:**

- `specs/requirements.md` (baseline — only reference)
- `architecture/postgresql_schema.md` (reference — feature data_models align to it)
- `mobile/**`, `backend/**` (no code)
- `tasks/sprint_001.md` (frozen plan)

---

## 8. Verification plan (post-implementation)

| Check | Command / method |
|-------|------------------|
| All 36 artifacts exist | `find features -name 'requirements.md' \| wc -l` → 6, etc. |
| No Elasticsearch in property_search | `rg -i elasticsearch features/property_search/` → 0 |
| api_conventions linked | `rg 'api_conventions' features/*/api_design.md` → 6 hits |
| P0 traceability | `tasks/traceability_matrix.md` — no empty FR column for P0 |
| Fair housing tests | `rg -i 'fair housing' features/ai_chat/tests.md features/recommendation/tests.md` |
| PDPL tests | `rg -i 'consent\|erasure\|PDPL' features/authentication/tests.md features/profile/tests.md` |
| README SDD tables | Manual: 6 READMEs all ✅ |
| M1 DoD | [master_execution_plan.md](./master_execution_plan.md) § M1 checklist |

---

## 9. Risks & mitigations

| Risk | Mitigation |
|------|------------|
| Large doc PR hard to review | One PR per batch (0, 1, 2, 3a–d, 4) |
| Schema drift vs data_model | Batch 4 includes S1-112 cross-check task |
| AI agent count mismatch (README vs SRS) | Align to **4 agents** in seed + SRS FR-CHAT-003 note in ai_chat requirements |
| Scope creep into code | Agent mode instruction: markdown only until S1-115 |

---

## 10. Approval request

Please confirm:

- [ ] **Approve full plan** — proceed with Batch 0 → 4 in order
- [ ] **Approve phased** — specify which batch(es) to implement first (e.g. Batch 0 + 1 only)
- [ ] **Notifications:** Option A (booking owns FR-NOTIF) or Option B (separate `features/notifications/`)
- [ ] **PR strategy:** single doc PR vs one PR per batch

**Reply with:** `Approved` + any adjustments, or list changes. Implementation of markdown artifacts will start only after your confirmation.

---

## 11. Related documents

| Document | Path |
|----------|------|
| Sprint task breakdown | [sprint_001.md](./sprint_001.md) |
| Master plan M1 | [master_execution_plan.md](./master_execution_plan.md) |
| M1 registry | [m01-sdd/](./m01-sdd/) |
