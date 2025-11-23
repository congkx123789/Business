# Phase 3: Payment, Logistics & Financial Ecosystem Implementation

## Overview

Phase 3 focuses on enabling in-platform transactions, improving reliability between buyers and sellers, and providing comprehensive financial analytics. This implementation includes:

1. **Payment Integration** - Selfcar Wallet with escrow, payment gateways (Momo, ZaloPay, Stripe Connect)
2. **Order Workflow** - "Book – Inspect – Pay" flow for vehicle purchases
3. **Logistics Module** - Pickup, inspection, and delivery coordination
4. **Financial Dashboard** - Revenue/profit analytics by dealer, category, and location

## Database Schema

### New Tables

1. **wallets** - Escrow-based wallet for sellers
   - Balance, escrow balance, pending balance tracking
   - Bank account information for payouts

2. **orders** - Vehicle purchase orders with full workflow
   - Supports "Book – Inspect – Pay" flow
   - Multiple status states for order lifecycle
   - Inspection scheduling and tracking
   - Payment tracking (deposit + remaining amount)

3. **logistics_tasks** - Pickup, inspection, and delivery tasks
   - Task assignment to drivers
   - Scheduled and actual dates
   - Vehicle condition notes
   - Distance and cost tracking

4. **financial_summary** - Aggregated financial analytics
   - Daily, weekly, monthly, yearly summaries
   - Revenue, profit, fees tracking
   - Breakdown by dealer, category, location

5. **wallet_transactions_log** - Complete audit trail
   - Before/after balances
   - Escrow balance changes
   - Transaction linking

### Enhanced Tables

- **payment_transactions** - Added `order_id` foreign key for order-based payments

## Backend Implementation

### Models Created

1. **Order.java** - Complete order entity with status workflow
2. **LogisticsTask.java** - Logistics task management
3. **FinancialSummary.java** - Financial analytics aggregation
4. **WalletTransactionLog.java** - Wallet audit trail

### Repositories Created

1. **OrderRepository** - Order queries with status filtering
2. **LogisticsTaskRepository** - Task queries by order, driver, status
3. **FinancialSummaryRepository** - Financial analytics queries
4. **WalletTransactionLogRepository** - Audit log queries

### Services Created

1. **OrderService** - Complete order lifecycle management
   - Create orders with deposit
   - Inspection scheduling and completion
   - Payment initiation and completion
   - Pickup and delivery scheduling
   - Order cancellation and refunds

2. **LogisticsService** - Logistics task management
   - Task creation for inspection, pickup, delivery
   - Driver assignment
   - Task status updates
   - Completion tracking

3. **FinancialAnalyticsService** - Financial dashboard data
   - Revenue and profit analytics
   - Category and location breakdowns
   - Transaction reconciliation

### Key Workflows

#### Order Workflow: "Book – Inspect – Pay"

```
1. BOOKED
   ↓ (Schedule Inspection)
2. INSPECTION_SCHEDULED
   ↓ (Start Inspection)
3. INSPECTION_IN_PROGRESS
   ↓ (Complete Inspection)
4. INSPECTION_COMPLETED
   ↓ (If Passed)
5. PAYMENT_PENDING
   ↓ (Complete Payment)
6. PAYMENT_COMPLETED
   ↓ (Schedule Pickup/Delivery)
7. PICKUP_SCHEDULED / DELIVERY_SCHEDULED
   ↓ (Execute)
8. PICKUP_IN_PROGRESS / DELIVERY_IN_PROGRESS
   ↓ (Complete)
9. COMPLETED
```

#### Escrow Flow

