# Monitoring, Detection, and Response (Week 4–12, ongoing)

## Goal: Know fast, act faster

## 1) Operational Monitoring & Alerts (DevOps/SRE)
- Metrics to instrument:
  - Request rate, error rate (4xx/5xx), latency p50/p95/p99
  - Availability (synthetic checks)
  - DB pool usage (active/idle), slow queries
  - Cache hit rate/misses
- Alerting (24/7 on-call):
  - Error rate >2% for 5m, p95 latency >1s for 10m, DB pool saturation >85%
  - Synthetic downtime any region
- Dashboards: Traffic, Latency, Errors, DB, Cache
- Ownership: On-call rotation in calendar; escalation chain documented

## 2) Security Logging & Audit Trails (SecOps)
- Centralize:
  - Auth events (login success/failure, password/MFA changes)
  - Admin actions
  - Payment events (init, return, callbacks)
  - Webhook verifications (rate-limit/replay/valid)
  - Data-access decisions (BOLA allow/deny)
- Storage: immutable/WORM bucket, time sync (NTP), retention ≥ 1 year
- Dashboards & alerts: spikes in failed login, webhook replays, BOLA denies

## 3) Vulnerability Scanning vs. Manual Pentest (SecOps)
- Automated scans: weekly (CVE/misconfig) with SLAs (P1<24h, P2<7d)
- Pentests: quarterly and after major changes; scope payment surfaces and auth flows
- Calendar: owners assigned; tickets auto-created

## 4) Incident Response Plan (SecOps + Leadership)
- IR playbook: roles, escalation matrix, comms plan, external contacts
- Tabletop schedule: semi-annual; first tabletop completed
- Runbooks: e-skimming, credential stuffing, webhook abuse, WAF block tuning
- Evidence capture: timelines, logs, configs, user comms

## Artifacts in this repo
- `docs/W11_TEST_AND_EVIDENCE_PLAN.md` – test plan & acceptance
- `docs/W12_ROLLOUT_SAQ_AND_HANDOFF.md` – rollout & SAQ
- `docs/CONTROL_MAPPING_CHEATSHEET.md` – evidence guide
- `nginx/payment_waf.conf` – WAF baseline (DetectionOnly)

## Done Criteria
- Alerts live to on-call; dashboards available
- Logs centralized and queryable; audit trails complete
- Scans and pen-tests scheduled with SLAs
- IR playbook approved; tabletop completed


