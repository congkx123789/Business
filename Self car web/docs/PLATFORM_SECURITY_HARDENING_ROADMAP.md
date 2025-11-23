# Platform/Infrastructure Security Hardening Roadmap (Week 6-10)

**Goal:** Reduce blast radius and make attacks noisy.

## Overview

This roadmap implements four critical security hardening areas to improve the platform's security posture and reduce attack surface.

---

## 1. Secrets Management & Configuration Partitioning

**Owner:** DevOps  
**Status:** ✅ Implemented

### Implementation

#### SecretsManagementService
- **Location:** `backend/src/main/java/com/selfcar/security/SecretsManagementService.java`
- **Purpose:** Centralized secrets management with validation at startup
- **Features:**
  - Validates all required secrets in production at application startup
  - Fails fast if secrets are missing
  - Provides centralized access to secrets via environment variables
  - Supports secrets manager integration

#### Configuration Changes
- **Production Properties:** `application-prod.properties` contains NO credentials
- All secrets MUST be provided via environment variables or secrets manager
- Validation enforced at startup - application won't start if secrets are missing

#### Required Secrets (validated at startup)
- `DB_PASSWORD` - Database password
- `JWT_SECRET` - JWT signing secret (minimum 32 characters)
- `GOOGLE_CLIENT_SECRET` - OAuth2 Google client secret
- `GITHUB_CLIENT_SECRET` - OAuth2 GitHub client secret
- `FACEBOOK_CLIENT_SECRET` - OAuth2 Facebook client secret
- `MOMO_SECRET_KEY` - Momo payment gateway secret key
- `MOMO_ACCESS_KEY` - Momo payment gateway access key
- `ZALOPAY_KEY1` - ZaloPay payment gateway key 1
- `ZALOPAY_KEY2` - ZaloPay payment gateway key 2
- `STRIPE_SECRET_KEY` - Stripe payment gateway secret key

#### Deployment Checklist
- [ ] Configure secrets manager (AWS Secrets Manager, HashiCorp Vault, or similar)
- [ ] Set all required environment variables in production
- [ ] Verify `application-prod.properties` contains no credentials
- [ ] Test application startup with missing secrets (should fail)
- [ ] Document secrets rotation procedure

---

## 2. Network Posture

**Owner:** DevOps  
**Status:** 🔄 In Progress

### Implementation Plan

#### Database Network Isolation
- **Private DB Network:** Database should be in a private subnet/VPC
- **Security Groups:** Restrict database access to application servers only
- **No Public Access:** Database should not be accessible from the internet

#### Least-Privileged Database Users
- **Service-Specific Users:** Each service should have its own database user
- **Minimal Permissions:** Grant only necessary permissions per service
- **Read-Only Users:** Use read-only users for reporting/analytics services

#### Egress Policies
- **Application Outbound:** Restrict outbound connections to known services only
- **No Direct Internet:** Applications should not make direct internet connections
- **Proxy/VPN:** Use proxy or VPN for external API calls

#### Implementation Files

**Database Security Configuration:**
- `backend/src/main/java/com/selfcar/config/DatabaseSecurityConfig.java` - Database user management
- `database/security/least_privilege_users.sql` - SQL scripts for creating service users

**Network Configuration:**
- `docker-compose.prod.yml` - Production Docker Compose with network segmentation
- `infrastructure/network-security.md` - Network security documentation

#### Database User Setup Example

```sql
-- Create service-specific users
CREATE USER 'app_user'@'%' IDENTIFIED BY 'secure_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON selfcar_db.* TO 'app_user'@'%';

CREATE USER 'readonly_user'@'%' IDENTIFIED BY 'secure_password';
GRANT SELECT ON selfcar_db.* TO 'readonly_user'@'%';

CREATE USER 'analytics_user'@'%' IDENTIFIED BY 'secure_password';
GRANT SELECT ON selfcar_db.analytics.* TO 'analytics_user'@'%';
```

