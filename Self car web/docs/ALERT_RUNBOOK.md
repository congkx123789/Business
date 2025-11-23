# Alert Runbook

**Last Updated:** January 2026  
**Alert Rules:** [`docs/alerts/prometheus-rules.yml`](docs/alerts/prometheus-rules.yml)  
**On-Call Rotation:** Configure in PagerDuty/OpsGenie

## Alert Categories

### 🚨 Critical (Page Immediately)

#### HighErrorRate
- **Severity:** `page`
- **Trigger:** Error rate > 5% for 5 minutes
- **Response Time:** < 5 minutes
- **Runbook:**
  1. Check `/actuator/health` endpoint
  2. Review application logs: `tail -f backend/logs/application.log`
  3. Check database connectivity: `mysql -u root -p selfcar_db`
  4. Verify Redis cache availability
  5. Check for deployment issues or recent changes
  6. Escalate if error rate persists > 10 minutes

#### HighLatencyP99
- **Severity:** `page`
- **Trigger:** p99 latency > 2s for 5 minutes
- **Response Time:** < 5 minutes
- **Runbook:**
  1. Check database query performance: `SHOW PROCESSLIST;`
  2. Review slow query log (if enabled)
  3. Check HikariCP pool usage: `/actuator/metrics/hikaricp.connections.active`
  4. Verify cache hit rates: `/api/admin/cache/metrics/overall`
  5. Check external API dependencies (payment gateways)
  6. Review application logs for blocking operations
  7. Consider scaling up if consistent load issue

#### DBPoolExhaustion
- **Severity:** `page`
- **Trigger:** HikariCP pool usage > 90% for 5 minutes
- **Response Time:** < 5 minutes
- **Runbook:**
  1. Check active connections: `/actuator/metrics/hikaricp.connections.active`
  2. Review database connection pool configuration in `application.properties`
  3. Check for connection leaks: `SHOW PROCESSLIST;`
  4. Review slow queries that may be holding connections
  5. Temporarily increase pool size if needed: `spring.datasource.hikari.maximum-pool-size=20`
  6. Restart application if connections are leaked
  7. Monitor for 30 minutes after fix

#### WebhookVerificationFailures
- **Severity:** `page`
- **Trigger:** Payment webhook failures > 10/min for 5 minutes
- **Response Time:** < 5 minutes
- **Runbook:**
  1. Check webhook security logs: `grep "WEBHOOK" backend/logs/security-events.log`
  2. Review payment provider status pages (Momo, ZaloPay, Stripe)
  3. Verify IP allowlist configuration: `webhook.ip-allowlist`
  4. Check rate limiting: `webhook.rate-limit-per-minute`
  5. Review replay protection settings: `webhook.replay-window-minutes`
  6. Test webhook endpoint manually: `curl -X POST https://api.selfcar.com/api/payments/momo/callback`
  7. Escalate to payment team if provider issue

### ⚠️ Warning (Ticket, Page if Escalates)

#### HighLatencyP95
- **Severity:** `page`
- **Trigger:** p95 latency > 1s for 10 minutes
- **Response Time:** < 15 minutes
- **Runbook:**
  1. Review performance metrics dashboard
  2. Check cache hit rates
  3. Investigate slow endpoints via `/actuator/prometheus`
  4. Monitor for escalation to p99 alert

#### VDPDiskCacheHitRateDrop
- **Severity:** `ticket`
- **Trigger:** VDP cache hit rate < 80% for 10 minutes
- **Response Time:** < 1 hour
- **Runbook:**
  1. Check Redis availability: `redis-cli ping`
  2. Review cache metrics: `/api/admin/cache/metrics/vdp`
  3. Check for cache invalidation storms
  4. Verify TTLs: `cache.aside.vdp.ttl`
  5. Review database query performance
  6. Consider warming cache for popular vehicles

#### OverallCacheHitRateDrop
- **Severity:** `ticket`
- **Trigger:** Overall cache hit rate < 70% for 15 minutes
- **Response Time:** < 2 hours
- **Runbook:**
  1. Review cache namespace breakdown: `/api/admin/cache/metrics/namespace/{namespace}`
  2. Check Redis memory usage
  3. Review cache eviction policies
  4. Monitor database load increase

## Alert Response Workflow

### 1. Alert Received
- **On-Call Engineer:** Acknowledge alert within 5 minutes
- **Severity `page`:** Open incident immediately
- **Severity `ticket`:** Create ticket, investigate within SLA

### 2. Initial Investigation
- Check alert details in Prometheus/Grafana
- Review application logs
- Check health endpoints
- Verify recent deployments

### 3. Triage
- **Is it a false positive?** → Update alert thresholds
- **Is it a known issue?** → Reference existing incident
- **Is it a new issue?** → Escalate to team lead

### 4. Resolution
- Document root cause
- Implement fix or workaround
- Verify alert clears
- Update runbook if needed

### 5. Post-Mortem
- Schedule post-mortem for critical alerts
- Document lessons learned
- Update runbook and monitoring

## Alert Configuration

### Prometheus Alert Rules
Location: [`docs/alerts/prometheus-rules.yml`](docs/alerts/prometheus-rules.yml)

### Alert Manager Integration
Configure in `prometheus.yml`:
```yaml
alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - 'alertmanager:9093'
```

### On-Call Rotation
- Configure in PagerDuty/OpsGenie
- Primary on-call: 24/7 coverage
- Secondary on-call: Backup escalation
- Rotation schedule: Weekly rotation

### Alert Channels
- **Critical (`page`):** PagerDuty → Phone call + SMS + Email
- **Warning (`ticket`):** Slack channel + Email

## Testing Alerts

### Test Alert Firing
```bash
# Trigger test alert via Prometheus
curl -X POST http://prometheus:9090/api/v1/alerts \
  -H "Content-Type: application/json" \
  -d '{"alerts":[{"labels":{"alertname":"TestAlert"}}]}'
```

### Validate Alert Rules
```bash
# Check Prometheus rule syntax
promtool check rules docs/alerts/prometheus-rules.yml
```

### Test On-Call Integration
- Schedule monthly alert test
- Verify all channels receive alerts
- Test escalation path

## Monitoring Dashboards

- **Grafana Main Dashboard:** `http://grafana:3000/dashboards/main`
- **Performance Dashboard:** `http://grafana:3000/dashboards/performance`
- **Security Dashboard:** `http://grafana:3000/dashboards/security`

## Related Documentation

- [Monitoring & Alerts Guide](docs/MONITORING_ALERTS_RUNBOOK.md)
- [Incident Response Playbook](docs/IR_PLAYBOOK.md)
- [Performance Monitoring](docs/DASHBOARDS_AND_ALERTS.md)
- [Security Hardening](docs/SECURITY_HARDENING_COMPLETE.md)

## Contact

- **On-Call Slack Channel:** `#oncall-selfcar`
- **Engineering Team:** `#engineering-selfcar`
- **Security Team:** `#security-selfcar`

