package com.selfcar.security;

import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Security Event Logger
 * 
 * Centralized logging for security events.
 * Provides structured logging for security monitoring and alerting.
 */
@Slf4j
@Component
public class SecurityEventLogger {

    private static final Logger SECURITY_LOGGER = LoggerFactory.getLogger("SECURITY_EVENT");

    /**
     * Logs unauthorized access attempts
     */
    public void logUnauthorizedAccess(String resourceType, Long resourceId, Long userId, String reason) {
        Map<String, Object> event = new HashMap<>();
        event.put("event_type", "UNAUTHORIZED_ACCESS");
        event.put("resource_type", resourceType);
        event.put("resource_id", resourceId);
        event.put("user_id", userId);
        event.put("reason", reason);
        event.put("timestamp", LocalDateTime.now());
        
        SECURITY_LOGGER.warn("{}", event);
    }

    /**
     * Logs failed login attempts
     */
    public void logFailedLogin(String email, String ipAddress, String reason) {
        Map<String, Object> event = new HashMap<>();
        event.put("event_type", "FAILED_LOGIN");
        event.put("email", email);
        event.put("ip_address", ipAddress);
        event.put("reason", reason);
        event.put("timestamp", LocalDateTime.now());
        
        SECURITY_LOGGER.warn("{}", event);
    }

    /**
     * Logs account lockout
     */
    public void logAccountLockout(String email, String ipAddress, long remainingMinutes) {
        Map<String, Object> event = new HashMap<>();
        event.put("event_type", "ACCOUNT_LOCKOUT");
        event.put("email", email);
        event.put("ip_address", ipAddress);
        event.put("remaining_minutes", remainingMinutes);
        event.put("timestamp", LocalDateTime.now());
        
        SECURITY_LOGGER.warn("{}", event);
    }

    /**
     * Logs webhook security violations
     */
    public void logWebhookSecurityViolation(String provider, String ipAddress, String violationType) {
        Map<String, Object> event = new HashMap<>();
        event.put("event_type", "WEBHOOK_SECURITY_VIOLATION");
        event.put("provider", provider);
        event.put("ip_address", ipAddress);
        event.put("violation_type", violationType);
        event.put("timestamp", LocalDateTime.now());
        
        SECURITY_LOGGER.warn("{}", event);
    }

    /**
     * Logs breached password detection
     */
    public void logBreachedPassword(String email, String context) {
        Map<String, Object> event = new HashMap<>();
        event.put("event_type", "BREACHED_PASSWORD_DETECTED");
        event.put("email", email);
        event.put("context", context); // "registration" or "password_change"
        event.put("timestamp", LocalDateTime.now());
        
        log.warn("SECURITY_EVENT: {}", event);
    }

    /**
     * Logs token revocation
     */
    public void logTokenRevocation(Long userId, String tokenType, String reason) {
        Map<String, Object> event = new HashMap<>();
        event.put("event_type", "TOKEN_REVOCATION");
        event.put("user_id", userId);
        event.put("token_type", tokenType); // "refresh" or "access"
        event.put("reason", reason);
        event.put("timestamp", LocalDateTime.now());
        
        SECURITY_LOGGER.info("{}", event);
    }

    /**
     * Logs suspicious activity
     */
    public void logSuspiciousActivity(String activityType, String details, String ipAddress) {
        Map<String, Object> event = new HashMap<>();
        event.put("event_type", "SUSPICIOUS_ACTIVITY");
        event.put("activity_type", activityType);
        event.put("details", details);
        event.put("ip_address", ipAddress);
        event.put("timestamp", LocalDateTime.now());
        
        SECURITY_LOGGER.warn("{}", event);
    }


    /**
     * Logs rate limit exceeded
     */
    public void logRateLimitExceeded(String identifier, int currentCount, int maxAllowed) {
        Map<String, Object> event = new HashMap<>();
        event.put("event_type", "RATE_LIMIT_EXCEEDED");
        event.put("identifier", identifier);
        event.put("current_count", currentCount);
        event.put("max_allowed", maxAllowed);
        event.put("timestamp", LocalDateTime.now());
        
        SECURITY_LOGGER.warn("{}", event);
    }

    /**
     * Logs CVE registration
     */
    public void logCveRegistration(String cveId, String severity, String description) {
        Map<String, Object> event = new HashMap<>();
        event.put("event_type", "CVE_REGISTERED");
        event.put("cve_id", cveId);
        event.put("severity", severity);
        event.put("description", description);
        event.put("timestamp", LocalDateTime.now());
        
        log.warn("SECURITY_EVENT: {}", event);
    }

    /**
     * Logs virtual patch application
     */
    public void logVirtualPatchApplied(String cveId, String wafRule) {
        Map<String, Object> event = new HashMap<>();
        event.put("event_type", "VIRTUAL_PATCH_APPLIED");
        event.put("cve_id", cveId);
        event.put("waf_rule", wafRule);
        event.put("timestamp", LocalDateTime.now());
        
        SECURITY_LOGGER.info("{}", event);
    }

    /**
     * Logs real patch application
     */
    public void logRealPatchApplied(String cveId, String patchVersion) {
        Map<String, Object> event = new HashMap<>();
        event.put("event_type", "REAL_PATCH_APPLIED");
        event.put("cve_id", cveId);
        event.put("patch_version", patchVersion);
        event.put("timestamp", LocalDateTime.now());
        
        SECURITY_LOGGER.info("{}", event);
    }

    /**
     * Logs SLO violation
     */
    public void logSloViolation(String cveId, String patchType, long actualTime, long expectedTime) {
        Map<String, Object> event = new HashMap<>();
        event.put("event_type", "SLO_VIOLATION");
        event.put("cve_id", cveId);
        event.put("patch_type", patchType);
        event.put("actual_time", actualTime);
        event.put("expected_time", expectedTime);
        event.put("timestamp", LocalDateTime.now());
        
        SECURITY_LOGGER.error("{}", event);
    }
}

