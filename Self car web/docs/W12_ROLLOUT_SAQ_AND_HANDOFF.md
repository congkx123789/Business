# Week 12 — Rollout, SAQ, and Hand-off

## Objectives
- Production rollout with redirect enabled; legacy card forms removed
- Hosted-fields flows (if any) documented with A-EP obligations; payment page monitoring retained
- SAQ package completed and signed; policies updated (Req 12)
- Verify future-dated PCI DSS v4.x requirements now mandatory are in backlog

## 1) Production Rollout
- Redirect enabled for all eligible flows (SAQ A target)
- Remove legacy card forms and routes
- Validate return handlers and webhook paths are correct per gateway
- Observability:
  - Monitor `AUDIT_EVENT` for init/return spikes
  - Verify CSP violation and script-report volumes
- Rollback plan documented

## 2) Hosted-Fields Flows (If Applicable)
- Business justification: UX/accessibility requirement
- A-EP obligations:
  - Strict CSP allowlist; `frame-ancestors 'none'`
  - Script inventory approvals, change detection alerts
  - No PAN in logs, memory, telemetry; tokens only to backend
- SAQ target updated to A-EP for impacted flows; controls expanded

## 3) SAQ Package & Policies (Req 12)
- Complete SAQ A or A-EP forms
- Attachments:
  - `docs/PCI_DSS_CONTROL_MAPPING.csv` (control-mapping)
  - Evidence links: configs, screenshots, logs, tickets
  - Compensating controls (if any)
- Policies updated: security policy, IR playbook (e-skimming scenario), training, vendor due-diligence for PSP
- Sign-offs: Product, Backend, SecOps

## 4) Future-Dated Requirements (now mandatory)
- Review PCI SSC bulletin and confirm the following in backlog & timelines:
  - Payment page change/tamper detection (11.6.1) – already implemented
  - Script management and approvals (6.4.3) – implemented & governed
  - Any additional v4.x future-dated items effective Mar 31, 2025

## Acceptance (W12)
- All traffic on redirect/hosted-fields only
- SAQ + evidence package signed by Product/Backend/SecOps
- Policies updated; periodic reviews scheduled


