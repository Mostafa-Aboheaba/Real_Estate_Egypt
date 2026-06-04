# Backend — AI Property Assistant API

> NestJS modular monolith · PostgreSQL 16 + pgvector · Redis + BullMQ

## Status

**M2 Platform Bootstrap** — API skeleton, Prisma schema, health checks, Docker Compose, CI.

## Quick start (< 30 min)

```bash
cd backend
cp .env.example .env
# Do not put comments on the same line as cp (zsh treats words after # badly).
docker compose up -d postgres redis
npm ci
npx prisma migrate deploy
npm run prisma:seed
npm run start:dev
```

Verify:

```bash
curl http://localhost:3000/health
curl http://localhost:3000/health/ready
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run start:dev` | API with hot reload |
| `npm run worker:dev` | BullMQ worker |
| `npm run build` | Production build |
| `npm test` | Unit tests |
| `npm run test:e2e` | E2E (requires DB) |
| `npm run lint` | ESLint |
| `npx prisma migrate dev` | New migration (dev) |
| `npm run prisma:seed` | Seed AI agents |

## Docker (full stack)

For local API development, prefer **Postgres + Redis only** (run the API on the host with `npm run start:dev`):

```bash
docker compose up -d postgres redis
```

To build and run API + worker in Docker:

```bash
docker compose up --build
```

Services: `postgres` (pgvector), `redis`, `api`, `worker`.

## Project structure

See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md).

| Layer | Path |
|-------|------|
| Domain | `src/domain/` — no NestJS imports |
| Application | `src/application/` |
| Infrastructure | `src/infrastructure/` |
| Presentation | `src/presentation/` |

## API

- Health: `GET /health`, `GET /health/ready` (no `/api/v1` prefix)
- Feature routes: `/api/v1/*` (auth M3, properties M4)
- Properties: `GET /api/v1/properties`, `GET /api/v1/properties/:id` (guest page 1 OK)
- Listing sync: auto on empty DB; `npm run worker:dev` for BullMQ worker

## Architecture docs

- [Backend architecture](../architecture/backend_architecture.md)
- [PostgreSQL schema](../architecture/postgresql_schema.md)
- [API conventions](../architecture/api_conventions.md)
