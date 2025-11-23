# RACI Matrix

**RACI**: Responsible, Accountable, Consulted, Informed

## Security Pillars

### Foundations (Months 1-3)

| Task | Platform/Infra | App Dev | Security/Compliance |
|------|----------------|---------|---------------------|
| Secrets Manager Setup | **R** | I | **A** |
| Pre-commit Hooks | I | **R** | **A** |
| SAST in PRs | **R** (CI/CD) | **R** (fixes) | **A** (rules) |
| SCA Auto-fix | **R** (config) | **R** (merges) | **C** |
| IaC Scanning | **R** | I | **A** |
| DAST Setup | **R** (infra) | I | **A** |
| IDOR Middleware | I | **R** | **A** |
| SBOM Generation | **R** | I | **C** |

### Zero-Trust Phase 1 (Months 4-5)

| Task | Platform/Infra | App Dev | Security/Compliance |
|------|----------------|---------|---------------------|
| Istio Installation | **R** | I | **A** |
| Sidecar Injection | **R** | **C** (testing) | **A** |
| mTLS Metrics | **R** | I | **A** |
| JWT Gateway Filters | **R** | **C** (contract) | **A** |
| JWT Propagation | **R** | **R** (implementation) | **A** |
| Exception List | **R** | **C** | **A** |

### Zero-Trust Phase 2 (Month 6)

| Task | Platform/Infra | App Dev | Security/Compliance |
|------|----------------|---------|---------------------|
| mTLS Strict Mode | **R** | **C** (testing) | **A** |
| RBAC Library | I | **R** | **A** |
| Contract Tests | I | **R** | **C** |
| Cert Rotation CI/CD | **R** | I | **A** |
| Policy Deployment | **R** | I | **A** |

### Compliance Stream (Ongoing)

| Task | Platform/Infra | App Dev | Security/Compliance |
|------|----------------|---------|---------------------|
| PCI-DSS Mapping | I | I | **R** |
| Training Delivery | I | I | **R** |
| Training Logs | I | **R** (attendance) | **A** |
| SAST Evidence | **R** (CI/CD) | **R** (fixes) | **A** |
| DAST Evidence | **R** (runs) | **R** (fixes) | **A** |
| Compliance Reports | **C** | **C** | **R** |

### Program & Metrics

| Task | Platform/Infra | App Dev | Security/Compliance |
|------|----------------|---------|---------------------|
| Metrics Collection | **R** (automation) | I | **A** |
| Dashboard Creation | **R** | I | **A** |
| SLA Tracking | **R** | **R** (compliance) | **A** |
| Reporting | **C** | **C** | **R** |

## Legend

- **R** (Responsible): Does the work
- **A** (Accountable): Ultimately accountable for outcome
- **C** (Consulted): Provides input/feedback
- **I** (Informed): Kept informed of progress

## Cross-Functional Collaboration

### Weekly Sync

**Attendees**: Platform Lead, App Dev Lead, Security Lead  
**Agenda**:
- Blockers from each pillar
- SLA compliance review
- Upcoming milestones

### Monthly Review

**Attendees**: All RACI stakeholders  
**Agenda**:
- KPI review vs. targets
- Compliance status
- Roadmap adjustments

## Escalation Path

**Blockers**:
1. Raise in weekly sync
2. If unresolved, escalate to CTO/CISO
3. Document in `security/roadmap/blockers.md`

**SLA Violations**:
1. Security Team reviews
2. App Dev Lead assigns fix owner
3. Track in `security/roadmap/sla-violations.md`

