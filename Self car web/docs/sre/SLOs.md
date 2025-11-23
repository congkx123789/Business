## Service Level Objectives (Month 1)

This document defines Tiered SLOs for critical journeys with explicit SLIs, measurement methods, and monthly error budgets. Internal SLOs are stricter than any external SLA.

### Scope
- Payments (checkout through payment processor response)
- Search API (query to first byte and overall availability)
- Inventory consistency (source-of-truth vs. serving layer reconciliation)

---

### Payments — Success Rate SLO
- Objective: 99.99% monthly successful payment completion
- SLI (Success Rate): successful_payment_count / total_payment_attempts
- Events counted:
  - Success: processor-approved charges that transition order to "paid"
  - Failure: declined/errored attempts after our retry policy is exhausted
- Measurement window: Calendar month (UTC)
- Internal SLO target: 99.99%
- External SLA: 99.9% (if applicable)
- Error budget (monthly): 0.01% of attempts
  - Example: For 1,000,000 attempts/month → budget = 100 failures
- Exclusions (explicitly NOT excluded unless marked as third-party outage with agreed policy): processor regional outages, card network brownouts
- Alerts: burn-rate based (see Playbook). Fast-burn and slow-burn alerts mapped to 2% and 5% of budget per hour/day
- Source of truth: payment events stream (backend), joined with processor webhooks; deduplicated per orderId

Validation and anti-gaming guidelines:
- Count user-visible success only when order state is irrevocably paid
- Retries: count as a single attempt per user action unless user re-submits

---

### Search — P99 Latency and Availability SLOs
1) Latency SLO (P99 under load)
- Objective: P99 < 500 ms for search queries
- SLI (Latency): 99th percentile of end-to-end server latency (ingress to first byte)
- Window: Calendar month (UTC)
- Internal SLO target: P99 < 500 ms
- Error budget: minutes/requests beyond threshold considered budget burn (see burn policy)
- Scope: GET /search (and equivalent) production traffic, authenticated and guest

2) Availability SLO
- Objective: 99.9% monthly availability
- SLI (Availability): 1 - (5xx responses + timeouts) / total_requests
- Window: Calendar month (UTC)
- Internal SLO target: 99.9%
- Monthly downtime budget at 99.9%: ~43m 49s
- Health check parity: External synthetic checks must reflect customer reachability

Measurement notes:
- Exclude client-side aborts from numerator and denominator
- Include timeouts as unavailability

---

### Inventory Consistency — Reconciliation SLO
- Objective: Failed reconciliations < 0.001% monthly (99.999% consistency)
- SLI (Consistency): 1 - (failed_reconciliations / total_reconciliations)
- Reconciliation definition: VIN-level parity between source-of-truth and serving indices/caches
- Window: Calendar month (UTC)
- Internal SLO target: 99.999%
- Error budget: 0.001% of reconciliation items
  - Example: For 10,000,000 VIN checks → budget = 100 failures

Measurement notes:
- A failure is a mismatch not corrected by automated repair within the SLA’d repair window (e.g., 5 minutes)
- Staleness is considered failure if exceeding repair window

---

### Shared Measurement & Governance
- Time base: UTC; calendar-month windows for Month 1
- Data pipeline: metrics emitted from backend services; stored in time-series DB; reconciler emits counters
- Ownership:
  - Payments SLO: Payments team (backend + ops)
  - Search SLOs: Search/API team
  - Inventory consistency: Inventory/Platform team
- Reporting: dashboards with monthly rollups and burn-down charts

### Error Budget Policy (Summary)
- Monthly budgets computed per SLO as above
- Freeze policy: New feature launches freeze when an SLO’s monthly budget is fully consumed
- Unfreeze requires: postmortem completed, corrective actions accepted, 7 days stable burn under 25% of expected rate
- Alerting: multi-window burn-rate alerts (fast and slow) to on-call + owners

### Initial Targets Validation
- Targets reflect business priority of unique VIN inventory and payments reliability
- Revisit after 30 days of data for calibration


