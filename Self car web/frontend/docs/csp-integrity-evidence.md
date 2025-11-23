# CSP + Integrity Evidence Pack

## Overview

This document provides evidence for PCI DSS compliance related to Content Security Policy (CSP) and script integrity monitoring for payment routes.

## PCI DSS Requirements

- **PCI DSS 4.0 6.4.3**: Protect payment pages from unauthorized modifications
- **PCI DSS 4.0 11.6.1**: Monitor payment page scripts for tampering
- **PCI DSS 4.0 6.5.7**: Protect against cross-site scripting (XSS)

## Evidence Collection

### 1. Content Security Policy (CSP)

#### Payment Route CSP Configuration

**Location**: `nginx/csp.conf`, `vite.config.js`

**Payment Routes**:
- `/checkout`
- `/payment/*`
- `/booking/*/payment`

**CSP Policy** (Production):
```
default-src 'none';
base-uri 'none';
object-src 'none';
frame-ancestors 'none';
form-action 'self' https://checkout.stripe.com https://payment.momo.vn;
script-src 'self' https://js.stripe.com https://checkout.stripe.com;
style-src 'self';
img-src 'self' data: https://*.stripe.com;
font-src 'self' data:;
connect-src 'self' https://api.example.com https://api.stripe.com;
frame-src https://checkout.stripe.com;
upgrade-insecure-requests;
report-uri /api/security/csp-report;
```

**Evidence**:
- ✅ CSP headers configured in nginx
- ✅ CSP headers configured in Vite dev server
- ✅ Payment routes isolated with strict CSP
- ✅ CSP violation reporting enabled
- ✅ Frame-ancestors set to 'none' for payment pages

#### CSP Allowlist

**Allowed Script Sources**:
- `https://js.stripe.com` - Stripe payment gateway
- `https://checkout.stripe.com` - Stripe hosted checkout
- `https://payment.momo.vn` - MoMo payment gateway (if applicable)
- `https://sandbox.zalopay.vn` - ZaloPay sandbox (if applicable)

**Allowed Frame Sources**:
- `https://checkout.stripe.com` - Stripe hosted checkout iframe

**Evidence**:
- ✅ Allowlist documented
- ✅ Only payment gateway domains allowed
- ✅ No third-party scripts allowed on payment pages

### 2. Script Integrity Monitoring

#### Implementation

**Location**: `frontend/src/utils/scriptIntegrity.js`, `frontend/src/utils/paymentMonitoring.js`

**Features**:
- ✅ Script inventory tracking
- ✅ Tamper detection
- ✅ SRI (Subresource Integrity) validation
- ✅ Unauthorized script detection
- ✅ Script modification monitoring

**Evidence**:
- ✅ Script integrity monitoring initialized on payment pages
- ✅ Script inventory captured on page load
- ✅ Tamper detection active
- ✅ Suspicious scripts reported to backend

#### Script Inventory

**Allowed Scripts**:
1. **Payment Gateway Scripts**:
   - Stripe.js: `https://js.stripe.com/v3/`
   - Stripe Elements: `https://js.stripe.com/v3/elements.js`
   - Stripe Checkout: `https://checkout.stripe.com/checkout.js`

2. **Application Scripts**:
   - All application scripts must have SRI attributes
   - SRI calculated using SHA-384

**Evidence**:
- ✅ Script inventory function implemented
- ✅ Allowed scripts list documented
- ✅ SRI validation active
- ✅ Suspicious scripts detected and reported

### 3. Tamper Detection

#### Implementation

**Location**: `frontend/src/utils/paymentMonitoring.js`

**Features**:
- ✅ MutationObserver for script changes
- ✅ Unauthorized script addition detection
- ✅ Script modification monitoring
- ✅ Tamper event reporting

**Evidence**:
- ✅ Tamper detection initialized on payment pages
- ✅ MutationObserver active
- ✅ Unauthorized scripts detected
- ✅ Tamper events reported to backend

#### Detection Logs

**Example Detection**:
```javascript
{
  eventType: 'script_added',
  src: 'https://malicious-script.com/evil.js',
  timestamp: '2024-01-01T12:00:00Z',
  pageUrl: 'https://example.com/checkout',
  userAgent: 'Mozilla/5.0...'
}
```

### 4. Subresource Integrity (SRI)

#### Implementation

**Location**: `frontend/vite.config.js` (ViteSRI plugin)

