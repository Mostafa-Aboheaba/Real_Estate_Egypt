# API Conventions

> Global REST conventions for AI Property Assistant — all feature `api_design.md` files MUST comply.

## Document Status

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Status | Draft |
| Last Updated | 2026-06-03 |
| Traces to | NFR-MAINT-005, NFR-SEC-008, NFR-UX-007 |

---

## 1. Base URL and versioning

| Rule | Value |
|------|-------|
| Base path | `/api/v1` |
| Breaking changes | New major version (`/api/v2`) — no breaking changes within v1 |
| Content-Type | `application/json; charset=utf-8` |
| HTTPS | Required in staging and production (NFR-SEC-001) |

---

## 2. Authentication

| Header | Usage |
|--------|--------|
| `Authorization` | `Bearer <access_token>` on protected routes |
| Guest access | Omit header; only endpoints marked `auth: none` |

| Token | Lifetime | Notes |
|-------|----------|-------|
| Access JWT | ≤ 15 minutes | NFR-SEC-003 |
| Refresh token | 7 days | Rotated on every use; previous invalidated |

---

## 3. Locale and language

| Header | Priority | Values |
|--------|----------|--------|
| `Accept-Language` | Preferred | `ar-EG`, `en` |
| `X-Locale` | Fallback if `Accept-Language` absent | `ar-EG`, `en` |

- Error `message` and user-facing `details` MUST be returned in the requested locale when translations exist (NFR-UX-007).
- Listing content language follows provider data (ASM-013).

---

## 4. Pagination

Query parameters (list endpoints):

| Param | Type | Default | Max |
|-------|------|---------|-----|
| `page` | integer ≥ 1 | `1` | — |
| `pageSize` | integer | `20` | `50` |

Response envelope:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 142,
    "totalPages": 8
  }
}
```

---

## 5. Error envelope

All non-2xx responses use:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable summary",
    "details": [{ "field": "email", "reason": "invalid_format" }],
    "correlationId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

| HTTP | `code` | When |
|------|--------|------|
| 400 | `VALIDATION_ERROR` | Invalid input |
| 401 | `UNAUTHORIZED` | Missing/invalid/expired token |
| 403 | `FORBIDDEN` | Valid token, insufficient role |
| 404 | `NOT_FOUND` | Resource missing or soft-deleted |
| 409 | `CONFLICT` | Duplicate email, double-booking, etc. |
| 429 | `RATE_LIMITED` | Auth or AI quota exceeded |
| 500 | `INTERNAL_ERROR` | Unhandled server error |

**Security:** Login failures return generic `INVALID_CREDENTIALS` (no email-exists leak).

---

## 6. Dates and times

| Rule | Format |
|------|--------|
| API wire format | ISO-8601 UTC (`2026-06-03T14:30:00.000Z`) |
| Display default TZ | `Africa/Cairo` for Egypt users |
| Booking slots | Store UTC; convert in mobile UI |

---

## 7. Idempotency

| Endpoint family | Header | Behavior |
|-----------------|--------|----------|
| `POST /favorites` | `Idempotency-Key: <uuid>` | Same key → same result, no duplicate row |
| `POST /bookings` | `Idempotency-Key: <uuid>` | Prevents duplicate requests on retry |

---

## 8. Correlation ID

- Server accepts `X-Correlation-Id` or generates UUID per request.
- Returned in error envelope and structured logs (NFR-OBS-001).

---

## 9. Rate limiting

| Scope | Limit | Response |
|-------|-------|----------|
| Auth endpoints `/auth/*` | 10 req/min per IP | 429 `RATE_LIMITED` |
| AI chat messages | 30 req/min per user | 429 |
| AI daily quota (P1) | 10 messages/day | 429 `AI_QUOTA_EXCEEDED` |

`Retry-After` header included on 429 when applicable.

---

## 10. Related documents

| Document | Path |
|----------|------|
| SRS | [specs/requirements.md](../specs/requirements.md) |
| Backend architecture | [backend_architecture.md](./backend_architecture.md) |
