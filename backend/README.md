# Backend

> NestJS modular monolith. **No code until feature specs are approved.**

## Status

Not initialized — folder structure defined; implementation blocked on SDD approval.

## Modules

| Module | API prefix |
|--------|------------|
| Auth | `/api/v1/auth` |
| Users | `/api/v1/users` |
| Properties | `/api/v1/properties` |
| Bookings | `/api/v1/bookings` |
| AI | `/api/v1/ai`, `/api/v1/agents` |
| Notifications | `/api/v1/notifications` |

## Project Structure

See **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** for the full Clean Architecture folder tree.

## Architecture

- [Backend architecture](../architecture/backend_architecture.md)
- [PostgreSQL schema](../architecture/postgresql_schema.md) — ERD + DDL
- [Gemini integration layer](../architecture/gemini_integration_layer.md) — streaming, tools, safety
- [Monitoring strategy](../architecture/monitoring_strategy.md) — logging, metrics, alerts
- [Deployment architecture](../architecture/deployment_architecture.md) — GCP, Cloud Run, Vertex AI, CI/CD

## Stack

| Component | Technology |
|-----------|------------|
| NestJS | Modular monolith |
| Prisma | PostgreSQL ORM |
| pgvector | Semantic search / RAG |
| Gemini | Chat + embeddings |
| BullMQ | Background jobs |
| Passport | JWT, Google, Apple |

## Gate

Implementation begins only after feature SDD artifacts are approved and explicit implementation approval is received.
