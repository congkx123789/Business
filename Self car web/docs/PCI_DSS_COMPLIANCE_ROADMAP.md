# PCI DSS Compliance Roadmap

## Overview

This roadmap implements PCI DSS v4.x compliance for payment processing, focusing on scope reduction, control mapping, and payment page security.

## Scope Decision: Redirect vs Hosted Fields

### Decision Framework

**Commit to Redirect (Hosted Checkout) where possible:**
- ✅ Lower scope: Typically targets **SAQ A**
- ✅ Merchant systems don't store/process/transmit PAN
- ✅ Payment gateway handles all card data
- ✅ Simpler compliance burden

**Use Hosted Fields (iframes) only when UX forces it:**
- ⚠️ Higher scope: Often lands in **SAQ A-EP**
- ⚠️ Requires more controls (6.4.3, 11.6.1)
- ⚠️ Payment page security requirements apply

### SAQ Target per Flow

| Flow ID | Flow Name | Entry Point | Payment Method | SAQ Target | Gateway |
|---------|-----------|-------------|----------------|------------|---------|
| web-checkout | Web Browser Checkout | WEB | REDIRECT | SAQ A | Stripe/MoMo |
| mobile-app | Mobile App Checkout | MOBILE_APP | REDIRECT | SAQ A | Stripe/MoMo |
| recurring-billing | Recurring Billing | API | API_DIRECT | SAQ D | Stripe |

### Implementation

**Service:** `PciScopeDecisionService`
- Tracks payment flow scope decisions
- Records SAQ target per flow
- Documents payment entry points

**Usage:**
```java
pciScopeDecisionService.registerFlow(
    "web-checkout",
    "Web Browser Checkout",
    PaymentEntryPoint.WEB,
    PaymentMethod.REDIRECT,
    SaqTarget.SAQ_A,
    "Stripe",
    "Standard web checkout with redirect to Stripe"
);
```

---

## Data Flow Diagrams (DFDs)

### Key Principle
**Merchant systems DO NOT store/process/transmit PAN (Primary Account Number)**

### Payment Flow DFDs

#### 1. Web Checkout Flow (Redirect)
```
[Customer Browser]
    │
    ├─> [SelfCar Web App] (No PAN)
    │       │
    │       ├─> Creates payment intent
    │       └─> Redirects to payment gateway
    │
    └─> [Payment Gateway] (Stripe/MoMo/ZaloPay)
            │
            ├─> Collects card data (PAN)
            ├─> Processes payment
            └─> Redirects back to SelfCar
                    │
                    └─> [SelfCar Web App] (Receives transaction ID only)
```

**PAN Handling:**
- ❌ SelfCar systems: NO PAN storage/processing/transmission
- ✅ Payment Gateway: Handles all PAN data
- ✅ SelfCar receives: Transaction ID, status, amount (no card data)

#### 2. Mobile App Checkout Flow (Redirect)
```
[Mobile App]
    │
    ├─> [SelfCar Backend API] (No PAN)
    │       │
    │       ├─> Creates payment intent
    │       └─> Returns payment URL
    │
    └─> [Payment Gateway Mobile SDK] (Stripe/MoMo)
            │
            ├─> Collects card data (PAN)
            ├─> Processes payment
            └─> Returns transaction result
                    │
                    └─> [SelfCar Backend API] (Receives transaction ID only)
```

**PAN Handling:**
- ❌ SelfCar systems: NO PAN storage/processing/transmission
- ✅ Payment Gateway SDK: Handles all PAN data
- ✅ SelfCar receives: Transaction ID, status, amount (no card data)

#### 3. Recurring Billing Flow (API Direct)
```
[SelfCar Backend]
    │
    ├─> [Payment Gateway API] (Stripe)
    │       │
    │       ├─> Tokenized payment method (no PAN)
    │       ├─> Processes payment
    │       └─> Returns transaction result
    │
    └─> [SelfCar Backend] (Stores transaction ID only)
```

**PAN Handling:**
- ❌ SelfCar systems: NO PAN storage/processing/transmission
- ✅ Payment Gateway: Uses tokenized payment methods
- ✅ SelfCar stores: Transaction ID, tokenized payment method ID (no PAN)

### Data Storage Verification

**What SelfCar Stores:**
- ✅ Transaction IDs
- ✅ Payment gateway transaction IDs
- ✅ Amounts, currencies, statuses
- ✅ Tokenized payment method IDs (if applicable)
- ✅ User IDs, booking IDs