#### Deployment Checklist
- [ ] Configure private database network
- [ ] Set up security groups/firewall rules
- [ ] Create least-privileged database users
- [ ] Update application to use service-specific database users
- [ ] Configure egress policies
- [ ] Test network isolation
- [ ] Document network architecture

---

## 3. DDoS & Bot Management

**Owner:** SecOps  
**Status:** ✅ Implemented

### Implementation

#### RateLimitingService
- **Location:** `backend/src/main/java/com/selfcar/security/RateLimitingService.java`
- **Purpose:** Application-level rate limiting to prevent DDoS and abuse
- **Features:**
  - IP-based and user-based rate limiting
  - Endpoint-specific limits (login, OTP, search, API)
  - Global rate limiting
  - Sliding window algorithm

#### BotDetectionService
- **Location:** `backend/src/main/java/com/selfcar/security/BotDetectionService.java`
- **Purpose:** Detect and mitigate bot traffic
- **Features:**
  - User-Agent analysis
  - Request pattern analysis
  - Suspicious activity detection
  - Challenge-response for suspicious traffic

#### Interceptors
- **RateLimitInterceptor:** `backend/src/main/java/com/selfcar/security/RateLimitInterceptor.java`
- **BotDetectionInterceptor:** `backend/src/main/java/com/selfcar/security/BotDetectionInterceptor.java`
- **WebSecurityConfig:** Registers interceptors for all API endpoints

#### Rate Limiting Configuration

| Endpoint Type | Max Requests | Window |
|--------------|--------------|--------|
| Login | 5 | 60 seconds |
| OTP | 3 | 300 seconds (5 minutes) |
| Search | 30 | 60 seconds |
| General API | 100 | 60 seconds |
| Global (per IP) | 1000 | 60 seconds |

#### CDN Integration
- **Edge Rate Limiting:** Configure CDN (Cloudflare, AWS CloudFront, etc.) for edge rate limiting
- **Bot Mitigation:** Enable CDN bot management features
- **WAF Rules:** Configure WAF rules at CDN level

#### Deployment Checklist
- [ ] Configure CDN rate limiting
- [ ] Enable CDN bot mitigation
- [ ] Configure application rate limits via environment variables
- [ ] Test rate limiting under load
- [ ] Set up monitoring and alerts for rate limit violations
- [ ] Document rate limit policies
- [ ] Configure CAPTCHA/challenge for suspicious traffic

---

## 4. Patch Management with Virtual Patching

**Owner:** SecOps + Platform  
**Status:** ✅ Implemented  
**SLO:** High-severity CVEs mitigated in <24h (WAF), fully patched in ≤14d

### Implementation

#### VirtualPatchingService
- **Location:** `backend/src/main/java/com/selfcar/security/VirtualPatchingService.java`
- **Purpose:** Two-stage patching model with SLO tracking
- **Features:**
  - CVE registration and tracking
  - Virtual patch (WAF rule) application
  - Real patch tracking
  - SLO compliance monitoring

#### Two-Stage Patching Model

**Stage 1: Virtual Patch (WAF)**
- Applied immediately via WAF rules
- Mitigates vulnerability without code changes
- SLO: <24 hours for high-severity CVEs

**Stage 2: Real Patch**
- Applied after staging verification
- Code-level fix
- SLO: ≤14 days for high-severity CVEs

#### SLO Requirements

| Severity | Virtual Patch | Real Patch |
|----------|---------------|------------|
| High | <24 hours | ≤14 days |
| Medium | <48 hours | ≤30 days |
| Low | <7 days | ≤90 days |

#### Usage Example

```java
// Register a new CVE
virtualPatchingService.registerCve(
    "CVE-2024-1234",
    "HIGH",
    "SQL Injection vulnerability in UserController",
    Arrays.asList("UserController", "UserService")
);

// Apply virtual patch
virtualPatchingService.applyVirtualPatch("CVE-2024-1234", "BLOCK_SQL_INJECTION");

// Mark real patch applied
virtualPatchingService.markRealPatchApplied("CVE-2024-1234", "v1.2.3");
```

