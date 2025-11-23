# Zero-Trust Phase 1: Permissive Service Mesh

**Timeline**: Months 4-5  
**Goal**: Install Istio in permissive mode; observe traffic; issue certs; standardize JWT propagation

## Acceptance Criteria

✅ **Done when**:
- 100% services have sidecar-injected
- mTLS metrics visible in dashboard
- Exception list documented for non-mesh services
- API gateway propagates JWT with required claims (user_id, role)
- Internal service calls include JWT consistently

## Step 1: Install Istio Service Mesh

### Prerequisites
- Kubernetes cluster (v1.24+)
- kubectl access
- Helm 3.x

### Installation

```bash
# Install Istio operator
istioctl operator init

# Create IstioControlPlane with permissive mode
kubectl apply -f infrastructure/istio/istio-operator-permissive.yaml
```

See: `infrastructure/istio/istio-operator-permissive.yaml` (template)

### Verify Installation

```bash
# Check Istio control plane pods
kubectl get pods -n istio-system

# Verify Istio version
istioctl version
```

## Step 2: Sidecar Injection

### Automatic Injection (Recommended)

Label namespaces for automatic sidecar injection:

```bash
kubectl label namespace default istio-injection=enabled
kubectl label namespace production istio-injection=enabled
kubectl label namespace staging istio-injection=enabled
```

### Manual Injection (if needed)

```bash
istioctl kube-inject -f deployment.yaml | kubectl apply -f -
```

### Verification

```bash
# Check sidecar pods
kubectl get pods -n default -o jsonpath='{.items[*].spec.containers[*].name}' | grep -c istio-proxy

# Expected: count matches number of pods
```

### Exception List

Document services that cannot be sidecar-injected:

| Service | Reason | Alternative | Owner |
|---------|--------|-------------|-------|
| Legacy VM service | No container | API Gateway proxy | Platform Team |
| External third-party | Out of control | mTLS terminated at gateway | Security Team |

File: `security/roadmap/mesh-exceptions.md`

## Step 3: mTLS Permissive Mode

### PeerAuthentication Policy

```yaml
# infrastructure/istio/peer-authentication-permissive.yaml
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
  namespace: istio-system
spec:
  mtls:
    mode: PERMISSIVE  # Allows both mTLS and plaintext
```

### Verify mTLS Metrics

```bash
# Port-forward to Prometheus (if installed)
kubectl port-forward -n istio-system svc/prometheus 9090:9090

# Query mTLS percentage
istio_requests_total{destination_service_namespace="default",response_code="200"} / 
istio_requests_total{destination_service_namespace="default"} * 100
```

### Metrics Dashboard

Create Grafana dashboard with:
- mTLS adoption rate (%)
- Service-to-service traffic volume
- Certificate expiration timeline

Template: `infrastructure/observability/grafana/mtls-dashboard.json`

## Step 4: JWT Propagation Standard

### API Gateway Configuration

**Required Claims**:
- `user_id` (string, required)
- `role` (string, enum: user|admin|support)
- `iat` (issued at, number)
- `exp` (expiration, number)

### Gateway Filter (Example: Kong/Envoy)

```yaml
# infrastructure/gateway/jwt-propagate.yaml
apiVersion: configuration.konghq.com/v1
kind: KongPlugin
metadata:
  name: jwt-propagate
spec:
  plugin: jwt-propagate
  config:
    header_name: X-User-Context
    claims:
      - user_id
      - role
    passthrough: true
```

### Service Contract

See: `security/jwt-standards.md`

**Contract**:
1. Gateway extracts JWT from `Authorization: Bearer <token>`
2. Gateway validates signature and expiration
3. Gateway forwards required claims as headers:
   - `X-User-Id: <user_id>`
   - `X-User-Role: <role>`
4. Services read from headers (not from JWT directly)

## Step 5: Internal Service JWT Propagation

### Sidecar Configuration

Istio sidecar automatically propagates headers. Ensure services read from headers:

```java
// Example: Spring Boot
@RequestHeader("X-User-Id") String userId,
@RequestHeader("X-User-Role") String role
```

### Verification

```bash
# Test service-to-service call
curl -H "Authorization: Bearer <jwt>" https://api.example.com/api/orders

# Verify downstream service receives headers
kubectl logs -n default <service-pod> -c istio-proxy | grep "X-User-Id"
```

## Troubleshooting

### Sidecar not injecting
- Check namespace label: `kubectl get namespace default -o yaml | grep istio-injection`
- Check pod annotation: `kubectl get pod <pod> -o yaml | grep sidecar.istio.io`

### mTLS not working
- Verify PeerAuthentication: `kubectl get peerauthentication -A`
- Check destination rule: `kubectl get destinationrule -A`

### JWT not propagated
- Verify gateway plugin: `kubectl get kongplugin`
- Check service logs for headers

## Next Steps

After Phase 1 completion:
- Review mTLS metrics for 2 weeks
- Identify any services that cannot use mTLS
- Proceed to Phase 2 (strict mTLS)