**Features**:
- ✅ SRI attributes added to all external scripts
- ✅ SHA-384 hash calculation
- ✅ SRI validation on script load

**Evidence**:
- ✅ ViteSRI plugin configured
- ✅ SRI attributes generated for all scripts
- ✅ SRI validation active

#### Example SRI Attribute

```html
<script 
  src="https://js.stripe.com/v3/" 
  integrity="sha384-..." 
  crossorigin="anonymous">
</script>
```

### 5. Payment Page Isolation

#### Implementation

**Location**: `frontend/src/pages/Checkout.jsx`, `frontend/src/utils/paymentMonitoring.js`

**Features**:
- ✅ Payment pages isolated with strict CSP
- ✅ Script integrity monitoring active
- ✅ Tamper detection enabled
- ✅ Telemetry for security events

**Evidence**:
- ✅ Payment pages isolated
- ✅ Monitoring initialized on payment pages only
- ✅ Security events tracked

### 6. CSP Violation Reporting

#### Implementation

**Location**: `nginx/csp.conf`, `vite.config.js`

**Features**:
- ✅ CSP violation reporting enabled
- ✅ Violations sent to `/api/security/csp-report`
- ✅ Violations logged for analysis

**Evidence**:
- ✅ CSP violation reporting configured
- ✅ Report-URI set
- ✅ Violations captured and logged

### 7. SAQ Evidence Targets

#### SAQ A Targets

**PCI DSS Requirement 6.4.3**:
- ✅ Payment pages protected from unauthorized modifications
- ✅ Script integrity monitoring implemented
- ✅ Tamper detection active

**PCI DSS Requirement 11.6.1**:
- ✅ Payment page scripts monitored
- ✅ Unauthorized script detection
- ✅ Tamper events reported

**PCI DSS Requirement 6.5.7**:
- ✅ CSP configured to prevent XSS
- ✅ Script sources restricted
- ✅ Inline scripts restricted (except payment gateway)

#### Evidence Collection

**Automated Evidence**:
- ✅ Script inventory logs
- ✅ Tamper detection logs
- ✅ CSP violation reports
- ✅ Payment telemetry events

**Manual Evidence**:
- ✅ CSP configuration files
- ✅ Script integrity monitoring code
- ✅ Payment page isolation implementation
- ✅ Documentation

### 8. Testing Evidence

#### Test Results

**Location**: `frontend/e2e/checkout.spec.js`

**Tests**:
- ✅ Payment page CSP headers present
- ✅ Script integrity monitoring active
- ✅ Tamper detection working
- ✅ Payment flow functional

**Evidence**:
- ✅ Test results documented
- ✅ CI tests passing
- ✅ Payment flow verified

### 9. Monitoring Evidence

#### Monitoring Implementation

**Location**: `frontend/src/utils/paymentMonitoring.js`

**Features**:
- ✅ Script inventory tracking
- ✅ Tamper detection
- ✅ Security event logging
- ✅ Backend reporting

**Evidence**:
- ✅ Monitoring active on payment pages
- ✅ Events logged
- ✅ Reports sent to backend

### 10. Compliance Checklist

- ✅ CSP configured for payment routes
- ✅ Script integrity monitoring implemented
- ✅ Tamper detection active
- ✅ SRI attributes on external scripts
- ✅ CSP violation reporting enabled
- ✅ Payment page isolation implemented
- ✅ Security events tracked
- ✅ Evidence collected and documented

## Evidence Files

1. **CSP Configuration**:
   - `nginx/csp.conf`
   - `vite.config.js`

2. **Script Integrity Monitoring**:
   - `frontend/src/utils/scriptIntegrity.js`
   - `frontend/src/utils/paymentMonitoring.js`

3. **Payment Components**:
   - `frontend/src/pages/Checkout.jsx`
   - `frontend/src/components/Payment/HostedCheckout.jsx`
   - `frontend/src/components/Payment/HostedFieldsFallback.jsx`

4. **Tests**:
   - `frontend/e2e/checkout.spec.js`

5. **Documentation**:
   - `frontend/docs/csp-integrity-evidence.md` (this file)

## Updates

**Last Updated**: Month 4 - Payments UX Hardening
**Status**: ✅ Complete
**Owner**: Frontend Team

---

**Note**: This evidence pack should be updated whenever CSP or script integrity monitoring changes are made.

