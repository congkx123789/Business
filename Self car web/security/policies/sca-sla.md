# SCA SLA & Dashboards

Objective: Reduce median time-to-merge of security dependency updates to < 7 days.

Scope:
- All app services (frontend, backend)
- Containers (Docker base image updates)

SLA:
- Critical/High security updates: merge within 7 days of PR creation.
- Medium: within 14 days.
- Low: best effort.

Process:
1) Dependabot opens PRs weekly for GitHub Actions, npm, pip, and Docker.
2) CI must pass (tests, SAST, secrets, IaC checks).
3) Owner reviews changelog and merges or schedules.
4) Track outliers by labeling PRs (e.g., `security-update`) and measuring time-to-merge.

Dashboards:
- GitHub Insights: Filter by label `security-update`, measure lead time.
- Optional: Export PR metadata to a BI tool for median TTM.

Exceptions:
- Document in `security/iac/exceptions.md` or service-specific `SECURITY_NOTES.md` with rationale and time-bound plan.

