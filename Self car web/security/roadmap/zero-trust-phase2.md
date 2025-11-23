# Zero-Trust Phase 2: Strict mTLS + RBAC

**Timeline**: Month 6  
**Goal**: Enforce strict mTLS cluster-wide; block non-mesh traffic; enforce RBAC on JWT claims

## Acceptance Criteria

✅ **Done when**:
- East-west traffic is encrypted and verified (mTLS strict)
- Non-mesh traffic is blocked
- Requests pass both checks: mTLS + JWT RBAC
- CI/CD automatically manages cert rotation and policy deploys

## Step 1: Flip mTLS to Strict Mode

### Policy Rollout Plan

**Week 1**: Enable strict in staging namespace  
**Week 2**: Enable strict in production namespace (with fallback SLOs)

### PeerAuthentication (Strict)

```yaml
# infrastructure/istio/peer-authentication-strict.yaml
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
  namespace: istio-system
spec:
  mtls:
    mode: STRICT  # Only mTLS allowed
  selector:
    matchLabels:
      app: "*"
```

### Gradual Rollout

```bash
# 1. Apply to staging first
kubectl apply -f infrastructure/istio/peer-authentication-strict-staging.yaml -n staging

# 2. Monitor for 24 hours
# 3. Apply to production
kubectl apply -f infrastructure/istio/peer-authentication-strict-production.yaml -n production
```

### Fallback SLOs

**SLOs to monitor**:
- Error rate increase < 0.1%
- P95 latency increase < 50ms
- Availability remains > 99.9%

If SLOs violated, rollback:
```bash
kubectl apply -f infrastructure/istio/peer-authentication-permissive.yaml
```

### Block Non-Mesh Traffic

```yaml
# infrastructure/istio/authorization-policy-block-non-mesh.yaml
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: require-mtls
  namespace: default
spec:
  action: DENY
  rules:
  - from:
    - source:
        notPrincipals: ["cluster.local/*"]  # Only allow cluster-local identities
```

## Step 2: In-Service RBAC on JWT Claims

### Shared Auth Library

**Java (Spring Boot)**:
```java
// security/idor/middleware/java-spring-rbac.java
@Component
public class JwtRbacEnforcer {
    public boolean hasRole(String requiredRole, HttpServletRequest req) {
        String role = req.getHeader("X-User-Role");
        return requiredRole.equals(role) || "admin".equals(role);
    }
    
    public boolean isOwner(UUID resourceId, String userId, String resourceType) {
        // Check ownership via OwnershipService
        return ownershipService.isOwner(resourceType, resourceId, userId);
    }
}
```

**Python (FastAPI)**:
```python
# security/idor/middleware/python-fastapi-rbac.py
from fastapi import Depends, HTTPException, Header

async def require_role(required_role: str, x_user_role: str = Header(...)):
    if x_user_role != required_role and x_user_role != "admin":
        raise HTTPException(status_code=403, detail="insufficient role")
    return x_user_role
```

### Usage in Controllers

```java
@RestController
@RequestMapping("/api/orders")
public class OrderController {
    @Autowired private JwtRbacEnforcer rbac;
    
    @GetMapping("/{orderId}")
    @OwnerOnly(resource = "order", idParam = "orderId")
    public OrderDto getOrder(@PathVariable UUID orderId, HttpServletRequest req) {
        // Already enforced: mTLS (Istio) + ownership (aspect)
        // Optional: enforce role
        if (!rbac.hasRole("user", req)) {
            throw new AccessDeniedException("insufficient role");
        }
        return orderService.get(orderId);
    }
}
```

### Contract Tests

```java
// backend/src/test/java/com/selfcar/security/ZeroTrustContractTest.java
@Test
void testRequestPassesBothChecks() {
    // 1. mTLS check: sidecar verifies client cert
    // 2. JWT RBAC check: service validates role
    // 3. Ownership check: service validates user owns resource
    
    var response = client.get("/api/orders/{orderId}")
        .header("X-User-Id", userId)
        .header("X-User-Role", "user")
        .exchange()
        .expectStatus().isOk();
}
```

## Step 3: CI/CD Pipeline Integration

### Certificate Rotation

**Istio certs rotate automatically** via `cert-manager` or Istio's built-in rotation.

**Application certs** (if needed):

```yaml
# .github/workflows/cert-rotation.yml
name: Certificate Rotation

on:
  schedule:
    - cron: '0 0 1 * *'  # Monthly

jobs:
  rotate-certs:
    runs-on: ubuntu-latest
    steps:
      - name: Rotate application certs
        run: |
          # Update secrets in AWS Secrets Manager
          aws secretsmanager update-secret --secret-id app-certs --secret-string "$(generate-certs)"
          
      - name: Trigger rolling restart
        run: |
          kubectl rollout restart deployment/app -n production
```

### Policy Deployment

```yaml
# .github/workflows/deploy-istio-policies.yml
name: Deploy Istio Policies

on:
  push:
    paths:
      - 'infrastructure/istio/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy PeerAuthentication
        run: |
          kubectl apply -f infrastructure/istio/peer-authentication-strict.yaml
          
      - name: Verify policy
        run: |
          kubectl get peerauthentication -A
```

### Automated Testing

```yaml
# .github/workflows/verify-zero-trust.yml
name: Verify Zero-Trust

on:
  pull_request:
    paths:
      - 'infrastructure/istio/**'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Test mTLS strict
        run: |
          # Test that non-mTLS traffic is blocked
          kubectl run test-pod --image=curlimages/curl --rm -it -- curl http://service:8080
          # Expected: connection refused or timeout
          
      - name: Test JWT propagation
        run: |
          # Test that JWT headers are present
          kubectl exec -it <pod> -- curl -H "X-User-Id: test" http://downstream:8080
```

## Verification Checklist

- [ ] mTLS strict mode enabled in all namespaces
- [ ] Non-mesh traffic blocked (tested)
- [ ] All services use shared RBAC library
- [ ] Contract tests pass (mTLS + JWT)
- [ ] Cert rotation automated (monthly)
- [ ] Policy changes deployed via CI/CD
- [ ] SLOs met (no degradation)

## Troubleshooting

### mTLS connection failures
- Check destination rule: `kubectl get destinationrule -A`
- Verify certificates: `istioctl proxy-config secret <pod>`
- Check peer authentication: `kubectl get peerauthentication -A`

### RBAC enforcement failures
- Verify JWT headers: `kubectl logs <pod> | grep X-User-Role`
- Check shared library version consistency
- Review contract test failures

## Next Steps

After Phase 2 completion:
- Document final architecture
- Prepare compliance evidence (PCI-DSS)
- Set up ongoing monitoring

