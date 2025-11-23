## Blameless Postmortem Template

Title: <Service/Incident Summary>
Date: <YYYY-MM-DD>
Severity: <SEV1/SEV2/SEV3>
SLOs Affected: <Payments/Search/Inventory>

### Summary
- What happened in one paragraph, user impact, duration

### Impact
- Customer impact: who, what, how many
- SLO impact: % budget burned, downtime, breached/not breached

### Timeline (UTC)
- 00:00 – Detection (alert/synthetic/user report)
- 00:05 – Acknowledged by on-call
- 00:15 – Mitigation started
- 00:45 – Mitigation completed
- 01:10 – Fully resolved

### Root Cause Analysis
- Technical factors (systems, configs, dependencies)
- Contributing conditions (load, feature flag, deploy)
- Why ladder (5-whys or causal graph)

### What Went Well
- Detection, runbooks, safe-guards, observability

### What Went Poorly
- Gaps in detection, toil, unclear ownership, noisy alerts

### Corrective and Preventive Actions (CPAs)
- Action 1 — Owner — Priority — Due Date
- Action 2 — Owner — Priority — Due Date
- Tests/monitors to add

### Rollback/Recovery Artifacts
- Links to dashboards, traces, logs, PRs, feature flags

### Communications
- Internal comms (Slack threads, summary)
- External comms (status page, customer updates)

### Approval
- Reviewed by: <Name/Role>
- Date:

Notes:
- No blame; focus on systems and safeguards
- Required for page-level incidents or >10% monthly budget burned within 24h


