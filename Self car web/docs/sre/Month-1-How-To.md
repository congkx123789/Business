# Month 1 — Culture, SLOs & Error Budgets (How‑To Guide)

**Scope**: Payments, Search API, overall API availability, and Inventory consistency (reconciliation).

> Note: This is written to be executed in 4 weeks. Adjust owners/dates to your team.

---

## Week 1 — Foundations & Data

### 1) Agree on blameless culture & postmortems (2 hrs)

* Adopt these ground rules:

  1. Focus on **systems and processes**, not individuals.

  2. Use facts & timelines; avoid hindsight bias.

  3. Every high‑severity incident produces a postmortem within **48 hours**.

* Create a shared folder: `Ops/Postmortems/` and a Slack alias `#incidents`.

* Add the template in this doc (see Appendix A) to your wiki/Notion.

### 2) Define SLIs → SLOs (½ day)

**Service Level Indicators (SLIs)** & **Objectives (SLOs)** you will track:

1. **Payment success rate (critical path)**

   * *SLI (ratio)*: successful payments / total payments.

   * *SLO*: **≥ 99.99%** over rolling 30 days.

   * *Allowed monthly errors (30d)*: **0.01%** of attempts, i.e., **4.32 minutes** worth of unavailability equivalent.

2. **Search latency (P99)**

   * *SLI (latency)*: `P99` of `/search` handler end‑to‑end.

   * *SLO*: P99 **< 500 ms** over rolling 7/30 days.

3. **API availability**

   * *SLI (ratio)*: 1 ‑ (5xx / all) for public APIs.

   * *SLO*: **≥ 99.9%** over rolling 30 days (*~43.2 min monthly error budget*).

4. **Inventory data consistency**

   * *SLI (ratio)*: reconciliation_failures / reconciliation_checks.

   * *SLO*: **< 0.001%** failures (≈ **99.999%** consistent) over rolling 30 days (*~25.92 s monthly error budget*).

> Vietnamese note: **SLO** = mục tiêu chất lượng dịch vụ; **SLI** = chỉ số đo lường; **Error budget** = ngân sách lỗi.

### 3) Make sure data exists (1 day)

Instrument/verify metrics (Prometheus‑friendly names shown):

* **Payments**

  * `counter payments_total{status="success|failed", provider, currency}`

  * `gauge payment_webhook_lag_seconds{provider}` (optional)

* **HTTP/API**

  * `counter http_requests_total{code, method, route}`

  * `histogram http_server_duration_seconds_bucket{route}` (server‑side)

* **Search**

  * Reuse `http_server_duration_seconds_bucket{route="/search"}`

* **Inventory reconciliation**

  * `counter inventory_reconciliation_total{result="success|failure", source}`

Make sure each log line carries a `trace_id` and key business ids (`order_id`, `vin`) to correlate with traces.

---

## Week 2 — Queries, Recording Rules, Dashboards

### 4) PromQL SLIs (copy/paste)

```yaml

# === Recording rules: SLI inputs ===

# 1) Payments

- record: sli:payments_success:ratio

  expr: |

    sum(rate(payments_total{status="success"}[5m]))

    /

    sum(rate(payments_total[5m]))

# 2) API availability

- record: sli:api_availability:ratio

  expr: |

    1 - (

      sum(rate(http_requests_total{code=~"5.."}[5m]))

      /

      sum(rate(http_requests_total[5m]))

    )

# 3) Search P99 latency (server)

- record: sli:search_p99_latency:seconds

  expr: |

    histogram_quantile(

      0.99,

      sum by (le) (rate(http_server_duration_seconds_bucket{route="/search"}[5m]))

    )

# 4) Inventory consistency

- record: sli:inventory_consistency:ratio

  expr: |

    1 - (

      sum(rate(inventory_reconciliation_total{result="failure"}[5m]))

      /

      sum(rate(inventory_reconciliation_total[5m]))

    )

```

### 5) SLO rollups & budget math

```yaml

# Target SLOs

- record: slo:target:payments_success

  expr: 0.9999

- record: slo:target:api_availability

  expr: 0.999

- record: slo:target:inventory_consistency

  expr: 0.99999

# Error rate series (1 - SLI)

- record: error:rate:payments

  expr: 1 - sli:payments_success:ratio

- record: error:rate:api

  expr: 1 - sli:api_availability:ratio

- record: error:rate:inventory

  expr: 1 - sli:inventory_consistency:ratio

# Burn rate = (current error rate) / (error budget fraction)

- record: burn:payments

  expr: (1 - sli:payments_success:ratio) / (1 - slo:target:payments_success)

- record: burn:api

  expr: (1 - sli:api_availability:ratio) / (1 - slo:target:api_availability)

- record: burn:inventory

  expr: (1 - sli:inventory_consistency:ratio) / (1 - slo:target:inventory_consistency)

```

### 6) Grafana dashboard (what to add)

Create one dashboard **“SLOs & Error Budgets”** with panels:

* **Gauges**: current SLI vs SLO target for Payments, API, Inventory.

* **Timeseries**: `sli:*` and `burn:*` (5m and 1h rate overlays).

* **SingleStat**: Remaining monthly budget (see panel formula below).

**Remaining budget (30d window) example formula**:

```

remaining = (SLO * 30d) - (integral(error_rate over 30d))

```

You can approximate in Grafana with PromQL using `sum_over_time(error:rate[30d])` and multiply by minutes.

---

## Week 3 — Alerts & Policy

### 7) Multi‑window burn‑rate alerting

