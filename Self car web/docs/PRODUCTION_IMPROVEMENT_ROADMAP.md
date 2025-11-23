# 🚀 Production Improvement Roadmap

**Last Updated:** 2024  
**Status:** Planning Phase  
**Priority:** High

---

## 📋 Executive Summary

This roadmap outlines critical improvements needed to move your SelfCar application from development to production-ready state. The focus areas are **Security**, **Configuration Management**, **Payment Integration**, and **OAuth2 Enhancement**.

---

## 🎯 Current State Analysis

### ✅ What's Working
- **OAuth2 Foundation**: Basic OAuth2 (Google/GitHub/Facebook) wired into Spring Security
- **JWT Token Provider**: Functional JWT generation with validation and expiration (~24h)
- **Payment Gateway Layer**: Callback/webhook infrastructure with HMAC-SHA256 helper for Momo
- **Security**: JWT secret length validation (warns if <32 chars)
- **Development Setup**: Local DB credentials and JWT configs working for dev

### ⚠️ Critical Gaps
1. **OAuth2 Disabled**: Currently commented out in `SecurityConfig.java`
2. **JWT Token in URL**: Security risk - tokens exposed in browser history/logs
3. **Payment Gateway**: Momo implementation incomplete (mock responses, needs production API integration)
4. **Secrets Management**: Dev credentials hardcoded in properties files
5. **Production Config**: No proper environment variable management

---

## 🗺️ Roadmap Phases

### **Phase 1: Security Hardening** (Priority: CRITICAL)
**Timeline:** 2-3 weeks  
**Goal:** Eliminate security vulnerabilities before production deployment

#### 1.1 JWT Token Security Improvement
**Current Issue:** Tokens passed in URL redirect after OAuth2 login  
**Risk:** Tokens visible in browser history, server logs, referrer headers

**Tasks:**
- [ ] Implement secure token delivery via HTTP-only cookies or postMessage
- [ ] Create `OAuth2TokenResponseHandler` that redirects to frontend with token in secure cookie
- [ ] Update frontend `OAuth2Callback.jsx` to extract token from cookie or postMessage
- [ ] Add token refresh mechanism (refresh tokens)
- [ ] Implement token rotation strategy
- [ ] Add CSRF protection for OAuth2 callback endpoints
- [ ] Remove token from URL parameters completely

**Files to Modify:**
- `backend/src/main/java/com/selfcar/config/OAuth2SuccessHandler.java` (create if missing)
- `frontend/src/pages/OAuth2Callback.jsx`
- `backend/src/main/java/com/selfcar/security/JwtTokenProvider.java` (add refresh token support)
- `backend/src/main/java/com/selfcar/config/SecurityConfig.java`

**Security Best Practices:**
- Use `SameSite=Strict` for cookies
- Set `HttpOnly` flag on cookie
- Use `Secure` flag in production (HTTPS only)
- Implement short-lived access tokens (15-30 min) + refresh tokens (7-30 days)

#### 1.2 JWT Secret Management
**Current Issue:** Dev secret in `application.properties`  
**Risk:** Weak secrets in version control

**Tasks:**
- [ ] Enforce minimum 256-bit (32 character) secret in production
- [ ] Remove all secrets from version control
- [ ] Implement secret rotation strategy
- [ ] Add startup validation that fails if secret <32 chars in production
- [ ] Use environment variables or secret management service (AWS Secrets Manager, HashiCorp Vault)
- [ ] Add `.env.example` files with dummy values

**Files to Modify:**
- `backend/src/main/java/com/selfcar/security/JwtTokenProvider.java`
- `backend/src/main/resources/application-prod.properties`
- `config/backend/application-prod.properties.template`
- Add to `.gitignore`: `application*.properties` (except templates)

#### 1.3 OAuth2 Re-enablement & Hardening
**Current Issue:** OAuth2 commented out, needs production configuration  
**Risk:** Incomplete authentication flow

**Tasks:**
- [ ] Re-enable OAuth2 in `SecurityConfig.java`
- [ ] Create `OAuth2SuccessHandler` implementation (if missing)
- [ ] Implement proper user creation/merge logic for OAuth users
- [ ] Add state parameter validation for CSRF protection
- [ ] Configure proper OAuth2 redirect URIs for production
- [ ] Add OAuth2 failure handler with proper error messages
- [ ] Implement account linking (link OAuth accounts to existing users)
- [ ] Add rate limiting for OAuth2 endpoints

