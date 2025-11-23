# On-Call Policy (24/7)

## Scope
- Services: Payments, API, Inventory pipeline, Search
- Alerts: high error%, high latency, availability drop, DB pool saturation, webhook failures, SLO burn

## Expectations
- Primary on-call responds within 5 minutes (SEV1), 15 minutes (SEV2)
- Keep incident comms in Slack `#incidents`; update every 15 min until resolved
- Use blameless postmortem within 48h for page-worthy incidents

## Escalation
- PagerDuty schedules: Primary → Secondary → Eng Manager
- Auto-escalate if unacked in 5 minutes (SEV1)

## Change Freeze
- When SLO budget exhausted or during active SEV1, freeze net-new launches

## Handoffs
- Weekly rotation handoff notes: top risks, open actions, known flaky alerts


