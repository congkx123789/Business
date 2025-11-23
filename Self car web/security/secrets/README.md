Centralized Secrets Management
==============================

Goal: Zero hard-coded secrets. All credentials come from a cloud-native secrets store, loaded at runtime, never committed to VCS.

Recommended options (choose your cloud):
- AWS: AWS Secrets Manager or AWS Systems Manager Parameter Store
- Azure: Azure Key Vault
- GCP: Secret Manager

Principles:
- Do not store secrets in code, .env files, or CI variables in plaintext.
- Prefer fine-grained IAM to attach access at runtime (EC2/ECS/EKS roles, Workload Identity, Managed Identity).
- Encrypt in transit and at rest; enable audit logging on read/write.
- Scope secrets per environment (dev/staging/prod) and per service.

App integration pattern:
1) Grant the runtime identity permission to read specific secrets.
2) Resolve secrets at startup (or lazy-load) via SDK/CLI.
3) Cache minimally in memory; do not log values.

Local development:
- Use cloud emulators or per-dev secrets in the same store with limited scope.
- If a temporary .env is unavoidable locally, add to .gitignore and load via a library, but replace with real secrets in CI and prod.

Rotation policy:
- See ../policies/secret-rotation.md (90-day rotation).

Pre-commit enforcement:
- The repo ships with GitGuardian pre-commit scanning. Install:
  pip install pre-commit ggshield
  pre-commit install --hook-type pre-commit --hook-type pre-push
- On any finding, commits/pushes are blocked. Fix by removing the secret and revoking/rotating it in the secrets store.

