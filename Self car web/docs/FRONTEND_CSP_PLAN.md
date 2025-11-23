# Frontend CSP & Integrity Roadmap (Week 6–10)

- Week 6: Inventory + CSP Report-Only + collector endpoint
  - Dev CSP header via Vite, prod Nginx template (`nginx/csp.conf`)
  - Backend collector: `POST /api/security/csp-report`
  - Lint rules to prevent common DOM-XSS sinks
- Week 7: Fix + enforce on core, SRI
  - Refactor inline patterns; enable SRI via `vite-plugin-sri`
- Week 8: Payments isolation
  - Tight per-route CSP + Permissions-Policy template; iframe sandbox
- Week 9: Runtime integrity + PCI hooks
  - Script manifest check, dist FIM, SBOM & PR gates
- Week 10: Enforce site-wide + drills
  - Flip to enforce; runbooks + drills

Report target: `/api/security/csp-report`; aggregate in SIEM dashboards.

