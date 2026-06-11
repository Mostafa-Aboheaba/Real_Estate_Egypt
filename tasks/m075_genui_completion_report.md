# M7.5 GenUI — Completion Report

**Date:** 2026-06-11  
**Milestone:** M75 — Generative Chat UI (GenUI)

## Summary

M75 delivers server-built A2UI surfaces in chat: `a2ui_surface` SSE events, persisted `ui_surface` on messages, Flutter GenUI catalog + `A2uiSurfaceView`, and safety allowlisting. When `GENUI_ENABLED=true` (default in development), search results render as an interactive property carousel instead of duplicate static listing cards.

## Tasks (8/8)

| Task | Status |
|------|--------|
| M75-GUI001 GenUI SDD & architecture | Done |
| M75-GUI002 Widget catalog | Done |
| M75-GUI003 Mobile GenUI chat integration | Done |
| M75-GUI004 SSE A2UI contract | Done |
| M75-GUI005 Orchestrator A2UI emission | Done |
| M75-GUI006 Migrate listing cards (feature flag) | Done |
| M75-GUI007 Safety allowlist | Done |
| M75-GUI008 P0 test pack | Done |

## Key files

- `features/ai_chat/genui_design.md`
- `backend/src/application/chat/a2ui-surface-builder.service.ts`
- `backend/src/application/chat/a2ui-safety.validator.ts`
- `mobile/lib/features/ai_chat/genui/`

## Env

| Variable | Purpose |
|----------|---------|
| `GENUI_ENABLED=true` | Emit `a2ui_surface`; hide legacy `listing_cards` |
| `GENUI_ENABLED=false` | M7 listing card behavior |
