# JWT Propagation Standards

**Goal**: Standardize JWT propagation from API gateway to internal services with required claims

## Required Claims

**Standard Claims** (RFC 7519):
- `iat` (issued at): Unix timestamp
- `exp` (expiration): Unix timestamp
- `iss` (issuer): Service that issued the token

**Application Claims** (required):
- `user_id` (string): Unique user identifier (UUID)
- `role` (string): User role (enum: `user`, `admin`, `support`)

**Optional Claims**:
- `email` (string): User email address
- `permissions` (array): Fine-grained permissions (if needed)

## Gateway Contract

### Input

**Header**: `Authorization: Bearer <jwt>`

### Validation

1. Verify signature (using issuer's public key)
2. Verify expiration (`exp` claim)
3. Verify issuer (`iss` claim matches trusted issuer)
4. Extract required claims (`user_id`, `role`)

### Output

**Headers forwarded to downstream services**:
- `X-User-Id: <user_id>`
- `X-User-Role: <role>`
- `X-Request-Id: <correlation-id>` (for tracing)

### Example: Kong Gateway

```yaml
# infrastructure/gateway/kong-jwt-plugin.yaml
apiVersion: configuration.konghq.com/v1
kind: KongPlugin
metadata:
  name: jwt-propagate
spec:
  plugin: jwt-propagate
  config:
    header_name: Authorization
    claims_to_forward:
      - user_id -> X-User-Id
      - role -> X-User-Role
    passthrough: true
    secret_key: ${JWT_SECRET_KEY}
```

### Example: Envoy Gateway

```yaml
# infrastructure/gateway/envoy-jwt-filter.yaml
apiVersion: networking.istio.io/v1alpha3
kind: EnvoyFilter
metadata:
  name: jwt-propagate
spec:
  configPatches:
  - applyTo: HTTP_FILTER
    match:
      context: SIDECAR_INBOUND
    patch:
      operation: INSERT_BEFORE
      value:
        name: envoy.filters.http.jwt_authn
        typed_config:
          "@type": type.googleapis.com/envoy.extensions.filters.http.jwt_authn.v3.JwtAuthentication
          providers:
            default:
              issuer: ${JWT_ISSUER}
              audiences:
              - ${JWT_AUDIENCE}
              remote_jwks:
                http_uri:
                  uri: ${JWKS_URL}
                  cluster: jwks
          forward: true
          forward_payload_header: X-User-Context
```

## Service Contract

### Reading Claims

**Do NOT**:
- Parse JWT directly in services
- Validate JWT signature in services
- Read from `Authorization` header

**Do**:
- Read from forwarded headers (`X-User-Id`, `X-User-Role`)
- Trust the gateway (it validated the JWT)

### Example: Spring Boot

```java
@RestController
@RequestMapping("/api/orders")
public class OrderController {
    @GetMapping("/{orderId}")
    public OrderDto getOrder(
        @PathVariable UUID orderId,
        @RequestHeader("X-User-Id") String userId,
        @RequestHeader("X-User-Role") String role
    ) {
        // Use userId and role for authorization
        return orderService.get(orderId, userId, role);
    }
}
```

### Example: FastAPI

```python
from fastapi import Header

@app.get("/api/orders/{order_id}")
async def get_order(
    order_id: UUID,
    x_user_id: str = Header(..., alias="X-User-Id"),
    x_user_role: str = Header(..., alias="X-User-Role")
):
    # Use x_user_id and x_user_role for authorization
    return order_service.get(order_id, x_user_id, x_user_role)
```

## Testing

### Contract Test

```java
@Test
void testJwtPropagation() {
    // Given: JWT with user_id and role
    String jwt = generateJwt("user-123", "user");
    
    // When: Request is made through gateway
    var response = client.get("/api/orders/{orderId}")
        .header("Authorization", "Bearer " + jwt)
        .exchange();
    
    // Then: Service receives headers
    verify(service).getOrder(any(), eq("user-123"), eq("user"));
}
```

### Integration Test

```bash
# Test gateway forwards headers
curl -H "Authorization: Bearer <jwt>" https://api.example.com/api/orders/123

# Verify downstream service logs show headers
kubectl logs -n default <service-pod> | grep "X-User-Id"
```

## Security Considerations

1. **Header Trust**: Services trust headers from gateway (gateway validates JWT)
2. **Sidecar Injection**: Istio sidecar automatically propagates headers
3. **Audit Logging**: Log all requests with `X-User-Id` for audit trail
4. **Rate Limiting**: Apply per `X-User-Id` to prevent abuse

## Migration Guide

**From Direct JWT Parsing**:
1. Remove JWT parsing libraries from services
2. Update controllers to read from headers
3. Update tests to set headers instead of JWT
4. Deploy gateway changes first
5. Deploy service changes

**Rollback Plan**:
- Gateway can fall back to forwarding full JWT if needed
- Services can read from `Authorization` header as fallback

