# 🚀 Quick Start: Production Improvements

This guide provides immediate actionable steps to address the most critical production issues.

---

## 🎯 Immediate Actions (Do These First)

### 1. Secure JWT Token Delivery (Day 1)

**Problem:** Tokens are currently passed in URL after OAuth2 login - security risk.

**Quick Fix Options:**

#### Option A: HTTP-Only Cookie (Recommended)
```java
// In OAuth2SuccessHandler.java
@Value("${app.frontend.url:http://localhost:5173}")
private String frontendUrl;

@Override
public void onAuthenticationSuccess(HttpServletRequest request, 
                                   HttpServletResponse response,
                                   Authentication authentication) {
    String token = jwtTokenProvider.generateToken(authentication);
    
    // Create secure cookie
    Cookie cookie = new Cookie("jwt_token", token);
    cookie.setHttpOnly(true);
    cookie.setSecure(true); // HTTPS only in production
    cookie.setPath("/");
    cookie.setMaxAge(86400); // 24 hours
    cookie.setAttribute("SameSite", "Strict");
    
    response.addCookie(cookie);
    response.sendRedirect(frontendUrl + "/auth/callback?success=true");
}
```

#### Option B: PostMessage API
```java
@Override
public void onAuthenticationSuccess(...) {
    String token = jwtTokenProvider.generateToken(authentication);
    
    String html = String.format(
        "<!DOCTYPE html><html><body>" +
        "<script>" +
        "window.opener.postMessage({type: 'OAUTH_SUCCESS', token: '%s'}, '%s');" +
        "window.close();" +
        "</script>" +
        "</body></html>",
        token, frontendUrl
    );
    
    response.setContentType("text/html");
    response.getWriter().write(html);
}
```

**Frontend Update:**
```javascript
// In OAuth2Callback.jsx
useEffect(() => {
  // Option A: Read from cookie
  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('jwt_token='))
    ?.split('=')[1];
  
  // Option B: Listen for postMessage
  window.addEventListener('message', (event) => {
    if (event.origin !== 'http://localhost:8080') return;
    if (event.data.type === 'OAUTH_SUCCESS') {
      const token = event.data.token;
      // Store token and redirect
    }
  });
}, []);
```

---

### 2. Externalize Secrets (Day 1-2)

**Problem:** Secrets hardcoded in `application.properties`.

**Steps:**

1. **Create `.env` file** (gitignored):
```bash
# .env (DO NOT COMMIT)
JWT_SECRET=your-super-secret-key-at-least-32-characters-long-for-production
JWT_EXPIRATION=86400000
DB_URL=jdbc:mysql://localhost:3306/selfcar_db
DB_USERNAME=root
DB_PASSWORD=your_password
MOMO_PARTNER_CODE=your_code
MOMO_SECRET_KEY=your_secret
```

2. **Update `application.properties`** to use env vars:
```properties
jwt.secret=${JWT_SECRET}
jwt.expiration=${JWT_EXPIRATION:86400000}
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
```

3. **Update `.gitignore`**:
```
.env
*.env
application*.properties
!application*.properties.template
```

4. **Create `.env.example`** (commit this):
```bash
# .env.example
JWT_SECRET=change_this_to_at_least_32_characters
JWT_EXPIRATION=86400000
DB_URL=jdbc:mysql://localhost:3306/selfcar_db
DB_USERNAME=root
DB_PASSWORD=your_password
```

5. **Add startup validation**:
```java
@PostConstruct
public void validateConfig() {
    if (jwtSecret.length() < 32) {
        throw new IllegalStateException(
            "JWT secret must be at least 32 characters. " +
            "Set JWT_SECRET environment variable."
        );
    }
}
```

---

### 3. Re-enable OAuth2 (Day 2-3)

**Problem:** OAuth2 is commented out in SecurityConfig.

**Steps:**

1. **Create OAuth2SuccessHandler** (if missing):
```java
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {
    
    private final JwtTokenProvider jwtTokenProvider;
    
    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;
    
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                       HttpServletResponse response,
                                       Authentication authentication) {
        // Generate JWT token
        String token = jwtTokenProvider.generateToken(authentication);
        
        // Use secure cookie or postMessage (see section 1)
        // ...
    }
}
```

2. **Update SecurityConfig.java**:
```java
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    
    private final OAuth2SuccessHandler oauth2SuccessHandler;
    // ... other dependencies
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // ... existing config ...
            .oauth2Login(oauth2 -> oauth2
                .successHandler(oauth2SuccessHandler)
                .failureHandler((request, response, exception) -> {
                    response.sendRedirect(frontendUrl + "/auth/callback?error=" + 
                        URLEncoder.encode(exception.getMessage(), "UTF-8"));
                })
            );
        
        return http.build();
    }
}
```

3. **Configure OAuth2 providers** in `application.properties`:
```properties
# Google OAuth2
spring.security.oauth2.client.registration.google.client-id=${GOOGLE_CLIENT_ID}
spring.security.oauth2.client.registration.google.client-secret=${GOOGLE_CLIENT_SECRET}
spring.security.oauth2.client.registration.google.scope=profile,email

# GitHub OAuth2
spring.security.oauth2.client.registration.github.client-id=${GITHUB_CLIENT_ID}
spring.security.oauth2.client.registration.github.client-secret=${GITHUB_CLIENT_SECRET}
```

