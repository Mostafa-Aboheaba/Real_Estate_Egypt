# Implementation Tasks — Property Search

## Document Status

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Status | Draft |
| Approval | Pending PO / Tech Lead / QA |

Implementation is **blocked** until this feature SDD is approved.

---

## Task list

| Order | Task ID | Title | Est. |
|-------|---------|-------|------|
| 1 | [M4-SEA001](../../tasks/m04-property-search/m4-sea001.md) | Listing Provider Port + Property Domain | 3h |
| 2 | [M4-SEA002](../../tasks/m04-property-search/m4-sea002.md) | Shaety Listing Adapter (with mock fallback) | 4h |
| 3 | [M4-SEA003](../../tasks/m04-property-search/m4-sea003.md) | Properties Prisma Repository | 3h |
| 4 | [M4-SEA004](../../tasks/m04-property-search/m4-sea004.md) | Listing Sync BullMQ Worker | 4h |
| 5 | [M4-SEA005](../../tasks/m04-property-search/m4-sea005.md) | Full-Text Search (tsvector) + Query Builder | 3h |
| 6 | [M4-SEA006](../../tasks/m04-property-search/m4-sea006.md) | GET /api/v1/properties (filter, sort, paginate) | 4h |
| 7 | [M4-SEA007](../../tasks/m04-property-search/m4-sea007.md) | GET /api/v1/properties/:id | 2h |
| 8 | [M4-SEA008](../../tasks/m04-property-search/m4-sea008.md) | Admin Sync Status Endpoint | 2h |
| 9 | [M4-SEA009](../../tasks/m04-property-search/m4-sea009.md) | Mobile Search Screen + Results List | 4h |
| 10 | [M4-SEA010](../../tasks/m04-property-search/m4-sea010.md) | Mobile Filters Bottom Sheet | 3h |
| 11 | [M4-SEA011](../../tasks/m04-property-search/m4-sea011.md) | Mobile Listing Detail Screen | 4h |
| 12 | [M4-SEA012](../../tasks/m04-property-search/m4-sea012.md) | Property Search Integration Test Pack | 3h |

**Prerequisites:** M2-PLT002–003 (NestJS + Prisma), M2-PLT007 (BullMQ), M3-AUTH008 (RBAC guards).

**Milestone:** M4 — Property Search & Listing Sync.

---

## SDD traceability

| Task | SDD artifacts |
|------|----------------|
| M4-SEA001–003 | [data_model.md](./data_model.md), [architecture.md](./architecture.md) |
| M4-SEA004–005 | [architecture.md](./architecture.md), [requirements.md](./requirements.md) FR-SYNC-* |
| M4-SEA006–008 | [api_design.md](./api_design.md) |
| M4-SEA009–011 | [user_stories.md](./user_stories.md), [acceptance_criteria.md](./acceptance_criteria.md) |
| M4-SEA012 | [tests.md](./tests.md) |

---

## Related documents

- [tests.md](./tests.md)
- [api_design.md](./api_design.md)
