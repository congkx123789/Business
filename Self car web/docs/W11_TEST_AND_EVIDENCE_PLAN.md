# Week 11 — Test, Prove, and Close Gaps

## Objectives
- DAST against payment surfaces; targeted pen-test on checkout return handlers
- WAF: move from log-only to blocking with documented exclusions
- E-skimming resilience: validate script-change alerts; run IR tabletop
- Evidence: populate control-mapping workbook with links (configs, screenshots, logs, tickets)

## Scope (Req 11; ties to Req 10, 12)
- Payment APIs and return handlers: `/api/payments/**`, `/payment/**`, `/checkout/**`
- CSP/report endpoints: `/api/security/csp-report`, `/api/security/report-script`
- WAF coverage: payment routes only

## 1) DAST & Targeted Pen-Test
- Tools: OWASP ZAP/Burp (authenticated + unauthenticated)
- Targets:
  - Redirect return flow: `GET /api/payments/return/{gateway}` (tamper signature, params)
  - Webhooks: `/api/payments/*/callback` (replay, tamper, idempotency)
  - CSP/report endpoints: ensure no SSRF/log injection
- Evidence:
  - Reports: attach PDFs/HTML to `docs/evidence/w11/dast/`
  - Issue tracker links for any findings
  - Remediation notes or compensating controls

## 2) WAF to Block Mode
- Baseline: `nginx/payment_waf.conf` (DetectionOnly)
- Steps:
  1. Review ModSecurity logs for 48h; record false positives
  2. Add documented exclusions (rule IDs/URIs)
  3. Switch to `SecRuleEngine On` in payment routes
  4. Evidence: config diff, change ticket, block logs

## 3) E-Skimming Resilience (6.4.3 / 11.6.1)
- Script-change alert test:
  - Alter a non-critical script hash; confirm alerts via `SecurityEventLogger` entries
  - Verify CSP report hits `/api/security/csp-report`
- IR tabletop (ties to Req 12):
  - Scenario: compromised third-party script on checkout
  - Outputs: comms plan, containment steps, rollback, WAF rules, evidence retention

## 4) Evidence Collection
- Populate workbook fields (owner, artifact link, date):
  - Logs: `AUDIT_EVENT`, `SECURITY_EVENT` extracts (payment init/return, config change)
  - Screenshots: CSP headers in browser, WAF dashboards, SIEM alerts
  - Configs: CSP allowlist, ModSecurity conf, TLS cipher settings
  - Change tickets: WAF switch, CSP deployment, alerting enablement

## Acceptance (W11)
- Test reports filed; high/critical findings closed or with compensating controls
- WAF in block on payment routes; exclusions documented
- Script-change alerts verified; IR tabletop summary attached


