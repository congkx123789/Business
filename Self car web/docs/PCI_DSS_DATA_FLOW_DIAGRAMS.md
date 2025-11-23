# PCI DSS Data Flow Diagrams (SelfCar)

Last updated: 2026-02-01

## Scope Overview
- SAQ Target: SAQ A-EP (no cardholder data stored; e-commerce site that relies on a payment gateway but controls the payment page that could impact the security of the payment transaction).
- In-scope systems: frontend (payment pages), backend (payment initiation + webhook), network edge (CDN/WAF), logging/monitoring.
- Out of scope: card storage, payment processing; handled by providers (Momo, ZaloPay, Stripe).

## Data Flows

### DF-1: Payment Initiation (User → Gateway)
1. User confirms booking in frontend.
2. Frontend calls backend `/api/payments/create` (no CHD), receives gateway session/URL.
3. Frontend redirects user to gateway-hosted payment page.
4. No CHD traverses SelfCar systems.

Security controls:
- HTTPS with HSTS; CSP on payment pages; SRI for scripts.
- OAuth2 session via HttpOnly Secure cookies.
- CSRF protection on initiation endpoints.

### DF-2: Payment Webhook (Gateway → Backend)
1. Gateway sends callback to `/api/payments/{provider}/webhook`.
2. Backend validates signature, timestamp, idempotency, rate limit, and (optionally) IP allowlist.
3. Backend updates booking/payment status; writes audit and security logs.

Security controls:
- `WebhookSecurityService` (replay window, rate limit, allowlist, idempotency).
- Separate security/audit logs; integrity retained.
- Alerts on 4xx/5xx spikes (`WebhookVerificationFailures`).

### DF-3: Receipt & Status (Backend → Frontend)
1. Frontend polls/queries `/api/payments/{id}/status`.
2. Backend returns sanitized status (no CHD).

Security controls:
- Strict DTOs; no sensitive data.
- Authentication/authorization enforced.

## Trust Boundaries
- Browser boundary: frontend app; CSP + Subresource Integrity on payment pages.
- Edge/CDN/WAF boundary: TLS termination, WAF rules for payments.
- Backend boundary: authn/z, input validation, logging, rate limiting.
- Payment provider boundary: signed webhooks, provider SLA.

## SAQ & Review Plan
- SAQ: SAQ A-EP (annual), QSA review for first submission; thereafter annual self-assessment unless scope changes.
- Evidence: DAST results (staging), SAST/IaC reports, webhook security logs, Prometheus alert history, runbooks.

## Diagrams

```text
[User] --HTTPS--> [Frontend SPA]
  |                        |
  |  (initiate)            | fetch /api/payments/create
  v                        v
[Payment Gateway Page] <- redirect URL/session from backend
  | (webhook)                 ^
  v                           |
[Backend Webhook Endpoint] ---
  | writes audit/security logs
  v
[DB: bookings/payments]
```

## References
- `docs/SECURITY.md`, `docs/SECURITY_HARDENING_COMPLETE.md`
- `docs/alerts/prometheus-rules.yml`
- `backend/src/main/java/com/selfcar/security/WebhookSecurityService.java`

# PCI DSS Data Flow Diagrams (DFDs)

## Overview

This document provides data flow diagrams for all payment entry points, clearly showing that merchant systems **DO NOT** store, process, or transmit PAN (Primary Account Number).

---

## Key Principle

**Merchant systems DO NOT store/process/transmit PAN**

All card data (PAN) handling is outsourced to PCI DSS Level 1 certified payment gateways.

---

## DFD 1: Web Checkout Flow (Redirect)

### Flow Diagram