**What SelfCar DOES NOT Store:**
- ❌ PAN (Primary Account Number)
- ❌ Card expiration dates
- ❌ CVV/CVC codes
- ❌ Cardholder names (unless required for other purposes)
- ❌ Full magnetic stripe data

---

## Control Inventory: PCI DSS v4.x Control Mapping

### 12 Requirements + Evidence Owner + Collection Method

| Req ID | Requirement | Control Category | Evidence Owner | Collection Method |
|--------|-------------|------------------|----------------|-------------------|
| 1.1 | Install and maintain network security controls | Network Security | DevOps | Network diagrams, firewall rules, access logs |
| 2.1 | Apply secure configurations to all system components | System Configuration | DevOps | Configuration files, hardening checklists, change logs |
| 3.1 | Protect stored account data | Data Protection | Security | Data encryption documentation, key management procedures |
| 4.1 | Protect cardholder data transmission | Data Transmission | Security | TLS configuration, certificate management, encryption logs |
| 5.1 | Protect systems from malicious software | Malware Protection | DevOps | Antivirus logs, malware scans, patch management records |
| 6.1 | Develop and maintain secure systems and software | Secure Development | Engineering | Code reviews, vulnerability scans, patch logs |
| **6.4.3** | **Payment page security** | **Payment Page Security** | **Security** | **CSP headers, script inventory, tamper detection logs** |
| 7.1 | Restrict access to system components and cardholder data | Access Control | Security | Access control lists, user permissions, access logs |
| 8.1 | Identify users and authenticate access | Authentication | Security | Authentication logs, MFA records, password policies |
| 9.1 | Restrict physical access to cardholder data | Physical Security | Operations | Access logs, visitor logs, security camera footage |
| 10.1 | Log and monitor all access | Logging | Security | Access logs, audit trails, security event logs |
| **11.6.1** | **Change and tamper detection** | **Change Detection** | **Security** | **File integrity monitoring, change detection logs, tamper alerts** |
| 11.1 | Test security of systems and networks regularly | Security Testing | Security | Penetration test reports, vulnerability scans, security assessments |
| 12.1 | Support information security with organizational policies | Security Policy | Management | Security policies, training records, incident response plans |

### Implementation

**Service:** `PciControlMappingService`
- Maps PCI DSS v4.x requirements to controls
- Tracks evidence owners and collection methods
- Monitors control status and compliance

**Usage:**
```java
// Initialize controls
pciControlMappingService.initializePciControls();

// Update control status
pciControlMappingService.updateControlStatus("6.4.3", ControlStatus.COMPLIANT, 
    "CSP headers implemented, script inventory maintained, tamper detection active");
```

---

## Payment Page Security Plan

### PCI DSS Requirements
- **6.4.3:** Payment page security (CSP, script inventory, change detection)
- **11.6.1:** Change and tamper detection for payment pages

### Implementation Components

#### 1. Content Security Policy (CSP) Allowlists

**Service:** `PaymentPageSecurityService`

**CSP Configuration:**
- Strict allowlist for scripts (**no unsafe-inline**, prefer hashes or SRI)
- Script-src: Only payment gateway scripts
- Form-action: Only payment gateway URLs
- Frame-ancestors: 'none' (prevent clickjacking)
- Object-src: 'none' (prevent plugins)

**Implementation:**
```java
// Generate CSP header
String csp = paymentPageSecurityService.generateCspHeader(
    allowedScripts,    // Payment gateway scripts only
    allowedStyles,     // Self and inline (if needed)
    allowedImages,     // Self and data URIs
    allowedFonts       // Self and data URIs
);
```

**Applied via:** `PaymentPageSecurityConfig` interceptor (strict mode: no unsafe-inline)

**CSP Reporting:**
- Report endpoint: `POST /api/security/csp-report`
- Monitor and alert on CSP violations

#### 2. Script Inventory

**Requirements:**
- Maintain inventory of all scripts on payment pages
- Document purpose of each script
- Track script hashes (SHA-256)
- Alert on unauthorized scripts

**Implementation:**
```java
// Register script
paymentPageSecurityService.registerScript(
    "checkout-page",
    "https://js.stripe.com/v3/",
    "sha256-hash-here",
    "Stripe payment processing"
);
```

#### 3. Change/Tamper Detection

**Requirements (11.6.1):**
- Monitor payment page files for changes
- Detect unauthorized modifications
- Alert on tampering
- Maintain file integrity baselines

**Implementation:**
```java
// Record baseline
paymentPageSecurityService.recordFileBaseline(
    "/payment/checkout.html",
    "sha256-hash",
    fileSize
);

// Verify integrity
FileIntegrityResult result = paymentPageSecurityService.verifyFileIntegrity(
    "/payment/checkout.html",
    currentHash,
    currentSize
);
```

