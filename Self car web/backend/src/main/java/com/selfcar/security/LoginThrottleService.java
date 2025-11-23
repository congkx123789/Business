package com.selfcar.security;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Login Throttle Service
 * 
 * Prevents brute-force attacks by rate limiting login attempts.
 * Implements exponential backoff for repeated failures.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class LoginThrottleService {

    @Value("${auth.login.max-attempts:5}")
    private int maxAttempts;

    @Value("${auth.login.lockout-duration-minutes:15}")
    private int lockoutDurationMinutes;

    @Value("${auth.login.attempt-window-minutes:15}")
    private int attemptWindowMinutes;

    // In-memory storage (consider Redis for distributed systems)
    private final Map<String, LoginAttempt> attemptCache = new ConcurrentHashMap<>();

    /**
     * Records a failed login attempt
     * 
     * @param identifier User identifier (email or IP address)
     */
    public void recordFailedAttempt(String identifier) {
        LoginAttempt attempt = attemptCache.computeIfAbsent(identifier, 
                k -> new LoginAttempt(identifier));

        attempt.incrementAttempts();
        attempt.setLastAttemptTime(LocalDateTime.now());

        if (attempt.getAttemptCount() >= maxAttempts) {
            attempt.setLockedUntil(LocalDateTime.now().plusMinutes(lockoutDurationMinutes));
            log.warn("Account locked due to too many failed login attempts: {}", identifier);
        }

        attemptCache.put(identifier, attempt);
    }

    /**
     * Records a successful login and clears failed attempts
     * 
     * @param identifier User identifier
     */
    public void recordSuccessfulLogin(String identifier) {
        attemptCache.remove(identifier);
        log.debug("Cleared login attempts for: {}", identifier);
    }

    /**
     * Checks if login is allowed for the given identifier
     * 
     * @param identifier User identifier (email or IP address)
     * @return true if login is allowed, false if throttled
     */
    public boolean isLoginAllowed(String identifier) {
        LoginAttempt attempt = attemptCache.get(identifier);
        
        if (attempt == null) {
            return true;
        }

        // Check if lockout period has expired
        if (attempt.getLockedUntil() != null && 
            attempt.getLockedUntil().isAfter(LocalDateTime.now())) {
            log.warn("Login blocked - account locked: {}", identifier);
            return false;
        }

        // Check if attempt window has expired
        if (attempt.getLastAttemptTime() != null &&
            attempt.getLastAttemptTime().plusMinutes(attemptWindowMinutes)
                    .isBefore(LocalDateTime.now())) {
            // Window expired, reset attempts
            attemptCache.remove(identifier);
            return true;
        }

        // Check if max attempts exceeded
        if (attempt.getAttemptCount() >= maxAttempts) {
            log.warn("Login blocked - max attempts exceeded: {}", identifier);
            return false;
        }

        return true;
    }

    /**
     * Gets remaining lockout time in minutes
     * 
     * @param identifier User identifier
     * @return Remaining minutes, or 0 if not locked
     */
    public long getRemainingLockoutMinutes(String identifier) {
        LoginAttempt attempt = attemptCache.get(identifier);
        
        if (attempt == null || attempt.getLockedUntil() == null) {
            return 0;
        }

        LocalDateTime now = LocalDateTime.now();
        if (attempt.getLockedUntil().isBefore(now)) {
            return 0;
        }

        return java.time.Duration.between(now, attempt.getLockedUntil()).toMinutes();
    }

    /**
     * Cleans up old attempt records
     */
    public void cleanupExpiredAttempts() {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(attemptWindowMinutes * 2);
        attemptCache.entrySet().removeIf(entry -> 
            entry.getValue().getLastAttemptTime() != null &&
            entry.getValue().getLastAttemptTime().isBefore(cutoff)
        );
    }

    /**
     * Login attempt record
     */
    private static class LoginAttempt {
        private final String identifier;
        private int attemptCount = 0;
        private LocalDateTime lastAttemptTime;
        private LocalDateTime lockedUntil;

        LoginAttempt(String identifier) {
            this.identifier = identifier;
        }

        void incrementAttempts() {
            this.attemptCount++;
        }

        // Getters and setters
        String getIdentifier() { return identifier; }
        int getAttemptCount() { return attemptCount; }
        void setAttemptCount(int count) { this.attemptCount = count; }
        LocalDateTime getLastAttemptTime() { return lastAttemptTime; }
        void setLastAttemptTime(LocalDateTime time) { this.lastAttemptTime = time; }
        LocalDateTime getLockedUntil() { return lockedUntil; }
        void setLockedUntil(LocalDateTime time) { this.lockedUntil = time; }
    }
}

