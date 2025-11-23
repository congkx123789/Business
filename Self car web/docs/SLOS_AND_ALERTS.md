SLOs and burn-rate alerts

Targets
- Availability (monthly): 99.9% API availability (excluding planned maintenance).
- p95 latency: search ≤ 300ms, reserve (hold) ≤ 500ms, checkout ≤ 800ms.
- Outbox publish delay: p95 ≤ 15s.
- Webhook verification failure rate: ≤ 0.5% per day.
- Double-sell rate: 0.

Burn-rate alerting (multi-window)
- Fast burn: 5% of error budget in 30m → page.
- Slow burn: 5% in 6h → ticket + slack.
Implement using Prometheus/Alertmanager (examples):
- SLI: `rate(http_server_errors_total[5m]) / rate(http_requests_total[5m])` per route group.
- Latency: `histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, route))`.
- Outbox lag: exporter of oldest `PENDING` age in seconds; alert > 60s (warn) / > 300s (crit).

Dashboards/metrics to watch
- Search p95, reserve/checkout p95, auth failures, DB replica lag, outbox lag, webhook failures, reserve→sale conversion.


