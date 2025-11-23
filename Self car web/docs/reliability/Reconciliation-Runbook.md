# Reconciliation Runbook (VIN Consistency)

## Signals
- SLI: `sli:inventory_consistency:ratio` (target 0.99999)
- Metrics: `inventory_reconciliation_total{result,source}`
- Alerts: SLO burn alerts + `reconciliation.json` dashboard

## Quick Triage (5 min)
- Check Grafana dashboard “Inventory Reconciliation”
- Inspect burn rate; if trending to budget exhaustion: freeze changes
- Check Kafka lag (if pipeline uses Kafka)

## Deep Dive
- Identify top VINs failing (logs search for `recon.mismatch`)
- Validate dealer/source API responses vs serving index/cache
- Check recent deploys, feature flags, TTLs

## Mitigations
- Manually trigger reconciliation:
  - POST `/admin/reconciliation/run`
- Adjust cache TTLs for inventory paths
- If data delayed upstream: degrade search to hide stale VINs

## Escalation
- Treat breaches with same severity as availability incidents
- Page on-call; open incident in `#incidents`; follow postmortem template


