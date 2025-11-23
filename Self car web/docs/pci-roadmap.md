## PCI DSS v4.x Implementation Roadmap — Redirect First, Hosted Fields When Required

This roadmap operationalizes a "no-PAN-touch" architecture using Redirect (Hosted Checkout) wherever possible, and Hosted Fields only when UX requires it. Each week includes acceptance criteria, implementation tasks, and evidence to capture for SAQ A or A-EP.

### Scope decision and principles
- **Primary flow**: Redirect to PSP-hosted checkout (target SAQ A)
- **Secondary flow**: Hosted Fields (PSP iframes) only if UX requires (likely SAQ A-EP)
- **No PAN present in merchant systems**: No storage, processing, or transmission of PAN by merchant services, logs, or telemetry

### SAQ target per flow

| Flow | Channel | PSP Pattern | SAQ Target | Notes |
|---|---|---|---|---|
| Card checkout (default) | Web | Redirect (hosted checkout) | SAQ A | Strict CSP, script monitoring required |
| Card checkout (edge) | Web | Hosted Fields (PSP iframes only) | SAQ A-EP | Justify UX reason; enhanced page controls|
| Mobile in-app | App | Redirect to app/webview PSP | SAQ A | Use in-app browser; deep-link return |
| Saved card/token | Web/App | Tokenized payments (server-side) | SAQ A | Use PSP tokens only, not PAN |

---

## Week 8 — Decide scope & freeze the approach

### Deliverables (Acceptance)
- Architecture one-pager
- SAQ target per flow decided and recorded
- Updated DFDs covering all payment entry points (web/app)
- v1 control-mapping sheet (owners + evidence collection method)

### Tasks
1. Document flows and SAQ targets
   - Create `docs/payment-flows.md` outlining redirect vs hosted fields per route and platform
   - Link PSP docs and list allowed providers
2. Data Flow Diagrams (DFDs)
   - Add Mermaid DFDs to `docs/dfd/checkout.md` showing that merchant backend never handles PAN
   - Include browser → PSP redirect, return handler, and tokenization
3. Control inventory (12 requirements)
   - Create `docs/pci-control-mapping.csv` per table template below
   - Assign evidence owner and collection method
4. Security plan for payment pages (Req 6.4.3 & 11.6.1)
   - Define CSP allowlists (PSP domains only; no inline scripts)
   - Create script inventory process and change/tamper detection plan

### Evidence to capture
- Architecture one-pager (PDF/Markdown)
- DFDs (Mermaid/PNG)
- Control mapping sheet (CSV)
- Decision log entry for SAQ targets

### DFD example (Mermaid)
```mermaid
flowchart LR
  Browser[Customer Browser] -->|Redirect to PSP| PSP[PSP Hosted Checkout]
  PSP -->|Return with token/HMAC| MerchantFE[Merchant Frontend]
  MerchantFE -->|POST token only| MerchantBE[Merchant Backend]
  MerchantBE -->|Create charge with token| PSPAPI[PSP API]
  subgraph Merchant
    MerchantFE
    MerchantBE
  end
  note right of MerchantBE: No PAN stored/processed/transmitted by merchant
```

### Control-mapping workbook (template)
Save as `docs/pci-control-mapping.csv`.
```csv
Requirement,Title,Scope,Owner,Evidence,Collection Method,Review Cadence
1,Network Security Controls,Payment surfaces,SecOps,Firewall/WAF rules,Screenshots + IaC diffs,Quarterly
2,Secure Configurations,Payment hosts,Platform Eng,OS/TLS baselines,Config exports + PR links,Quarterly
3,Protect Stored Account Data,All,Backend,Attestation: No PAN stored,Architecture doc + grep reports,Release
4,Encrypt Transmission,All,Platform Eng,TLS reports + cipher suite,Qualys/ssllabs report,Quarterly
5,Malware Protection,Endpoints,IT/EDR,EDR dashboards,Screenshots + alerts,Monthly
6,Secure Software Dev,App/Svc,Eng Mgmt,SAST/DAST/Secrets/PRs,Tool dashboards + PRs,Sprint
7,Access Control,All,Identity,RBAC matrix,Mgmt exports + reviews,Quarterly
8,AuthN/AuthZ,All,Identity,MFA policy + JIT access,Policy + logs,Quarterly
9,Physical Security,If applicable,Facilities,Badge controls,Policy + access logs,Annual
10,Logging/Monitoring,All,SecOps,Immutable logs + dashboards,SIEM views + runbooks,Monthly
11,Testing/WAF,Payment surfaces,SecOps,DAST + WAF block,Snyk/ZAP + WAF console,Quarterly
12,Policies/Program,Org,Risk/Compliance,IR playbooks + training,Policy repo + LMS,Annual
6.4.3,Payment Page Integrity,Payment pages,Frontend,Script inventory + approvals,PRs + review logs,Sprint
11.6.1,Script Change Detection,Payment pages,SecOps,Alerts + tickets,SIEM alerts + JIRA links,Monthly
```

