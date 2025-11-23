# DevSecOps Security Roadmap

**Timeline**: 6 months | **Goal**: Zero-Trust architecture with PCI-DSS compliance

## Overview

This roadmap implements a shift-left security program with Zero-Trust networking, covering:
- **Months 1-3**: Foundations (secrets, SAST/SCA/DAST, IaC scanning)
- **Months 4-5**: Zero-Trust Phase 1 (permissive service mesh)
- **Month 6**: Zero-Trust Phase 2 (strict mTLS + RBAC)
- **Ongoing**: Compliance stream (PCI-DSS mapping, training, evidence)

## Phases

### ✅ Phase 0: Foundations (Months 1-3) - COMPLETE
- [x] Centralized secrets management
- [x] Pre-commit secret scanning (GitGuardian)
- [x] SAST in PRs (Semgrep, CodeQL)
- [x] SCA auto-fix (Dependabot, Snyk)
- [x] IaC scanning (Checkov)
- [x] DAST weekly scans (ZAP)
- [x] IDOR prevention middleware
- [x] SBOM generation and publishing

### 🔄 Phase 1: Zero-Trust Foundation (Months 4-5)
**Goal**: Deploy service mesh in permissive mode; observe traffic; issue certs

Deliverables:
- [ ] Istio service mesh installed
- [ ] 100% services sidecar-injected
- [ ] mTLS metrics dashboard
- [ ] Exception list for non-mesh services
- [ ] JWT propagation standardized from API gateway
- [ ] Required claims contract (user_id, role)

See: `security/roadmap/zero-trust-phase1.md`

### 🔒 Phase 2: Zero-Trust Enforcement (Month 6)
**Goal**: Strict mTLS cluster-wide; enforce RBAC on JWT claims

Deliverables:
- [ ] mTLS strict mode policy
- [ ] Fallback SLOs defined
- [ ] In-service RBAC library
- [ ] Contract tests for mTLS + JWT
- [ ] CI/CD manages cert rotation and policy deploys

See: `security/roadmap/zero-trust-phase2.md`

### 📋 Compliance Stream (Ongoing)
**Goal**: PCI-DSS compliance, especially Requirement 6.x

Deliverables:
- [ ] Control matrix mapping
- [ ] Yearly training logs
- [ ] SAST/DAST evidence reports
- [ ] OWASP Top 10 coverage proof

See: `security/roadmap/compliance-pci.md`

## Program Metrics

**Shift-Left Economics**:
- Target: >80% security issues found pre-merge
- Track: "found in PR vs. prod" ratio
- Measure: time-to-fix by severity

**SLAs**:
- Critical: <48h
- High: <7d
- Medium: <30d

See: `security/roadmap/metrics.md`

## RACI Matrix

See: `security/roadmap/raci.md`

## Quick Links

- [Zero-Trust Phase 1 Implementation](./zero-trust-phase1.md)
- [Zero-Trust Phase 2 Implementation](./zero-trust-phase2.md)
- [PCI-DSS Compliance Mapping](./compliance-pci.md)
- [Metrics & Dashboards](./metrics.md)
- [RACI Matrix](./raci.md)
- [JWT Propagation Standards](../jwt-standards.md)
- [Pipeline Integration Guide](./pipeline-integration.md)

