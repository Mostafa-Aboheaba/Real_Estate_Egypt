# Real Estate Agent Platform

AI-first real estate platform for property discovery, recommendations, and booking.

## Project Structure

```
Real_Estate_agent/
├── specs/                  # Product vision and high-level requirements
│   ├── vision.md
│   └── requirements.md
├── features/               # Feature specs (SDD artifacts per module)
│   ├── authentication/
│   ├── ai_chat/
│   ├── property_search/
│   ├── recommendation/
│   ├── booking/
│   └── profile/
├── architecture/           # System and layer architecture docs
│   ├── system_design.md
│   ├── clean_architecture.md
│   ├── flutter_architecture.md
│   ├── backend_architecture.md
│   ├── ai_agent_architecture.md
│   ├── rag_architecture.md
│   ├── ai_services_architecture.md
│   ├── ai_provider_strategy.md
│   ├── listing_providers.md
│   └── deployment_architecture.md
├── PROJECT_STATUS.md       # Auto-generated executive dashboard
├── tasks/                  # Delivery planning
│   ├── roadmap.md
│   └── master_execution_plan.md
├── backend/                # NestJS — see backend/PROJECT_STRUCTURE.md
├── mobile/                 # Flutter app — platform bootstrap complete
└── docs/                   # Documentation index
```

## Development Process

This project follows **Specification Driven Development (SDD)**:

1. Requirements → User Stories → Acceptance Criteria
2. Architecture Design → Data Model → API Design
3. Implementation Tasks → Tests
4. **Approval gate** → then code

Track progress: [`PROJECT_STATUS.md`](PROJECT_STATUS.md) (regenerate with `python3 tasks/build_project_status.py` after completing tasks).

Formal SDD sign-off is still pending in [`tasks/m1_approval_signoff.md`](tasks/m1_approval_signoff.md); M2–M4 implementation is in progress in `backend/` and `mobile/`.

## Approved Stack

| Component | Choice |
|-----------|--------|
| Backend | Node.js / NestJS |
| ORM | Prisma |
| Storage | PostgreSQL 16 |
| Vector DB | pgvector |
| LLM | Google Gemini (Vertex AI in cloud) |
| Cloud | Google Cloud Platform |
| CI/CD | GitHub Actions |
| Mobile API | REST (MVP) |
| Mobile | Flutter (Clean Architecture) |
| Market | Egypt — EGP, ar-EG + en |
| Auth | Google, Apple, email/password |
| LLM | Google Gemini |
| Listings | Shaety (شقتي), Aqarmap, Property Finder Egypt |
| Agent onboarding | Automated |

## Quick Links

- [Vision](specs/vision.md)
- [Requirements](specs/requirements.md)
- [System Design](architecture/system_design.md)
- [Flutter Architecture](architecture/flutter_architecture.md)
- [Backend Architecture](architecture/backend_architecture.md)
- [RAG Architecture](architecture/rag_architecture.md)
- [AI Agent Architecture](architecture/ai_agent_architecture.md)
- [AI Services Architecture](architecture/ai_services_architecture.md)
- [Deployment Architecture](architecture/deployment_architecture.md)
- [Task registry](tasks/README.md) — 133 independently testable tasks (≤4h each)
- [M2 Platform Bootstrap Report](tasks/m02_platform_bootstrap_completion_report.md)
- [Master Execution Plan](tasks/master_execution_plan.md)
- [Roadmap](tasks/roadmap.md)
- [Documentation Index](docs/README.md)

## Next Steps

1. Approve Phase 0 foundation docs (stack decisions recorded)
2. Begin full SDD cycle for **authentication** (recommended first feature)
3. Approve authentication specs before any implementation