```
┌─────────────────────┐
│  Customer Browser   │
└──────────┬──────────┘
           │
           │ 1. Selects car & initiates booking
           │
┌──────────▼──────────────────────────┐
│  SelfCar Web Application             │
│  (No PAN Handling)                   │
│                                      │
│  Inputs:                             │
│  • Booking details                  │
│  • Amount                            │
│  • User ID                           │
│                                      │
│  Processing:                         │
│  • Creates payment intent            │
│  • Generates transaction ID          │
│  • Stores transaction metadata       │
│                                      │
│  Outputs:                            │
│  • Transaction ID                    │
│  • Payment gateway URL               │
│  • Redirect URL                      │
└──────────┬──────────────────────────┘
           │
           │ 2. Redirect to Payment Gateway
           │
┌──────────▼──────────────────────────┐
│  Payment Gateway                    │
│  (PCI DSS Level 1)                   │
│                                      │
│  Inputs:                             │
│  • Transaction ID                    │
│  • Amount                            │
│  • Card data (PAN) ← Customer enters│
│                                      │
│  Processing:                         │
│  • Validates card data               │
│  • Processes payment                 │
│  • Authorizes transaction            │
│                                      │
│  Outputs:                            │
│  • Transaction status                │
│  • Gateway transaction ID            │
│  • Payment result                    │
└──────────┬──────────────────────────┘
           │
           │ 3. Redirect back with transaction result
           │
┌──────────▼──────────────────────────┐
│  SelfCar Web Application             │
│  (No PAN Handling)                   │
│                                      │
│  Inputs:                             │
│  • Transaction ID                    │
│  • Transaction status                │
│  • Gateway transaction ID            │
│  ❌ NO PAN received                  │
│                                      │
│  Processing:                         │
│  • Updates booking status            │
│  • Stores transaction record         │
│  • Creates payment transaction       │
│                                      │
│  Storage:                            │
│  • Transaction ID                    │
│  • Amount, currency, status         │
│  • Gateway transaction ID            │
│  ❌ NO PAN stored                    │
└──────────────────────────────────────┘
```

### PAN Handling Verification

**SelfCar Systems:**
- ❌ **DO NOT** receive PAN
- ❌ **DO NOT** store PAN
- ❌ **DO NOT** process PAN
- ❌ **DO NOT** transmit PAN

**Payment Gateway:**
- ✅ **HANDLES** all PAN data
- ✅ **PROCESSES** payment
- ✅ **RETURNS** transaction result only (no PAN)

---

## DFD 2: Mobile App Checkout Flow (Redirect)

### Flow Diagram

```
┌─────────────────────┐
│  Mobile App         │
└──────────┬──────────┘
           │
           │ 1. User initiates payment
           │
┌──────────▼──────────────────────────┐
│  SelfCar Backend API                │
│  (No PAN Handling)                  │
│                                      │
│  Inputs:                             │
│  • Booking ID                        │
│  • Amount                            │
│  • User ID                           │
│                                      │
│  Processing:                         │
│  • Creates payment intent            │
│  • Generates transaction ID          │
│  • Returns payment URL               │
│                                      │
│  Outputs:                            │
│  • Transaction ID                    │
│  • Payment gateway URL               │
└──────────┬──────────────────────────┘
           │
           │ 2. Payment URL returned
           │
┌──────────▼──────────────────────────┐
│  Payment Gateway SDK                │
│  (PCI DSS Level 1)                   │
│                                      │
│  Inputs:                             │
│  • Payment URL                       │
│  • Card data (PAN) ← User enters    │
│                                      │
│  Processing:                         │
│  • Collects card data                │
│  • Validates card data               │
│  • Processes payment                 │
│                                      │
│  Outputs:                            │
│  • Transaction status                │
│  • Gateway transaction ID            │
└──────────┬──────────────────────────┘
           │
           │ 3. Transaction result returned
           │
┌──────────▼──────────────────────────┐
│  Mobile App                         │
│  (No PAN Handling)                  │
│                                      │
│  Inputs:                             │
│  • Transaction status                │
│  • Gateway transaction ID            │
│  ❌ NO PAN received                  │
│                                      │
│  Processing:                         │
│  • Updates UI                        │
│  • Notifies backend                  │
└──────────┬──────────────────────────┘
           │
           │ 4. Notify backend with transaction ID
           │
┌──────────▼──────────────────────────┐
│  SelfCar Backend API                │
│  (No PAN Handling)                  │
│                                      │
│  Inputs:                             │
│  • Transaction ID                    │
│  • Transaction status                │
│  • Gateway transaction ID            │
│  ❌ NO PAN received                  │
│                                      │
│  Processing:                         │
│  • Updates booking status            │
│  • Stores transaction record         │
│                                      │
│  Storage:                            │
│  • Transaction ID                    │
│  • Amount, currency, status         │
│  • Gateway transaction ID            │
│  ❌ NO PAN stored                    │
└──────────────────────────────────────┘
```

### PAN Handling Verification

**SelfCar Systems (Mobile App + Backend):**
- ❌ **DO NOT** receive PAN
- ❌ **DO NOT** store PAN
- ❌ **DO NOT** process PAN
- ❌ **DO NOT** transmit PAN

**Payment Gateway SDK:**
- ✅ **HANDLES** all PAN data
- ✅ **PROCESSES** payment
- ✅ **RETURNS** transaction result only (no PAN)

---

## DFD 3: Recurring Billing Flow (Tokenized)

### Flow Diagram

