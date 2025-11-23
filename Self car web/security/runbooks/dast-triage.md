# DAST Triage Runbook

Scope: OWASP ZAP weekly authenticated scans against Staging (checkout, deposit, profile).

SLA:
- Critical: triage and start remediation < 48 hours
- High: triage and start remediation < 7 days

Flow:
1) Review ZAP report artifact (JSON) from the latest run.
2) De-duplicate findings; validate exploitability in Staging.
3) Create tickets with severity, evidence, and owner.
4) Remediate per SLA; add tests where relevant.
5) Verify in next weekly scan; close tickets once resolved.

Alerting (optional):
- Set `DAST_SLACK_WEBHOOK_URL` to receive Slack notifications when High/Critical findings are detected.

Ticket template:
- Title: [DAST][Severity] <rule>: <endpoint>
- Evidence: request/response, steps
- CWE/OWASP mapping
- Owner and due date