---

## Week 9 — Build the no-PAN-touch integration + page hardening

### Deliverables (Acceptance)
- Working redirect/hosted-fields integration in staging
- CSP enforced on payment pages
- Script-monitoring live with alerts
- WAF in log-only on payment routes

### Tasks
1. Redirect integration (preferred)
   - Implement PSP-hosted checkout redirect from `POST /payments/init`
   - Handle return URL with HMAC verification and token capture
   - Store only PSP token/reference; never PAN
2. Hosted Fields integration (only if UX requires)
   - Use PSP iframes for PAN; ensure tokenization
   - Verify: no PAN in logs, memory, frontend error telemetry, or backend payloads
3. Page security (Req 6.4.3 / 11.6.1)
   - Ship strict CSP (no 'unsafe-inline'); allowlist PSP origins only
   - Maintain approved script inventory; gate third-party JS via build allowlist
   - Implement script change detection: subresource integrity and/or file hash monitoring; alert into SIEM
4. Network/WAF controls (Req 1, 2, 11)
   - Egress allowlist to PSP endpoints only from payment microservices
   - Enable WAF rules on payment routes; start in log-only; capture baselines

### Java/Spring sample: Redirect return handler with HMAC verification
```java
// Example outline for verifying PSP callback/return signature
@PostMapping("/payments/return")
public ResponseEntity<Void> handleReturn(@RequestBody PspReturn payload, @RequestHeader("X-PSP-Signature") String signature) {
    String canonical = canonicalize(payload); // stable field order and encoding
    String computed = hmacSha256Hex(pspSecret, canonical);
    if (!MessageDigest.isEqual(computed.getBytes(StandardCharsets.UTF_8), signature.getBytes(StandardCharsets.UTF_8))) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
    // Use PSP token only; never PAN
    paymentService.captureWithToken(payload.getToken());
    return ResponseEntity.ok().build();
}
```

### CSP example (reverse proxy header)
```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' https://<psp-js-origin>; frame-src https://<psp-frame-origin>; connect-src 'self' https://<psp-api-origin>; img-src 'self' data:; style-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'" always;
```

### Script inventory example (tracked in repo)
```json
{
  "approvedScripts": [
    { "name": "app-bundle", "path": "/static/js/app.*.js", "owner": "frontend" },
    { "name": "psp-js", "origin": "https://<psp-js-origin>/sdk.js", "owner": "payments" }
  ],
  "approvalProcess": "PR review with security sign-off for any new third-party JS"
}
```

---

## Week 10 — Access, logging & crypto hardening

### Deliverables (Acceptance)
- Access review signed off for payment-adjacent systems
- Logging dashboards/alerts active
- Secure-config checklist closed (TLS/ciphers/secrets)

### Tasks
1. Access control (Req 7–8)
   - Clean up roles for payment-adjacent systems; enforce MFA
   - Least privilege + JIT for production; document break-glass
   - Quarterly access recertification workflow
2. Logging & monitoring (Req 10)
   - Emit structured, immutable logs for auth, payment init/return, config changes
   - Retention and time sync documented; build dashboards and alerts (SIEM)
3. Secure configs & software (Req 2 & 6)
   - Secret rotation; ensure no PAN in telemetry; harden TLS; disable weak ciphers
   - Code review proving server never handles PAN
4. Malware/EDR (Req 5)
   - Verify EDR coverage on payment-adjacent hosts; dashboards and alerting

