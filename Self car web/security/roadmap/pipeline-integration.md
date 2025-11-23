# DevSecOps Pipeline Integration

**Goal**: Automate Zero-Trust policy management (cert rotation, policy deploys) via CI/CD

## Certificate Rotation

### Istio Certificates

**Automatic**: Istio manages its own certificates via `cert-manager` or built-in rotation.

**Verification**:
```bash
# Check cert expiration
istioctl proxy-config secret <pod> -n default

# Check cert rotation logs
kubectl logs -n istio-system <istiod-pod> | grep "certificate rotation"
```

### Application Certificates

**If applications use custom certificates** (e.g., for external APIs):

```yaml
# .github/workflows/cert-rotation.yml
name: Certificate Rotation

on:
  schedule:
    - cron: '0 0 1 * *'  # First day of month
  workflow_dispatch:

jobs:
  rotate:
    runs-on: ubuntu-latest
    steps:
      - name: Generate new certificates
        run: |
          openssl req -x509 -newkey rsa:4096 -nodes \
            -keyout app-key.pem -out app-cert.pem \
            -days 365 -subj "/CN=app.example.com"
            
      - name: Update AWS Secrets Manager
        env:
          AWS_REGION: ${{ secrets.AWS_REGION }}
          SECRET_ID: ${{ secrets.APP_CERT_SECRET_ID }}
        run: |
          aws secretsmanager update-secret \
            --secret-id $SECRET_ID \
            --secret-string "$(cat app-cert.pem app-key.pem | base64)"
            
      - name: Trigger rolling restart
        run: |
          kubectl rollout restart deployment/app -n production
          kubectl rollout status deployment/app -n production
```

## Policy Deployment

### Istio Policy Changes

**Trigger**: Changes to `infrastructure/istio/**`

```yaml
# .github/workflows/deploy-istio-policies.yml
name: Deploy Istio Policies

on:
  push:
    paths:
      - 'infrastructure/istio/**'
    branches: [ main, master ]

permissions:
  contents: read
  id-token: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Configure kubectl
        uses: azure/setup-kubectl@v3
        
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: ${{ secrets.AWS_REGION }}
          
      - name: Deploy PeerAuthentication
        run: |
          kubectl apply -f infrastructure/istio/peer-authentication-strict.yaml
          
      - name: Deploy AuthorizationPolicy
        run: |
          kubectl apply -f infrastructure/istio/authorization-policy-*.yaml
          
      - name: Verify policies
        run: |
          kubectl get peerauthentication -A
          kubectl get authorizationpolicy -A
          
      - name: Run smoke tests
        run: |
          # Test that mTLS still works
          kubectl run test-pod --image=curlimages/curl --rm -it -- \
            curl -k https://service:8080/health
```

### Gateway Policy Changes

**Trigger**: Changes to `infrastructure/gateway/**`

```yaml
# .github/workflows/deploy-gateway-policies.yml
name: Deploy Gateway Policies

on:
  push:
    paths:
      - 'infrastructure/gateway/**'
    branches: [ main, master ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy Kong plugins
        run: |
          kubectl apply -f infrastructure/gateway/kong-jwt-plugin.yaml
          
      - name: Verify gateway
        run: |
          kubectl get kongplugin
          kubectl get kongingress
```

## Automated Testing

### Zero-Trust Contract Tests

```yaml
# .github/workflows/verify-zero-trust.yml
name: Verify Zero-Trust

on:
  pull_request:
    paths:
      - 'infrastructure/istio/**'
      - 'backend/**'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Test mTLS strict
        run: |
          # Test that non-mTLS traffic is blocked
          kubectl run test-pod --image=curlimages/curl --rm -it -- \
            timeout 5 curl http://service:8080 || echo "Blocked as expected"
            
      - name: Test JWT propagation
        run: |
          # Test that JWT headers are present
          kubectl exec -it <pod> -- curl -H "X-User-Id: test" http://downstream:8080
          
      - name: Run contract tests
        run: |
          cd backend
          ./mvnw test -Dtest=ZeroTrustContractTest
```

## Monitoring Integration

### Policy Deployment Metrics

```yaml
# .github/workflows/notify-policy-deploy.yml
name: Notify Policy Deploy

on:
  workflow_run:
    workflows: ["Deploy Istio Policies"]
    types: [completed]

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: Notify Slack
        if: ${{ github.event.workflow_run.conclusion == 'success' }}
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
        run: |
          curl -X POST -H 'Content-type: application/json' \
            --data '{"text":"Istio policies deployed successfully"}' \
            $SLACK_WEBHOOK_URL
```

## Rollback Procedures

### Automatic Rollback on Failure

```yaml
# .github/workflows/deploy-istio-policies-with-rollback.yml
name: Deploy Istio Policies (with Rollback)

on:
  push:
    paths:
      - 'infrastructure/istio/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Backup current policies
        run: |
          kubectl get peerauthentication -A -o yaml > backup-policies.yaml
          
      - name: Deploy new policies
        run: |
          kubectl apply -f infrastructure/istio/peer-authentication-strict.yaml
          
      - name: Wait and verify
        run: |
          sleep 30
          kubectl get pods -A | grep -i error && exit 1 || echo "OK"
          
      - name: Rollback on failure
        if: failure()
        run: |
          kubectl apply -f backup-policies.yaml
          echo "Rolled back to previous policies"
```

## Best Practices

1. **Always backup** policies before deploying
2. **Test in staging** before production
3. **Monitor metrics** (error rate, latency) after deployment
4. **Automate rollback** if SLOs violated
5. **Document changes** in `security/roadmap/policy-changes.md`

## Policy Change Log

**File**: `security/roadmap/policy-changes.md`

**Template**:
```markdown
## YYYY-MM-DD

- **Change**: Deployed mTLS strict mode
- **Author**: Platform Team
- **Reason**: Zero-Trust Phase 2
- **Rollback**: `kubectl apply -f infrastructure/istio/peer-authentication-permissive.yaml`
- **Verification**: mTLS metrics show 100% adoption
```

