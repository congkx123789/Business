# Checkout Saga — Order → Payment → Inventory (Choreography First)

## Goals
- Ensure consistency across Order, Payment, Inventory with compensations
- Prefer event choreography; consider orchestration if flow complexity grows

## Happy Path (Choreography)
1) OrderCreated → InventoryReserveRequested
2) InventoryReserved → PaymentChargeRequested
3) PaymentSucceeded → OrderCompleted

## Failure Paths and Compensations
- PaymentFailed → Compensation: InventoryReleaseRequested, OrderCancelled
- InventoryReserveFailed → Compensation: OrderCancelled
- Downstream timeout → Retry policy (idempotent) then Compensation

## Events (canonical names)
- OrderCreated, OrderCompleted, OrderCancelled
- InventoryReserveRequested, InventoryReserved, InventoryReserveFailed, InventoryReleaseRequested, InventoryReleased
- PaymentChargeRequested, PaymentSucceeded, PaymentFailed, PaymentRefundRequested, PaymentRefunded

## Idempotency & Delivery
- Every event carries `eventId`, `correlationId`, `orderId`, optional `vin`
- Consumers deduplicate by `eventId`
- Use retry w/ backoff; dead-letter on poison messages

## Topics (suggested)
- `orders-events`, `inventory-events`, `payments-events`

## Diagram (text)
- OrderCreated -> [InventoryService] InventoryReserveRequested -> InventoryReserved -> [PaymentService] PaymentChargeRequested -> PaymentSucceeded -> OrderCompleted
- If PaymentFailed -> InventoryReleaseRequested -> OrderCancelled
- If InventoryReserveFailed -> OrderCancelled

## Observability
- Trace across services with `correlation_id`
- Emit business counters: `payments_total{status="success|failed"}`, `inventory_reservations_total{result="success|failure"}`