---

### 4. Payment Gateway Production Setup (Week 1)

**Problem:** Momo gateway has mock responses.

**Steps:**

1. **Replace mock with real API calls**:
```java
@Service
@RequiredArgsConstructor
public class MomoGatewayService {
    
    private final RestTemplate restTemplate;
    
    @Override
    public PaymentResponse initiatePayment(PaymentRequest request) {
        // Build request body (existing code)
        Map<String, Object> requestBody = buildRequestBody(request);
        
        // Make actual HTTP call
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(
                getApiUrl(),
                entity,
                Map.class
            );
            
            // Parse response
            Map<String, Object> responseBody = response.getBody();
            PaymentResponse paymentResponse = new PaymentResponse();
            
            if (responseBody != null && "0".equals(responseBody.get("resultCode"))) {
                paymentResponse.setSuccess(true);
                paymentResponse.setPaymentUrl((String) responseBody.get("payUrl"));
                paymentResponse.setGatewayTransactionId((String) responseBody.get("transId"));
            } else {
                paymentResponse.setSuccess(false);
                paymentResponse.setErrorMessage((String) responseBody.get("message"));
            }
            
            return paymentResponse;
            
        } catch (Exception e) {
            log.error("Error calling Momo API", e);
            PaymentResponse errorResponse = new PaymentResponse();
            errorResponse.setSuccess(false);
            errorResponse.setErrorMessage("Payment gateway error: " + e.getMessage());
            return errorResponse;
        }
    }
}
```

2. **Add RestTemplate bean**:
```java
@Configuration
public class PaymentConfig {
    
    @Bean
    public RestTemplate restTemplate() {
        RestTemplate restTemplate = new RestTemplate();
        
        // Add timeout configuration
        HttpComponentsClientHttpRequestFactory factory = 
            new HttpComponentsClientHttpRequestFactory();
        factory.setConnectTimeout(5000);
        factory.setReadTimeout(10000);
        
        restTemplate.setRequestFactory(factory);
        return restTemplate;
    }
}
```

3. **Test in sandbox first**:
- Use Momo sandbox credentials
- Test all payment flows
- Verify webhook callbacks
- Test error scenarios

---

### 5. Production Configuration Template (Day 3-4)

**Create `application-prod.properties`**:
```properties
# Production Profile - NO DEFAULTS!
# All values must come from environment variables

spring.profiles.active=prod

# Database (MUST be set via env vars)
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}

# JWT (MUST be set via env vars, min 32 chars)
jwt.secret=${JWT_SECRET}
jwt.expiration=${JWT_EXPIRATION:86400000}

# Payment Gateway
payment.momo.partner-code=${MOMO_PARTNER_CODE}
payment.momo.access-key=${MOMO_ACCESS_KEY}
payment.momo.secret-key=${MOMO_SECRET_KEY}
payment.momo.environment=production

# OAuth2
spring.security.oauth2.client.registration.google.client-id=${GOOGLE_CLIENT_ID}
spring.security.oauth2.client.registration.google.client-secret=${GOOGLE_CLIENT_SECRET}
spring.security.oauth2.client.registration.github.client-id=${GITHUB_CLIENT_ID}
spring.security.oauth2.client.registration.github.client-secret=${GITHUB_CLIENT_SECRET}

# CORS (Production domain)
spring.web.cors.allowed-origins=${CORS_ALLOWED_ORIGINS:https://selfcar.com}

# Logging
logging.level.root=INFO
logging.level.com.selfcar=INFO
logging.level.org.springframework.security=WARN
```

---

## 📋 Environment Variables Checklist

Create these in your production environment:

**Required:**
- `JWT_SECRET` (min 32 characters)
- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`

**Payment Gateway:**
- `MOMO_PARTNER_CODE`
- `MOMO_ACCESS_KEY`
- `MOMO_SECRET_KEY`

**OAuth2:**
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `FACEBOOK_CLIENT_ID`
- `FACEBOOK_CLIENT_SECRET`

**Optional:**
- `CORS_ALLOWED_ORIGINS`
- `JWT_EXPIRATION`
- `APP_FRONTEND_URL`

---

## ✅ Quick Validation

After implementing the above:

1. **Test JWT token security:**
   - Login via OAuth2
   - Check browser history - no token should appear
   - Check network logs - token should be in cookie or postMessage

2. **Test configuration:**
   - Start app without env vars - should fail with clear error
   - Start with env vars - should work
   - Check no secrets in logs

3. **Test OAuth2:**
   - Login with Google/GitHub/Facebook
   - Verify user creation
   - Verify token generation
   - Verify redirect flow

4. **Test payment:**
   - Initiate payment in sandbox
   - Verify API call is made
   - Verify webhook received
   - Check payment status

---

## 🔗 Next Steps

After completing quick start:
1. Review [Production Improvement Roadmap](./PRODUCTION_IMPROVEMENT_ROADMAP.md)
2. Follow [Production Checklist](./PRODUCTION_CHECKLIST.md)
3. Implement remaining phases based on priority

---

## ⚠️ Important Notes

- **Never commit secrets** to version control
- **Always test in sandbox/staging** before production
- **Use HTTPS** in production (required for secure cookies)
- **Validate configurations** on startup
- **Monitor logs** for security issues

---

**Estimated Time:** 3-5 days for quick start implementation

