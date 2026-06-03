# Implementation Tasks — Recommendations

## Document Status

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Status | Draft |
| Approval | Pending PO / Tech Lead / QA |

Implementation is **blocked** until this feature SDD is approved.

---

## Prerequisites

| Milestone | Deliverable |
|-----------|-------------|
| M1 | All `features/recommendation/*` SDD artifacts approved |
| M3 | Authentication (JWT) |
| M4 | Listings + property embeddings (pgvector) |
| M5 | Profile — `search_preferences`, favorites |
| M6 | Embedding pipeline (RAG003) |

M7 (AI chat) optional for P0 cold-start path; required for P1 chat signals (FR-REC-004).

---

## Task list

| Order | Task ID | Title | Est. | Traces |
|-------|---------|-------|------|--------|
| 1 | [M8-REC001](../../tasks/m08-recommendations/m8-rec001.md) | Recommendation domain + scoring port | 3h | [data_model.md](./data_model.md), FR-REC-008 |
| 2 | [M8-REC002](../../tasks/m08-recommendations/m8-rec002.md) | User preference vector builder | 3h | FR-REC-002, FR-REC-003 |
| 3 | [M8-REC003](../../tasks/m08-recommendations/m8-rec003.md) | GET /api/v1/recommendations | 4h | FR-REC-001, FR-REC-005, FR-REC-006, FR-REC-007 |
| 4 | [M8-REC004](../../tasks/m08-recommendations/m8-rec004.md) | POST /api/v1/recommendations/feedback | 2h | FR-REC-003, FR-REC-006 |
| 5 | [M8-REC005](../../tasks/m08-recommendations/m8-rec005.md) | Mobile home recommendations section | 4h | AC-REC-001, AC-REC-009 |
| 6 | [M8-REC006](../../tasks/m08-recommendations/m8-rec006.md) | Recommendation P0 test pack | 3h | [tests.md](./tests.md) |

**Total estimate:** ~19h backend + mobile + tests.

---

## SDD authoring tasks (M1 — complete)

| Task ID | Artifact |
|---------|----------|
| [M1-REC-REQ](../../tasks/m01-sdd/m1-rec-req.md) | [requirements.md](./requirements.md) |
| [M1-REC-ARC](../../tasks/m01-sdd/m1-rec-arc.md) | [architecture.md](./architecture.md) |
| [M1-REC-DAT](../../tasks/m01-sdd/m1-rec-dat.md) | [data_model.md](./data_model.md) |
| [M1-REC-API](../../tasks/m01-sdd/m1-rec-api.md) | [api_design.md](./api_design.md) |

---

## Definition of done (M8)

- [ ] Home screen shows personalized feed for returning user with likes
- [ ] Like/dislike updates next page of recommendations
- [ ] Disliked listings never reappear (FR-REC-006)
- [ ] Budget/area preferences enforced (FR-REC-005)
- [ ] All P0 REC AC pass per [tests.md](./tests.md)
- [ ] Fair housing compliance tests green (REC-T-050–055)
- [ ] Feed works without chat history

---

## Related documents

- [tests.md](./tests.md)
- [api_design.md](./api_design.md)
- [master_execution_plan.md](../../tasks/master_execution_plan.md) — M8 section