**Alerting Path:** On violation, events are logged via `SecurityEventLogger` and can be routed to SIEM.

**Monitoring:**
- Scheduled file integrity checks
- Real-time file change detection
- Alerting on tamper detection

---

## W8 Deliverables

### 1. Architecture One-Pager

**Document:** `docs/PCI_DSS_ARCHITECTURE.md`

**Contents:**
- Payment flow architecture
- PAN handling boundaries
- Security controls overview
- Compliance scope

### 2. SAQ Target per Flow

**Document:** `docs/PCI_DSS_SAQ_TARGETS.md`

**Contents:**
- Flow-by-flow SAQ target mapping
- Scope decision rationale
- Payment method selection criteria

**Implementation:**
```java
// Query SAQ targets
List<PaymentFlowScope> saqAFlows = pciScopeDecisionService.getFlowsBySaqTarget(SaqTarget.SAQ_A);
List<PaymentFlowScope> saqAepFlows = pciScopeDecisionService.getFlowsBySaqTarget(SaqTarget.SAQ_A_EP);
```

### 3. Updated Data Flow Diagrams (DFDs)

**Document:** `docs/PCI_DSS_DATA_FLOW_DIAGRAMS.md`

**Contents:**
- Web checkout flow DFD
- Mobile app checkout flow DFD
- Recurring billing flow DFD
- PAN handling boundaries clearly marked
- Data storage verification

### 4. v1 Control-Mapping Sheet

**Document:** `docs/PCI_DSS_CONTROL_MAPPING.xlsx` (or CSV)

**Contents:**
- All 12 PCI DSS requirements
- Control names and descriptions
- Evidence owners
- Collection methods
- Control status
- Evidence links

**Implementation:**
```java
// Export control mapping
List<PciControl> controls = pciControlMappingService.getAllControls();
// Export to CSV/Excel format
```

---

## Implementation Checklist

### Phase 1: Scope Decision & Flow Registration
- [ ] Register all payment flows with `PciScopeDecisionService`
- [ ] Document SAQ target per flow
- [ ] Create architecture one-pager
- [ ] Document scope decisions

### Phase 2: Data Flow Documentation
- [ ] Create DFDs for all payment entry points
- [ ] Verify PAN handling boundaries
- [ ] Document data storage verification
- [ ] Update DFDs document

### Phase 3: Control Mapping
- [ ] Initialize PCI control mappings
- [ ] Assign evidence owners
- [ ] Document collection methods
- [ ] Create control-mapping sheet (v1)

### Phase 4: Payment Page Security
- [ ] Implement CSP headers for payment pages
- [ ] Create script inventory
- [ ] Implement file integrity monitoring
- [ ] Wire frontend to send CSP reports (Report-To/report-uri)
- [ ] Set up tamper detection alerts
- [ ] Test CSP enforcement
- [ ] Verify script inventory accuracy

### Phase 5: W8 Deliverables
- [ ] Architecture one-pager
- [ ] SAQ target per flow document
- [ ] Updated DFDs
- [ ] v1 control-mapping sheet

---

## Configuration

### Application Properties

```properties
# Payment Page Security
pci.payment-page.csp.strict-mode=true
pci.payment-page.tamper-detection.enabled=true

# PCI Control Mapping
pci.control-mapping.auto-initialize=true
```

---

## Monitoring & Alerting

### Key Metrics
1. **Payment Page Security:**
   - CSP violations
   - Unauthorized scripts detected
   - File tamper events

2. **Control Compliance:**
   - Control status changes
   - Evidence collection status
   - Compliance gaps

3. **Scope Management:**
   - New payment flows registered
   - SAQ target changes
   - Payment method changes

### Alert Thresholds
- **Critical:** File tamper detected, unauthorized script detected
- **High:** CSP violation, control status changed to non-compliant
- **Medium:** New payment flow registered, control evidence missing
- **Low:** Control status updated, script inventory updated

---

## References

- PCI DSS v4.x Quick Reference Guide
- PCI DSS v4.x Requirements and Testing Procedures
- OWASP Content Security Policy Cheat Sheet
- PCI Security Standards Council: https://www.pcisecuritystandards.org

---

## Notes

- All payment flows must be registered before going live
- CSP headers must be tested in staging environment
- File integrity monitoring requires baseline establishment
- Control evidence must be collected and stored securely
- SAQ targets must be reviewed and approved by QSA

