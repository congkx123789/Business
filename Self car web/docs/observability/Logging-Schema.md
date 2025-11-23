# Unified Logging Schema (JSON)

Purpose: enable fast cross-service debugging by standardizing fields and ensuring correlation with traces.

## Required Fields
- level: string (TRACE, DEBUG, INFO, WARN, ERROR)
- timestamp: ISO8601 UTC
- message: string
- service: string (e.g., selfcar-backend)
- environment: string (dev|staging|prod)
- correlation_id: string (propagate X-Request-ID)
- user_id: string|null
- order_id: string|null
- vin: string|null
- http:
  - method: string|null
  - route: string|null
  - status_code: int|null
  - client_ip: string|null
- error:
  - type: string|null
  - message: string|null
  - stack: string|null

## Example (backend API)
```json
{
  "level": "INFO",
  "timestamp": "2025-11-05T10:24:31Z",
  "service": "selfcar-backend",
  "environment": "prod",
  "correlation_id": "a8f5f167-...",
  "user_id": "u_123",
  "order_id": "ord_789",
  "vin": "1HGCM82633A004352",
  "http": {"method": "POST", "route": "/api/payments", "status_code": 201, "client_ip": "203.0.113.5"},
  "message": "payment.created",
  "duration_ms": 142
}
```

## Validation
- All logs must be single-line JSON (no newlines in values)
- Use UTC timestamps
- Include correlation_id on every line (injected via MDC)

## Implementation Notes
- Logback uses JSON encoder; MDC keys are emitted automatically
- Request filter adds `correlation_id`, and optionally `user_id`, `order_id`, `vin` from headers
- For non-HTTP workers (Kafka consumers), set MDC at the start of processing and clear after

## Kafka/Inventory Pipeline
- Add `pipeline_stage`, `topic`, `partition`, `offset`, `lag` when relevant
- Emit `consumer_group` and `processing_time_ms`

## Security
- Never log PII/secrets (cards, tokens)
- Truncate large payloads and use sampling for verbose logs


