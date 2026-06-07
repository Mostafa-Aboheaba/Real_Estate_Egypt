# Shaety API → AI Property Assistant Domain Mapping

> Maps endpoints from [`external_apis/shaety_collection.json`](external_apis/shaety_collection.json) (Postman collection **Shaety**) to product features defined in [`specs/requirements.md`](../specs/requirements.md) (SRS-001).

## Context

| Item | Detail |
|------|--------|
| **Shaety role** | Primary **listing provider** (FR-SEARCH-003, FR-SYNC-001) — data source ingested via `ShaetyAdapter`, not exposed to mobile clients |
| **Our API** | NestJS `/api/v1/*` — authentication, search, profile, booking, AI chat are **platform-owned** |
| **Base URL** | `https://shaety.pountech.com/api/` — `GET properties` (guest/mobile headers; optional Bearer via `SHAETY_API_KEY`) |
| **Current adapter** | `backend/src/infrastructure/listing/shaety/shaety.adapter.ts` — guest sync; mock fallback on failure |

### Classification legend

| Mark | Can Reuse? | Meaning |
|------|------------|---------|
| **REUSE** | Yes | Call (or mirror) this Shaety endpoint in the **provider adapter** with field mapping into the canonical listing model; little or no semantic change |
| **MODIFY** | Partial | Concept is useful but implementation differs: different auth, data model, scheduling, or feature boundary |
| **IGNORE** | No | Do not integrate for MVP — superseded by platform requirements, duplicate, or out of scope |

---

## Summary

| Mark | Count | Primary use |
|------|-------|-------------|
| **REUSE** | 4 | Listing sync + search index (properties, detail, filters) |
| **MODIFY** | 9 | Projects/RAG, similar listings, leads, FCM pattern, localization |
| **IGNORE** | 16 | Shaety user auth, profile, notifications (platform-owned) |

---

## Property & listings (provider adapter)

| Current Endpoint | Current Purpose | Can Reuse? | Mark | Required Changes | Target Feature |
|------------------|-----------------|------------|------|------------------|----------------|
| `GET /properties` | Paginated property search (`?city=`, `?page=`); returns title, content, price, city, images | Yes | **REUSE** | Map query params to canonical filters (FR-SEARCH-004–008, FR-SEARCH-011); resolve numeric `city` IDs to governorate/city names; paginate in sync worker; store `externalId`; attribution + `sourceUrl` (FR-SEARCH-014); replace placeholder API URL in adapter with real base path from provider | **Property Search** · **Listing Sync** (FR-SEARCH-001, FR-SEARCH-002, FR-SYNC-001) |
| `GET /properties/{id}` | Single listing detail; supports `x-localization: ar` | Yes | **REUSE** | Map response fields to `Property` entity / detail DTO (FR-SEARCH-013); persist images, description, location; optional per-locale fetch for FR-SEARCH-018 | **Property Search** · **Listing Sync** |
| `GET /properties/similar/{id}` | Related listings for a property | Partial | **MODIFY** | Do not proxy to app directly; use during ingest or offline job to enrich “similar” edges, or as signal for FR-REC-001 — not a substitute for platform recommendation engine | **Recommendations** (P1) · **Property Search** |
| `GET /filters` | Search filter metadata (cities, types, etc.) | Yes | **REUSE** | Seed normalized filter vocabulary and city/area reference data; align with mobile filter UI (FR-SEARCH-004–009) | **Property Search** · **Listing Sync** |

---

## Projects & developers (knowledge / extended catalog)