```
┌─────────────────────┐
│  SelfCar Backend    │
│  (No PAN Handling)  │
└──────────┬──────────┘
           │
           │ 1. Initial Setup: Customer authorizes recurring payment
           │
┌──────────▼──────────────────────────┐
│  Payment Gateway API                │
│  (PCI DSS Level 1)                   │
│                                      │
│  Inputs:                             │
│  • Card data (PAN) ← First time only│
│  • Customer details                  │
│                                      │
│  Processing:                         │
│  • Validates card data               │
│  • Creates tokenized payment method  │
│  • Returns payment method ID         │
│                                      │
│  Outputs:                            │
│  • Tokenized payment method ID       │
│  ❌ NO PAN returned                  │
└──────────┬──────────────────────────┘
           │
           │ 2. Tokenized payment method ID returned
           │
┌──────────▼──────────────────────────┐
│  SelfCar Backend                    │
│  (No PAN Handling)                  │
│                                      │
│  Inputs:                             │
│  • Tokenized payment method ID       │
│  ❌ NO PAN received                  │
│                                      │
│  Storage:                            │
│  • Tokenized payment method ID       │
│  • Customer ID                       │
│  • Subscription ID                   │
│  ❌ NO PAN stored                    │
└──────────────────────────────────────┘

           │
           │ 3. Subsequent Charges: Use tokenized payment method
           │
┌──────────▼──────────────────────────┐
│  SelfCar Backend                    │
│  (No PAN Handling)                  │
│                                      │
│  Inputs:                             │
│  • Tokenized payment method ID       │
│  • Amount                            │
│  • Transaction ID                    │
│  ❌ NO PAN used                      │
│                                      │
│  Processing:                         │
│  • Creates charge request            │
│  • Sends to payment gateway          │
└──────────┬──────────────────────────┘
           │
           │ 4. Charge request with tokenized payment method
           │
┌──────────▼──────────────────────────┐
│  Payment Gateway API                │
│  (PCI DSS Level 1)                   │
│                                      │
│  Inputs:                             │
│  • Tokenized payment method ID       │
│  • Amount                            │
│  • Transaction ID                    │
│                                      │
│  Processing:                         │
│  • Resolves tokenized payment method │
│  • Processes payment                 │
│  • Authorizes transaction            │
│                                      │
│  Outputs:                            │
│  • Transaction status                │
│  • Gateway transaction ID            │
└──────────┬──────────────────────────┘
           │
           │ 5. Transaction result returned
           │
┌──────────▼──────────────────────────┐
│  SelfCar Backend                    │
│  (No PAN Handling)                  │
│                                      │
│  Inputs:                             │
│  • Transaction status                │
│  • Gateway transaction ID            │
│  ❌ NO PAN received                  │
│                                      │
│  Storage:                            │
│  • Transaction ID                    │
│  • Amount, currency, status         │
│  • Gateway transaction ID            │
│  ❌ NO PAN stored                    │
└──────────────────────────────────────┘
```

### PAN Handling Verification

**SelfCar Backend:**
- ❌ **DO NOT** receive PAN (after initial setup)
- ❌ **DO NOT** store PAN
- ❌ **DO NOT** process PAN
- ❌ **DO NOT** transmit PAN
- ✅ **STORES** tokenized payment method ID only

**Payment Gateway:**
- ✅ **HANDLES** PAN during initial setup only
- ✅ **STORES** tokenized payment methods securely
- ✅ **PROCESSES** payments using tokens
- ✅ **RETURNS** transaction result only (no PAN)

---

## Data Storage Verification

### What SelfCar Stores

✅ **Allowed:**
- Transaction IDs
- Payment gateway transaction IDs
- Amounts and currencies
- Transaction statuses
- Tokenized payment method IDs (for recurring billing)
- User IDs and booking IDs
- Payment timestamps

### What SelfCar DOES NOT Store

❌ **Forbidden:**
- Primary Account Number (PAN)
- Card expiration dates
- CVV/CVC codes
- Full magnetic stripe data
- Cardholder names (unless required for other business purposes)

---

## System Boundaries

### SelfCar Systems (In Scope)
- Web application
- Mobile application
- Backend API
- Database (transaction records only)
- Payment gateway integration layer

### Payment Gateway Systems (Out of Scope)
- Payment gateway hosted checkout
- Payment gateway mobile SDK
- Payment gateway API
- Payment gateway tokenization service

### PAN Handling Boundary
**PAN never enters SelfCar systems** - all card data handling occurs at payment gateway.

---

## References

- PCI DSS v4.x Requirements and Testing Procedures
- Payment Gateway Documentation
- PCI Security Standards Council: https://www.pcisecuritystandards.org

