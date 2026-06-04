# M6 Embeddings, RAG & Knowledge — Completion Report

**Date:** 2026-06-04  
**Milestone:** M6 — Embeddings, RAG & Knowledge

## Summary

M6 delivers Gemini-compatible embedding (mock + API), BullMQ `embed-listing` worker, hybrid pgvector + tsvector retrieval, Redis/in-memory RAG cache, FAQ markdown ingest, admin retrieve API, Prometheus-style metrics, and a golden-set eval script.

## Tasks

| Task | Status |
|------|--------|
| M6-RAG001 Gemini embedding adapter | Done |
| M6-RAG002 embed-listing worker | Done |
| M6-RAG003 HNSW / pgvector (init + faq enum migration) | Done |
| M6-RAG004 RAG orchestrator | Done |
| M6-RAG005 POST `/api/v1/ai/rag/retrieve` | Done |
| M6-RAG006 Redis RAG cache | Done |
| M6-RAG007 FAQ knowledge ingest | Done |
| M6-RAG008 RAG metrics `/metrics` | Done |
| M6-RAG009 `scripts/rag-eval.ts` | Done |

## Key endpoints

- `POST /api/v1/ai/rag/retrieve` — admin/agent only; returns chunks + `listingIds`
- `GET /metrics` — Prometheus text (RAG counters)

## Run locally

```bash
cd backend
docker compose up -d postgres redis
npx prisma migrate deploy
GEMINI_MOCK_EMBEDDINGS=true npm run start:dev
# Worker (embed jobs):
GEMINI_MOCK_EMBEDDINGS=true npm run worker:dev
# Eval:
DATABASE_URL=... GEMINI_MOCK_EMBEDDINGS=true npx ts-node scripts/rag-eval.ts
```

Set `GEMINI_API_KEY` for real `text-embedding-004` vectors.
