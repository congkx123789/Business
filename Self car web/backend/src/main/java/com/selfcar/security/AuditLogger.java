

package com.selfcar.security;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

/**
 * Audit Logger
 * Structured, immutable audit logs for security-relevant events (Req 10).
 */
@Slf4j
@Component
public class AuditLogger {

    /**
     * Logs an authentication event.
     *
     * @param eventType the type of auth event
     * @param userId the user ID
     * @param ip the IP address
     * @param userAgent the user agent string
     * @param extras additional event data (may be null)
     */
    public void logAuthEvent(String eventType, Long userId, String ip, String userAgent, Map<String, Object> extras) {
        Map<String, Object> e = base("AUTH", eventType, userId, ip, userAgent, extras);
        log.info("AUDIT_EVENT: {}", e);
    }

    /**
     * Logs a payment event.
     *
     * @param eventType the type of payment event
     * @param transactionId the transaction ID
     * @param userId the user ID
     * @param gateway the payment gateway
     * @param extras additional event data (may be null)
     */
    public void logPaymentEvent(String eventType, String transactionId, Long userId, String gateway, Map<String, Object> extras) {
        Map<String, Object> e = new HashMap<>();
        e.put("category", "PAYMENT");
        e.put("event_type", eventType);
        e.put("transaction_id", transactionId);
        e.put("user_id", userId);
        e.put("gateway", gateway);
        e.put("timestamp", Instant.now().toString());
        if (extras != null) e.putAll(LogSanitizer.sanitize(extras));
        log.info("AUDIT_EVENT: {}", e);
    }

    /**
     * Logs a configuration change event.
     *
     * @param changedBy who made the change
     * @param changeSummary summary of the change
     * @param extras additional event data (may be null)
     */
    public void logConfigChange(String changedBy, String changeSummary, Map<String, Object> extras) {
        Map<String, Object> e = new HashMap<>();
        e.put("category", "CONFIG");
        e.put("event_type", "CONFIG_CHANGE");
        e.put("changed_by", changedBy);
        e.put("summary", changeSummary);
        e.put("timestamp", Instant.now().toString());
        if (extras != null) e.putAll(LogSanitizer.sanitize(extras));
        log.warn("AUDIT_EVENT: {}", e);
    }

    /**
     * Logs a domain-specific event.
     *
     * @param domain the domain category
     * @param eventType the type of event
     * @param extras additional event data (may be null)
     */
    public void logDomainEvent(String domain, String eventType, Map<String, Object> extras) {
        Map<String, Object> e = new HashMap<>();
        e.put("category", domain);
        e.put("event_type", eventType);
        e.put("timestamp", Instant.now().toString());
        if (extras != null) e.putAll(LogSanitizer.sanitize(extras));
        log.info("AUDIT_EVENT: {}", e);
    }

    private Map<String, Object> base(String category, String eventType, Long userId, String ip, String ua, Map<String, Object> extras) {
        Map<String, Object> e = new HashMap<>();
        e.put("category", category);
        e.put("event_type", eventType);
        e.put("user_id", userId);
        e.put("ip", ip);
        e.put("user_agent", ua);
        e.put("timestamp", Instant.now().toString());
        if (extras != null) e.putAll(LogSanitizer.sanitize(extras));
        return e;
    }
}

