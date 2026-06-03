# API Design — AI Chat

## Document Status

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Status | Draft |
| Last Updated | 2026-06-03 |
| Conventions | [api_conventions.md](../../architecture/api_conventions.md) |

Base path: `/api/v1`. All endpoints require `Authorization: Bearer <access_token>` unless noted.

---

## 1. Endpoint summary

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/agents` | buyer, agent | Active agent catalog (FR-CHAT-002) |
| GET | `/conversations` | buyer, agent | List user sessions (FR-CHAT-012) |
| POST | `/conversations` | buyer, agent | Create session (FR-CHAT-012) |
| GET | `/conversations/:id` | buyer, agent | Session metadata |
| PATCH | `/conversations/:id` | buyer, agent | Update title, archive, switch agent (FR-CHAT-005) |
| DELETE | `/conversations/:id` | buyer, agent | Delete session + messages |
| GET | `/conversations/:id/messages` | buyer, agent | Paginated message history (FR-CHAT-011) |
| POST | `/conversations/:id/messages` | buyer, agent | Send message — non-streaming (FR-CHAT-001) |
| POST | `/conversations/:id/messages/stream` | buyer, agent | Send message — **SSE** stream (primary) |
| PATCH | `/admin/agents/:agentId` | admin | Enable/disable agent (FR-ADMIN-001) |

Profile default agent: `PATCH /api/v1/users/me` with `preferredAgentId` (profile feature; FR-CHAT-008).

---

## 2. GET /agents

**Response 200:**

```json
{
  "data": [
    {
      "id": "search-agent",
      "name": "Search Agent",
      "description": "Find and compare properties in natural language",
      "locale": "en",
      "isDefault": true
    }
  ]
}
```

Localized fields follow `Accept-Language` (`ar-EG`, `en`). Inactive agents omitted (FR-CHAT-009).

**Errors:** 401 unauthenticated.

---

## 3. POST /conversations

**Request:**

```json
{
  "agentId": "search-agent",
  "title": null
}
```

If `agentId` omitted, use `users.preferred_agent_id` or platform default.

**Response 201:**

```json
{
  "data": {
    "id": "uuid",
    "agentId": "search-agent",
    "title": null,
    "createdAt": "2026-06-03T10:00:00Z"
  }
}
```

**Errors:** 400 invalid agent, 401, 404 disabled agent with no fallback (should not occur if default active).

---

## 4. GET /conversations

**Query:** `?page=1&pageSize=20&archived=false`

**Response 200:**

```json
{
  "data": [
    {
      "id": "uuid",
      "agentId": "search-agent",
      "title": "Apartments in Maadi",
      "preview": "Last message snippet…",
      "lastMessageAt": "2026-06-03T09:00:00Z"
    }
  ],
  "meta": { "page": 1, "pageSize": 20, "total": 5 }
}
```

---

## 5. GET /conversations/:id/messages

**Query:** `?cursor=<messageId>&limit=50` (cursor pagination, oldest-first within page)

**Response 200:**

```json
{
  "data": [
    {
      "id": "uuid",
      "role": "user",
      "content": "Show me 3BR in New Cairo",
      "agentId": null,
      "listingRefs": [],
      "createdAt": "2026-06-03T09:00:00Z"
    },
    {
      "id": "uuid",
      "role": "assistant",
      "content": "Here are some options…",
      "agentId": "search-agent",
      "listingRefs": [{ "propertyId": "uuid", "title": "3BR New Cairo", "priceEgp": 2000000 }],
      "createdAt": "2026-06-03T09:00:05Z"
    }
  ]
}
```

**Errors:** 403/404 if conversation not owned.

---

## 6. POST /conversations/:id/messages (non-streaming)

**Request:**

```json
{
  "content": "عايز شقة للإيجار في الزمالك"
}
```

**Response 200:**

```json
{
  "data": {
    "userMessageId": "uuid",
    "assistantMessage": {
      "id": "uuid",
      "content": "…",
      "agentId": "search-agent",
      "listingRefs": [],
      "disclaimer": "AI-generated guidance — not legal or financial advice.",
      "metadata": { "toolsCalled": ["semantic_search"], "latencyMs": 1200 }
    },
    "agentSwitchedNotice": null
  }
}
```

**Errors:**

| Status | Code | When |
|--------|------|------|
| 400 | `VALIDATION_ERROR` | Empty content |
| 401 | `UNAUTHORIZED` | No token |
| 403 | `AI_QUOTA_EXCEEDED` | P1 daily limit (FR-CHAT-018) |
| 429 | `RATE_LIMITED` | 30/min per user |
| 503 | `AI_UNAVAILABLE` | Gemini down (FR-CHAT-016) |

Fair housing block: **200** with assistant refusal content (pre-call safety); no Gemini invocation.

---

## 7. POST /conversations/:id/messages/stream (SSE)

Primary path per [gemini_integration_layer.md §3.5](../../architecture/gemini_integration_layer.md).

**Request headers:**

```
Authorization: Bearer <jwt>
Content-Type: application/json
Accept: text/event-stream
```

**Request body:**

```json
{
  "content": "شقة 3 غرف في المعادي"
}
```

**Response:** `Content-Type: text/event-stream`

| Event | Data JSON | When |
|-------|-----------|------|
| `text_delta` | `{ "text": "..." }` | Incremental reply |
| `tool_call` | `{ "name": "semantic_search", "args": {} }` | Model requests tool |
| `tool_result` | `{ "name": "semantic_search", "summary": "5 listings" }` | Server executed tool |
| `listing_cards` | `{ "cards": [{ "propertyId": "uuid", "title": "…", "priceEgp": 25000 }] }` | Structured UI |
| `done` | `{ "messageId": "uuid", "agentId": "search-agent", "usage": { "promptTokens": 0, "completionTokens": 0 }, "agentSwitchedNotice": null }` | Stream complete |
| `error` | `{ "code": "AI_UNAVAILABLE", "message": "…" }` | Failure |

**Response headers:** `Cache-Control: no-cache`, `Connection: keep-alive`, `X-Accel-Buffering: no`.

**Client abort:** server cancels upstream Gemini stream; partial assistant message not persisted (MVP).

**Errors (before stream):** same as non-streaming POST.

---

## 8. PATCH /conversations/:id

**Request:**

```json
{
  "agentId": "recommendation-agent",
  "title": "Maadi search",
  "isArchived": false
}
```

**Response 200:** Updated conversation DTO.

Mid-session agent switch (FR-CHAT-005): only `agentId` required.

---

## 9. Admin: PATCH /admin/agents/:agentId

**Request:**

```json
{
  "isActive": false
}
```

**Response 200:** Agent config row (still in DB). Excluded from `GET /agents` (AC-CHAT-013).

---

## 10. Error envelope (shared)

```json
{
  "error": {
    "code": "AI_UNAVAILABLE",
    "message": "AI assistant is temporarily unavailable",
    "correlationId": "uuid"
  }
}
```

Localized `message` per `Accept-Language` for user-facing codes.

---

## Related documents

- [architecture.md](./architecture.md)
- [data_model.md](./data_model.md)
- [gemini_integration_layer.md §3.5](../../architecture/gemini_integration_layer.md)
- [tests.md](./tests.md)
