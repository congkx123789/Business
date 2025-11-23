Security overview

BOLA protections
- Service-layer ownership checks via `ObjectLevelAuthorizationService` enforced in controllers (bookings, payments, orders) and extended to car images.
- Policy: any resource with a user/owner relation must verify owner == principal.id or admin.

Authentication and session
- Access tokens short-lived (15 min), cookies: HttpOnly, Secure, SameSite=Strict.
- Refresh-token rotation in secure cookies.
- MFA: mandatory for admins; adaptive for users (planned rollout).

Webhooks
- HMAC/signature verification at gateway layer; timestamp/replay window, idempotency, rate limiting.
- IP allowlisting supported via `webhook.ip-allowlist`.

Client-side defenses
- CSP applied globally; stricter policy on payment pages. Report-Only supported; Enforce in prod.
- Subresource Integrity for third-party JS on payment pages (via CDN/templates).

Edge/WAF
- WAF and CDN bot management on `/auth/*`, `/callback/*`, and search endpoints.
- Rate limits tuned and provider IP allowlists for callbacks.

Secrets & config
- Secrets via environment/secret manager; no secrets in repo.

Audit
- Append-only audit logs for listing status changes.
- Security and payment audit events via `AuditLogger`.