#### WAF Integration
- **AWS WAF:** Configure rules via AWS WAF API
- **Cloudflare WAF:** Configure rules via Cloudflare API
- **Custom WAF:** Integrate with your WAF provider's API

#### Deployment Checklist
- [ ] Set up WAF integration
- [ ] Configure WAF API credentials
- [ ] Set up CVE monitoring and alerting
- [ ] Document patch management process
- [ ] Create staging environment for patch verification
- [ ] Set up SLO tracking and alerting
- [ ] Document incident response procedures

---

## Implementation Timeline

### Week 6: Secrets Management & Configuration Partitioning
- ✅ SecretsManagementService implementation
- ✅ Production properties cleanup
- ✅ Secrets validation at startup
- [ ] Secrets manager integration
- [ ] Secrets rotation procedure

### Week 7: Network Posture
- [ ] Database network isolation
- [ ] Security groups configuration
- [ ] Least-privileged database users
- [ ] Egress policies
- [ ] Network documentation

### Week 8: DDoS & Bot Management
- ✅ RateLimitingService implementation
- ✅ BotDetectionService implementation
- ✅ Interceptors configuration
- [ ] CDN rate limiting configuration
- [ ] Bot mitigation at CDN
- [ ] Monitoring and alerting

### Week 9-10: Patch Management
- ✅ VirtualPatchingService implementation
- ✅ SLO tracking
- [ ] WAF integration
- [ ] CVE monitoring setup
- [ ] Patch management process documentation
- [ ] Staging environment for patch verification

---

## Monitoring & Alerting

### Key Metrics to Monitor
1. **Secrets Management:**
   - Missing secrets at startup
   - Secrets rotation failures

2. **Network Posture:**
   - Unauthorized database access attempts
   - Egress policy violations
   - Network security group changes

3. **DDoS & Bot Management:**
   - Rate limit violations
   - Bot detection events
   - CDN rate limit hits

4. **Patch Management:**
   - CVE registrations
   - Virtual patch application time
   - Real patch application time
   - SLO violations

### Alerting Thresholds
- **Critical:** Missing production secrets, SLO violations (>2x target time)
- **High:** Rate limit violations >100/minute, bot detection >50/hour
- **Medium:** CVE registration, virtual patch application
- **Low:** Network configuration changes, rate limit approaching limits

---

## Security Event Logging

All security events are logged via `SecurityEventLogger`:
- Unauthorized access attempts
- Rate limit exceeded
- Bot detection events
- CVE registrations
- Virtual patch applications
- Real patch applications
- SLO violations

---

## Testing

### Unit Tests
- [ ] SecretsManagementService tests
- [ ] RateLimitingService tests
- [ ] BotDetectionService tests
- [ ] VirtualPatchingService tests

### Integration Tests
- [ ] Secrets validation at startup
- [ ] Rate limiting enforcement
- [ ] Bot detection effectiveness
- [ ] Network isolation verification

### Load Tests
- [ ] Rate limiting under load
- [ ] Bot detection accuracy
- [ ] Performance impact of security features

---

## Documentation

- ✅ This roadmap document
- [ ] Network security architecture diagram
- [ ] Secrets rotation procedure
- [ ] Patch management runbook
- [ ] Incident response procedures

---

## Notes

- All services use in-memory storage for development
- For production, consider Redis for distributed rate limiting and bot detection
- WAF integration requires API credentials to be configured
- Database security requires infrastructure-level changes (VPC, security groups)
- CDN integration requires CDN provider configuration

---

## References

- OWASP Top 10
- NIST Cybersecurity Framework
- AWS Security Best Practices
- Cloudflare Security Documentation

