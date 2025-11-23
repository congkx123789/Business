package com.selfcar.security;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Rate Limiting Service
 * 
 * Implements rate limiting for API endpoints to prevent DDoS attacks and abuse.
 * Supports both IP-based and user-based rate limiting.
 * 
 * Features:
 * - IP-based rate limiting for anonymous requests
 * - User-based rate limiting for authenticated requests
 * - Configurable limits per endpoint
 * - Sliding window algorithm
 * 
 * Owner: SecOps
 * 
 * Integration Points:
 * - CDN should handle edge rate limiting
 * - This service handles application-level rate limiting
 * - Logs suspicious traffic for analysis
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RateLimitingService {

    private final SecurityEventLogger securityEventLogger;

    @Value("${security.rate-limit.login.max-requests:5}")
    private int loginMaxRequests;

    @Value("${security.rate-limit.login.window-seconds:60}")
    private int loginWindowSeconds;

    @Value("${security.rate-limit.otp.max-requests:3}")
    private int otpMaxRequests;

    @Value("${security.rate-limit.otp.window-seconds:300}")
    private int otpWindowSeconds;

    @Value("${security.rate-limit.search.max-requests:30}")
    private int searchMaxRequests;

    @Value("${security.rate-limit.search.window-seconds:60}")
    private int searchWindowSeconds;

    @Value("${security.rate-limit.api.max-requests:100}")
    private int apiMaxRequests;

    @Value("${security.rate-limit.api.window-seconds:60}")
    private int apiWindowSeconds;

    @Value("${security.rate-limit.global.max-requests:1000}")
    private int globalMaxRequests;

    @Value("${security.rate-limit.global.window-seconds:60}")
    private int globalWindowSeconds;

    // In-memory rate limit tracking (consider Redis for distributed systems)
    private final Map<String, RateLimitRecord> rateLimitCache = new ConcurrentHashMap<>();

    /**
     * Check if request is allowed for login endpoint
     * 
     * @param identifier User identifier (email or IP)
     * @return true if allowed, false if rate limited
     */
    public boolean isLoginAllowed(String identifier) {
        return checkRateLimit("LOGIN:" + identifier, loginMaxRequests, loginWindowSeconds);
    }

    /**
     * Check if request is allowed for OTP endpoint
     * 
     * @param identifier User identifier (email or IP)
     * @return true if allowed, false if rate limited
     */
    public boolean isOtpAllowed(String identifier) {
        return checkRateLimit("OTP:" + identifier, otpMaxRequests, otpWindowSeconds);
    }

    /**
     * Check if request is allowed for search endpoint
     * 
     * @param identifier User identifier (email or IP)
     * @return true if allowed, false if rate limited
     */
    public boolean isSearchAllowed(String identifier) {
        return checkRateLimit("SEARCH:" + identifier, searchMaxRequests, searchWindowSeconds);
    }

    /**
     * Check if request is allowed for general API endpoint
     * 
     * @param identifier User identifier (email or IP)
     * @return true if allowed, false if rate limited
     */
    public boolean isApiAllowed(String identifier) {
        return checkRateLimit("API:" + identifier, apiMaxRequests, apiWindowSeconds);
    }

    /**
     * Check global rate limit for an IP address
     * 
     * @param ipAddress IP address
     * @return true if allowed, false if rate limited
     */
    public boolean isGlobalAllowed(String ipAddress) {
        return checkRateLimit("GLOBAL:" + ipAddress, globalMaxRequests, globalWindowSeconds);
    }

    /**
     * Core rate limiting check using sliding window
     * 
     * @param key Unique key for the rate limit bucket
     * @param maxRequests Maximum requests allowed in the window
     * @param windowSeconds Window size in seconds
     * @return true if allowed, false if rate limited
     */
    private boolean checkRateLimit(String key, int maxRequests, int windowSeconds) {
        RateLimitRecord record = rateLimitCache.computeIfAbsent(key, 
            k -> new RateLimitRecord(key, maxRequests, windowSeconds));

        LocalDateTime now = LocalDateTime.now();
        
        // Clean up old requests outside the window
        record.cleanup(now, windowSeconds);

        // Check if limit exceeded
        if (record.getRequestCount() >= maxRequests) {
            log.warn("Rate limit exceeded for key: {} ({} requests in {} seconds)", 
                key, record.getRequestCount(), windowSeconds);
            
            securityEventLogger.logRateLimitExceeded(key, record.getRequestCount(), maxRequests);
            return false;
        }

        // Record this request
        record.incrementRequest(now);
        return true;
    }

    /**
     * Get client identifier from request (IP address or user ID)
     * 
     * @param request HTTP request
     * @param userId Optional user ID if authenticated
     * @return Identifier string
     */
    public String getClientIdentifier(HttpServletRequest request, Long userId) {
        if (userId != null) {
            return "USER:" + userId;
        }
        
        // Get real IP address (considering proxies)
        String ip = getClientIpAddress(request);
        return "IP:" + ip;
    }

    /**
     * Extract client IP address from request (handles proxies)
     * 
     * @param request HTTP request
     * @return Client IP address
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            // Take the first IP (original client)
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }

        return request.getRemoteAddr();
    }

    /**
     * Clean up expired rate limit records
     */
    public void cleanupExpiredRecords() {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(1);
        rateLimitCache.entrySet().removeIf(entry -> 
            entry.getValue().getLastRequestTime().isBefore(cutoff)
        );
    }

    /**
     * Rate limit record for tracking requests
     */
    private static class RateLimitRecord {
        private final String key;
        private final int maxRequests;
        private final AtomicInteger requestCount = new AtomicInteger(0);
        private LocalDateTime lastRequestTime;
        private final java.util.concurrent.ConcurrentLinkedQueue<LocalDateTime> requestTimestamps = 
            new java.util.concurrent.ConcurrentLinkedQueue<>();

        RateLimitRecord(String key, int maxRequests, int windowSeconds) {
            this.key = key;
            this.maxRequests = maxRequests;
            this.lastRequestTime = LocalDateTime.now();
        }

        void incrementRequest(LocalDateTime now) {
            requestTimestamps.offer(now);
            requestCount.incrementAndGet();
            lastRequestTime = now;
        }

        void cleanup(LocalDateTime now, int windowSeconds) {
            LocalDateTime windowStart = now.minusSeconds(windowSeconds);
            
            // Remove timestamps outside the window
            while (!requestTimestamps.isEmpty() && 
                   requestTimestamps.peek().isBefore(windowStart)) {
                requestTimestamps.poll();
                requestCount.decrementAndGet();
            }
        }

        int getRequestCount() {
            return requestCount.get();
        }

        LocalDateTime getLastRequestTime() {
            return lastRequestTime;
        }
    }
}

