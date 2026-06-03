# Documentation

> Project-wide documentation index.

## Specification Documents

| Document | Path |
|----------|------|
| Vision | [specs/vision.md](../specs/vision.md) |
| Requirements (SRS) | [specs/requirements.md](../specs/requirements.md) |
| User Stories Index | [specs/user_stories_index.md](../specs/user_stories_index.md) |

## Architecture

| Document | Path |
|----------|------|
| System Design | [architecture/system_design.md](../architecture/system_design.md) |
| Flutter Architecture | [architecture/flutter_architecture.md](../architecture/flutter_architecture.md) |
| Backend Architecture | [architecture/backend_architecture.md](../architecture/backend_architecture.md) |
| RAG Architecture | [architecture/rag_architecture.md](../architecture/rag_architecture.md) |
| AI Agent Architecture | [architecture/ai_agent_architecture.md](../architecture/ai_agent_architecture.md) |
| AI Services Architecture | [architecture/ai_services_architecture.md](../architecture/ai_services_architecture.md) |
| Gemini Integration Layer | [architecture/gemini_integration_layer.md](../architecture/gemini_integration_layer.md) |
| Monitoring Strategy | [architecture/monitoring_strategy.md](../architecture/monitoring_strategy.md) |
| Deployment Architecture | [architecture/deployment_architecture.md](../architecture/deployment_architecture.md) |
| Clean Architecture | [architecture/clean_architecture.md](../architecture/clean_architecture.md) |
| Listing Providers | [architecture/listing_providers.md](../architecture/listing_providers.md) |
| PostgreSQL Schema | [architecture/postgresql_schema.md](../architecture/postgresql_schema.md) |

## Planning

| Document | Path |
|----------|------|
| Task registry (≤4h tasks) | [tasks/README.md](../tasks/README.md) |
| Master Execution Plan | [tasks/master_execution_plan.md](../tasks/master_execution_plan.md) |
| Mobile Bootstrap Report | [tasks/mobile_platform_bootstrap_completion_report.md](../tasks/mobile_platform_bootstrap_completion_report.md) |
| Roadmap | [tasks/roadmap.md](../tasks/roadmap.md) |

## Feature Specifications

Each feature follows the SDD artifact checklist defined in its README:

| Feature | Index |
|---------|-------|
| Authentication | [features/authentication/README.md](../features/authentication/README.md) |
| Property Search | [features/property_search/README.md](../features/property_search/README.md) |
| AI Chat | [features/ai_chat/README.md](../features/ai_chat/README.md) |
| Recommendation | [features/recommendation/README.md](../features/recommendation/README.md) |
| Booking | [features/booking/README.md](../features/booking/README.md) |
| Profile | [features/profile/README.md](../features/profile/README.md) |

## Development Process

1. Write specs (Requirements → Tests) for a feature
2. Review and approve specs
3. Implement in `backend/` and `mobile/`
4. Verify against acceptance criteria
5. Update docs

## Conventions

- All specs are Markdown in version control
- Feature specs live under `features/<name>/`
- No implementation code without approved specs
