# SDD Artifact Checklist

> Required sections for each feature spec file (Sprint 001 / M1).

## requirements.md

- [ ] Document status + version
- [ ] Purpose and scope (in / out)
- [ ] Personas and roles
- [ ] Functional requirements table (FR-* with P0/P1)
- [ ] User story → FR traceability
- [ ] Applicable NFRs
- [ ] Dependencies and assumptions
- [ ] Open questions (owned or empty)

## architecture.md

- [ ] Backend module and layer mapping
- [ ] Mobile feature folder structure
- [ ] Links to global architecture docs
- [ ] External services and queues
- [ ] At least one diagram (mermaid optional)

## data_model.md

- [ ] Domain entities and value objects
- [ ] Aggregates and invariants
- [ ] Prisma / PostgreSQL mapping
- [ ] Indexes and FK notes

## api_design.md

- [ ] Link to [api_conventions.md](../architecture/api_conventions.md)
- [ ] Endpoint table (method, path, auth, roles)
- [ ] P0 request/response JSON examples
- [ ] Per-endpoint error codes

## tests.md

- [ ] Test ID convention (`<FEAT>-T-###`)
- [ ] Unit / integration / E2E sections
- [ ] AC-ID → Test-ID matrix (100% P0)
- [ ] Compliance tests where applicable (PDPL, fair housing)

## implementation_tasks.md

- [ ] Ordered tasks linking to `tasks/m0X-*`
- [ ] Each chunk ≤ 4 hours
- [ ] Approval gate reminder
