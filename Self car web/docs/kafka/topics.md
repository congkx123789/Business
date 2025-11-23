# Kafka Topic Conventions

- listings-events: listing change events (CQRS read model updates)
- reserve-car: command to inventory service
- charge-payment: command to payments service
- confirm-booking: command to booking service
- booking-events: saga events fan-in (CarReserved, PaymentCharged, BookingConfirmed)

## Headers
- eventId: UUID for idempotency
- version: long for external versioning
- eventType: type discriminator

## Retention
- commands: 24h, events: 7d (tune per SLA)

