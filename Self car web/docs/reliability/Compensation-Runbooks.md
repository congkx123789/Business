# Compensation Runbooks — Checkout Saga

## Payment Failed after Inventory Reserved
- Trigger: PaymentFailed(event)
- Actions:
  1) Emit InventoryReleaseRequested(orderId, vin)
  2) Mark OrderCancelled(orderId, reason=payment_failed)
  3) If charge captured later (late webhook), emit PaymentRefundRequested

## Inventory Reserve Failed
- Trigger: InventoryReserveFailed(event)
- Actions:
  1) Mark OrderCancelled(orderId, reason=inventory_unavailable)

## Partial Failures / Timeouts
- Retry with exponential backoff (idempotent endpoints)
- On max retries exceeded → run compensation path above

## Manual Recovery Playbook
- If stuck state detected:
  - Check latest events in topic for `orderId`
  - Verify payment status at provider
  - If captured but order not completed → emit OrderCompleted & ensure inventory locked
  - If not captured but inventory locked → emit InventoryReleaseRequested


