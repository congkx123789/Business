# DevSecOps Metrics & Dashboards

## Shift-Left Economics

**Goal**: >80% of security issues found pre-merge (in PRs, not production)

### Metrics

**Formula**:
```
Shift-Left Ratio = (Issues found in PR / Total issues) * 100
Target: >80%
```

**Data Sources**:
- SAST findings (Semgrep, CodeQL) → GitHub Security tab
- SCA findings (Dependabot, Snyk) → PRs
- Secrets findings (TruffleHog, GitGuardian) → Pre-commit hooks
- IaC findings (Checkov) → PRs

**Tracking**:
- Label PRs with `security-finding` when issues are discovered
- Query GitHub API: `label:security-finding created:>=2024-01-01`
- Compare against production incidents (Security Team logs)

### Time-to-Fix by Severity

**Metrics**:
- Time from finding creation to fix merged
- Grouped by severity (Critical, High, Medium, Low)

**SLAs**:
- Critical: <48 hours
- High: <7 days
- Medium: <30 days
- Low: Best effort

**Query** (GitHub Insights):
```sql
SELECT 
  severity,
  AVG(DATEDIFF(merged_at, created_at)) as avg_days_to_fix,
  COUNT(*) as total_findings
FROM security_findings
WHERE merged_at IS NOT NULL
GROUP BY severity
```

## Dashboards

### Security Finding Dashboard

**Metrics**:
1. Shift-Left Ratio (target: >80%)
2. Time-to-Fix by Severity (vs. SLA)
3. Finding Count by Source (SAST, SCA, DAST, IaC)
4. Finding Trend (weekly/monthly)

**Location**: Grafana dashboard  
**Template**: `infrastructure/observability/grafana/security-findings-dashboard.json`

### SCA Dashboard

**Metrics**:
1. Median time-to-merge for security PRs (target: <7 days)
2. Open security PRs by severity
3. Dependency update coverage (% of dependencies with auto-updates)

**Data Source**: GitHub Dependabot PRs, Snyk PRs  
**Query**: Label `security-update` PRs, measure lead time

### SAST Dashboard

**Metrics**:
1. SAST coverage (% of code scanned)
2. Findings by rule (OWASP/CWE mapping)
3. PRs blocked by SAST (High/Critical)

**Data Source**: Semgrep, CodeQL SARIF files

### DAST Dashboard

**Metrics**:
1. Weekly scan completion rate
2. Findings by severity (Critical, High, Medium)
3. Triage SLA compliance (Critical <48h, High <7d)

**Data Source**: ZAP reports (`security/dast/reports/`)

### IaC Dashboard

**Metrics**:
1. IaC coverage (% of repos scanned)
2. Findings by framework (Terraform, CloudFormation)
3. Critical findings blocking deployments

**Data Source**: Checkov SARIF files

### Zero-Trust Dashboard

**Metrics**:
1. mTLS adoption rate (%)
2. Service-to-service traffic volume
3. Certificate expiration timeline
4. RBAC enforcement rate (JWT claims validated)

**Data Source**: Istio metrics (Prometheus)

## KPI Targets

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Shift-Left Ratio | >80% | TBD | 🟡 |
| Critical Fix Time | <48h | TBD | 🟡 |
| High Fix Time | <7d | TBD | 🟡 |
| Medium Fix Time | <30d | TBD | 🟡 |
| SCA TTM (median) | <7d | TBD | 🟡 |
| Training Completion | 100% | TBD | 🟡 |
| mTLS Adoption | 100% | TBD | 🟡 |

## Reporting

### Weekly Report

**Recipients**: Engineering Leads, Security Team  
**Content**:
- Shift-Left Ratio
- Top 5 findings by severity
- SLA compliance (Critical/High fixes)
- Upcoming cert rotations

### Monthly Report

**Recipients**: CISO, CTO  
**Content**:
- All KPIs vs. targets
- Trend analysis
- Compliance status (PCI-DSS)
- Recommendations

### Quarterly Report

**Recipients**: Board, Auditors  
**Content**:
- Compliance evidence package
- Zero-Trust progress
- Training completion
- Risk assessment

## Automation

### Metrics Collection

```yaml
# .github/workflows/collect-security-metrics.yml
name: Collect Security Metrics

on:
  schedule:
    - cron: '0 0 * * 1'  # Weekly

jobs:
  metrics:
    runs-on: ubuntu-latest
    steps:
      - name: Collect GitHub metrics
        run: |
          # Query PRs with security findings
          gh pr list --label security-finding --json number,createdAt,mergedAt > metrics.json
          
      - name: Upload to S3
        run: |
          aws s3 cp metrics.json s3://metrics-bucket/security/weekly/
```

### Dashboard Updates

- Grafana dashboards auto-update from Prometheus
- GitHub Insights dashboards update in real-time
- S3 metrics available for BI tools (Tableau, Power BI)

