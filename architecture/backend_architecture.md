# Backend Architecture

> NestJS modular monolith with Clean Architecture and PostgreSQL.

## Document Status

| Field | Value |
|-------|-------|
| Version | 1.1.0 |
| Status | Draft |
| Last Updated | 2026-06-03 |
| Project structure | [../backend/PROJECT_STRUCTURE.md](../backend/PROJECT_STRUCTURE.md) |
| Runtime | Node.js LTS |
| Framework | NestJS |
| Database | PostgreSQL + Prisma |
| Vector Store | pgvector (PostgreSQL extension) |
| API Style | REST JSON `/api/v1/*` |

---

## 1. Overview

The backend is a **modular monolith** — one deployable NestJS application organized by bounded context. Business logic lives in framework-free `domain/` and `application/` layers; NestJS modules in `presentation/` are thin HTTP adapters.

```mermaid
flowchart TB
    subgraph clients [Clients]
        Flutter[Flutter Mobile App]
        Admin[Admin API Client]
    end

    subgraph nestjs [NestJS Modular Monolith]
        subgraph presentation [Presentation Layer]
            Controllers[Controllers / Guards / Pipes]
            Modules[NestJS Modules]
        end

        subgraph application [Application Layer]
            UseCases[Use Cases / Commands / Queries]
        end

        subgraph domain [Domain Layer]
            Entities[Entities / Aggregates]
            Ports[Repository Ports]
            DomainServices[Domain Services]
        end

        subgraph infrastructure [Infrastructure Layer]
            Prisma[Prisma Repositories]
            Gemini[Gemini AI Adapter]
            Vector[pgvector Search]
            Listings[Listing Provider Adapters]
            Queue[BullMQ Workers]
            Auth[Passport Strategies]
            Cache[Redis Cache]
        end
    end

    subgraph data [Data Tier]
        PG[(PostgreSQL + pgvector)]
        Redis[(Redis)]
    end

    subgraph external [External Services]
        Shaety[Shaety — شقتي]
        Aqarmap[Aqarmap]
        PF[Property Finder Egypt]
        Google[Google OAuth]
        Apple[Apple Sign In]
        FCM[FCM / APNs]
    end

    Flutter --> Controllers
    Admin --> Controllers
    Controllers --> UseCases
    UseCases --> Ports
    Prisma --> Ports
    Gemini --> Ports
    Vector --> Ports
    Prisma --> PG
    Vector --> PG
    Cache --> Redis
    Queue --> Redis
    Listings --> Shaety
    Listings --> Aqarmap
    Listings --> PF
    Auth --> Google
    Auth --> Apple
    Queue --> FCM
```

---

## 2. Layer Architecture

```mermaid
flowchart LR
    direction TB

    subgraph outer [Outer — Frameworks]
        HTTP[HTTP / REST]
        PrismaORM[Prisma Client]
        BullMQ[BullMQ]
        Passport[Passport.js]
    end

    subgraph infra [Infrastructure]
        RepoImpl[Repository Implementations]
        AIAdapter[Gemini Adapter]
        VectorRepo[Vector Search Repo]
        SyncWorker[Sync Workers]
    end

    subgraph app [Application]
        UC[Use Cases]
        DTO[Request / Response DTOs]
    end

    subgraph dom [Domain — Center]
        E[Entities]
        P[Ports / Interfaces]
        DS[Domain Services]
    end

    HTTP --> UC
    UC --> P
    UC --> E
    RepoImpl --> P
    AIAdapter --> P
    VectorRepo --> P
    RepoImpl --> PrismaORM
    SyncWorker --> BullMQ
```

### Dependency Rule

| Layer | May Import | Must NOT Import |
|-------|------------|-----------------|
| `domain/` | Nothing external | NestJS, Prisma, Gemini SDK |
| `application/` | `domain/` | NestJS decorators, Prisma |
| `infrastructure/` | `domain/`, `application/` | NestJS controllers |
| `presentation/` | All layers (wiring only) | — |

---

## 3. Project Structure

Full folder tree: **[backend/PROJECT_STRUCTURE.md](../backend/PROJECT_STRUCTURE.md)**

```
backend/src/
├── domain/           # auth | users | properties | bookings | ai | notifications
├── application/      # use-cases + app DTOs per module
├── infrastructure/   # prisma, gemini, rag, passport, queue, fcm, email
└── presentation/     # NestJS modules (Auth, Users, Properties, Bookings, AI, Notifications)
```

---

## 4. NestJS Module Map