| Current Endpoint | Current Purpose | Can Reuse? | Mark | Required Changes | Target Feature |
|------------------|-----------------|------------|------|------------------|----------------|
| `GET /projects` | List development projects (optional `?city=`) | Partial | **MODIFY** | Ingest into `projects` + `embeddings` (`entity_type=project`) for RAG (FR-CHAT-007); not required for MVP search browse | **Embeddings, RAG & Knowledge** (FR-SYNC-002) · Property Search (P1) |
| `GET /projects/city?city={id}` | Projects filtered by city | Partial | **MODIFY** | Same as `/projects`; consolidate duplicate routes in adapter | **RAG** · Property Search (P1) |
| `GET /projects/{id}/properties` | Units/listings belonging to a project | Partial | **MODIFY** | Link `Property.projectId` during normalization; compound discovery in chat/search P1 | **Property Search** · **RAG** |
| `GET /developers` | Developer directory (Postman folders: “Projects by Developer”, “Developers”) | Partial | **MODIFY** | Map to project metadata (`developer` field); optional FAQ/RAG context only | **RAG** (P1) |
| `GET /projects` (folder `projects` / “Projects by city”) | Duplicate of project-by-city listing | Partial | **MODIFY** | Deduplicate with Property › Projects endpoints in adapter | **RAG** |

---

## Auth (Shaety app identity — not platform auth)

| Current Endpoint | Current Purpose | Can Reuse? | Mark | Required Changes | Target Feature |
|------------------|-----------------|------------|------|------------------|----------------|
| `POST /register` | Register with phone, name, password; returns Shaety token | No | **IGNORE** | Platform uses email/password + Google + Apple (FR-AUTH-001–003, FR-AUTH-007); Egypt phone captured in profile (FR-PROF-001), not Shaety account | — |
| `POST /login` | Login with phone + password | No | **IGNORE** | Platform JWT/refresh (FR-AUTH-006) | **Authentication** (own API) |
| `POST /logout` | Invalidate Shaety session | No | **IGNORE** | FR-AUTH-004 handled locally | **Authentication** |
| `POST /register` (“Social”) | Mislabeled social flow; same URL as register | No | **IGNORE** | Use Google/Apple OAuth on platform (FR-AUTH-002–003) | **Authentication** |
| `POST /password/forgot` | Start phone/password reset | No | **IGNORE** | Email reset flow (FR-AUTH-005) | **Authentication** |
| `POST /password/verify-otp` | Verify OTP for password reset | No | **IGNORE** | Email token model | **Authentication** |
| `POST /profile/verify` | Verify user (OTP / phone) | No | **IGNORE** | Email verification (FR-AUTH-009) | **Authentication** |
| `POST /verify-otp/resend` | Resend verification OTP | No | **IGNORE** | Platform resend verification | **Authentication** |
| `POST /sms` | SMS-related action (collection points at `logout` — likely stale) | No | **IGNORE** | Out of scope / fix collection before use | — |

**Service-to-service note:** Postman shows **Bearer `{{token}}`** on property routes. Confirm whether sync uses API key, service account, or OAuth client credentials — adapter should use **provider credentials**, not end-user tokens (MODIFY vs collection).

---

## Profile (Shaety user profile — platform-owned)

| Current Endpoint | Current Purpose | Can Reuse? | Mark | Required Changes | Target Feature |
|------------------|-----------------|------------|------|------------------|----------------|
| `GET /profile` | Current user profile (name, email, phone, filters, nested notifications) | No | **IGNORE** | Implement `GET/PATCH /api/v1/users/me` (FR-PROF-001–002, FR-PROF-005–007) | **Profile & Preferences** |
| `PUT /profile` | Update name, phone, email | No | **IGNORE** | Platform profile PATCH + validation (Phone VO, locale) | **Profile & Preferences** |
| `POST /profile/forgot-password/change` | Set new password after OTP | No | **IGNORE** | `POST /api/v1/auth/reset-password` flow | **Authentication** |

---

## Notifications & device tokens

