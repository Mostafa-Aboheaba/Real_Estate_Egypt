# Acceptance Criteria — Property Search

## Document Status

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Status | Draft |
| Last Updated | 2026-06-03 |

---

## AC-SEARCH-001: Unified Search

**Maps to:** US-SEARCH-001  
**Priority:** P0

**Given** listings exist from Shaety, Aqarmap, and Property Finder  
**When** I search without provider filter  
**Then** results include listings from all active providers in a single list  
**And** each result shows provider badge (Shaety / Aqarmap / Property Finder)  
**And** response time p95 ≤ 2 seconds

---

## AC-SEARCH-002: Location Filters

**Maps to:** US-SEARCH-002  
**Priority:** P0

**Given** I am on the search screen  
**When** I select governorate "Cairo", city "New Cairo", district "Fifth Settlement"  
**Then** only listings matching that location hierarchy are returned  
**And** invalid combinations show validation error

---

## AC-SEARCH-003: Price and Property Filters

**Maps to:** US-SEARCH-003  
**Priority:** P0

**Given** I set filters: rent, apartment, 2–3 bedrooms, 1M–2M EGP  
**When** I apply filters  
**Then** all returned listings match all active filter criteria  
**And** prices display formatted as EGP (e.g., "1,500,000 EGP")

---

## AC-SEARCH-004: Amenity Filters

**Maps to:** US-SEARCH-004  
**Priority:** P1

**Given** I select amenities "parking" and "elevator"  
**When** I search  
**Then** only listings with both amenities in normalized vocabulary are returned

---

## AC-SEARCH-005: Sort Results

**Maps to:** US-SEARCH-005  
**Priority:** P0

**Given** search returns multiple listings  
**When** I sort by "Price: Low to High"  
**Then** results reorder accordingly  
**When** I sort by "Newest"  
**Then** results order by `syncedAt` descending  
**When** I sort by "Relevance"  
**Then** Elasticsearch relevance score determines order

---

## AC-SEARCH-006: Pagination

**Maps to:** US-SEARCH-006  
**Priority:** P0

**Given** search returns 50+ listings  
**When** I load the first page  
**Then** I receive 20 listings (default page size) with pagination metadata (`total`, `page`, `hasNext`)  
**When** I request page 2  
**Then** next 20 listings load without duplicates from page 1

---

## AC-SEARCH-007: Listing Detail

**Maps to:** US-SEARCH-007  
**Priority:** P0

**Given** I tap a listing from search results  
**When** detail screen loads  
**Then** I see: photo gallery, title, price (EGP), area (sqm), bedrooms, bathrooms, location, description, amenities  
**And** page load p95 ≤ 1.5 seconds

**Given** listing has no photos  
**When** detail loads  
**Then** a placeholder image is shown

---

## AC-SEARCH-008: Source Attribution

**Maps to:** US-SEARCH-008  
**Priority:** P0

**Given** I view listing detail  
**When** the listing is from Shaety  
**Then** I see "Source: Shaety — شقتي" and a tappable link opening the original URL in browser  
**And** attribution complies with provider ToS

---

## AC-SEARCH-009: Guest Browse

**Maps to:** US-SEARCH-009  
**Priority:** P1

**Given** I am not logged in  
**When** I search properties  
**Then** I see the first page of results and can open listing detail  
**When** I attempt page 2 or save favorite  
**Then** I am prompted to register or log in

---

## AC-SEARCH-010: Bilingual Display

**Maps to:** US-SEARCH-010  
**Priority:** P0

**Given** my app language is Arabic  
**When** I view search filters and empty states  
**Then** all UI strings are in Arabic with RTL layout  
**And** listing title/description displays provider content in available language

---

## AC-SEARCH-011: Geo-Proximity Search

**Maps to:** US-SEARCH-011  
**Priority:** P1

**Given** listings have latitude/longitude  
**When** I search within 5 km of a point in New Cairo  
**Then** only listings within radius are returned, ordered by distance

---

## AC-SEARCH-012: Listing Freshness

**Maps to:** US-SEARCH-012  
**Priority:** P0

**Given** a listing was removed from provider 24+ hours ago  
**When** I search  
**Then** that listing does not appear in results  
**And** `isActive: false` in database

**Given** last successful sync was ≤ 1 hour ago  
**When** admin checks sync status  
**Then** data freshness requirement is met

---

## AC-SEARCH-013: Provider Rollout Order

**Maps to:** US-SEARCH-013  
**Priority:** P0

**Given** MVP Phase 1 launch  
**When** only Shaety adapter is deployed  
**Then** search returns Shaety listings only without errors  
**Given** Aqarmap adapter is added  
**When** I search  
**Then** results include both Shaety and Aqarmap listings

---

## AC-SEARCH-014: Automated Sync

**Maps to:** US-SEARCH-014  
**Priority:** P0

**Given** Shaety provider adapter is configured  
**When** scheduled sync job runs  
**Then** new/updated listings are normalized to canonical model  
**And** stored in PostgreSQL  
**And** indexed in Elasticsearch within same job run

---

## AC-SEARCH-015: Sync Retry and Alert

**Maps to:** US-SEARCH-015  
**Priority:** P0

**Given** provider API returns 503  
**When** sync job runs  
**Then** job retries with exponential backoff (min 3 attempts)  
**Given** 3 consecutive sync failures for same provider  
**When** third failure completes  
**Then** admin alert is triggered (log + metric)

---

## AC-SEARCH-016: Manual Sync

**Maps to:** US-SEARCH-016  
**Priority:** P1

**Given** I am authenticated as Admin  
**When** I POST `/api/v1/admin/sync/shaety/trigger`  
**Then** sync job is enqueued immediately  
**And** response includes job ID and estimated start time

**Given** I am a Buyer  
**When** I call the same endpoint  
**Then** I receive 403 Forbidden

---

## AC-SEARCH-017: Sync Status API

**Maps to:** US-SEARCH-017  
**Priority:** P0

**Given** I am Admin  
**When** I GET `/api/v1/admin/sync/status`  
**Then** response includes per provider: `lastRunAt`, `listingCount`, `errorCount`, `status` (healthy/degraded/failed)

---

## Related Documents

- [User Stories](./user_stories.md)
- [Listing Providers](../../architecture/listing_providers.md)