```mermaid
flowchart TB
    AppModule[AppModule]

    AppModule --> AuthModule
    AppModule --> UsersModule
    AppModule --> PropertiesModule
    AppModule --> BookingsModule
    AppModule --> AiModule
    AppModule --> NotificationsModule
    AppModule --> AdminModule
    AppModule --> HealthModule

    subgraph auth [Auth]
        AuthController
        PassportJWT
    end

    subgraph users [Users]
        UsersController
        FavoritesController
    end

    subgraph properties [Properties]
        PropertiesController
        ListingSyncWorker
    end

    subgraph bookings [Bookings]
        BookingsController
        AgentBookingsController
    end

    subgraph ai [AI]
        ChatController
        AgentsController
        RecommendationsController
        GeminiRAG
    end

    subgraph notifications [Notifications]
        NotificationsController
        FCMEmail
    end

    AuthModule --> auth
    UsersModule --> users
    PropertiesModule --> properties
    BookingsModule --> bookings
    AiModule --> ai
    NotificationsModule --> notifications

    BookingsModule --> NotificationsModule
    AiModule --> PropertiesModule
    AiModule --> UsersModule
```

| NestJS Module | Presentation | Domain | Primary use cases |
|---------------|--------------|--------|-------------------|
| **Auth** | `auth.controller` | `domain/auth` | Register, login, OAuth, refresh, password reset |
| **Users** | `users.controller`, `favorites.controller` | `domain/users` | Profile, preferences, favorites, account delete |
| **Properties** | `properties.controller` | `domain/properties` | Search, detail, listing sync |
| **Bookings** | `bookings.controller`, `agent-bookings.controller` | `domain/bookings` | Request, confirm, cancel, availability |
| **AI** | `chat`, `agents`, `recommendations` controllers | `domain/ai` | Chat, RAG, agents, recommendations |
| **Notifications** | `notifications.controller` | `domain/notifications` | Push, email, preferences |
| **Admin** | `admin.controller` | cross-cutting | Sync status, agent toggle |

---

## 5. Request Lifecycle

```mermaid
sequenceDiagram
    participant C as Client
    participant G as Guards
    participant Ctrl as Controller
    participant UC as Use Case
    participant Dom as Domain
    participant Infra as Infrastructure
    participant DB as PostgreSQL

    C->>G: HTTP Request + JWT
    G->>G: JwtAuthGuard + RolesGuard
    G->>Ctrl: Authorized request
    Ctrl->>Ctrl: ValidationPipe (DTO)
    Ctrl->>UC: execute(command)
    UC->>Dom: Business rules
    UC->>Infra: Repository port call
    Infra->>DB: Prisma / raw SQL
    DB-->>Infra: Data
    Infra-->>UC: Domain entity
    UC-->>Ctrl: Result DTO
    Ctrl-->>C: JSON response
```

---

## 6. PostgreSQL Data Architecture

```mermaid
erDiagram
    users ||--o{ refresh_tokens : has
    users ||--o{ chat_sessions : owns
    users ||--o{ bookings : requests
    users ||--o{ favorites : saves
    users ||--o{ user_preferences : has

    listings ||--o{ listing_embeddings : has
    listings ||--o{ favorites : referenced
    listings ||--o{ bookings : referenced

    chat_sessions ||--o{ chat_messages : contains
    ai_agents ||--o{ chat_sessions : assigned
    ai_agents ||--o{ chat_messages : generated

    agents ||--|| users : extends
    agents ||--o{ bookings : manages
    agents ||--o{ agent_availability : sets

    users {
        uuid id PK
        string email UK
        string password_hash
        enum role
        string locale
        uuid preferred_agent_id FK
        timestamp created_at
    }

    listings {
        uuid id PK
        string external_id
        enum provider
        decimal price_egp
        jsonb location
        tsvector search_vector
        boolean is_active
    }

    listing_embeddings {
        uuid listing_id PK_FK
        vector embedding
        string model_version
        timestamp embedded_at
    }

    ai_agents {
        string id PK
        jsonb name_i18n
        text system_prompt
        string gemini_model
        boolean is_active
    }
```

### Storage Split

| Data Type | Storage | Access |
|-----------|---------|--------|
| Users, bookings, chat, agents | PostgreSQL tables | Prisma |
| Full-text search (keywords) | PostgreSQL `tsvector` | Prisma raw SQL |
| Semantic / similarity search | **pgvector** `listing_embeddings` | Vector cosine query |
| Session cache, rate limits | Redis | ioredis |
| Job queues | Redis (BullMQ) | BullMQ |

---

## 7. Listing Sync Pipeline

```mermaid
flowchart LR
    subgraph providers [Providers]
        S[Shaety]
        A[Aqarmap]
        P[Property Finder]
    end

    subgraph queue [BullMQ]
        SyncJob[sync-listings job]
        EmbedJob[embed-listings job]
    end

    subgraph processing [Processing]
        Adapter[Provider Adapter]
        Normalizer[Canonical Normalizer]
        PrismaWrite[Prisma Upsert]
    end

    subgraph storage [PostgreSQL]
        Listings[(listings)]
        Embeddings[(listing_embeddings)]
        TSVector[tsvector index]
    end

    S --> SyncJob
    A --> SyncJob
    P --> SyncJob
    SyncJob --> Adapter
    Adapter --> Normalizer
    Normalizer --> PrismaWrite
    PrismaWrite --> Listings
    PrismaWrite --> TSVector
    PrismaWrite --> EmbedJob
    EmbedJob --> Embeddings
```

