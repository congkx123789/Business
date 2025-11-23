package com.selfcar.security;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

/**
 * Secrets Management Service
 * 
 * Ensures that sensitive credentials are only loaded from environment variables
 * or secrets manager, never from property files. This service validates that
 * all required secrets are present at startup and provides a centralized way
 * to access them.
 * 
 * Owner: DevOps
 * 
 * Production Requirements:
 * - All secrets MUST be provided via environment variables or secrets manager
 * - application-prod.properties contains NO credentials
 * - Secrets are validated at application startup
 */
@Slf4j
@Service
public class SecretsManagementService {

    private final Environment environment;
    private final Set<String> requiredSecrets = new HashSet<>();
    private final Set<String> missingSecrets = new HashSet<>();
    private final boolean isProduction;

    public SecretsManagementService(Environment environment) {
        this.environment = environment;
        this.isProduction = Arrays.asList(environment.getActiveProfiles()).contains("prod");
        
        // Define all required secrets for production
        requiredSecrets.add("DB_PASSWORD");
        requiredSecrets.add("JWT_SECRET");
        requiredSecrets.add("GOOGLE_CLIENT_SECRET");
        requiredSecrets.add("GITHUB_CLIENT_SECRET");
        requiredSecrets.add("FACEBOOK_CLIENT_SECRET");
        requiredSecrets.add("MOMO_SECRET_KEY");
        requiredSecrets.add("MOMO_ACCESS_KEY");
        requiredSecrets.add("ZALOPAY_KEY1");
        requiredSecrets.add("ZALOPAY_KEY2");
        requiredSecrets.add("STRIPE_SECRET_KEY");
    }

    @PostConstruct
    public void validateSecrets() {
        if (!isProduction) {
            log.info("Secrets validation skipped for non-production environment");
            return;
        }

        log.info("Validating required secrets for production environment...");
        
        for (String secretName : requiredSecrets) {
            String value = environment.getProperty(secretName);
            if (value == null || value.trim().isEmpty()) {
                missingSecrets.add(secretName);
                log.error("MISSING REQUIRED SECRET: {}", secretName);
            } else {
                log.debug("Secret {} is present", secretName);
            }
        }

        if (!missingSecrets.isEmpty()) {
            String errorMessage = String.format(
                "CRITICAL: Missing required secrets in production: %s. " +
                "Application cannot start without these secrets. " +
                "Please set them via environment variables or secrets manager.",
                missingSecrets
            );
            log.error(errorMessage);
            throw new IllegalStateException(errorMessage);
        }

        log.info("All required secrets validated successfully");
    }

    /**
     * Get a secret value from environment variables
     * 
     * @param secretName The name of the secret (environment variable name)
     * @return The secret value, or null if not found
     */
    public String getSecret(String secretName) {
        String value = environment.getProperty(secretName);
        if (value == null || value.trim().isEmpty()) {
            if (isProduction) {
                log.warn("Secret {} not found in production environment", secretName);
            }
            return null;
        }
        return value;
    }

    /**
     * Get a secret value with a default fallback (for non-critical secrets)
     * 
     * @param secretName The name of the secret
     * @param defaultValue Default value if secret not found
     * @return The secret value or default
     */
    public String getSecretOrDefault(String secretName, String defaultValue) {
        String value = getSecret(secretName);
        return value != null ? value : defaultValue;
    }

    /**
     * Check if a secret is present
     * 
     * @param secretName The name of the secret
     * @return true if secret is present, false otherwise
     */
    public boolean hasSecret(String secretName) {
        String value = environment.getProperty(secretName);
        return value != null && !value.trim().isEmpty();
    }

    /**
     * Get all missing secrets (for reporting)
     * 
     * @return Set of missing secret names
     */
    public Set<String> getMissingSecrets() {
        return new HashSet<>(missingSecrets);
    }

    /**
     * Check if we're running in production
     * 
     * @return true if production profile is active
     */
    public boolean isProduction() {
        return isProduction;
    }
}

