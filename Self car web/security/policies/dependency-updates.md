# Dependency Update Policy

Purpose: Ensure third-party vulnerabilities are surfaced and fixed quickly via automated PRs.

Policy:
- Dependabot runs weekly for GitHub Actions, npm, and pip ecosystems.
- Security PRs (severity High/Critical or GHSA with fix) should be merged within 7 days.
- Non-breaking minor/patch bumps should be merged after CI passes.
- Breaking changes require issue review and planned rollout.

Process:
1) PR raised by Dependabot.
2) CI must pass, including unit/e2e and security checks.
3) Reviewer confirms changelog/impact; merge or schedule.
4) Track exceptions with a ticket linking to the PR.

