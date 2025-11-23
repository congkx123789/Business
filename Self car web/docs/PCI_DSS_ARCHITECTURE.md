# PCI DSS Architecture One-Pager

## Payment Processing Architecture

### Overview
SelfCar uses **redirect-based payment processing** (Hosted Checkout) to minimize PCI DSS scope. All card data (PAN) is handled by PCI DSS Level 1 certified payment gateways. SelfCar systems never store, process, or transmit PAN.

---

## Architecture Diagram

```
┌─────────────────┐
│  Customer       │
│  Browser/App    │
└────────┬────────┘
         │
         │ 1. Initiates Payment
         │
┌────────▼────────────────────────┐
│  SelfCar Application            │
│  (No PAN Handling)             │
│                                 │
│  • Creates payment intent       │
│  • Generates transaction ID    │
│  • Stores transaction metadata  │
└────────┬────────────────────────┘
         │
         │ 2. Redirect to Gateway
         │
┌────────▼────────────────────────┐
│  Payment Gateway               │
│  (PCI DSS Level 1)             │
│                                 │
│  • Collects card data (PAN)    │
│  • Processes payment            │
│  • Returns transaction result   │
└────────┬────────────────────────┘
         │
         │ 3. Payment Result
         │
┌────────▼────────────────────────┐
│  SelfCar Application           │
│  (Receives transaction ID only) │
│                                 │
│  • Updates booking status       │
│  • Stores transaction ID        │
│  • No card data received        │
└─────────────────────────────────┘
```

---

## PAN Handling Boundaries

### ✅ SelfCar Systems Handle
- Transaction IDs
- Payment amounts and currencies
- Transaction status (success/failure)
- User IDs and booking IDs
- Payment gateway transaction IDs

### ❌ SelfCar Systems DO NOT Handle
- Primary Account Number (PAN)
- Card expiration dates
- CVV/CVC codes
- Full magnetic stripe data
- Cardholder names (unless required for other business purposes)

---

## Payment Flows

### 1. Web Checkout (Redirect)
- **Entry Point:** Web Browser
- **Payment Method:** Redirect to Hosted Checkout
- **Gateway:** Stripe, MoMo, ZaloPay
- **SAQ Target:** SAQ A
- **PAN Handling:** None (gateway handles all card data)

### 2. Mobile App Checkout (Redirect)
- **Entry Point:** Mobile Application
- **Payment Method:** Redirect to Payment Gateway SDK
- **Gateway:** Stripe, MoMo
- **SAQ Target:** SAQ A
- **PAN Handling:** None (gateway SDK handles all card data)

### 3. Recurring Billing (API Direct)
- **Entry Point:** Backend API
- **Payment Method:** Tokenized Payment Methods
- **Gateway:** Stripe
- **SAQ Target:** SAQ D
- **PAN Handling:** None (uses tokenized payment methods)

---

## Security Controls

### Network Security
- Database in private network
- Security groups restrict access
- No direct internet access to database

### Data Protection
- No PAN storage
- Transaction data encrypted at rest
- TLS 1.2+ for all transmissions

### Payment Page Security (6.4.3)
- Content Security Policy (CSP) headers
- Script inventory maintained
- File integrity monitoring
- Tamper detection

### Change Detection (11.6.1)
- File integrity baselines
- Scheduled integrity checks
- Real-time change detection
- Tamper alerts

---

## Compliance Scope

### SAQ A Flows
- Web checkout (redirect)
- Mobile app checkout (redirect)

### SAQ A-EP Flows
- None (all flows use redirect)

### SAQ D Flows
- Recurring billing (tokenized)

---

## Payment Gateway Integration

### Supported Gateways
1. **Stripe**
   - Hosted Checkout
   - Tokenized payment methods
   - PCI DSS Level 1 certified

2. **MoMo (Mobile Money)**
   - Redirect-based checkout
   - PCI DSS compliant

3. **ZaloPay**
   - Redirect-based checkout
   - PCI DSS compliant

---

## Key Principles

1. **Scope Reduction:** Use redirect-based payment processing whenever possible
2. **No PAN Handling:** Merchant systems never store, process, or transmit PAN
3. **Gateway Responsibility:** All card data handling is outsourced to PCI DSS certified gateways
4. **Minimal Scope:** Target SAQ A for most flows
5. **Security Controls:** Implement payment page security and change detection

---

## References

- PCI DSS v4.x Requirements
- Payment Gateway Documentation (Stripe, MoMo, ZaloPay)
- PCI Security Standards Council: https://www.pcisecuritystandards.org

