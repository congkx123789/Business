package com.selfcar.security;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Pattern;

/**
 * Bot Detection Service
 * 
 * Detects and mitigates bot traffic by analyzing request patterns,
 * user agents, and behavioral signals.
 * 
 * Features:
 * - User-Agent analysis
 * - Request pattern analysis
 * - Challenge-response for suspicious traffic
 * - Integration with CDN bot mitigation
 * 
 * Owner: SecOps
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BotDetectionService {

    private final SecurityEventLogger securityEventLogger;

    @Value("${security.bot-detection.enabled:true}")
    private boolean botDetectionEnabled;

    @Value("${security.bot-detection.suspicious-threshold:10}")
    private int suspiciousThreshold;

    @Value("${security.bot-detection.challenge-on-suspicious:true}")
    private boolean challengeOnSuspicious;

    // Known bot user agents (should be expanded)
    private static final Set<String> KNOWN_BOT_AGENTS = Set.of(
        "bot", "crawler", "spider", "scraper", "curl", "wget", 
        "python-requests", "java", "go-http-client", "postman"
    );

    // Suspicious patterns
    private static final Pattern SUSPICIOUS_USER_AGENT = Pattern.compile(
        "(?i)(bot|crawler|spider|scraper|headless|phantom|selenium|automated)"
    );

    // Track suspicious IPs
    private final Map<String, SuspiciousActivity> suspiciousActivityMap = new ConcurrentHashMap<>();

    /**
     * Analyze request for bot indicators
     * 
     * @param request HTTP request
     * @return BotDetectionResult with risk score and recommendations
     */
    public BotDetectionResult analyzeRequest(HttpServletRequest request) {
        if (!botDetectionEnabled) {
            return BotDetectionResult.allowed();
        }

        String ipAddress = getClientIpAddress(request);
        String userAgent = request.getHeader("User-Agent");
        int riskScore = 0;
        Set<String> indicators = new java.util.HashSet<>();

        // Check User-Agent
        if (userAgent == null || userAgent.trim().isEmpty()) {
            riskScore += 30;
            indicators.add("MISSING_USER_AGENT");
        } else {
            if (SUSPICIOUS_USER_AGENT.matcher(userAgent).find()) {
                riskScore += 40;
                indicators.add("SUSPICIOUS_USER_AGENT");
            }
            
            // Check for known bot agents
            String lowerUA = userAgent.toLowerCase();
            for (String botAgent : KNOWN_BOT_AGENTS) {
                if (lowerUA.contains(botAgent)) {
                    riskScore += 20;
                    indicators.add("KNOWN_BOT_AGENT");
                    break;
                }
            }
        }

        // Check for missing or suspicious headers
        if (request.getHeader("Accept") == null) {
            riskScore += 10;
            indicators.add("MISSING_ACCEPT_HEADER");
        }

        if (request.getHeader("Accept-Language") == null) {
            riskScore += 5;
            indicators.add("MISSING_ACCEPT_LANGUAGE");
        }

        // Check request frequency (if already tracked)
        SuspiciousActivity activity = suspiciousActivityMap.get(ipAddress);
        if (activity != null && activity.getRequestCount() > suspiciousThreshold) {
            riskScore += 25;
            indicators.add("HIGH_REQUEST_FREQUENCY");
        }

        // Record activity
        recordActivity(ipAddress);

        // Determine if challenge is needed
        boolean requiresChallenge = riskScore >= 50 && challengeOnSuspicious;

        if (riskScore >= 70) {
            log.warn("High bot risk detected for IP: {} (score: {}, indicators: {})", 
                ipAddress, riskScore, indicators);
            securityEventLogger.logSuspiciousActivity("BOT_DETECTION", 
                "High risk score: " + riskScore + ", indicators: " + indicators, ipAddress);
        }

        return BotDetectionResult.builder()
            .allowed(riskScore < 70)
            .requiresChallenge(requiresChallenge)
            .riskScore(riskScore)
            .indicators(indicators)
            .build();
    }

    /**
     * Record activity for an IP address
     * 
     * @param ipAddress IP address
     */
    private void recordActivity(String ipAddress) {
        SuspiciousActivity activity = suspiciousActivityMap.computeIfAbsent(ipAddress, 
            k -> new SuspiciousActivity(ipAddress));
        activity.incrementRequest();
        activity.setLastRequestTime(LocalDateTime.now());
    }

    /**
     * Get client IP address from request
     * 
     * @param request HTTP request
     * @return Client IP address
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }

        return request.getRemoteAddr();
    }

    /**
     * Clean up old activity records
     */
    public void cleanupOldActivity() {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(1);
        suspiciousActivityMap.entrySet().removeIf(entry -> 
            entry.getValue().getLastRequestTime().isBefore(cutoff)
        );
    }

    /**
     * Bot detection result
     */
    @lombok.Builder
    @lombok.Data
    public static class BotDetectionResult {
        private boolean allowed;
        private boolean requiresChallenge;
        private int riskScore;
        private Set<String> indicators;

        public static BotDetectionResult allowed() {
            return BotDetectionResult.builder()
                .allowed(true)
                .requiresChallenge(false)
                .riskScore(0)
                .indicators(Set.of())
                .build();
        }
    }

    /**
     * Suspicious activity tracking
     */
    private static class SuspiciousActivity {
        private final String ipAddress;
        private int requestCount = 0;
        private LocalDateTime lastRequestTime;

        SuspiciousActivity(String ipAddress) {
            this.ipAddress = ipAddress;
            this.lastRequestTime = LocalDateTime.now();
        }

        void incrementRequest() {
            this.requestCount++;
        }

        int getRequestCount() {
            return requestCount;
        }

        LocalDateTime getLastRequestTime() {
            return lastRequestTime;
        }

        void setLastRequestTime(LocalDateTime time) {
            this.lastRequestTime = time;
        }
    }
}