### Log schema example (JSON)
```json
{
  "event": "payment.return.processed",
  "psp": "<provider>",
  "orderId": "<uuid>",
  "pspToken": "<redacted-token-id>",
  "userId": "<uuid>",
  "ip": "<client-ip>",
  "traceId": "<trace-id>",
  "result": "success|failure",
  "reason": "signature_mismatch|...",
  "ts": "<rfc3339>"
}
```

---

## Week 11 — Test, prove, and close gaps

### Deliverables (Acceptance)
- DAST against payment surfaces; targeted pen-test on return handlers
- WAF moved to block with documented exclusions
- E-skimming script-change alerts validated
- Evidence set populated in control-mapping workbook

### Tasks
1. Security testing (Req 11)
   - Run DAST on payment routes and return handlers; fix high/critical
   - Pen-test the redirect return handler and signature verification
2. E-skimming resilience
   - Validate script-change alerts trigger; triage in SIEM and ticketing
   - Run IR tabletop for compromised script scenario (Req 12 linkage)
3. Evidence collection
   - Link configs, screenshots, logs, change tickets into control-mapping sheet

---

## Week 12 — Rollout, SAQ, and hand-off

### Deliverables (Acceptance)
- Traffic uses redirect/hosted-fields only; legacy PAN fields and endpoints removed
- SAQ A or A-EP package completed with evidence; compensating controls documented if any
- Policies updated and review cadence scheduled; future-dated v4.x requirements accounted for

### Tasks
1. Production rollout
   - Enable redirect by default; remove legacy card forms and server endpoints that accepted PAN
   - Hosted-fields flows documented with A-EP obligations; retain monitoring
2. SAQ package & policies
   - Complete SAQ A/A-EP; attach control mapping and compensating controls
   - Update policies (Req 12) and schedule periodic reviews
3. Future-dated items check
   - Verify v4.x future-dated requirements now mandatory (post–Mar 31, 2025) are tracked

---

## Implementation references (tailored to this codebase)

### Where to integrate in backend (Spring)
- `backend/src/main/java/com/selfcar/controller/payment/PaymentController.java`
  - Add endpoints for init redirect and handle return (HMAC verify)
- `backend/src/main/java/com/selfcar/security/WebhookSecurityService.java`
  - Centralize signature verification and canonicalization
- `backend/src/main/java/com/selfcar/security/ObjectLevelAuthorizationService.java`
  - Ensure only authorized users can view payment intents/receipts (no PAN)

### Example: central HMAC verification utility (outline)
```java
public final class PspSignature {
  public static String hmacSha256Hex(String secret, String message) {
    try {
      Mac mac = Mac.getInstance("HmacSHA256");
      mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
      byte[] raw = mac.doFinal(message.getBytes(StandardCharsets.UTF_8));
      return Hex.encodeHexString(raw);
    } catch (GeneralSecurityException e) {
      throw new IllegalStateException("HMAC failure", e);
    }
  }
}
```

### CSP deployment checklist
- Add CSP headers at edge (CDN/reverse proxy) and application server
- No `unsafe-inline`; use nonces or external scripts
- Allowlist PSP origins for `script-src`, `frame-src`, and `connect-src`
- Add `frame-ancestors 'none'` for non-embedded merchant pages
- Test in `Report-Only` first, then enforce

### Script change detection options (Req 11.6.1)
- Subresource Integrity (SRI) for first-party static JS
- File hash monitoring of deployed JS bundles with alerting
- CSP violation reports to collector → SIEM alerts

### WAF rollout plan
- Scope payment routes to WAF ruleset; run in log-only
- Baseline false positives; add exclusions; move to block
- Retain IaC diff links and console screenshots as evidence

---

## Definition of Done (DoD)
- All payment pages use redirect or PSP Hosted Fields; legacy PAN fields removed and endpoints disabled
- Documented PCI control mapping (12 requirements) with evidence and compensating controls signed by Product/Backend/SecOps
- Payment page protections (CSP, script inventory, change detection) verified in production
- SAQ A or A-EP completed and filed; backlog tracks remaining v4.x future-dated requirements now in force

---

## Backlog items (if discovered during execution)
- Replace any third-party analytics on payment pages with server-side or CSP-compatible approach
- Expand tokenization coverage for all payment modifications/recurring charges
- Automate egress allowlist management via IaC
- Build CI checks: denylist PAN-like patterns in logs and telemetry


