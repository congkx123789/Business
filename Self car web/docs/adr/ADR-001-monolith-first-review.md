# ADR-001: Monolith-First Review (April 2026)

Status: Proposed

## Context
SelfCar currently operates a modular monolith (Spring Boot backend + React frontend). Performance and security baselines are established (caching, CDN, OAuth2 cookie hardening, alerts). The team is small; operational simplicity is a priority.

## Decision
- Stay modular monolith through H1 2026.
- Consider extraction only when ALL are true for a boundary:
  1) Clear ownership and on-call coverage
  2) Sustained scaling pressure or isolation need (perf, fault, compliance)
  3) Stable API contract and data ownership
  4) Observability budgets and SLOs met for the last quarter

## Rationale
- Avoids “distributed monolith” risks and operational overhead.
- Keeps deployment simple; accelerates feature delivery.
- Existing modular packaging supports future extraction.

## Consequences
- Keep package-by-feature refactor within monolith (auth → payments → shop → logistics → insights).
- Maintain outbox pattern and document CDC toggle (Kafka/Debezium) for future throughput needs.
- Re-evaluate quarterly with SLO/error budgets.

## Metrics & Triggers
- p95 API latency consistently > 800ms despite caching → re-evaluate boundary.
- Team growth (≥ 3 feature teams) → service extraction for isolated ownership.
- Compliance demands (data residency/payment isolation) → targeted extraction.

## References
- `docs/SLOS_AND_ALERTS.md`
- `docs/MULTI_LAYER_CACHING.md`
- `docs/IMAGE_OPTIMIZATION_SETUP.md`
- `docs/PHASE6_IMPLEMENTATION.md`


