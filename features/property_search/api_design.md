# API Design — Property Search & Listing Sync

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
| GET | `/api/v1/properties` | Optional | — | Search with filters, sort, pagination |
| GET | `/api/v1/properties/:id` | Optional | — | Active listing detail |
| GET | `/api/v1/admin/sync/status` | Bearer | `admin`, `agent` | Per-provider sync health |
| POST | `/api/v1/admin/sync/:provider/trigger` | Bearer | `admin` | Manual sync enqueue (P1) |

Guest access: first page of `GET /properties` without token (FR-SEARCH-016). Page ≥ 2 returns `401` with `AUTH_REQUIRED` unless authenticated.

---

## 2. GET /api/v1/properties

### Query parameters

| Param | Type | Description |
|-------|------|-------------|
| `q` | string | Keyword full-text search (title, description) |
| `governorate` | string | Location filter |
| `city` | string | Location filter |
| `district` | string | Location filter |
| `minPrice` | number | EGP inclusive |
| `maxPrice` | number | EGP inclusive |
| `propertyType` | enum | apartment, villa, … |
| `listingType` | enum | `sale` \| `rent` |
| `minBedrooms` | int | |
| `maxBedrooms` | int | |
| `minBathrooms` | int | |
| `maxBathrooms` | int | |
| `minAreaSqm` | number | |
| `maxAreaSqm` | number | |
| `amenities` | string[] | Comma-separated normalized tags (P1) |
| `provider` | enum | Filter single provider |
| `sort` | enum | `price_asc`, `price_desc`, `newest`, `relevance` |
| `page` | int | Default 1 |
| `pageSize` | int | Default 20, max 50 |
| `lat`, `lng`, `radiusKm` | number | Geo-proximity (P1) |
| `semantic` | string | Semantic search via pgvector (optional) |

**Sort behavior:**

| sort | Order |
|------|-------|
| `price_asc` / `price_desc` | `price_egp` |
| `newest` | `synced_at DESC` |
| `relevance` | `ts_rank(search_vector, query)` when `q` present; else `synced_at DESC` |

### Response 200

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "3BR Apartment in Maadi",
      "priceEgp": 1500000,
      "listingType": "sale",
      "propertyType": "apartment",
      "bedrooms": 3,
      "bathrooms": 2,
      "areaSqm": 180,
      "location": {
        "governorate": "Cairo",
        "city": "Maadi",
        "district": "Degla"
      },
      "thumbnailUrl": "https://...",
      "provider": "shaety",
      "providerLabel": "Shaety — شقتي",
      "syncedAt": "2026-06-03T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 142,
    "totalPages": 8
  }
}
```

**Errors:** 400 invalid filter combination; 401 guest page 2+; 429 rate limit.

---

## 3. GET /api/v1/properties/:id

### Response 200

```json
{
  "data": {
    "id": "uuid",
    "title": "3BR Apartment in Maadi",
    "description": "...",
    "priceEgp": 1500000,
    "listingType": "sale",
    "propertyType": "apartment",
    "bedrooms": 3,
    "bathrooms": 2,
    "areaSqm": 180,
    "location": {
      "governorate": "Cairo",
      "city": "Maadi",
      "district": "Degla",
      "latitude": 29.96,
      "longitude": 31.27
    },
    "amenities": ["parking", "elevator"],
    "images": ["https://..."],
    "provider": "shaety",
    "providerLabel": "Shaety — شقتي",
    "sourceUrl": "https://shaety.example/listing/123",
    "syncedAt": "2026-06-03T10:00:00Z",
    "isActive": true
  }
}
```

**Errors:** 404 `LISTING_NOT_FOUND` for unknown id or inactive listing.

---

## 4. GET /api/v1/admin/sync/status

**Auth:** Bearer; roles `admin` or `agent`.

### Response 200

```json
{
  "data": {
    "providers": [
      {
        "provider": "shaety",
        "status": "healthy",
        "lastRunAt": "2026-06-03T10:15:00Z",
        "lastSuccessAt": "2026-06-03T10:15:00Z",
        "listingCount": 1250,
        "activeListingCount": 1180,
        "errorCount": 0,
        "consecutiveFailures": 0,
        "lastError": null
      },
      {
        "provider": "aqarmap",
        "status": "degraded",
        "lastRunAt": "2026-06-03T09:00:00Z",
        "lastSuccessAt": "2026-06-02T18:00:00Z",
        "listingCount": 0,
        "activeListingCount": 0,
        "errorCount": 2,
        "consecutiveFailures": 2,
        "lastError": "HTTP 503 from provider"
      }
    ],
    "generatedAt": "2026-06-03T10:20:00Z"
  }
}
```

**Status values:** `healthy` (last run success within SLA), `degraded` (failures < 3 or stale data), `failed` (≥ 3 consecutive failures).

**Errors:** 403 for `buyer` / guest.

---

## 5. POST /api/v1/admin/sync/:provider/trigger (P1)

**Auth:** Bearer; role `admin` only.

`:provider` — `shaety` \| `aqarmap` \| `property_finder`.

### Response 202

```json
{
  "data": {
    "jobId": "bullmq-job-id",
    "provider": "shaety",
    "enqueuedAt": "2026-06-03T10:21:00Z",
    "message": "sync_job_enqueued"
  }
}
```

**Errors:** 403 non-admin; 400 unknown provider; 409 job already running for provider.

---

## 6. RBAC summary

| Endpoint | Guest | buyer | agent | admin |
|----------|-------|-------|-------|-------|
| GET /properties (page 1) | ✅ | ✅ | ✅ | ✅ |
| GET /properties (page 2+) | ❌ | ✅ | ✅ | ✅ |
| GET /properties/:id | ✅ | ✅ | ✅ | ✅ |
| GET /admin/sync/status | ❌ | ❌ | ✅ | ✅ |
| POST /admin/sync/.../trigger | ❌ | ❌ | ❌ | ✅ |

---

## Related documents

- [acceptance_criteria.md](./acceptance_criteria.md)
- [tests.md](./tests.md)
