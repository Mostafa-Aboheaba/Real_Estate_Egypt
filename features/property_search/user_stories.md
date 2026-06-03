# User Stories — Property Search

## Document Status

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Status | Draft |
| Last Updated | 2026-06-03 |
| Traces to | FR-SEARCH-*, FR-SYNC-*, FR-ADMIN-002 in [specs/requirements.md](../../specs/requirements.md) |

---

## US-SEARCH-001: Unified Property Search

**Priority:** P0  
**Role:** Buyer, Agent, Guest  
**Traces to:** FR-SEARCH-001, FR-SEARCH-010

**As a** property seeker  
**I want** to search properties from Shaety, Aqarmap, and Property Finder in one place  
**So that** I do not need to switch between multiple apps to find listings

---

## US-SEARCH-002: Filter by Location

**Priority:** P0  
**Role:** All users  
**Traces to:** FR-SEARCH-004

**As a** user  
**I want** to filter properties by governorate, city, and district  
**So that** I only see listings in areas I am interested in

---

## US-SEARCH-003: Filter by Price and Property Details

**Priority:** P0  
**Role:** All users  
**Traces to:** FR-SEARCH-005, FR-SEARCH-006, FR-SEARCH-007, FR-SEARCH-008

**As a** user  
**I want** to filter by price range (EGP), property type, sale/rent, bedrooms, bathrooms, and area  
**So that** I find properties matching my budget and needs

---

## US-SEARCH-004: Filter by Amenities

**Priority:** P1  
**Role:** All users  
**Traces to:** FR-SEARCH-009

**As a** user  
**I want** to filter by amenities such as parking, elevator, and balcony  
**So that** I find properties with the features I require

---

## US-SEARCH-005: Sort Search Results

**Priority:** P0  
**Role:** All users  
**Traces to:** FR-SEARCH-012

**As a** user  
**I want** to sort results by price, date listed, or relevance  
**So that** I can prioritize listings the way that suits my search

---

## US-SEARCH-006: Paginated Results

**Priority:** P0  
**Role:** All users  
**Traces to:** FR-SEARCH-011

**As a** user  
**I want** search results paginated with smooth infinite scroll or page navigation  
**So that** I can browse large result sets without slow load times

---

## US-SEARCH-007: View Listing Detail

**Priority:** P0  
**Role:** All users  
**Traces to:** FR-SEARCH-013, FR-SEARCH-014

**As a** user  
**I want** to view full listing details including photos, price, location, and amenities  
**So that** I can evaluate a property before booking a viewing

---

## US-SEARCH-008: See Listing Source Attribution

**Priority:** P0  
**Role:** All users  
**Traces to:** FR-SEARCH-014, NFR-COMP-006

**As a** user  
**I want** to see which portal (Shaety, Aqarmap, Property Finder) a listing came from with a link to the original  
**So that** I can verify details on the source site and trust the data origin

---

## US-SEARCH-009: Guest Browse (Limited)

**Priority:** P1  
**Role:** Guest  
**Traces to:** FR-SEARCH-016

**As a** guest (not logged in)  
**I want** to browse the first page of search results and view listing details  
**So that** I can explore the app before creating an account

---

## US-SEARCH-010: Bilingual Search Experience

**Priority:** P0  
**Role:** All users  
**Traces to:** FR-SEARCH-018, NFR-UX-001

**As a** user  
**I want** the search UI and listing information displayed in Arabic or English  
**So that** I can search comfortably in my preferred language

---

## US-SEARCH-011: Geo-Proximity Search

**Priority:** P1  
**Role:** Authenticated user  
**Traces to:** FR-SEARCH-017

**As a** user  
**I want** to search properties near a location or within a map radius  
**So that** I find homes close to work, school, or family

---

## US-SEARCH-012: Fresh Listing Data

**Priority:** P0  
**Role:** System / User  
**Traces to:** FR-SEARCH-002, FR-SEARCH-015, NFR-AVAIL-003

**As a** user  
**I want** listings to be up to date and inactive listings removed from results  
**So that** I do not waste time on sold or unavailable properties

---

## US-SEARCH-013: Shaety-First Provider Rollout

**Priority:** P0  
**Role:** Platform  
**Traces to:** FR-SEARCH-003

**As the** platform operator  
**I want** Shaety integrated first, then Aqarmap and Property Finder  
**So that** we launch search quickly with the primary provider before expanding coverage

---

## US-SEARCH-014: Automated Listing Sync

**Priority:** P0  
**Role:** System  
**Traces to:** FR-SYNC-001, FR-SYNC-002, FR-SYNC-003

**As the** platform  
**I want** listings synced automatically from each provider into PostgreSQL with full-text and vector indexes  
**So that** search results reflect provider catalogs without manual data entry

---

## US-SEARCH-015: Sync Failure Recovery

**Priority:** P0  
**Role:** System / Admin  
**Traces to:** FR-SYNC-003, FR-SYNC-004

**As a** platform admin  
**I want** sync jobs to retry on failure and alert me after repeated failures  
**So that** listing data gaps are detected and resolved quickly

---

## US-SEARCH-016: Manual Sync Trigger

**Priority:** P1  
**Role:** Admin  
**Traces to:** FR-SYNC-005

**As a** platform admin  
**I want** to manually trigger a sync for a specific provider  
**So that** I can refresh data immediately after a provider outage or configuration change

---

## US-SEARCH-017: View Sync Status

**Priority:** P0  
**Role:** Admin  
**Traces to:** FR-SYNC-006, FR-ADMIN-002

**As a** platform admin  
**I want** to view sync status (last run, listing count, errors) per provider via API  
**So that** I can monitor listing pipeline health

---

## Summary

| Priority | Count |
|----------|-------|
| P0 | 13 |
| P1 | 4 |
| P2 | 0 |
| **Total** | **17** |

## Related Documents

- [Acceptance Criteria](./acceptance_criteria.md)
- [Listing Providers](../../architecture/listing_providers.md)
