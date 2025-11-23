package com.selfcar.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

class LoginThrottleServiceTest {

    private LoginThrottleService service;

    @BeforeEach
    void setup() {
        service = new LoginThrottleService();
        // Tighten limits for test speed
        ReflectionTestUtils.setField(service, "maxAttempts", 2);
        ReflectionTestUtils.setField(service, "lockoutDurationMinutes", 30);
        ReflectionTestUtils.setField(service, "attemptWindowMinutes", 15);
    }

    @Test
    @DisplayName("recordFailedAttempt triggers lockout after max attempts")
    void lockoutAfterMaxAttempts() {
        String id = "user@example.com";
        assertThat(service.isLoginAllowed(id)).isTrue();
        service.recordFailedAttempt(id);
        assertThat(service.isLoginAllowed(id)).isTrue();
        service.recordFailedAttempt(id);
        // Now locked
        assertThat(service.isLoginAllowed(id)).isFalse();
        assertThat(service.getRemainingLockoutMinutes(id)).isGreaterThanOrEqualTo(0);
    }

    @Test
    @DisplayName("recordSuccessfulLogin clears attempts and unlocks")
    void successClearsAttempts() {
        String id = "ip:1.2.3.4";
        service.recordFailedAttempt(id);
        service.recordFailedAttempt(id);
        assertThat(service.isLoginAllowed(id)).isFalse();
        service.recordSuccessfulLogin(id);
        assertThat(service.isLoginAllowed(id)).isTrue();
        assertThat(service.getRemainingLockoutMinutes(id)).isEqualTo(0);
    }

    @Test
    @DisplayName("cleanupExpiredAttempts removes stale entries and allows login")
    void cleanupRemovesStale() {
        String id = "stale@example.com";
        // Hit twice to create entry
        service.recordFailedAttempt(id);
        service.recordFailedAttempt(id);
        // Simulate very old lastAttemptTime
        Object attemptCache = ReflectionTestUtils.getField(service, "attemptCache");
        java.util.Map<?,?> map = (java.util.Map<?,?>) attemptCache;
        Object attempt = map.get(id);
        // Set lastAttemptTime to long ago
        ReflectionTestUtils.setField(attempt, "lastAttemptTime", java.time.LocalDateTime.now().minusMinutes(1000));

        service.cleanupExpiredAttempts();
        // Should allow again because entry was removed
        assertThat(service.isLoginAllowed(id)).isTrue();
    }
}


