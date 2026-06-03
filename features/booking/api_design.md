# API Design — Booking & Notifications

## Document Status

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Status | Draft |
| Last Updated | 2026-06-03 |
| Conventions | [api_conventions.md](../../architecture/api_conventions.md) |
| Base path | `/api/v1` |
| Notifications scope | **Option A** — §6 documents FR-NOTIF-* payloads in this file |

---

## 1. Endpoint summary

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| POST | `/bookings` | Bearer | `buyer` | Create viewing request |
| GET | `/bookings` | Bearer | `buyer` | List buyer bookings |
| GET | `/bookings/:id` | Bearer | `buyer`, `agent` | Booking detail (own only) |
| PATCH | `/bookings/:id/confirm` | Bearer | `agent` | Confirm with scheduled time |
| PATCH | `/bookings/:id/propose` | Bearer | `agent` | Propose alternative time |
| PATCH | `/bookings/:id/decline` | Bearer | `agent` | Decline with reason |
| PATCH | `/bookings/:id/cancel` | Bearer | `buyer`, `agent` | Cancel before viewing |
| PATCH | `/bookings/:id/complete` | Bearer | `agent` | Mark completed after viewing |
| GET | `/agent/bookings` | Bearer | `agent` | Agent inbox (filter by status) |

**Headers (create):** `Idempotency-Key: <uuid>` — required on POST `/bookings`.

**Query params (list):** `status`, `page`, `limit` (default 20, max 50).

---

## 2. POST /bookings

Create a viewing request.

**Request:**

```json
{
  "propertyId": "550e8400-e29b-41d4-a716-446655440000",
  "preferredAt": "2026-06-10T14:00:00.000Z",
  "message": "Available after 2pm, please call if late."
}
```

**Response 201:**

```json
{
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "status": "requested",
    "propertyId": "550e8400-e29b-41d4-a716-446655440000",
    "agentId": "770e8400-e29b-41d4-a716-446655440002",
    "preferredAt": "2026-06-10T14:00:00.000Z",
    "buyerMessage": "Available after 2pm, please call if late.",
    "createdAt": "2026-06-03T10:00:00.000Z"
  }
}
```

**Errors:**

| Status | Code | When |
|--------|------|------|
| 400 | `VALIDATION_ERROR` | Missing/invalid fields |
| 401 | `UNAUTHORIZED` | No token |
| 403 | `FORBIDDEN` | Not a buyer |
| 403 | `AGENT_QUOTA_EXCEEDED` | Free tier ≥5 bookings this month (FR-BOOK-009) |
| 404 | `PROPERTY_NOT_FOUND` | Inactive or missing listing |
| 409 | `DUPLICATE_REQUEST` | Same Idempotency-Key replay |
| 422 | `EMAIL_NOT_VERIFIED` | Buyer not verified |

Side effect: enqueue `booking.requested` notifications to agent (§6).

---

## 3. GET /bookings

Buyer booking history.

**Response 200:**

```json
{
  "data": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "status": "confirmed",
      "property": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "title": "3BR Apartment, Maadi",
        "thumbnailUrl": "https://cdn.example.com/thumb.jpg"
      },
      "scheduledAt": "2026-06-10T14:00:00.000Z",
      "preferredAt": "2026-06-10T14:00:00.000Z",
      "createdAt": "2026-06-03T10:00:00.000Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 1 }
}
```

---

## 4. GET /bookings/:id

**Response 200:** Full booking with property summary, agent/buyer contact (masked phone), status timeline.

```json
{
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "status": "requested",
    "property": { "id": "...", "title": "...", "address": "..." },
    "agent": { "id": "...", "name": "Ahmed Hassan" },
    "buyer": { "id": "...", "name": "Sara Mohamed" },
    "preferredAt": "2026-06-10T14:00:00.000Z",
    "scheduledAt": null,
    "buyerMessage": "...",
    "agentMessage": null,
    "timeline": [
      { "status": "requested", "at": "2026-06-03T10:00:00.000Z" }
    ]
  }
}
```

**Errors:** 403 if caller is neither buyer nor assigned agent; 404 if not found.

---

## 5. Agent actions

### 5.1 PATCH /bookings/:id/confirm

**Request:**

```json
{
  "scheduledAt": "2026-06-10T14:00:00.000Z"
}
```

**Response 200:** Booking with `status: "confirmed"`, `scheduledAt`, `confirmedAt`.

**Errors:**

| Status | Code | When |
|--------|------|------|
| 409 | `SLOT_UNAVAILABLE` | Double-booking conflict (FR-BOOK-010) |
| 409 | `INVALID_TRANSITION` | Not in `requested` state |
| 403 | `FORBIDDEN` | Not assigned agent |

Side effect: `booking.confirmed` → push + email to buyer and agent (§6).

---

### 5.2 PATCH /bookings/:id/propose

**Request:**

```json
{
  "proposedAt": "2026-06-11T10:00:00.000Z",
  "message": "I'm unavailable Tuesday; does Wednesday 10 AM work?"
}
```

**Response 200:** Booking remains `requested`; `preferredAt` updated to proposed time; `agentMessage` set.

