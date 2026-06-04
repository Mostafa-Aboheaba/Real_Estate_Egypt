# M4 Property Search — Completion Report

**Date:** 2026-06-03  
**Milestone:** M4 — Property Search & Listing Sync

## Summary

M4 delivers property listing sync (Shaety mock adapter), full-text search, public/guest-aware search API, admin sync status, and mobile browse/search/detail flows.

## Backend

| Task | Status |
|------|--------|
| M4-SEA001 Domain + ListingProviderPort | Done |
| M4-SEA002 Shaety adapter + mock (≥10 listings) | Done |
| M4-SEA003 Prisma property repository + upsert | Done |
| M4-SEA004 Listing sync BullMQ worker | Done (`ListingSyncProcessor`, auto-sync on empty DB) |
| M4-SEA005 tsvector + full-text search | Done (trigger migration + raw SQL search) |
| M4-SEA006 GET `/api/v1/properties` | Done (filters, sort, pagination, guest page-1) |
| M4-SEA007 GET `/api/v1/properties/:id` | Done |
| M4-SEA008 Admin sync status | Done (`GET /api/v1/admin/sync/status`) |
| M4-SEA012 Integration tests | Done (`test/properties.e2e-spec.ts`) |

### Key endpoints

- `GET /api/v1/properties` — optional JWT; guests limited to page 1 (`GuestSearchGuard`)
- `GET /api/v1/properties/:id` — active listing detail
- `GET /api/v1/admin/sync/status` — admin/agent roles

### Run locally

```bash
cd backend
docker compose up -d postgres redis
npx prisma migrate deploy
npm run start:dev
# First boot enqueues Shaety sync if no listings; or:
npm run worker:dev   # listing sync processor (WorkerModule + PropertiesModule)
```

Verify:

```bash
curl 'http://localhost:3000/api/v1/properties?page=1&pageSize=5'
curl 'http://localhost:3000/api/v1/properties/<uuid>'
```

## Mobile

| Task | Status |
|------|--------|
| M4-SEA009 Search screen + list | Done |
| M4-SEA010 Filters bottom sheet | Done |
| M4-SEA011 Listing detail | Done |
| Guest browse routes | Done (home, search, `/properties/:id` public) |
| Widget test | Done (`test/features/property_search/search_page_test.dart`) |

### Run

```bash
cd mobile
flutter run --flavor dev -t lib/main_dev.dart
# Home → Browse properties (guest OK)
```

## Tests

```bash
cd backend && npm test && npm run test:e2e
cd mobile && flutter test test/features/property_search/
```

## Notes

- Shaety **live API** requires credentials; dev uses `mock-listings.json` (12 listings).
- Semantic/pgvector search param deferred (P1); keyword uses `search_vector`.
- Guest page 2+ requires sign-in (API + mobile snackbar).
