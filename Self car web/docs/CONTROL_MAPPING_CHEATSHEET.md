# Control-Mapping Cheat Sheet (Examples)

Use these examples to populate the workbook with owners and evidence links.

## Req 1/2 (Network & Secure Configs)
- Egress allowlists to PSP: link IaC (security groups/firewall) + change tickets
- Hardened TLS/ciphers: attach TLS config report and cipher list
- Baseline firewall rules: screenshots/exports from WAF/LB
- IaC diffs: link PRs/MRs for security changes

## Req 3/4 (Stored & In-Transit Data)
- Assertion: "no PAN stored/processed" (arch doc + code review link)
- Tokenization acceptance tests: test cases and logs
- TLS reports: ssllabs/openssl scans

## Req 5/6 (Malware & Secure Software)
- EDR dashboards: screenshots and policy link
- SCA/DAST/secret scans: CI pipeline results
- PR reviews: links proving no PAN handling in server code

## Req 7/8 (Access)
- RBAC matrix: spreadsheet or doc link
- Quarterly access recertifications: sign-off tickets
- MFA policy: doc and IdP config screenshot

## Req 9 (Physical)
- Badge controls (if on-prem components): policy + audit extract

## Req 10/11 (Logging & Testing)
- Immutable log storage: retention config and bucket/WORM settings
- Alert runbooks: runbook doc link
- WAF rules in block: config diff and block logs
- DAST/pen results: PDFs and issue links

## Req 6.4.3 & 11.6.1 (Payment Page)
- Script inventory + approvals: inventory export
- Change-detection alerts: alert screenshots and log entries

## Req 12 (Policies/Program)
- Training records: LMS exports
- IR playbook (e-skimming scenario): doc link
- Vendor due-diligence for PSP: questionnaire and attestation