1. Buyer makes deposit → Funds held in escrow (seller's wallet)
2. Inspection completed and passed → Payment pending
3. Remaining payment completed → Escrow released to seller's balance
4. Seller can withdraw funds to bank account

#### Logistics Flow

1. **Inspection Task**: Created when order reaches INSPECTION_SCHEDULED
   - Assigned to inspector
   - Scheduled date and location
   - Completion updates order status

2. **Pickup Task**: Created when order reaches PICKUP_SCHEDULED
   - Assigned to driver
   - Pickup location and date
   - Vehicle condition documented

3. **Delivery Task**: Created when order reaches DELIVERY_SCHEDULED
   - Assigned to driver
   - Delivery location and date
   - Customer confirmation

## API Endpoints (To Be Implemented)

### Order Management

- `POST /api/orders` - Create new order
- `GET /api/orders/{id}` - Get order details
- `GET /api/orders/buyer/{buyerId}` - Get buyer's orders
- `GET /api/orders/seller/{sellerId}` - Get seller's orders
- `POST /api/orders/{id}/schedule-inspection` - Schedule inspection
- `POST /api/orders/{id}/complete-inspection` - Complete inspection
- `POST /api/orders/{id}/initiate-payment` - Initiate payment
- `POST /api/orders/{id}/complete-payment` - Complete payment
- `POST /api/orders/{id}/schedule-pickup` - Schedule pickup
- `POST /api/orders/{id}/schedule-delivery` - Schedule delivery
- `POST /api/orders/{id}/complete` - Complete order
- `POST /api/orders/{id}/cancel` - Cancel order
- `POST /api/orders/{id}/refund` - Refund order

### Logistics Management

- `POST /api/logistics/tasks` - Create logistics task
- `GET /api/logistics/tasks/{id}` - Get task details
- `GET /api/logistics/tasks/order/{orderId}` - Get tasks for order
- `POST /api/logistics/tasks/{id}/assign-driver` - Assign driver
- `POST /api/logistics/tasks/{id}/start` - Start task
- `POST /api/logistics/tasks/{id}/complete` - Complete task
- `POST /api/logistics/tasks/{id}/cancel` - Cancel task
- `GET /api/logistics/tasks/driver/{driverId}` - Get driver's tasks

### Financial Dashboard

- `GET /api/financial/dashboard` - Get dashboard data
- `GET /api/financial/revenue` - Get revenue analytics
- `GET /api/financial/revenue-by-category` - Revenue by category
- `GET /api/financial/revenue-by-location` - Revenue by location
- `GET /api/financial/summary` - Get financial summary
- `POST /api/financial/reconcile` - Reconcile transactions

### Wallet Management

- `GET /api/wallet` - Get wallet details
- `GET /api/wallet/transactions` - Get transaction history
- `POST /api/wallet/withdraw` - Request withdrawal
- `POST /api/wallet/setup-bank` - Setup bank account

## Payment Gateway Integration

### Supported Gateways

1. **Momo** - Vietnamese mobile wallet
2. **ZaloPay** - Vietnamese payment app
3. **Stripe Connect** - International payments
4. **Bank Transfer** - Direct bank transfers

### Payment Flow

1. Buyer selects payment gateway
2. Payment request sent to gateway
3. Gateway returns payment URL
4. Buyer completes payment on gateway
5. Webhook callback received
6. Payment verified and escrow updated
7. Order status updated

## Testing Recommendations

### Unit Tests
- Order status transitions
- Escrow calculations
- Financial summary calculations
- Logistics task assignments

### Integration Tests
- Complete order workflow (Book → Inspect → Pay → Complete)
- Payment gateway webhook processing
- Escrow hold and release
- Financial reconciliation

### E2E Tests
- Buyer creates order
- Seller schedules inspection
- Inspection completed
- Payment processed
- Logistics tasks executed
- Order completed

## Configuration

### Required Environment Variables

```properties
# Payment Gateways
momo.partner-code=
momo.access-key=
momo.secret-key=

zalopay.app-id=
zalopay.key1=
zalopay.key2=

stripe.api-key=
stripe.connect.client-id=

# Platform Fees
platform.fee.percentage=2.5

# Escrow Settings
escrow.release-days=7
escrow.auto-release-enabled=true
```

## Migration Steps

1. Run `database/phase3_schema.sql` to create new tables
2. Migrate existing payment transactions to link with orders
3. Create wallets for existing sellers
4. Generate initial financial summaries for historical data
5. Configure payment gateway credentials
6. Test payment flows in sandbox mode
7. Enable production payment gateways

## Next Steps

1. Implement REST controllers for all services
2. Create DTOs for request/response mapping
3. Add validation and error handling
4. Implement payment gateway services (Momo, ZaloPay, Stripe)
5. Create frontend components for:
   - Order management dashboard
   - Logistics task management
   - Financial analytics dashboard
   - Wallet management interface
6. Add automated reconciliation jobs
7. Implement notification system for order updates
8. Add comprehensive logging and monitoring

## Notes

- All monetary amounts use BigDecimal for precision
- Currency default is VND (Vietnamese Dong)
- Platform fee is configurable (default 2.5%)
- Escrow provides buyer protection
- Financial summaries can be generated on-demand or scheduled
- Transaction logs provide complete audit trail