**Files to Modify:**
- `backend/src/main/java/com/selfcar/config/SecurityConfig.java`
- `backend/src/main/java/com/selfcar/config/OAuth2SuccessHandler.java` (create if needed)
- `backend/src/main/java/com/selfcar/service/auth/AuthService.java`
- `backend/src/main/resources/application.properties`

---

### **Phase 2: Configuration Management** (Priority: HIGH)
**Timeline:** 1-2 weeks  
**Goal:** Proper environment-based configuration for production

#### 2.1 Environment Variable Management
**Current Issue:** Dev credentials in application.properties  
**Risk:** Accidental exposure of production secrets

**Tasks:**
- [ ] Create comprehensive environment variable documentation
- [ ] Set up `.env` files for local development (gitignored)
- [ ] Create production configuration template with placeholders
- [ ] Implement configuration validation on startup
- [ ] Add configuration health check endpoint
- [ ] Document all required environment variables
- [ ] Set up CI/CD secrets management

**Files to Create/Modify:**
- `config/backend/application-prod.properties.template` (enhance)
- `config/backend/.env.example` (new)
- `docs/CONFIGURATION.md` (new)
- `backend/src/main/java/com/selfcar/config/ConfigValidator.java` (new)
- `backend/src/main/resources/application.properties` (remove defaults)

#### 2.2 Profile-Based Configuration
**Current Issue:** Dev and prod configs mixed  
**Risk:** Production using dev settings

**Tasks:**
- [ ] Separate configuration by Spring profiles (dev, staging, prod)
- [ ] Ensure `application-prod.properties` has no defaults
- [ ] Add validation that all required prod vars are set
- [ ] Create staging profile configuration
- [ ] Implement configuration encryption for sensitive fields
- [ ] Add configuration audit logging (log what configs are loaded, not values)

**Files to Modify:**
- `backend/src/main/resources/application-dev.properties`
- `backend/src/main/resources/application-prod.properties`
- `backend/src/main/resources/application-staging.properties` (new)
- `backend/src/main/resources/application.properties` (base config only)

#### 2.3 Database Configuration Security
**Current Issue:** DB credentials in properties files  
**Risk:** Database exposure if code is leaked

**Tasks:**
- [ ] Move all DB credentials to environment variables
- [ ] Use connection string encryption in production
- [ ] Implement connection pooling best practices
- [ ] Add database connection health checks
- [ ] Set up read replicas configuration for production
- [ ] Document database migration strategy

---

### **Phase 3: Payment Gateway Production Readiness** (Priority: HIGH)
**Timeline:** 3-4 weeks  
**Goal:** Complete payment gateway integration with proper error handling

#### 3.1 Momo Gateway Production Implementation
**Current Issue:** Mock responses, API calls commented out  
**Risk:** Payments not processing in production

**Tasks:**
- [ ] Implement actual HTTP POST requests to Momo API
- [ ] Replace mock responses with real API calls
- [ ] Implement proper error handling and retry logic
- [ ] Add request/response logging (without sensitive data)
- [ ] Implement payment status polling as fallback
- [ ] Add webhook signature verification
- [ ] Create integration tests with Momo sandbox
- [ ] Document Momo API integration details

**Files to Modify:**
- `backend/src/main/java/com/selfcar/service/payment/MomoGatewayService.java`
- `backend/src/main/java/com/selfcar/service/payment/PaymentService.java`
- `backend/src/main/java/com/selfcar/controller/payment/PaymentController.java`

**Implementation Details:**
- Use `RestTemplate` or `WebClient` for HTTP calls
- Implement exponential backoff for retries
- Add circuit breaker pattern for API failures
- Store API responses for audit trail

#### 3.2 Payment Webhook Security
**Current Issue:** Basic webhook handling, needs hardening  
**Risk:** Unauthorized payment callbacks

**Tasks:**
- [ ] Strengthen HMAC signature verification
- [ ] Add IP whitelist for webhook endpoints (if possible)
- [ ] Implement idempotency checks (prevent duplicate processing)
- [ ] Add webhook replay attack protection
- [ ] Create webhook event logging and audit trail
- [ ] Implement webhook retry mechanism for failed processing
- [ ] Add rate limiting on webhook endpoints