Side effect: `booking.proposed` → push to buyer.

---

### 5.3 PATCH /bookings/:id/decline

**Request:**

```json
{
  "reason": "Property under offer; viewings paused."
}
```

**Response 200:** `status: "declined"`, `cancelledAt` set.

Side effect: `booking.declined` → push + email to buyer.

---

### 5.4 PATCH /bookings/:id/cancel

**Request:**

```json
{
  "reason": "Schedule conflict"
}
```

**Response 200:** `status: "cancelled"`.

**Errors:** 409 `CANCEL_WINDOW_CLOSED` if viewing time has passed.

Side effect: `booking.cancelled` → notify other party.

---

### 5.5 PATCH /bookings/:id/complete

**Request:** `{}` (empty body)

**Response 200:** `status: "completed"`.

**Guard:** `scheduled_at` in the past.

---

## 6. GET /agent/bookings

Same shape as buyer list; default sort: `requested` first, then `preferred_at` ASC.

**Query:** `?status=requested&page=1&limit=20`

---

## 7. Notifications (FR-NOTIF-*)

Booking APIs do not expose notification send endpoints directly. Jobs are enqueued internally. This section defines payloads consumed by FCM and SendGrid adapters.

### 7.1 FR-NOTIF-001 — Push payloads

**FCM data message (all booking events):**

```json
{
  "notification": {
    "title": "Viewing confirmed",
    "body": "Your viewing at 3BR Maadi is confirmed for Jun 10, 2:00 PM."
  },
  "data": {
    "type": "booking",
    "event": "booking.confirmed",
    "bookingId": "660e8400-e29b-41d4-a716-446655440001",
    "deepLink": "aiproperty://bookings/660e8400-e29b-41d4-a716-446655440001"
  }
}
```

| Event | Recipient | Title (en) | Title (ar-EG) |
|-------|-----------|------------|---------------|
| `booking.requested` | Agent | New viewing request | طلب معاينة جديد |
| `booking.confirmed` | Buyer | Viewing confirmed | تم تأكيد المعاينة |
| `booking.proposed` | Buyer | Alternative time proposed | وقت بديل مقترح |
| `booking.declined` | Buyer | Viewing declined | تم رفض المعاينة |
| `booking.cancelled` | Other party | Viewing cancelled | تم إلغاء المعاينة |
| `booking.completed` | Buyer, Agent | Viewing completed | اكتملت المعاينة |

Copy selected from recipient `users.locale` (FR-NOTIF-004).

**Delivery SLA:** within 60 seconds of status persist (NFR-PERF-003).

---

### 7.2 FR-NOTIF-002 — Email payloads

Booking module sends transactional email for:

| Template ID | Event | Recipients |
|-------------|-------|------------|
| `booking-request-agent` | `booking.requested` | Agent |
| `booking-confirmed` | `booking.confirmed` | Buyer, Agent |

Password reset email remains in auth module.

**SendGrid dynamic template data (`booking-confirmed`):**

```json
{
  "locale": "ar-EG",
  "bookingId": "660e8400-e29b-41d4-a716-446655440001",
  "propertyTitle": "شقة 3 غرف، المعادي",
  "propertyAddress": "المعادي، القاهرة",
  "scheduledAtFormatted": "١٠ يونيو ٢٠٢٦، ٢:٠٠ م",
  "buyerName": "سارة محمد",
  "agentName": "أحمد حسن",
  "manageUrl": "https://app.example.com/bookings/660e8400-e29b-41d4-a716-446655440001"
}
```

---

### 7.3 FR-NOTIF-003 — Preference enforcement

Before enqueue, `EnqueueNotification` reads `notification_preferences`:

| Preference off | Behavior |
|----------------|----------|
| `push.booking = false` | Skip push job; status `skipped` |
| `email.booking = false` | Skip email for non-critical events |
| Essential events | `booking.confirmed`, `booking.requested` always email agent/buyer respectively |

Preference CRUD: [profile/api_design.md](../profile/api_design.md) (when available).

---

### 7.4 FR-NOTIF-004 — Bilingual templates

| Channel | Implementation |
|---------|----------------|
| Push | String tables `notifications/booking.{event}.{locale}.json` |
| Email | MJML templates `templates/booking-confirmed.{locale}.mjml` |

Snapshot tests render both locales (BOK-T-042).

---

## 8. Error codes summary

| Code | HTTP | Description |
|------|------|-------------|
| `SLOT_UNAVAILABLE` | 409 | Agent slot taken (FR-BOOK-010) |
| `AGENT_QUOTA_EXCEEDED` | 403 | Free tier monthly limit (FR-BOOK-009) |
| `INVALID_TRANSITION` | 409 | Illegal status change |
| `CANCEL_WINDOW_CLOSED` | 409 | Viewing time passed |
| `PROPERTY_NOT_FOUND` | 404 | Listing inactive |
| `BOOKING_NOT_FOUND` | 404 | Unknown ID |

---

## Related documents

- [requirements.md](./requirements.md)
- [data_model.md](./data_model.md)
- [architecture.md](./architecture.md)
