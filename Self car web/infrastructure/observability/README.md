# Observability: SLOs, SLIs, Alerts, Dashboards

This folder contains Prometheus recording rules, SLO rollups, alert rules, a starter SLO YAML, and a Grafana dashboard for Month 1.

## Layout
- `prometheus/recording-rules-sli.yaml` — SLIs for payments, API, search, inventory
- `prometheus/slo-rollups.yaml` — targets, error rates, burn rates
- `prometheus/alerts-slo-burn.yaml` — multi-window burn-rate alerts
- `prometheus/alerts-core-reliability.yaml` — core reliability alerts (error%, latency, DB, webhooks)
- `grafana/dashboards/slo-error-budgets.json` — dashboard to import
- `../observability/slo.yaml` — machine-readable SLO spec
- `docker-compose.otel-jaeger.yml` — OTel Collector + Jaeger stack
- `otel-collector-config.yaml` — OTel Collector pipelines (OTLP in, Jaeger out)
- `prometheus/kafka-consumer-lag.yaml` — Kafka Consumer Lag rules + alerts
- `prometheus/perf-cache-rules.yaml` — p95 latency and cache hit ratios
- `prometheus/alerts-perf-cache.yaml` — alerts for latency and cache hit SLOs

## Prerequisites
- Prometheus with `http_requests_total`, `http_server_duration_seconds_bucket`, `payments_total`, `inventory_reconciliation_total`
- Grafana with access to the Prometheus data source

## Deploy
1) Load recording rules and rollups (Prometheus):
```
--rule.files=
  /etc/prometheus/recording-rules-sli.yaml,
  /etc/prometheus/slo-rollups.yaml,
  /etc/prometheus/alerts-slo-burn.yaml
  /etc/prometheus/alerts-core-reliability.yaml
  /etc/prometheus/alerts-perf-cache.yaml
  /etc/prometheus/kafka-consumer-lag.yaml
  /etc/prometheus/perf-cache-rules.yaml
```

2) Import the Grafana dashboard:
- Grafana → Dashboards → Import → Upload `grafana/dashboards/slo-error-budgets.json`
- Also import `grafana/dashboards/performance.json` and `grafana/dashboards/reconciliation.json`

3) Create the dashboard “SLOs & Error Budgets” if not visible and set refresh to 30s.

4) Start tracing stack locally (optional):
```
docker compose -f docker-compose.otel-jaeger.yml up -d
```

5) Configure backend to export traces to the collector:
- Set env vars (or JVM opts):
```
OTEL_SERVICE_NAME=selfcar-backend
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317
OTEL_TRACES_EXPORTER=otlp
OTEL_METRICS_EXPORTER=none
```
- Alternatively, run with Java agent (preferred for auto-instrumentation):
```
JAVA_TOOL_OPTIONS="-javaagent:/path/opentelemetry-javaagent.jar"
```

6) (AWS) Enable centralized logs shipping (Terraform):
- In `infrastructure/terraform/terraform.tfvars`, set:
```
enable_opensearch = true
enable_log_shipping = true
opensearch_index_prefix = "selfcar-logs"
```
- Apply: `terraform apply` — creates OpenSearch, S3 backup, Firehose, and CloudWatch subscription filters.

## Alert Routing (suggested)
- Critical to on-call pager; warnings to service channel
- Tag alerts with `service` label: `payments`, `api`, `inventory`

## Notes
- Adjust thresholds to your traffic profile to avoid noise
- Use the weekly/monthly reviews as defined in `docs/sre/Month-1-How-To.md`


