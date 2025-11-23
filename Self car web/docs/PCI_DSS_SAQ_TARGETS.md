# PCI DSS SAQ Target per Flow

## Overview

This document maps each payment flow to its PCI DSS Self-Assessment Questionnaire (SAQ) target based on the payment method implementation.

---

## SAQ Target Definitions

### SAQ A
**Outsourced e-commerce** - Merchant does not store, process, or transmit card data. All card data handling is outsourced to PCI DSS compliant service providers via redirect or iframe.

### SAQ A-EP
**Partially outsourced e-commerce** - Merchant website receives card data but redirects immediately to payment gateway. May require additional controls for payment page security.

### SAQ D
**All other cases** - Merchant stores, processes, or transmits card data directly, or uses tokenized payment methods with API integration.

---

## Payment Flow SAQ Mapping

| Flow ID | Flow Name | Entry Point | Payment Method | Gateway | SAQ Target | Rationale |
|---------|-----------|-------------|----------------|---------|------------|------------|
| `web-checkout` | Web Browser Checkout | WEB | REDIRECT | Stripe/MoMo/ZaloPay | **SAQ A** | Redirect to hosted checkout - no PAN handling |
| `mobile-app` | Mobile App Checkout | MOBILE_APP | REDIRECT | Stripe/MoMo | **SAQ A** | Redirect to payment gateway SDK - no PAN handling |
| `recurring-billing` | Recurring Billing | API | API_DIRECT | Stripe | **SAQ D** | Uses tokenized payment methods - requires SAQ D |

---

## Flow Details

### 1. Web Browser Checkout

**Flow ID:** `web-checkout`  
**Flow Name:** Web Browser Checkout  
**Entry Point:** WEB  
**Payment Method:** REDIRECT (Hosted Checkout)  
**Gateway:** Stripe, MoMo, ZaloPay  
**SAQ Target:** **SAQ A**

**Scope Decision:**
- ✅ Redirect to payment gateway hosted checkout
- ✅ No PAN storage/processing/transmission
- ✅ Lower compliance burden

**Implementation:**
- Customer initiates payment on SelfCar website
- SelfCar creates payment intent and redirects to gateway
- Payment gateway collects card data and processes payment
- Gateway redirects back to SelfCar with transaction result
- SelfCar receives transaction ID only (no card data)

---

### 2. Mobile App Checkout

**Flow ID:** `mobile-app`  
**Flow Name:** Mobile App Checkout  
**Entry Point:** MOBILE_APP  
**Payment Method:** REDIRECT (Payment Gateway SDK)  
**Gateway:** Stripe, MoMo  
**SAQ Target:** **SAQ A**

**Scope Decision:**
- ✅ Redirect to payment gateway mobile SDK
- ✅ No PAN storage/processing/transmission
- ✅ Lower compliance burden

**Implementation:**
- Mobile app calls SelfCar backend API to initiate payment
- Backend creates payment intent and returns payment URL
- Mobile app opens payment gateway SDK
- Payment gateway SDK collects card data and processes payment
- SDK returns transaction result to mobile app
- Mobile app notifies SelfCar backend with transaction ID only

---

### 3. Recurring Billing

**Flow ID:** `recurring-billing`  
**Flow Name:** Recurring Billing  
**Entry Point:** API  
**Payment Method:** API_DIRECT (Tokenized)  
**Gateway:** Stripe  
**SAQ Target:** **SAQ D**

**Scope Decision:**
- ⚠️ Uses tokenized payment methods via API
- ⚠️ Requires SAQ D compliance
- ✅ No PAN storage (uses tokens)
- ✅ Tokenized payment methods stored securely by gateway

**Implementation:**
- Customer authorizes recurring payment (initial setup)
- Payment gateway returns tokenized payment method ID
- SelfCar stores tokenized payment method ID (not PAN)
- Subsequent charges use tokenized payment method ID
- Payment gateway processes payment using tokenized method

**Additional Controls Required:**
- Secure storage of tokenized payment method IDs
- Access controls for payment processing API
- Audit logging of all payment operations

---

## SAQ Target Summary

| SAQ Target | Number of Flows | Flows |
|------------|-----------------|-------|
| **SAQ A** | 2 | web-checkout, mobile-app |
| **SAQ A-EP** | 0 | None |
| **SAQ D** | 1 | recurring-billing |

---

## Scope Reduction Strategy

### Primary Strategy: Redirect (Hosted Checkout)
- ✅ **Target:** SAQ A (lowest scope)
- ✅ **Implementation:** Redirect to payment gateway hosted checkout
- ✅ **Flows:** Web checkout, Mobile app checkout

### Secondary Strategy: Tokenized API
- ⚠️ **Target:** SAQ D (higher scope)
- ⚠️ **Implementation:** Tokenized payment methods via API
- ⚠️ **Flows:** Recurring billing (when redirect not feasible)

### Avoided: Hosted Fields (iframes)
- ❌ **Target:** SAQ A-EP (medium scope)
- ❌ **Rationale:** Requires payment page security controls (6.4.3, 11.6.1)
- ❌ **Status:** Not used - redirect preferred

### If Hosted Fields Must Be Used
- Document business justification (UX/accessibility requirement)
- Confirm provider iframes are the only elements rendering PAN
- Ensure no PAN in logs, memory, or telemetry
- Enforce strict CSP: allowlist provider origins only; no unsafe-inline
- Use tokenization; only tokens reach the backend
- Update SAQ target to SAQ A-EP and expand controls accordingly

---

## Compliance Notes

1. **SAQ A Flows:** Minimal compliance burden - verify gateway PCI DSS compliance
2. **SAQ D Flows:** Requires full control implementation and evidence collection
3. **SAQ A-EP:** Not applicable - no flows use hosted fields

---

## Review and Approval

- **QSA Review:** Required before production deployment
- **Annual Review:** SAQ targets must be reviewed annually
- **Flow Changes:** Any new payment flow must be registered and assigned SAQ target

---

## References

- PCI DSS v4.x Self-Assessment Questionnaire Instructions
- PCI Security Standards Council: https://www.pcisecuritystandards.org

