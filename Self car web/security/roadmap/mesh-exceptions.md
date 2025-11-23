# Service Mesh Exceptions

**Purpose**: Document services that cannot be sidecar-injected or use mTLS

## Template

| Service Name | Namespace | Reason | Alternative | Owner | Expiry Date |
|-------------|-----------|--------|-------------|-------|-------------|
| Example | default | Legacy VM service | API Gateway proxy | Platform Team | 2024-12-31 |

## Exceptions

*No exceptions currently. Add entries as needed.*

## Review Process

**Monthly**: Review exceptions list; plan migration or alternatives  
**Quarterly**: Update expiry dates; remove resolved exceptions

## Migration Plan

For each exception:
1. Identify migration path (containerize, API Gateway proxy, etc.)
2. Set target date
3. Assign owner
4. Track progress

