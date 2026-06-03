# API Design — Profile & Preferences

## Document Status

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Status | Draft |
| Last Updated | 2026-06-03 |
| Conventions | [api_conventions.md](../../architecture/api_conventions.md) |

All paths prefixed with `/api/v1`. Responses use standard `{ "data": ... }` envelope per conventions.

---

## 1. Endpoint summary

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| GET | `/users/me` | Bearer | buyer, agent, admin | Current user profile |
| PATCH | `/users/me` | Bearer | buyer, agent, admin | Partial profile update |
| PATCH | `/users/me/preferences` | Bearer | buyer, agent | Search preferences only |
| GET | `/users/me/favorites` | Bearer | buyer, agent | Paginated favorites |
| POST | `/users/me/favorites/:propertyId` | Bearer | buyer, agent | Add favorite (idempotent) |
| DELETE | `/users/me/favorites/:propertyId` | Bearer | buyer, agent | Remove favorite |
| DELETE | `/users/me` | Bearer | all | Account deletion |
| POST | `/users/me/export` | Bearer | all | Request PDPL data export (P1) |
| GET | `/agents/:id` | Optional | — | Public agent profile card |
| GET | `/notifications/preferences` | Bearer | all | Notification prefs (Notifications module) |
| PATCH | `/notifications/preferences` | Bearer | all | Update notification prefs |

---

## 2. GET /users/me

**Auth:** Bearer access token.

**Response 200:**

```json
{
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "buyer",
    "name": "Ahmed Hassan",
    "phone": "+201012345678",
    "locale": "ar-EG",
    "avatarUrl": "https://cdn.example.com/avatars/uuid.jpg",
    "preferredAgentId": "buying-advisor",
    "searchPreferences": {
      "listingType": "rent",
      "minPriceEgp": 8000,
      "maxPriceEgp": 15000,
      "propertyTypes": ["apartment"],
      "cities": ["Cairo"]
    },
    "agentProfile": null,
    "emailVerified": true,
    "createdAt": "2026-06-01T10:00:00.000Z"
  }
}
```

When `role = agent`, `agentProfile` is populated. Buyers receive `agentProfile: null`.

**Errors:** 401 `UNAUTHORIZED`, 404 `NOT_FOUND` (soft-deleted user).

---

## 3. PATCH /users/me

Partial update — only supplied fields are changed.

**Request (examples):**

```json
{ "name": "Ahmed Hassan", "phone": "+201012345678" }
```

```json
{ "locale": "en" }
```

```json
{
  "preferredAgentId": "buying-advisor",
  "searchPreferences": {
    "listingType": "rent",
    "maxPriceEgp": 15000,
    "propertyTypes": ["apartment"],
    "cities": ["Cairo"]
  }
}
```

```json
{
  "agentProfile": {
    "bio": { "en": "Cairo specialist.", "ar": "..." },
    "serviceAreas": ["Cairo", "Giza"],
    "photoUrl": "https://cdn.example.com/agents/photo.jpg"
  }
}
```

**Response 200:** Same shape as GET /users/me.

**Errors:**

| HTTP | code | When |
|------|------|------|
| 400 | `VALIDATION_ERROR` | Invalid phone, bio length, budget range |
| 400 | `INVALID_AGENT_ID` | `preferredAgentId` not in catalog |
| 403 | `FORBIDDEN` | Non-agent sets `agentProfile` |
| 401 | `UNAUTHORIZED` | Missing token |

---

## 4. PATCH /users/me/preferences

Convenience alias for search-preferences-only updates. Same validation as `searchPreferences` in PATCH /users/me.

**Request:**

```json
{
  "listingType": "rent",
  "minPriceEgp": 8000,
  "maxPriceEgp": 15000,
  "propertyTypes": ["apartment"],
  "cities": ["Cairo", "New Cairo"]
}
```

**Response 200:**

```json
{
  "data": {
    "searchPreferences": { "...": "..." }
  }
}
```

---

## 5. Favorites CRUD

### 5.1 GET /users/me/favorites

**Query params:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | int | 1 | Page number |
| `limit` | int | 20 | Max 50 |

**Response 200:**

```json
{
  "data": {
    "items": [
      {
        "id": "favorite-uuid",
        "propertyId": "property-uuid",
        "createdAt": "2026-06-02T08:00:00.000Z",
        "property": {
          "id": "property-uuid",
          "title": "2BR Apartment in New Cairo",
          "priceEgp": 12000,
          "listingType": "rent",
          "location": { "city": "New Cairo", "governorate": "Cairo" },
          "thumbnailUrl": "https://...",
          "isActive": true
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 25,
      "hasMore": true
    }
  }
}
```

### 5.2 POST /users/me/favorites/:propertyId

**Headers:** `Idempotency-Key: <uuid>` (recommended per [api_conventions.md §7](../../architecture/api_conventions.md)).

**Response 201:** Favorite object (created).  
**Response 200:** Favorite object (already exists — idempotent).

**Errors:** 404 `NOT_FOUND` (property missing or inactive), 401 `UNAUTHORIZED`.

### 5.3 DELETE /users/me/favorites/:propertyId

**Response 204** No body.

**Errors:** 404 if favorite not found.

---

## 6. GET /agents/:id

Public agent profile card. `:id` is the agent's user UUID.

**Auth:** Optional (guests may view when linked from booking).

**Response 200:**

```json
{
  "data": {
    "id": "agent-user-uuid",
    "name": "Sara Mohamed",
    "photoUrl": "https://cdn.example.com/agents/sara.jpg",
    "phone": "+201098765432",
    "bio": "Licensed agent specializing in New Cairo compounds.",
    "serviceAreas": ["Cairo", "New Cairo", "Giza"],
    "languages": ["ar-EG", "en"]
  }
}
```

Bio and name resolved using `Accept-Language` header.

**Errors:** 404 `NOT_FOUND` (user not found, not an agent, or soft-deleted).

---

## 7. DELETE /users/me

PDPL right to erasure.

**Request:**

```json
{
  "password": "currentPassword",
  "confirm": true
}
```

OAuth-only users omit `password`; server validates session recency instead.

**Response 204** No body. All refresh tokens revoked; user logged out.

**Side effects:**

- Sets `users.deleted_at`
- Cancels active bookings (event → BookingsModule)
- Schedules PII purge job (≤ 30 days)

**Errors:** 400 `VALIDATION_ERROR` (missing confirm), 401 `INVALID_CREDENTIALS`.

---

## 8. POST /users/me/export (P1)

**Response 202:**

```json
{
  "data": {
    "requestId": "uuid",
    "status": "queued",
    "estimatedDeliveryHours": 72
  }
}
```

Export bundle (JSON) includes: profile, favorites IDs, search preferences, booking history metadata, chat session metadata — not full AI prompt content (AC-PROF-009).

---

## 9. Notification preferences (reference)

Profile settings UI calls Notifications module:

**PATCH /notifications/preferences**

```json
{
  "push": { "bookingUpdates": false, "recommendations": true },
  "email": { "bookingUpdates": true, "marketing": false }
}
```

See notifications feature SDD for full schema.

---

## Related documents

- [acceptance_criteria.md](./acceptance_criteria.md)
- [data_model.md](./data_model.md)
- [tests.md](./tests.md)
