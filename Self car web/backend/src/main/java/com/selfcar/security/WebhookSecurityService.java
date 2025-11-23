package com.selfcar.security;

import com.selfcar.model.payment.WebhookEvent;
import com.selfcar.repository.payment.WebhookEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.selfcar.security.SecurityEventLogger;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Webhook Security Service
 * 
 * Provides security features for payment webhooks:
 * - Rate limiting
 * - Replay attack protection (timestamp validation)
 * - Idempotency key enforcement
 * - IP allowlisting (if supported by provider)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class WebhookSecurityService {

    private final WebhookEventRepository webhookEventRepository;
    private final SecurityEventLogger securityEventLogger;
    private final AuditLogger auditLogger;

    @Value("${webhook.replay-window-minutes:15}")
    private int replayWindowMinutes;

    @Value("${webhook.rate-limit-per-minute:100}")
    private int rateLimitPerMinute;

    @Value("${webhook.ip-allowlist:}")
    private String ipAllowlistCsv;

    // In-memory rate limiting (consider Redis for distributed systems)
    private final Map<String, RateLimitInfo> rateLimitCache = new ConcurrentHashMap<>();
    private static final long RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute

    /**
     * Validates webhook timestamp to prevent replay attacks
     * 
     * @param timestamp The timestamp from the webhook (if provided)
     * @return true if timestamp is valid, false if replay attack detected
     */
    public boolean validateTimestamp(String timestamp) {
        if (timestamp == null || timestamp.isEmpty()) {
            // Some providers don't send timestamps - log but allow
            log.debug("Webhook timestamp not provided");
            return true;
        }

        try {
            // Parse timestamp (format depends on provider)
            // For Momo: timestamp is usually in "responseTime" field as epoch milliseconds
            long timestampMs = Long.parseLong(timestamp);
            long now = System.currentTimeMillis();
            // Guard against misconfiguration: empty env/property can bind to 0
            int effectiveWindowMinutes = (replayWindowMinutes <= 0 ? 5 : replayWindowMinutes);
            long windowMs = effectiveWindowMinutes * 60L * 1000L;

            // Check if timestamp is within acceptable window
            if (timestampMs < now - windowMs || timestampMs > now + 60_000) {
                log.warn("Webhook timestamp outside acceptable window. Timestamp: {}, Now: {}, Window: {} minutes",
                        timestampMs, now, effectiveWindowMinutes);
                return false;
            }

            return true;
        } catch (NumberFormatException e) {
            log.warn("Invalid webhook timestamp format: {}", timestamp);
            return false;
        }
    }

    /**
     * Checks if webhook has already been processed (idempotency)
     * 
     * @param provider The payment provider name
     * @param idempotencyKey The unique identifier for this webhook
     * @return true if already processed, false if new
     */
    public boolean isAlreadyProcessed(String provider, String idempotencyKey) {
        if (idempotencyKey == null || idempotencyKey.isEmpty()) {
            return false;
        }

        WebhookEvent existing = webhookEventRepository
                .findBySourceAndEventId(provider, idempotencyKey)
                .orElse(null);

        if (existing != null && existing.getStatus() == WebhookEvent.ProcessingStatus.PROCESSED) {
            log.info("Webhook already processed: provider={}, key={}", provider, idempotencyKey);
            return true;
        }

        return false;
    }

    /**
     * Rate limiting check for webhook endpoints
     * 
     * @param identifier Identifier for rate limiting (IP address or provider)
     * @return true if request is within rate limit, false if rate limited
     */
    public boolean checkRateLimit(String identifier) {
        if (identifier == null || identifier.isEmpty()) {
            return false;
        }

        long now = System.currentTimeMillis();
        RateLimitInfo info = rateLimitCache.get(identifier);

        if (info == null || (now - info.windowStart > RATE_LIMIT_WINDOW_MS)) {
            // New window or expired window
            rateLimitCache.put(identifier, new RateLimitInfo(now, 1));
            return true;
        }

        if (info.count >= rateLimitPerMinute) {
            log.warn("Webhook rate limit exceeded for identifier: {}", identifier);
            return false;
        }

        info.count++;
        return true;
    }

    /**
     * Validates webhook security requirements
     * 
     * @param provider Payment provider name
     * @param idempotencyKey Unique identifier for this webhook
     * @param timestamp Timestamp from webhook (if provided)
     * @param identifier Identifier for rate limiting (IP or provider)
     * @return true if all security checks pass
     */
    public boolean validateWebhookSecurity(String provider, String idempotencyKey, 
                                          String timestamp, String identifier) {
        // Optional IP allowlisting
        if (!isIpAllowed(identifier)) {
            securityEventLogger.logWebhookSecurityViolation(provider, identifier, "IP_NOT_ALLOWLISTED");
            auditLogger.logPaymentEvent("WEBHOOK_IP_DENY", idempotencyKey, null, provider,
                    Map.of("identifier", identifier));
            return false;
        }
        // Check rate limit
        if (!checkRateLimit(identifier)) {
            securityEventLogger.logWebhookSecurityViolation(provider, identifier, "RATE_LIMIT_EXCEEDED");
            auditLogger.logPaymentEvent("WEBHOOK_RATE_LIMIT", idempotencyKey, null, provider,
                    Map.of("identifier", identifier));
            return false;
        }

        // Check idempotency (already processed)
        if (isAlreadyProcessed(provider, idempotencyKey)) {
            // Already processed - this is OK, just return true to allow idempotent response
            return true;
        }

        // Validate timestamp (replay protection)
        if (!validateTimestamp(timestamp)) {
            securityEventLogger.logWebhookSecurityViolation(provider, identifier, "REPLAY_ATTACK");
            auditLogger.logPaymentEvent("WEBHOOK_REPLAY", idempotencyKey, null, provider,
                    Map.of("identifier", identifier, "timestamp", timestamp));
            return false;
        }

        auditLogger.logPaymentEvent("WEBHOOK_VALIDATED", idempotencyKey, null, provider,
                Map.of("identifier", identifier));
        return true;
    }

    private boolean isIpAllowed(String ip) {
        if (ip == null || ip.isBlank()) return false;
        if (ipAllowlistCsv == null || ipAllowlistCsv.isBlank()) return true; // allow if not configured
        String[] entries = ipAllowlistCsv.split(",");
        for (String e : entries) {
            String trimmed = e.trim();
            if (trimmed.isEmpty()) continue;
            if (ip.equals(trimmed)) return true;
            // TODO: CIDR match could be added here; for now exact match
        }
        return false;
    }

    /**
     * Cleans up old rate limit entries
     * Should be called periodically
     */
    public void cleanupRateLimitCache() {
        long now = System.currentTimeMillis();
        rateLimitCache.entrySet().removeIf(entry -> 
            now - entry.getValue().windowStart > RATE_LIMIT_WINDOW_MS
        );
    }

    /**
     * Rate limit information holder
     */
    private static class RateLimitInfo {
        long windowStart;
        int count;

        RateLimitInfo(long windowStart, int count) {
            this.windowStart = windowStart;
            this.count = count;
        }
    }
}

