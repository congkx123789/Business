package com.selfcar.config;

import com.selfcar.security.BotDetectionService;
import com.selfcar.security.RateLimitingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Scheduled Security Tasks
 * 
 * Performs periodic cleanup and maintenance tasks for security services.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ScheduledSecurityTasks {

    private final RateLimitingService rateLimitingService;
    private final BotDetectionService botDetectionService;

    /**
     * Clean up expired rate limit records every hour
     */
    @Scheduled(fixedRate = 3600000) // 1 hour
    public void cleanupRateLimitRecords() {
        log.debug("Cleaning up expired rate limit records");
        try {
            rateLimitingService.cleanupExpiredRecords();
        } catch (Exception e) {
            log.error("Error cleaning up rate limit records", e);
        }
    }

    /**
     * Clean up old bot detection activity records every hour
     */
    @Scheduled(fixedRate = 3600000) // 1 hour
    public void cleanupBotDetectionRecords() {
        log.debug("Cleaning up old bot detection activity records");
        try {
            botDetectionService.cleanupOldActivity();
        } catch (Exception e) {
            log.error("Error cleaning up bot detection records", e);
        }
    }
}