**Files to Modify:**
- `backend/src/main/java/com/selfcar/service/payment/MomoGatewayService.java`
- `backend/src/main/java/com/selfcar/service/payment/WebhookService.java`
- `backend/src/main/java/com/selfcar/controller/payment/PaymentController.java`

#### 3.3 Payment Testing & Monitoring
**Current Issue:** No production payment testing strategy  
**Risk:** Payment failures in production

**Tasks:**
- [ ] Create comprehensive payment integration tests
- [ ] Set up payment monitoring and alerting
- [ ] Implement payment reconciliation jobs
- [ ] Add payment metrics dashboard
- [ ] Create payment failure notification system
- [ ] Document payment troubleshooting guide

**Files to Create:**
- `backend/src/test/java/com/selfcar/service/payment/PaymentIntegrationTest.java`
- `docs/PAYMENT_TROUBLESHOOTING.md`

---

### **Phase 4: OAuth2 Enhancement** (Priority: MEDIUM)
**Timeline:** 2-3 weeks  
**Goal:** Production-ready OAuth2 implementation with proper user management

#### 4.1 OAuth2 User Management
**Current Issue:** User creation/merging logic may be incomplete  
**Risk:** Duplicate accounts or failed logins

**Tasks:**
- [ ] Implement proper OAuth user account creation
- [ ] Add email verification for OAuth users
- [ ] Implement account linking (merge OAuth with existing accounts)
- [ ] Add OAuth provider account disconnection
- [ ] Handle edge cases (email changes, provider changes)
- [ ] Add user profile completion flow for OAuth users

**Files to Modify:**
- `backend/src/main/java/com/selfcar/service/auth/AuthService.java`
- `backend/src/main/java/com/selfcar/model/auth/User.java`
- `backend/src/main/java/com/selfcar/config/OAuth2SuccessHandler.java`

#### 4.2 OAuth2 Provider Configuration
**Current Issue:** OAuth2 config commented out, needs production setup  
**Risk:** OAuth2 not working in production

**Tasks:**
- [ ] Configure production OAuth2 redirect URIs for all providers
- [ ] Set up OAuth2 apps in Google Cloud Console, GitHub, Facebook
- [ ] Document OAuth2 setup process for each provider
- [ ] Add environment-specific OAuth2 configurations
- [ ] Implement OAuth2 error handling and user feedback
- [ ] Add OAuth2 consent screen customization

**Files to Modify:**
- `backend/src/main/resources/application.properties`
- `backend/src/main/resources/application-prod.properties`
- `docs/OAUTH2_SETUP.md`

---

### **Phase 5: Monitoring & Observability** (Priority: MEDIUM)
**Timeline:** 2-3 weeks  
**Goal:** Production monitoring and alerting

#### 5.1 Application Monitoring
**Tasks:**
- [ ] Set up application performance monitoring (APM)
- [ ] Add health check endpoints
- [ ] Implement structured logging (JSON format)
- [ ] Add request tracing and correlation IDs
- [ ] Set up error tracking (Sentry, Rollbar, etc.)
- [ ] Create monitoring dashboards

#### 5.2 Security Monitoring
**Tasks:**
- [ ] Add security event logging
- [ ] Implement failed login attempt tracking
- [ ] Add suspicious activity detection
- [ ] Set up security alerts
- [ ] Create security audit logs

---

### **Phase 6: Documentation & Deployment** (Priority: MEDIUM)
**Timeline:** 1-2 weeks  
**Goal:** Complete production deployment documentation

#### 6.1 Deployment Documentation
**Tasks:**
- [ ] Create production deployment guide
- [ ] Document environment variable setup
- [ ] Create runbook for common issues
- [ ] Document rollback procedures
- [ ] Create disaster recovery plan
- [ ] Add architecture diagrams

#### 6.2 Operational Documentation
**Tasks:**
- [ ] Document backup procedures
- [ ] Create incident response plan
- [ ] Document scaling procedures
- [ ] Add performance tuning guide
- [ ] Create maintenance windows procedure

---

## 📊 Implementation Priority Matrix

