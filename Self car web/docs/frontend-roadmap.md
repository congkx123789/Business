## Frontend Improvement Roadmap (6 months)

This roadmap stays aligned with backend API evolution, CI/CD, and SRE practices. Each month includes clear deliverables, acceptance criteria, and cross-team touchpoints.

### Month 1 — Foundations & API contract hardening

- Lock API contracts for Cars, Bookings, Users, and Vouchers (types, error codes, pagination)
  - Acceptance: OpenAPI spec updated; versioned; breaking changes flagged via CI.
- Align UI voucher flows (lookup, validate, create) with backend behaviors/edge cases
  - Acceptance: All voucher UI states mapped to server status codes.
- Standardize React Query usage
  - Deliver: Query key registry, optimistic update patterns, invalidation rules, Data Fetching Playbook.
- Error boundaries & failure UX
  - Deliver: Route-level error boundaries; consistent UI per HTTP status family.
- Quality gates in CI
  - Deliver: Lighthouse CI with budgets; Chromatic visual tests; red lines per page.
- Security posture for payments
  - Deliver: CSP with SRI on payment routes; allowlist doc.

### Month 2 — Design system hardening & accessibility

- Promote shared UI primitives (buttons, forms, modals) to a design system package
  - Acceptance: Tokens for color/spacing/typography; story coverage in Chromatic.
- A11y pass across booking flows
  - Acceptance: Axe-core CI, pages at WCAG 2.1 AA, keyboard-only paths verified.
- Theming/dark-mode foundations aligned with CSP
  - Acceptance: No inline styles on payment routes; themes via CSS variables.

### Month 3 — Performance & data efficiency

- Route-based code-splitting and critical-path optimizations
  - Acceptance: Largest pages pass performance budgets; TTI/INP improved ≥20%.
- Image and asset strategy
  - Acceptance: Next/image or equivalent, responsive sources, preconnect for APIs/CDN.
- Query waterfalls removal, cache TTL tuning
  - Acceptance: React Query Devtools shows ≤1 redundant fetch per route.

### Month 4 — Observability & runtime resilience

- Frontend observability baseline
  - Deliver: RUM (Core Web Vitals, INP, SPA navigations), error tracking with source maps.
- Network resilience
  - Deliver: Retry/backoff policy, circuit breaker for flapping endpoints, offline toasts.
- Feature flags & config
  - Deliver: Flags for risky UI; server-driven config typed end-to-end.

### Month 5 — Payments UX, security, and forms

- Payments UX hardening
  - Acceptance: 3DS flows, error retries, receipt states; CSP review.
- Form infrastructure
  - Deliver: Schema-first forms (Zod/Yup), field components, async validation.
- Localization readiness
  - Deliver: i18n scaffolding, ICU messages, date/number formatting.

### Month 6 — Reliability, migrations, and developer experience

- Progressive migration to stricter TypeScript and ESLint rules
  - Acceptance: noImplicitAny on; CI gate; zero blockers on main.
- E2E test suite coverage expansion
  - Deliver: Booking happy paths, voucher flows, payments; smoke tests in CI.
- Developer experience
  - Deliver: One-command local dev, story scaffolds, Playwright fixtures library.

### Cross-cutting Deliverables (tracked monthly)

- Docs: "Data Fetching Playbook", CSP policy, UI error mapping, design tokens
- CI: Lighthouse CI budgets, Chromatic checks, Axe CI, type-check gate
- Security: CSP + SRI, dependency audit gate, permission checks surfaced in UI

### Dependencies & Coordination

- Backend: OpenAPI versioning, error taxonomy, voucher/payment APIs
- SRE: Budgets for LH, logging targets, CSP enforcement, RUM endpoints
- Product/Design: Token definitions, component specs, page-level UX intents

### Risks

- Breaking API changes mid-month; mitigate with versioned OpenAPI and feature flags.
- Budget regressions; mitigate with enforced CI red lines and auto-fail.

### Success Criteria

- Green CI on type checks, a11y, visual diffs, and performance budgets across key routes.
- Observability dashboards show improved INP/LCP and reduced client error rate.