| Current Endpoint | Current Purpose | Can Reuse? | Mark | Required Changes | Target Feature |
|------------------|-----------------|------------|------|------------------|----------------|
| `GET /notification` | List in-app notifications (property-related) | No | **IGNORE** | Booking/status notifications are platform events (FR-NOTIF-001–003), not Shaety feed | **Notifications** · **Booking** |
| `PUT /notification/{id}` | Mark notification read (`read_at`) | No | **IGNORE** | Own read-state model if needed P1 | **Notifications** |
| `POST /fcm-hash` | Register FCM device hash | Partial | **MODIFY** | **Pattern only** — store FCM token on platform user for Firebase push (FR-NOTIF-001); do not call Shaety from mobile | **Notifications** |
| `POST /profile/fcm` (sample in response) | Alternate FCM registration path | Partial | **MODIFY** | Consolidate to single platform device-token endpoint | **Notifications** |

---

## Leads & conversion

| Current Endpoint | Current Purpose | Can Reuse? | Mark | Required Changes | Target Feature |
|------------------|-----------------|------------|------|------------------|----------------|
| `POST /lead` | Submit lead (name, phone, type, city) | Partial | **MODIFY** | Analogous to **viewing request** intent — map to `bookings` table (FR-BOOK-001–002), not forward raw lead to Shaety from app; optional webhook to provider P2 | **Booking** (P0) |

---

## SRS traceability matrix (Shaety-supported FRs)

| SRS ID | Requirement (abbrev.) | Shaety endpoints | Mark |
|--------|----------------------|------------------|------|
| FR-SEARCH-001 | Aggregate Shaety listings | `GET /properties`, `GET /properties/{id}` | REUSE |
| FR-SEARCH-002 | Scheduled sync | `GET /properties` (paginated ingest) | REUSE |
| FR-SEARCH-003 | Shaety first provider | All REUSE/MODIFY property routes | REUSE |
| FR-SEARCH-004–012 | Search filters, sort, pagination | `GET /properties`, `GET /filters` | REUSE |
| FR-SEARCH-013–014 | Detail + attribution | `GET /properties/{id}` | REUSE |
| FR-SEARCH-015 | Stale/inactive listings | Sync diff vs last fetch | MODIFY |
| FR-SEARCH-018 | Bilingual content | `x-localization` header on detail | MODIFY |
| FR-SYNC-001–006 | Adapter, retry, admin sync | Ingestion layer over `GET /properties` | REUSE / MODIFY |
| FR-CHAT-007 | RAG grounding | Indirect via synced listings + optional `GET /projects` | REUSE / MODIFY |
| FR-REC-001 | Recommendations | `GET /properties/similar/{id}` as optional signal | MODIFY |
| FR-AUTH-* | Platform auth | — | IGNORE (all Auth folder) |
| FR-PROF-* | Platform profile | — | IGNORE (Profile folder) |
| FR-BOOK-* | Viewing requests | `POST /lead` (concept only) | MODIFY |
| FR-NOTIF-* | Push/email | FCM endpoints (pattern only) | MODIFY |

---

## Recommended adapter backlog (from mapping)

1. **REUSE first:** Wire real `GET /properties` + `GET /properties/{id}` + `GET /filters` in `ShaetyAdapter` (replace mock JSON and generic URL).
2. **MODIFY:** Add city-ID lookup table from `GET /filters`; support `x-localization` on detail ingest.
3. **MODIFY:** Post-sync embedding already queued — no Shaety change (FR-SYNC-002).
4. **P1:** Ingest `GET /projects*` for RAG project chunks; map `GET /properties/similar/{id}` to recommendation signals.
5. **IGNORE:** Do not implement Shaety Auth/Profile/Notification routes in mobile or public API.

---

## Related documents

| Document | Path |
|----------|------|
| SRS | [`specs/requirements.md`](../specs/requirements.md) |
| Listing providers | [`architecture/listing_providers.md`](../architecture/listing_providers.md) |
| Shaety Postman collection | [`external_apis/shaety_collection.json`](external_apis/shaety_collection.json) |
| Shaety adapter (code) | [`backend/src/infrastructure/listing/shaety/shaety.adapter.ts`](../backend/src/infrastructure/listing/shaety/shaety.adapter.ts) |

---

## Document control

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Date | 2026-06-04 |
| Source | SRS-001 v1.0.0 + Shaety Postman collection |