Use two severities per SLO. Tune windows to your traffic.

**Critical page (fast burn)** — burns budget very quickly:

```yaml

- alert: SLOFastBurn_Payments

  expr: (

    avg_over_time(burn:payments[5m]) > 10

  ) and (

    avg_over_time(burn:payments[1h]) > 10

  )

  for: 5m

  labels: {severity: critical, service: payments}

  annotations:

    summary: "Payments SLO burning fast"

    description: "Burn rate >10 on 5m & 1h — risk of budget exhaustion. Freeze changes, page on‑call."

```

**Warning (slow burn)** — sustained degradation:

```yaml

- alert: SLOSlowBurn_Payments

  expr: (

    avg_over_time(burn:payments[30m]) > 2

  ) and (

    avg_over_time(burn:payments[6h]) > 2

  )

  for: 30m

  labels: {severity: warning, service: payments}

  annotations:

    summary: "Payments SLO burning slowly"

    description: "Burn rate >2 on 30m & 6h — investigate before budget is consumed."

```

> Use the same structure for API and Inventory (replace `burn:payments`). Start with the thresholds above; adjust to reduce noise.

### 8) Error‑budget policy (one page everyone signs)

* **Budget window**: Rolling 30 days.

* **Change policy**:

  * If **any SLO’s remaining budget < 25%**, **freeze launches** for that service. Only reliability fixes allowed.

  * If **budget < 10%**, freeze + **mandatory root‑cause review** with engineering lead.

* **Ownership**: Every SLO has a DRI (directly responsible individual).

* **Review cadence**: Weekly budget review; quarterly SLO target review.

---

## Week 4 — Postmortems & Runbooks

### 9) Practice a postmortem (table‑top)

* Run a 60‑min simulation (e.g., payment gateway intermittent 5xx). Produce a postmortem using the template below.

* Store at `Ops/Postmortems/YYYY‑MM‑DD‑<slug>.md`.

### 10) Runbooks (one per SLO)

Each runbook must include:

* **Symptoms** (what dashboards/alerts look like)

* **Quick triage** (5‑minute checks)

* **Deep dive** (queries, traces)

* **Rollback/mitigation** (feature flags, traffic shaping, cache TTL tweaks)

* **Escalation list** (names, Slack, phone)

---

## Appendix A — Blameless Postmortem Template (Markdown)

```markdown

# Postmortem: <Incident title>

**Date/time:** <start – end (timezone)>

**Severity:** SEV1 | SEV2 | SEV3

**Services:** <payments, api, inventory, etc.>

**DRI:** <name>

## Summary

One‑paragraph, customer‑focused description of what happened and impact.

## Customer Impact & Metrics

- Impacted users/requests (%/count)

- Duration

- SLO budget consumed (by which SLO?)

## Timeline (all times local)

- T0 – First user impact detected (alert/monitor/helpdesk)

- T+?m – On‑call paged

- T+?m – Mitigation applied (what)

- T+?m – Confirmed recovery

## Root Causes & Contributing Factors

- Primary root cause

- Contributing factors (config, process, tooling, people)

## What Worked / What Didn’t

- Detection

- Diagnosis

- Mitigation

## Corrective & Preventative Actions (CPAs)

| ID | Action | Owner | Priority | Due |

|----|--------|-------|----------|-----|

| PM‑1 | <example> | <name> | P1 | YYYY‑MM‑DD |

## Follow‑ups

- Link to related tickets, commits, dashboards

- Lessons learned

```

---

## Appendix B — Starter `slo.yaml` (machine‑readable spec)

```yaml

service: selfcarweb

slos:

  - name: payments_success

    objective: 99.99

    sli:

      type: ratio

      success_metric: sum(rate(payments_total{status="success"}[5m]))

      total_metric: sum(rate(payments_total[5m]))

    window: 30d

    alerting:

      fast_burn:

        short: 5m

        long: 1h

        threshold: 10

      slow_burn:

        short: 30m

        long: 6h

        threshold: 2

    owner: payments@selfcarweb

  - name: api_availability

    objective: 99.9

    sli:

      type: ratio

      success_metric: sum(rate(http_requests_total[5m])) - sum(rate(http_requests_total{code=~"5.."}[5m]))

      total_metric: sum(rate(http_requests_total[5m]))

    window: 30d

    owner: platform@selfcarweb

  - name: inventory_consistency

    objective: 99.999

    sli:

      type: ratio

      success_metric: sum(rate(inventory_reconciliation_total{result="success"}[5m]))

      total_metric: sum(rate(inventory_reconciliation_total[5m]))

    window: 30d

    owner: data@selfcarweb

```

---

## Appendix C — How to communicate SLOs to the team (1 slide)

* **Why now**: Unique VINs mean *consistency* outages hurt as much as *availability*.

* **What we track**: Payments, API, Search latency, Inventory consistency.

* **How we act**: Error‑budget triggers change freezes and CPAs.

* **How we learn**: Blameless postmortems within 48h and weekly reviews.

---

## Success Checklist (tick these by Friday of each week)

**Week 1**

* [ ] SLOs agreed, owners assigned

* [ ] Postmortem template published

* [ ] Metrics confirmed in Prometheus

**Week 2**

* [ ] Recording rules deployed

* [ ] Grafana dashboard created

**Week 3**

* [ ] Alert rules live in Alertmanager

* [ ] Error‑budget policy approved & shared

**Week 4**

* [ ] Table‑top incident done & postmortem written

* [ ] Runbooks completed for each SLO


