# Requirements — Profile & Preferences

## Document Status

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Status | Draft |
| Last Updated | 2026-06-03 |
| Traces to | FR-PROF-* in [specs/requirements.md](../../specs/requirements.md) |

---

## 1. Purpose

Define functional and non-functional requirements for user profile management, saved favorites, persistent search preferences, agent public profiles, and PDPL data-rights flows for the AI Property Assistant mobile app and REST API.

---

## 2. Scope

### In scope (MVP — P0)

- View and edit personal information (name, phone, avatar)
- Language preference (Arabic / English) without re-login
- Save, unsave, and paginate favorite properties
- Persist search preferences (budget, areas, property type, listing type)
- Notification preferences per event type (via profile settings UI; API owned by Notifications module)
- Default AI agent selection
- Agent public profile (bio, photo, phone, service areas)
- Account deletion with PDPL erasure workflow

### In scope (post-MVP — P1)

- Personal data export (JSON, email delivery within 72 hours)
- Bilingual notification content (FR-NOTIF-004; coordinated with notifications feature)

### Out of scope (MVP)

- Agent license verification
- Buyer-facing agent profile on booking detail (P2 — US-PROF-011)
- Social profile / follower features
- Profile visibility privacy controls beyond role-based agent card

### Owned elsewhere

| Requirement | Owner feature |
|-------------|---------------|
| FR-PROF-011 (consent at onboarding) | [authentication](../authentication/requirements.md) |
| FR-NOTIF-003 (opt-out API) | notifications (profile UI triggers PATCH) |

---

## 3. Personas

| Persona | Role ID | Profile needs |
|---------|---------|---------------|
| Buyer / Renter | `buyer` | Personal info, favorites, search prefs, default AI agent |
| Real Estate Agent | `agent` | All buyer needs + public agent profile |
| Platform Admin | `admin` | Same API; admin routes out of scope |

---

## 4. Functional requirements

| ID | Requirement | Priority | User story | Acceptance criteria |
|----|-------------|----------|------------|---------------------|
| FR-PROF-001 | View and edit personal information (name, phone, avatar) | P0 | [US-PROF-001](./user_stories.md#us-prof-001-edit-personal-information) | [AC-PROF-001](./acceptance_criteria.md#ac-prof-001-edit-personal-info) |
| FR-PROF-002 | Set language preference (Arabic or English) | P0 | [US-PROF-002](./user_stories.md#us-prof-002-set-language-preference) | [AC-PROF-002](./acceptance_criteria.md#ac-prof-002-language-preference) |
| FR-PROF-003 | Save and unsave favorite properties | P0 | [US-PROF-003](./user_stories.md#us-prof-003-save-favorite-properties) | [AC-PROF-003](./acceptance_criteria.md#ac-prof-003-favorites) |
| FR-PROF-004 | View favorites list with pagination | P0 | US-PROF-003 | AC-PROF-003 |
| FR-PROF-005 | Persist search preferences (budget, areas, type, listing type) | P0 | [US-PROF-004](./user_stories.md#us-prof-004-set-search-preferences) | [AC-PROF-004](./acceptance_criteria.md#ac-prof-004-search-preferences) |
| FR-PROF-006 | Set notification preferences per event type | P0 | [US-PROF-005](./user_stories.md#us-prof-005-manage-notification-preferences) | [AC-PROF-005](./acceptance_criteria.md#ac-prof-005-notification-settings) |
| FR-PROF-007 | Set default AI agent | P0 | [US-PROF-006](./user_stories.md#us-prof-006-set-default-ai-agent) | [AC-PROF-006](./acceptance_criteria.md#ac-prof-006-default-ai-agent) |
| FR-PROF-008 | Agent public profile (bio, phone, service areas, photo) | P0 | [US-PROF-007](./user_stories.md#us-prof-007-agent-public-profile) | [AC-PROF-007](./acceptance_criteria.md#ac-prof-007-agent-profile) |
| FR-PROF-009 | Delete account and associated personal data (PDPL erasure) | P0 | [US-PROF-008](./user_stories.md#us-prof-008-delete-account) | [AC-PROF-008](./acceptance_criteria.md#ac-prof-008-account-deletion) |
| FR-PROF-010 | Export personal data (machine-readable) | P1 | [US-PROF-009](./user_stories.md#us-prof-009-export-personal-data) | [AC-PROF-009](./acceptance_criteria.md#ac-prof-009-data-export) |
| FR-PROF-011 | Grant/revoke consent during onboarding | P0 | — | authentication feature |

### P0 story summary (8)

| Story | Title | FR coverage |
|-------|-------|-------------|
| US-PROF-001 | Edit personal information | FR-PROF-001 |
| US-PROF-002 | Set language preference | FR-PROF-002 |
| US-PROF-003 | Save favorite properties | FR-PROF-003, FR-PROF-004 |
| US-PROF-004 | Set search preferences | FR-PROF-005 |
| US-PROF-005 | Manage notification preferences | FR-PROF-006 |
| US-PROF-006 | Set default AI agent | FR-PROF-007 |
| US-PROF-007 | Agent public profile | FR-PROF-008 |
| US-PROF-008 | Delete account | FR-PROF-009 |

---

## 5. Non-functional requirements

| ID | Application |
|----|-------------|
| NFR-UX-002 | Language switch without re-authentication |
| NFR-UX-007 | Validation errors in user's selected locale |
| NFR-COMP-001 | Egypt PDPL compliance |
| NFR-COMP-003 | PII purge within 30 days of account deletion |
| NFR-COMP-004 | Data export delivered within 72 hours (P1) |
| NFR-MAINT-001 | SDD approved before implementation |
| NFR-MAINT-003 | Domain layer ≥ 80% test coverage |

---

## 6. Dependencies

| Dependency | Required for |
|------------|--------------|
| [authentication](../authentication/) | JWT, verified user, role |
| property_search | Property IDs for favorites; listing cards in favorites list |
| ai_chat | Default agent consumed by new chat sessions |
| notifications | Notification preference storage and delivery |
| booking | Cancel active bookings on account deletion |

**Blocks:** recommendation (preference and favorites data).

---

## 7. Assumptions

- Avatar upload uses pre-signed URL or direct multipart to object storage (implementation detail in M5-PRO002).
- Egyptian mobile phone validation: `+20` or `01` prefix, 11 digits.
- Favorites reference `properties.id`; inactive listings remain in favorites but show "unavailable" state.
- Account deletion is soft-delete (`deleted_at`) with async PII purge job.

---

## 8. Open questions

| # | Question | Owner | Resolution |
|---|----------|-------|------------|
| 1 | Avatar storage: S3 vs Cloudinary | Tech Lead | TBD — stub URL in MVP |
| 2 | Export job: BullMQ vs cron | Tech Lead | BullMQ `export-user-data` queue (M5-PRO006 stub) |

---

## Related documents

- [User stories](./user_stories.md)
- [Acceptance criteria](./acceptance_criteria.md)
- [Architecture](./architecture.md)
- [Data model](./data_model.md)
- [API design](./api_design.md)
