# IaC CI Coverage

Goal: 100% of infrastructure repositories scanned in CI (Terraform/CloudFormation).

This repository:
- Checkov workflow: `.github/workflows/iac-scan.yml` (Terraform, CloudFormation) – blocks on HIGH/CRITICAL
- Paths covered: repository root

Org coverage checklist (add links as you enable):
- [ ] infra-networking (Terraform) – Checkov enabled
- [ ] infra-databases (Terraform) – Checkov enabled
- [ ] infra-buckets (Terraform/CFN) – Checkov enabled
- [ ] app-backend-infra – Checkov enabled
- [ ] app-frontend-infra – Checkov enabled

Notes:
- For monorepos, update `directory:` or `framework:` inputs in the workflow if needed.

