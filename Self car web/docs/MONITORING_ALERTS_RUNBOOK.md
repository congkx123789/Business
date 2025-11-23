# Monitoring, Detection, and Response Runbook

## Metrics to Instrument
- Request rate, error rate, latency (p50/p95/p99)
- Availability (success ratio)
- DB pool usage (Hikari: active, idle, max)
- Cache hit rate (if/when cache added)
- Webhook validations (rate, failures)
- Payment events by status

## Implementation
- Spring Boot Actuator + Micrometer Prometheus.
- HTTP metrics auto via Spring MVC: `http_server_requests`.
- HikariCP metrics auto-registered; expose via `/actuator/metrics` and `/actuator/prometheus`.
- Security/Audit logs: `logs/security-events.log`, `logs/audit-events.log`.

## Dashboards (Grafana suggestions)
- API Overview: RPS, error %, p95/p99 latency, 5xx by endpoint.
- DB: pool utilization, wait time.
- Webhooks: requests, 2xx/4xx/5xx, verification failures.
- Payments: initiated/succeeded/failed by gateway.

## Alerting (24/7 on-call)
- High error rate: error% > 5% for 5m.
- High latency: p95 > 1s for 10m; p99 > 2s for 5m.
- Availability drop: success < 99% for 10m.
- DB pool exhaustion: active connections > 90% for 5m.
- Webhook failures spike: verification failures > 10/min for 5m.
- Security: rate limit exceeded bursts; suspicious activity events.

See `docs/alerts/prometheus-rules.yml` for examples.

## On-Call Process
- Alerts page primary on-call via PagerDuty/OpsGenie.
- Acknowledge within 5 minutes; open incident and follow IR playbook.
- Attach relevant graphs and logs in the incident channel.

