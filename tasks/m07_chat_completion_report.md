# M7 AI Chat — Completion Report

**Date:** 2026-06-04  
**Milestone:** M7 — AI Chat

## Summary

M7 delivers authenticated AI chat: conversation/message persistence, four-agent catalog, fair-housing safety pre-check, RAG-backed `semantic_search` tools, mock/real Gemini orchestration, non-streaming and SSE streaming APIs, BullMQ conversation compaction, Flutter chat UI with agent picker and listing cards.

## Tasks (11/11)

| Task | Status |
|------|--------|
| M7-CHT001 Conversation domain + repositories | Done |
| M7-CHT002 AiModule + agents catalog API | Done |
| M7-CHT003 GeminiOrchestrator + prompt loader | Done |
| M7-CHT004 SafetyPipeline + fair housing | Done |
| M7-CHT005 ToolExecutionLoop | Done |
| M7-CHT006 POST /conversations + /messages | Done |
| M7-CHT007 SSE streaming endpoint | Done |
| M7-CHT008 Conversation compaction job | Done |
| M7-CHT009 Mobile chat UI + stream | Done |
| M7-CHT010 Mobile agent picker + listing cards | Done |
| M7-CHT011 AI chat P0 test pack | Done |

## Key endpoints

- `GET /api/v1/ai/agents` — active agent catalog
- `POST /api/v1/conversations` — create session
- `GET/PATCH/DELETE /api/v1/conversations/:id`
- `GET /api/v1/conversations/:id/messages`
- `POST /api/v1/conversations/:id/messages` — non-stream reply
- `POST /api/v1/conversations/:id/messages/stream` — SSE
- `PATCH /api/v1/admin/agents/:agentId` — enable/disable agent

## Run locally

```bash
cd backend
docker compose up -d postgres redis
npx prisma migrate deploy
npm run prisma:seed
GEMINI_MOCK_EMBEDDINGS=true GEMINI_MOCK_CHAT=true npm run start:dev
npm run worker:dev   # compaction + embed jobs

# Tests
GEMINI_MOCK_EMBEDDINGS=true GEMINI_MOCK_CHAT=true npm run test:e2e -- --testPathPattern=chat
```

```bash
cd mobile
flutter run -t lib/main_dev.dart
```

## Env

| Variable | Purpose |
|----------|---------|
| `GEMINI_MOCK_CHAT=true` | Deterministic chat without API key |
| `GEMINI_API_KEY` | Real Gemini generateContent |
| `GEMINI_MOCK_EMBEDDINGS=true` | RAG semantic_search in dev |
