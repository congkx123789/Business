# Network Security Configuration

**Owner:** DevOps  
**Goal:** Implement network segmentation and least-privilege access

## Network Architecture

### Production Network Topology

```
Internet
  │
  ├─── CDN/WAF (Cloudflare/AWS CloudFront)
  │     │
  │     └─── Rate Limiting & Bot Mitigation
  │
  ├─── Public Load Balancer
  │     │
  │     └─── Application Servers (Public Subnet)
  │           │
  │           └─── Private Database Network (Private Subnet)
  │                 │
  │                 └─── Database Server (No Internet Access)
```

### Network Segmentation

#### Public Subnet
- **Components:** Load Balancer, Application Servers
- **Access:** Internet-facing
- **Egress:** Restricted to known services only
- **Security Groups:** Allow HTTP/HTTPS from internet, allow outbound to database

#### Private Subnet
- **Components:** Database Server, Redis Cache
- **Access:** No internet access
- **Ingress:** Only from application servers
- **Security Groups:** Allow MySQL (3306) from application servers only

## Security Groups Configuration

### Application Server Security Group

**Inbound Rules:**
- HTTP (80) from Load Balancer
- HTTPS (443) from Load Balancer
- SSH (22) from Management IP only (for emergency access)

**Outbound Rules:**
- HTTPS (443) to known APIs (payment gateways, OAuth providers)
- MySQL (3306) to Database Security Group
- Redis (6379) to Cache Security Group

### Database Security Group

**Inbound Rules:**
- MySQL (3306) from Application Server Security Group only
- SSH (22) from Management IP only (for emergency access)

**Outbound Rules:**
- None (no internet access)

### Cache Security Group

**Inbound Rules:**
- Redis (6379) from Application Server Security Group only

**Outbound Rules:**
- None

## Database Network Isolation

### Requirements
1. Database must be in a private subnet with no internet gateway
2. Database should only be accessible from application servers
3. No direct internet access to database
4. Use security groups to restrict access

### Implementation

#### AWS VPC Configuration
```yaml
VPC:
  CIDR: 10.0.0.0/16
  Subnets:
    Public:
      - 10.0.1.0/24 (Application Servers)
    Private:
      - 10.0.2.0/24 (Database)
      - 10.0.3.0/24 (Cache)
```

#### Docker Compose (Production)
See `docker-compose.prod.yml` for network segmentation example.

## Egress Policies

### Allowed Outbound Connections

**Application Servers:**
- Payment Gateway APIs (HTTPS)
  - MoMo API: `https://test-payment.momo.vn`
  - ZaloPay API: `https://sandbox.zalopay.vn`
  - Stripe API: `https://api.stripe.com`
- OAuth Providers (HTTPS)
  - Google: `https://accounts.google.com`
  - GitHub: `https://github.com`
  - Facebook: `https://graph.facebook.com`
- CDN/Static Assets (HTTPS)
  - AWS S3: `https://s3.amazonaws.com`
  - CloudFront: `https://*.cloudfront.net`

**Database Server:**
- No outbound connections allowed

**Cache Server:**
- No outbound connections allowed

### Blocked Outbound Connections
- Direct internet access from database
- Unrestricted outbound access from application servers
- Unknown/untrusted domains

## Network Monitoring

### Key Metrics
1. **Unauthorized Access Attempts:**
   - Failed database connection attempts
   - Security group rule violations
   - Unusual network traffic patterns

2. **Network Performance:**
   - Latency between tiers
   - Bandwidth utilization
   - Connection errors

### Alerting
- **Critical:** Unauthorized database access attempts
- **High:** Security group changes
- **Medium:** Unusual outbound connections
- **Low:** Network performance degradation

## Implementation Checklist

### Phase 1: Network Segmentation
- [ ] Create VPC with public and private subnets
- [ ] Configure security groups
- [ ] Move database to private subnet
- [ ] Remove internet gateway from database subnet
- [ ] Test network isolation

### Phase 2: Security Groups
- [ ] Configure application server security group
- [ ] Configure database security group
- [ ] Configure cache security group
- [ ] Test access restrictions
- [ ] Document security group rules

### Phase 3: Egress Policies
- [ ] Configure outbound rules for application servers
- [ ] Block all outbound from database
- [ ] Test allowed outbound connections
- [ ] Monitor and log blocked connections
- [ ] Document egress policy

### Phase 4: Monitoring
- [ ] Set up network monitoring
- [ ] Configure alerts
- [ ] Test alerting
- [ ] Document monitoring setup

## Security Best Practices

1. **Principle of Least Privilege:**
   - Grant minimum necessary network access
   - Use security groups to enforce access

2. **Defense in Depth:**
   - Multiple layers of network security
   - Network segmentation + security groups + firewall rules

3. **Network Monitoring:**
   - Monitor all network traffic
   - Alert on suspicious activity
   - Log all access attempts

4. **Regular Audits:**
   - Review security group rules quarterly
   - Audit network access logs
   - Verify least-privilege access

5. **Incident Response:**
   - Document network incident procedures
   - Have network isolation procedures ready
   - Test incident response procedures

## References

- AWS VPC Security Best Practices
- NIST Network Security Guidelines
- OWASP Network Security
- CIS Network Security Benchmarks

