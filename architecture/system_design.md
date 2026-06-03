# System Design

> High-level architecture for the AI Property Assistant platform.

## Document Status

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Status | Draft |
| Last Updated | 2026-06-03 |

## Architecture Documents

| Layer | Document |
|-------|----------|
| **Flutter** (Clean Architecture) | [flutter_architecture.md](./flutter_architecture.md) |
| **Backend** (NestJS) | [backend_architecture.md](./backend_architecture.md) |
| **AI Agents** (Search, Recommend, Book, Follow-up) | [ai_agent_architecture.md](./ai_agent_architecture.md) |
| **RAG** (Property, FAQ, Projects, Contracts) | [rag_architecture.md](./rag_architecture.md) |
| **AI Services** (Gemini + pgvector) | [ai_services_architecture.md](./ai_services_architecture.md) |
| **Gemini Integration Layer** | [gemini_integration_layer.md](./gemini_integration_layer.md) |
| **Monitoring Strategy** | [monitoring_strategy.md](./monitoring_strategy.md) |
| **Deployment** (GCP, Vertex AI, GitHub Actions) | [deployment_architecture.md](./deployment_architecture.md) |
| Shared layer rules | [clean_architecture.md](./clean_architecture.md) |

---

## Technology Stack

| Layer | Technology | Status |
|-------|------------|--------|
| Mobile | **Flutter / Dart** — Clean Architecture | ✅ Approved |
| Backend API | **Node.js / NestJS** — REST `/api/v1/*` | ✅ Approved |
| ORM | **Prisma** | ✅ Approved |
| Primary storage | **PostgreSQL 16** | ✅ Approved |
| Vector database | **pgvector** (PostgreSQL extension) | ✅ Approved |
| LLM / Embeddings | **Google Gemini** | ✅ Approved |
| Cache / Queue | **Redis** + **BullMQ** | ✅ Approved |
| Auth | JWT + Passport (Google, Apple, local) | ✅ Approved |
| Market | Egypt — EGP, ar-EG + en | ✅ Approved |

---

## System Context

```mermaid
C4Context
    title System Context — AI Property Assistant

    Person(buyer, "Buyer / Renter", "Searches, chats, books viewings")
    Person(agent, "Real Estate Agent", "Manages bookings and leads")
    Person(admin, "Platform Admin", "Monitors sync and AI config")

    System(platform, "AI Property Assistant", "Flutter + NestJS + Gemini + pgvector")

    System_Ext(listings, "Listing Providers", "Shaety, Aqarmap, Property Finder Egypt")
    System_Ext(gemini, "Google Gemini API", "Chat + embeddings")
    System_Ext(oauth, "Google / Apple OAuth", "Social login")
    System_Ext(notify, "FCM / APNs / Email", "Notifications")

    Rel(buyer, platform, "Uses mobile app")
    Rel(agent, platform, "Uses mobile app")
    Rel(admin, platform, "Admin API")
    Rel(platform, listings, "Syncs listings")
    Rel(platform, gemini, "AI inference")
    Rel(platform, oauth, "Authentication")
    Rel(platform, notify, "Push and email")
```

---

## Container Diagram

```mermaid
C4Container
    title Container Diagram

    Person(user, "User")

    Container(mobile, "Flutter App", "Dart", "Clean Architecture — iOS + Android")
    Container(api, "NestJS API", "Node.js", "REST, auth, orchestration")
    Container(worker, "BullMQ Workers", "Node.js", "Sync, embeddings, notifications")
    ContainerDb(pg, "PostgreSQL", "PostgreSQL 16 + pgvector", "All data + vectors")
    ContainerDb(redis, "Redis", "Redis 7", "Cache, sessions, job queue")
    Container_Ext(gemini, "Gemini API", "Google", "Chat + text-embedding-004")

    Rel(user, mobile, "Uses")
    Rel(mobile, api, "HTTPS REST JSON")
    Rel(api, pg, "Prisma + vector SQL")
    Rel(api, redis, "Cache")
    Rel(api, gemini, "Chat + embed")
    Rel(worker, pg, "Sync + embed upsert")
    Rel(worker, redis, "Job queue")
    Rel(worker, gemini, "Batch embeddings")
```

---

## Three-Tier Architecture

```mermaid
flowchart TB
    subgraph tier1 [Presentation Tier — Flutter]
        UI[Screens & Widgets]
        State[Riverpod Providers]
        UC_M[Domain Use Cases]
    end

    subgraph tier2 [Application Tier — NestJS]
        REST[REST Controllers]
        UC_B[Application Use Cases]
        DOM[Domain Layer]
    end

    subgraph tier3 [Data & AI Tier]
        PG[(PostgreSQL)]
        PGV[pgvector]
        GEM[Gemini API]
        REDIS[(Redis)]
    end

    UI --> State --> UC_M
    UC_M -->|REST| REST
    REST --> UC_B --> DOM
    UC_B --> PG
    UC_B --> PGV
    UC_B --> GEM
    UC_B --> REDIS
    PGV --> PG
```

---

## Bounded Contexts (DDD)

| Context | Responsibility | Feature Folder |
|---------|----------------|----------------|
| **Identity & Access** | Auth, roles, sessions | `features/authentication/` |
| **Property Catalog** | Listings, search, sync | `features/property_search/` |
| **Conversational AI** | Chat, agents, RAG | `features/ai_chat/` |
| **Personalization** | Recommendations | `features/recommendation/` |
| **Scheduling** | Viewing bookings | `features/booking/` |
| **User Profile** | Preferences, favorites | `features/profile/` |

