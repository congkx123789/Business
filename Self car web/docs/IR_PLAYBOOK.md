# Incident Response Playbook

## Purpose
Define roles, escalation, communication, and procedures to triage and resolve incidents quickly.

## Roles
- Incident Commander (IC): Owns response; decision-maker.
- Comms Lead: Stakeholder/customer updates.
- Ops Lead (DevOps/SRE): Mitigation, rollback, infra.
- App Lead (Backend/Frontend): Code triage and fixes.
- SecOps Lead: Security incidents, forensics, legal.

## On-Call & Escalation
- Primary on-call: DevOps/SRE Pager rotation (24/7).
- Secondary on-call: Backend lead.
- Escalation matrix:
  1. Primary on-call (5 min)
  2. Secondary on-call (10 min)
  3. IC + Leadership (15 min)
  4. External contacts (per Severity below)

## Severity Levels
- Sev1: Full outage, data breach, payments failing (>50%).
- Sev2: Degraded performance, partial outages, suspicious activity.
- Sev3: Minor bugs, intermittent errors.

## Declare and Kickoff
1. Open incident in tracker; assign IC and severity.
2. Create dedicated channel (#inc-YYYYMMDD-HHMM).
3. Start timeline; begin 15-min update cadence.

## Communication Plan
- Internal: Slack channel + email distro (eng-all@, exec@).
- External: Status page, customer email template, PSP contact if payment-impacting.
- Regulatory: If PII/payment data involved, notify legal within 1 hour.

## Investigation & Containment
1. Gather facts: metrics (latency p50/p95/p99, error rate), logs (SECURITY_EVENT, AUDIT_EVENT), deploy diffs.
2. Contain: rate-limit, feature flag, WAF rule, revoke keys, scale up, rollback.
3. Validate with health/metrics endpoints and synthetic checks.

## Eradication & Recovery
- Apply hotfix/rollback; verify with dashboards and canary.
- Post-restore validation: error rate <1%, p95 latency within SLO, business KPIs green.

## Postmortem (within 48h)
- Blameless write-up: timeline, root cause, impact, what worked/didn’t, action items with owners/dates.
- Store under docs/incidents/INC-YYYYMMDD.md.

## External Contacts
- Cloud provider support: <account/contract>
- Payment providers (Momo, ZaloPay, Stripe): escalation emails/portals
- Legal counsel: <contact>
- Security IR firm: <contact>

## Tabletop Exercise Checklist
- Simulate: auth breach, webhook abuse, payment outage, DB failure.
- Validate: escalation, comms, metrics/alerts, runbooks, backups/restore.
- Done when: Findings captured as action items and owners assigned.

