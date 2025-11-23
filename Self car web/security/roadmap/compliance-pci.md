# PCI-DSS Compliance Mapping

**Requirement**: Especially Requirement 6.x (secure systems and applications)  
**Context**: Must-have for handling card deposits

## Control Matrix

| PCI-DSS Requirement | Control | Implementation | Evidence |
|---------------------|---------|----------------|----------|
| **6.1** | Establish process for identifying security vulnerabilities | SAST in PRs (Semgrep, CodeQL) | `.github/workflows/semgrep.yml`, `.github/workflows/codeql.yml` |
| **6.2** | Ensure all system components and software are protected from known vulnerabilities | SCA auto-fix (Dependabot, Snyk) | `.github/dependabot.yml`, `.github/workflows/snyk.yml` |
| **6.3** | Develop secure applications | Pre-commit secret scanning, SAST, manual reviews | `.pre-commit-config.yaml`, `security/reviews/` |
| **6.4** | Follow secure coding practices | IDOR middleware, OWASP Top 10 training | `security/idor/`, `security/training/` |
| **6.5** | Address common coding vulnerabilities | OWASP Top 10 coverage via SAST/DAST | `security/reviews/templates/baseline-review-checklist.md` |
| **6.6** | Public-facing web applications protected against attacks | DAST weekly scans (ZAP) | `.github/workflows/dast-zap.yml` |
| **6.7** | Security testing procedures | SAST + DAST + manual reviews | Reports in `security/reviews/reports/` |
| **7.2.1** | Restrict access to cardholder data | Zero-Trust RBAC, mTLS | `security/roadmap/zero-trust-phase2.md` |
| **8.2.1** | Strong authentication | JWT propagation, mTLS | `security/jwt-standards.md` |

## OWASP Top 10 Coverage

**Requirement**: OWASP coverage is not optional; it's a compliance requirement tied to card processing.

| OWASP Top 10 | Coverage Method | Evidence |
|--------------|----------------|----------|
| A01: Broken Access Control | IDOR middleware, RBAC enforcement | `security/idor/middleware/`, `security/roadmap/zero-trust-phase2.md` |
| A02: Cryptographic Failures | Secrets management, mTLS | `security/secrets/README.md`, `security/roadmap/zero-trust-phase2.md` |
| A03: Injection | SAST rules (Semgrep), input validation | `.semgrep/semgrep.yaml` |
| A04: Insecure Design | Manual security reviews | `security/reviews/templates/baseline-review-checklist.md` |
| A05: Security Misconfiguration | IaC scanning (Checkov) | `.github/workflows/iac-scan.yml` |
| A06: Vulnerable Components | SCA (Dependabot, Snyk) | `.github/dependabot.yml`, `.github/workflows/snyk.yml` |
| A07: Authentication Failures | JWT propagation, mTLS | `security/jwt-standards.md` |
| A08: Software and Data Integrity | SBOM generation | `.github/workflows/sbom.yml` |
| A09: Security Logging | Observability, audit logs | `infrastructure/observability/` |
| A10: SSRF | SAST rules, DAST scans | `.semgrep/semgrep.yaml`, `.github/workflows/dast-zap.yml` |

## Training Requirements

**Requirement**: Yearly OWASP Top 10 training for all developers (PCI DSS 6.x)

### Training Log

File: `security/training/roster-template.csv`

**Columns**:
- name
- team
- email
- session_date
- completed (true/false)
- verifier

**Completion Target**: 100% of developers

### Evidence Collection

- Training roster (CSV)
- Slides/recordings (if applicable)
- Quiz scores (if applicable)
- Re-training schedule (yearly)

## Scan Evidence Reports

### SAST Reports

**Location**: GitHub Actions artifacts  
**Frequency**: Every PR  
**Format**: SARIF (uploaded to GitHub Security tab)

**Evidence**:
- Semgrep: `.github/workflows/semgrep.yml`
- CodeQL: `.github/workflows/codeql.yml`

### DAST Reports

**Location**: `security/dast/reports/`  
**Frequency**: Weekly  
**Format**: JSON (ZAP)

**Evidence**:
- Weekly run: `.github/workflows/dast-zap.yml`
- Triage runbook: `security/runbooks/dast-triage.md`

### SCA Reports

**Location**: GitHub Dependabot PRs, Snyk dashboard  
**Frequency**: Weekly  
**Format**: PRs with vulnerability details

**Evidence**:
- Dependabot: `.github/dependabot.yml`
- Snyk: `.github/workflows/snyk.yml`

### IaC Reports

**Location**: GitHub Actions artifacts  
**Frequency**: Every PR (infrastructure changes)  
**Format**: SARIF (Checkov)

**Evidence**:
- Checkov: `.github/workflows/iac-scan.yml`

## Compliance Evidence Package

**Quarterly Package** (for auditors):

1. **Control Matrix** (this document)
2. **Training Roster** (`security/training/roster-template.csv`)
3. **SAST Evidence** (SARIF exports from GitHub)
4. **DAST Evidence** (ZAP reports from last 12 weeks)
5. **SCA Evidence** (Dependabot PR merge logs)
6. **IaC Evidence** (Checkov scan history)
7. **Zero-Trust Evidence** (mTLS metrics, RBAC enforcement logs)

**Storage**: S3 bucket (encrypted, versioned)

## Continuous Compliance

### Monthly
- Review SAST/DAST findings; ensure SLAs met
- Update training roster for new hires

### Quarterly
- Assemble evidence package
- Review control matrix for changes
- Update PCI-DSS mapping if requirements change

### Yearly
- Re-run OWASP Top 10 training for all developers
- Update compliance documentation

## Compliance Dashboard

**Metrics to track**:
- SAST coverage: % of code scanned
- DAST coverage: % of endpoints scanned
- SCA coverage: % of dependencies scanned
- Training completion: % of developers trained
- Finding remediation: % of Critical/High fixed within SLA

**Location**: Grafana dashboard (template: `infrastructure/observability/grafana/compliance-dashboard.json`)