---

## 8. Property Search Flow

```mermaid
sequenceDiagram
    participant M as Mobile
    participant API as PropertiesController
    participant UC as SearchPropertiesUseCase
    participant PG as PostgreSQL

    M->>API: GET /api/v1/properties?city=New+Cairo&maxPrice=2000000
    API->>UC: execute(filters)
    UC->>PG: SQL filter query (price, location, type)
    PG-->>UC: Listing rows
    UC-->>API: Paginated DTOs
    API-->>M: JSON response

    Note over M,PG: Semantic search path (optional query param)

    M->>API: GET /api/v1/properties?semantic=3 bedroom near mall
    API->>UC: execute semantic query
    UC->>UC: Gemini embed query text
    UC->>PG: pgvector cosine similarity + filters
    PG-->>UC: Ranked listing IDs
    UC-->>M: JSON response
```

---

## 9. Security Architecture

```mermaid
flowchart TB
    Request[Incoming Request]
    Request --> TLS[TLS Termination]
    TLS --> RateLimit[Rate Limiter — Redis]
    RateLimit --> JwtGuard[JWT Auth Guard]
    JwtGuard --> RolesGuard[Roles Guard]
    RolesGuard --> Validation[DTO Validation]
    Validation --> Controller[Controller]

    subgraph secrets [Secrets Management]
        EnvVars[Environment Variables]
        GeminiKey[Gemini API Key]
        JWTSecret[JWT Secret]
        OAuthSecrets[Google / Apple OAuth]
    end

    Controller -.-> secrets
```

| Concern | Implementation |
|---------|----------------|
| Authentication | Passport.js — local, Google, Apple |
| Tokens | JWT access (15 min) + refresh rotation |
| Authorization | `@Roles('buyer', 'agent', 'admin')` + domain checks |
| Password hashing | bcrypt cost ≥ 12 |
| Input validation | `class-validator` on all DTOs |
| Rate limiting | `@nestjs/throttler` + Redis |
| CORS | Whitelist mobile app origins |

---

## 10. Background Jobs (BullMQ)

| Queue | Job | Schedule | Purpose |
|-------|-----|----------|---------|
| `listing-sync` | `sync-provider` | Every 30 min | Ingest Shaety, Aqarmap, PF |
| `embeddings` | `embed-listing` | On listing upsert | Generate + store pgvector embedding |
| `recommendations` | `recompute-user` | On behavior change | Update recommendation scores |
| `notifications` | `send-push` | Event-driven | FCM/APNs dispatch |
| `notifications` | `send-email` | Event-driven | Booking, auth emails |

---

## 11. Deployment Topology

```mermaid
flowchart TB
    subgraph client [Client]
        Mobile[Flutter App]
    end

    subgraph edge [Edge]
        LB[Load Balancer / Nginx]
    end

    subgraph compute [Compute]
        API1[NestJS Instance 1]
        API2[NestJS Instance 2]
        Worker[BullMQ Worker Process]
    end

    subgraph managed [Managed Services]
        PG[(PostgreSQL 16 + pgvector)]
        Redis[(Redis 7)]
    end

    subgraph saas [External SaaS]
        Gemini[Google Gemini API]
        OAuth[Google / Apple]
    end

    Mobile --> LB
    LB --> API1
    LB --> API2
    API1 --> PG
    API2 --> PG
    API1 --> Redis
    Worker --> PG
    Worker --> Redis
    API1 --> Gemini
    Worker --> Gemini
    API1 --> OAuth
```

---

## 12. Technology Stack

| Component | Technology |
|-----------|------------|
| Runtime | Node.js 20 LTS |
| Framework | NestJS 10 |
| ORM | Prisma |
| Database | PostgreSQL 16 |
| Vector extension | pgvector |
| Cache / Queue | Redis 7 + BullMQ |
| Auth | Passport + JWT |
| Validation | class-validator + class-transformer |
| API docs | Swagger (dev/staging only) |
| Testing | Jest + Supertest |

---

## 13. Related Documents

| Document | Path |
|----------|------|
| Flutter Architecture | [flutter_architecture.md](./flutter_architecture.md) |
| AI Services Architecture | [ai_services_architecture.md](./ai_services_architecture.md) |
| Listing Providers | [listing_providers.md](./listing_providers.md) |
| System Design | [system_design.md](./system_design.md) |

## Approval

| Role | Name | Date | Status |
|------|------|------|--------|
| Tech Lead | — | — | Pending |
| Backend Lead | — | — | Pending |
