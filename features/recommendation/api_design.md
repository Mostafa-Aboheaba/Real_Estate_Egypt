# API Design — Recommendations

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
| GET | `/api/v1/recommendations` | Bearer (personalized) or none (popular) | `buyer`, `agent` / guest | Paginated recommendation feed |
| POST | `/api/v1/recommendations/feedback` | Bearer | `buyer`, `agent` | Record like or dislike |

Base path and error envelope follow global API conventions.

---

## 2. GET /api/v1/recommendations

Returns personalized listings for authenticated users; returns **popular listings** when unauthenticated (guest) or when user has no preference vector (cold start).

### Query parameters

| Param | Type | Default | Max | Notes |
|-------|------|---------|-----|-------|
| `page` | integer ≥ 1 | `1` | — | |
| `pageSize` | integer | `10` | `20` | AC-REC-006 default 10 |
| `refresh` | boolean | `false` | — | Bypass page-1 cache after feedback |

### Request headers

| Header | Required |
|--------|----------|
| `Authorization` | Bearer — personalized path |
| `Accept-Language` | Optional — listing i18n |

### Response 200 (personalized)

```json
{
  "data": {
    "title": "properties_you_might_like",
    "mode": "personalized",
    "items": [
      {
        "propertyId": "uuid",
        "score": 0.92,
        "reasonStub": "similar_to_liked",
        "listing": {
          "title": "3BR Apartment in Zamalek",
          "priceEgp": 14000,
          "listingType": "rent",
          "propertyType": "apartment",
          "location": { "city": "Cairo", "area": "Zamalek" },
          "thumbnailUrl": "https://..."
        }
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "totalItems": 40,
      "totalPages": 4,
      "hasNext": true
    }
  }
}
```

### Response 200 (guest / cold start)

```json
{
  "data": {
    "title": "popular_in_cairo",
    "mode": "popular",
    "items": [ "..." ],
    "pagination": { "page": 1, "pageSize": 10, "totalItems": 20, "totalPages": 2, "hasNext": true },
    "cta": {
      "messageKey": "register_for_personalized",
      "action": "navigate_register"
    }
  }
}
```

### Business rules

| Rule | FR |
|------|-----|
| Exclude disliked property IDs | FR-REC-006 |
| Exclude favorited property IDs | FR-REC-002 |
| Apply `search_preferences` SQL filters | FR-REC-005 |
| No duplicate IDs across pages for same session | FR-REC-007 |
| Minimum 5 items on first page when ≥ 5 matches exist | AC-REC-001 |

### Errors

| Status | Code | When |
|--------|------|------|
| 401 | `UNAUTHORIZED` | Invalid/expired token on optional-auth misuse |
| 403 | `EMAIL_NOT_VERIFIED` | Unverified user (if auth policy strict) |
| 429 | `RATE_LIMITED` | Guest/public abuse |
| 503 | `RECOMMENDATIONS_UNAVAILABLE` | pgvector / DB degraded |

---

## 3. POST /api/v1/recommendations/feedback

Records or updates explicit user feedback. Idempotent upsert on `(userId, propertyId)`.

### Request

```json
{
  "propertyId": "uuid",
  "sentiment": "like"
}
```

| Field | Type | Required | Values |
|-------|------|----------|--------|
| `propertyId` | UUID | yes | Active listing |
| `sentiment` | string | yes | `like` \| `dislike` |

### Response 201 (created)

```json
{
  "data": {
    "feedbackId": "uuid",
    "propertyId": "uuid",
    "sentiment": "like",
    "recorded": true
  }
}
```

### Response 200 (updated)

Same body as 201 when sentiment changed on existing row.

### Side effects

1. Upsert `listing_feedback`
2. Enqueue `recommendations.recompute-user` job
3. Invalidate Redis feed cache for user (if enabled)

### Errors

| Status | Code | When |
|--------|------|------|
| 400 | `VALIDATION_ERROR` | Invalid UUID or sentiment |
| 401 | `UNAUTHORIZED` | Missing Bearer |
| 404 | `PROPERTY_NOT_FOUND` | Inactive or unknown listing |
| 409 | — | Not used (upsert semantics) |

---

## 4. Recommendation Agent tools (internal)

Same semantics as REST; invoked from chat orchestrator.

| Tool | Maps to |
|------|---------|
| `get_recommendations` | GET `/api/v1/recommendations` (in-process use case) |
| `record_feedback` | POST `/api/v1/recommendations/feedback` |

Tool schemas: [ai_agent_architecture.md](../../architecture/ai_agent_architecture.md) §5.2.

---

## 5. RBAC and rate limits

| Route | Guard |
|-------|-------|
| GET personalized | `JwtAuthGuard` + `@Roles('buyer', 'agent')` |
| GET popular (no token) | Public; 60 req/min per IP |
| POST feedback | `JwtAuthGuard` + `@Roles('buyer', 'agent')` |

---

## Related documents

- [acceptance_criteria.md](./acceptance_criteria.md)
- [tests.md](./tests.md)
- [architecture.md](./architecture.md)
- [api_conventions.md](../../architecture/api_conventions.md)