## Context Map

```mermaid
flowchart LR
    Auth[Identity & Access]
    Search[Property Catalog]
    Chat[Conversational AI]
    Rec[Personalization]
    Book[Scheduling]
    Prof[User Profile]

    Auth --> Search
    Auth --> Chat
    Auth --> Rec
    Auth --> Book
    Auth --> Prof
    Search -->|Listings + embeddings| Chat
    Search --> Rec
    Rec --> Chat
    Prof --> Rec
    Book --> Search
```

---

## Data Architecture

```mermaid
flowchart LR
    subgraph relational [PostgreSQL — Relational]
        Users[users]
        Listings[listings]
        Bookings[bookings]
        Chat[chat_sessions / messages]
        Agents[ai_agents]
    end

    subgraph vector [PostgreSQL — pgvector]
        Embeddings[listing_embeddings]
    end

    subgraph search [PostgreSQL — Full-Text]
        TSVector[tsvector on listings]
    end

    Listings --> Embeddings
    Listings --> TSVector
    Gemini[Gemini Embeddings] -->|upsert| Embeddings
    Chat -->|RAG query| Embeddings
    Rec[Recommendations] -->|similarity| Embeddings
```

| Storage Need | Technology |
|--------------|------------|
| Users, bookings, chat, agents | PostgreSQL tables (Prisma) |
| Property keyword search | PostgreSQL `tsvector` + GIN index |
| Semantic search / RAG | **pgvector** cosine similarity |
| Listing embeddings | Gemini `text-embedding-004` → pgvector |
| Session cache, rate limits | Redis |

---

## Communication Patterns

| Pattern | Use Case |
|---------|----------|
| **REST (sync)** | Flutter ↔ NestJS — all MVP endpoints |
| **Gemini API (sync)** | Chat completion + query embedding |
| **BullMQ (async)** | Listing sync, embedding generation, notifications |
| **pgvector (sync)** | RAG retrieval within chat request |
| **Domain events (in-process)** | `ListingSynced`, `BookingConfirmed`, `MessageSent` |

---

## Data Flow — Property Search

```mermaid
sequenceDiagram
    participant M as Flutter App
    participant API as NestJS API
    participant PG as PostgreSQL

    M->>API: GET /api/v1/properties?filters
    API->>PG: SQL filter + tsvector query
    PG-->>API: Listing rows
    API-->>M: Paginated JSON
```

## Data Flow — AI Chat with RAG

```mermaid
sequenceDiagram
    participant M as Flutter App
    participant API as NestJS API
    participant Gem as Gemini API
    participant PG as PostgreSQL + pgvector

    M->>API: POST /api/v1/chat/messages
    API->>Gem: Embed user query
    Gem-->>API: Query vector
    API->>PG: pgvector similarity + filters
    PG-->>API: Top 5 listings
    API->>Gem: generateContent (prompt + RAG context)
    Gem-->>API: Assistant response
    API->>PG: Persist message
    API-->>M: Response + listing cards
```

## Data Flow — Listing Sync + Embedding

```mermaid
sequenceDiagram
    participant W as BullMQ Worker
    participant Provider as Shaety / Aqarmap / PF
    participant PG as PostgreSQL
    participant Gem as Gemini API

    W->>Provider: Fetch listings
    Provider-->>W: Raw listings
    W->>PG: Upsert listings + tsvector
    W->>Gem: Embed listing text (batch)
    Gem-->>W: Vectors
    W->>PG: Upsert listing_embeddings
```

---

## Deployment Topology

```mermaid
flowchart TB
    subgraph client [Client]
        Flutter[Flutter iOS + Android]
    end

    subgraph edge [Edge]
        LB[Load Balancer]
    end

    subgraph app [Application]
        API1[NestJS API]
        API2[NestJS API]
        Worker[BullMQ Workers]
    end

    subgraph data [Data]
        PG[(PostgreSQL + pgvector)]
        Redis[(Redis)]
    end

    subgraph google [Google Cloud]
        Gemini[Gemini API]
    end

    Flutter --> LB
    LB --> API1
    LB --> API2
    API1 --> PG
    API2 --> PG
    API1 --> Redis
    Worker --> PG
    Worker --> Redis
    API1 --> Gemini
    Worker --> Gemini
```

---

## Resolved Decisions

| Decision | Choice |
|----------|--------|
| Mobile | Flutter Clean Architecture |
| Backend | NestJS modular monolith |
| LLM | **Google Gemini** |
| Embeddings | **Gemini text-embedding-004** |
| Vector store | **pgvector** in PostgreSQL |
| Primary storage | **PostgreSQL** |
| ORM | Prisma |
| Mobile API | REST |
| AI pattern | Pluggable agents + RAG |
| Listings | Shaety → Aqarmap → Property Finder Egypt |

## Related Documents

- [Flutter Architecture](./flutter_architecture.md)
- [Backend Architecture](./backend_architecture.md)
- [AI Services Architecture](./ai_services_architecture.md)
- [Gemini Integration Layer](./gemini_integration_layer.md)
- [Monitoring Strategy](./monitoring_strategy.md)
- [Deployment Architecture](./deployment_architecture.md)
- [Clean Architecture](./clean_architecture.md)
- [AI Provider Strategy](./ai_provider_strategy.md)
- [Listing Providers](./listing_providers.md)
- [Requirements](../specs/requirements.md)

## Approval

| Role | Name | Date | Status |
|------|------|------|--------|
| Tech Lead | — | — | Pending |
| Architect | — | — | Pending |
