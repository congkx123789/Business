# Dashboards & Alerts

## Dashboards (Grafana)

### Panels
- **CDN Cache Hit Rate**: CloudFront `CacheHitRate` by path group
- **Origin Requests**: CloudFront Origin Requests per minute
- **Redis Hit/Miss**: `cache_hits_total`, `cache_misses_total` stacked; hit ratio
- **DB Read QPS**: `db_reads_total` over time
- **Latency**: p50/p95/p99 for API (Micrometer histograms)
- **Error Rates**: 4xx/5xx from App and CDN

### Example PromQL
```promql
# Redis hit ratio (overall)
sum(rate(cache_hits_total[5m])) / (sum(rate(cache_hits_total[5m])) + sum(rate(cache_misses_total[5m])))

# VDP hit ratio
sum(rate(cache_hits_total{namespace="vdp"}[5m])) /
(sum(rate(cache_hits_total{namespace="vdp"}[5m])) + sum(rate(cache_misses_total{namespace="vdp"}[5m])))

# API latency p95 (Micrometer histograms)
histogram_quantile(0.95, sum(rate(http_server_requests_seconds_bucket[5m])) by (le, uri))
```

## Alerts

### Prometheus Alert Rules (YAML)
```yaml
groups:
- name: cache-and-latency
  rules:
  - alert: LowVDPAppCacheHitRate
    expr: sum(rate(cache_hits_total{namespace="vdp"}[15m])) /
          (sum(rate(cache_hits_total{namespace="vdp"}[15m])) + sum(rate(cache_misses_total{namespace="vdp"}[15m]))) < 0.8
    for: 30m
    labels:
      severity: warning
    annotations:
      summary: "VDP cache hit rate low (<80%)"
  - alert: HighAPIP95Latency
    expr: histogram_quantile(0.95, sum(rate(http_server_requests_seconds_bucket[5m])) by (le)) > 0.8
    for: 10m
    labels:
      severity: critical
    annotations:
      summary: "High p95 API latency (>800ms)"
```

### CloudWatch Alarms (AWS CLI)
```powershell
# CloudFront CacheHitRate < 85% for 30m
aws cloudwatch put-metric-alarm `
  --alarm-name "CF-Low-CacheHitRate" `
  --metric-name CacheHitRate `
  --namespace AWS/CloudFront `
  --statistic Average `
  --period 300 `
  --threshold 85 `
  --comparison-operator LessThanThreshold `
  --evaluation-periods 6 `
  --dimensions Name=DistributionId,Value=$env:CLOUDFRONT_DISTRIBUTION_ID `
  --treat-missing-data breaching

# High Origin Requests (> baseline * factor)
aws cloudwatch put-metric-alarm `
  --alarm-name "CF-High-Origin-Requests" `
  --metric-name OriginRequests `
  --namespace AWS/CloudFront `
  --statistic Sum `
  --period 300 `
  --threshold 10000 `
  --comparison-operator GreaterThanThreshold `
  --evaluation-periods 3 `
  --dimensions Name=DistributionId,Value=$env:CLOUDFRONT_DISTRIBUTION_ID `
  --treat-missing-data notBreaching
```

## Error Budgets

Define SLOs and budgets (monthly):
- **Availability SLO**: 99.9% for API
- **Latency SLO**: p95 < 800ms, p99 < 1500ms
- **Cache SLO**: VDP hit rate ≥ 80%, CDN hit rate ≥ 85%

Alert when error budget consumption exceeds thresholds (e.g., 25%, 50%, 75%).

## Rollout Notes
- Add dashboards to Grafana; share links with on-call
- Hook alerts into PagerDuty/Slack
- Review weekly in performance standup