| Phase | Priority | Risk if Delayed | Effort | Impact |
|-------|----------|-----------------|--------|--------|
| Phase 1: Security Hardening | 🔴 CRITICAL | High | High | Critical |
| Phase 2: Configuration Mgmt | 🟠 HIGH | High | Medium | High |
| Phase 3: Payment Gateway | 🟠 HIGH | High | High | Critical |
| Phase 4: OAuth2 Enhancement | 🟡 MEDIUM | Medium | Medium | Medium |
| Phase 5: Monitoring | 🟡 MEDIUM | Medium | Medium | High |
| Phase 6: Documentation | 🟡 MEDIUM | Low | Low | Medium |

---

## 🔧 Technical Implementation Details

### JWT Token Security - Recommended Approach

**Option 1: HTTP-Only Cookies (Recommended)**
```java
// OAuth2SuccessHandler redirects to frontend with secure cookie
response.addCookie(createSecureCookie("jwt_token", token));
response.sendRedirect(frontendUrl + "/auth/callback?success=true");
```

**Option 2: PostMessage API**
```java
// OAuth2SuccessHandler returns HTML page with postMessage
String html = String.format(
    "<script>window.opener.postMessage({token: '%s'}, '%s'); window.close();</script>",
    token, frontendOrigin
);
```

**Option 3: Hybrid (Cookie + Short-lived URL token)**
- Set HTTP-only cookie for main auth
- Use short-lived (5 min) URL token for initial redirect
- Frontend extracts token, stores in memory, removes from URL

### Payment Gateway Integration Pattern

```java
@Service
public class MomoGatewayService {
    
    @Autowired
    private RestTemplate restTemplate; // or WebClient
    
    @Retryable(value = {Exception.class}, maxAttempts = 3)
    public PaymentResponse initiatePayment(PaymentRequest request) {
        // 1. Build request with HMAC signature
        // 2. Make HTTP POST to Momo API
        // 3. Parse response
        // 4. Handle errors with retry logic
        // 5. Log (sanitized) request/response
    }
}
```

### Configuration Management Pattern

```java
@Configuration
@ConfigurationProperties(prefix = "app")
public class AppConfig {
    @NotNull
    @Size(min = 32)
    private String jwtSecret; // Must be set via env var
    
    @PostConstruct
    public void validate() {
        if (jwtSecret.length() < 32) {
            throw new IllegalStateException("JWT secret must be at least 32 characters");
        }
    }
}
```

---

## ✅ Success Criteria

### Phase 1 Complete When:
- [ ] JWT tokens no longer in URL
- [ ] All secrets moved to environment variables
- [ ] OAuth2 fully functional and secure
- [ ] Security audit passed

### Phase 2 Complete When:
- [ ] All configurations externalized
- [ ] Production configs validated on startup
- [ ] No secrets in version control

### Phase 3 Complete When:
- [ ] Momo gateway fully integrated
- [ ] Payment webhooks verified and secure
- [ ] Payment tests passing
- [ ] Payment monitoring in place

### Overall Production Ready When:
- [ ] All phases complete
- [ ] Security audit passed
- [ ] Load testing completed
- [ ] Documentation complete
- [ ] Monitoring and alerting operational

---

## 📚 Additional Resources

### Security Best Practices
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)
- [OAuth2 Security Best Practices](https://oauth.net/2/)

### Payment Gateway Documentation
- [Momo Payment API](https://developers.momo.vn/)
- [Stripe Security Guide](https://stripe.com/docs/security)
- [ZaloPay API Documentation](https://developers.zalopay.vn/)

### Configuration Management
- [12-Factor App](https://12factor.net/config)
- [Spring Boot Externalized Configuration](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config)

---

## 🚨 Critical Actions Before Production

1. **DO NOT** deploy with tokens in URL
2. **DO NOT** commit secrets to version control
3. **DO NOT** use dev credentials in production
4. **DO NOT** enable payment gateway without proper testing
5. **DO** complete security audit before launch
6. **DO** set up monitoring and alerting
7. **DO** have rollback plan ready

---

## 📝 Notes

- This roadmap is a living document - update as priorities change
- Each phase should have its own detailed implementation plan
- Consider breaking phases into smaller sprints (2-week cycles)
- Regular security reviews should be scheduled
- Payment gateway integration requires careful testing in sandbox first

---

**Next Steps:** Review this roadmap, prioritize phases based on business needs, and create detailed sprint plans for Phase 1.

