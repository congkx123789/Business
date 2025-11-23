## Error Budget Playbook (Monthly Policy)

This playbook operationalizes SLO error budgets, alerts, freezes, and recoveries for Month 1.

### Definitions
- Error Budget: allowable unreliability within a window = 1 - SLO target
- Window: Calendar month (UTC)
- SLOs in scope: Payments success (99.99%), Search P99 latency (<500 ms), Search availability (99.9%), Inventory consistency (99.999%)

### Burn-Rate Alerting
Use multi-window burn alerts to catch fast regressions and slow drifts.

- Fast-burn (page on-call):
  - Payments: >5% of monthly budget burned in 1 hour OR >10% in 6 hours
  - Search Availability: projected to exhaust budget in <24h
  - Search Latency: P99 > 500 ms for 30 min sustained AND projected to exhaust latency budget in <24h
  - Inventory Consistency: >2% budget burned in 1 hour

- Slow-burn (ticket + daytime page to owner):
  - Payments: >20% budget burned in 3 days
  - Search Availability/Latency: >20% budget burned in 3 days
  - Inventory: >10% budget burned in 3 days

Alert routing: on-call primary, service owners, Slack #incidents, email DL

### Freeze Policy
- When an SLO’s monthly budget is fully consumed, freeze new feature launches for the owning service/team
- Allowed work during freeze: reliability fixes, rollbacks, infra mitigations, tests, observability, dependency upgrades that reduce risk
- Disallowed during freeze: net-new features, risky migrations, config that increases blast radius

### Unfreeze Requirements
All of the following:
1) Blameless postmortem completed and shared
2) Action items created, severities assigned, owners named, due dates set
3) At least 7 consecutive days with projected burn rate ≤ 25% of expected pace
4) Owners confirm mitigations deployed and verified on dashboards

### Incident Response Tie-in
- Use the postmortem template for any page-level incident or when >10% of monthly budget burns within 24h
- Track budget remaining on dashboards; add a "budget left" widget per SLO
- During incidents, prefer safe-guardrails: feature flags, traffic shaping, circuit breakers, and progressive delivery

### Governance
- Ownership: service teams own SLOs and budgets; SRE facilitates policy
- Reviews: weekly 15-min SLO review; monthly retrospective on burns and freezes
- Escalation: if >50% budget consumed by day 10 of month, escalate to Eng leadership

### Calculations (Month-level)
- Availability budget (99.9%): ~43m 49s per month
- Payments success (99.99%): budget = 0.01% of attempts
- Inventory consistency (99.999%): budget = 0.001% of reconciliation items
- Latency budget: requests above threshold count as budget burn; project burn via rate × remaining time

### Dashboards & Signals
- Show: SLO target, current attainment, budget remaining, burn rate (hour/day), projections
- Break down by: region, API route, payment processor, VIN source
- Synthetic checks: parity with real-user monitoring for availability


