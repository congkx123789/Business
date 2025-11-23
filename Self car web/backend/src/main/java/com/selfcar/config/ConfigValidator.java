package com.selfcar.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Configuration Validator
 * 
 * Validates all required configuration on application startup.
 * Ensures production deployments have all necessary environment variables set.
 */
@Slf4j
@Component
public class ConfigValidator {

    private final Environment environment;
    private final String activeProfile;

    public ConfigValidator(Environment environment,
                           @Value("${spring.profiles.active:dev}") String activeProfile) {
        this.environment = environment;
        this.activeProfile = activeProfile;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void validateConfiguration() {
        log.info("Validating configuration for profile: {}", activeProfile);
        
        List<String> errors = new ArrayList<>();
        List<String> warnings = new ArrayList<>();

        // Critical validations (fail startup if missing in production)
        if ("prod".equals(activeProfile)) {
            validateProductionConfig(errors);
        } else {
            validateDevelopmentConfig(warnings);
        }

        // Always validate JWT secret
        validateJwtSecret(errors, warnings);

        // Log warnings
        if (!warnings.isEmpty()) {
            log.warn("Configuration warnings:");
            warnings.forEach(warning -> log.warn("  - {}", warning));
        }

        // Fail if critical errors in production
        if (!errors.isEmpty()) {
            log.error("Configuration validation failed:");
            errors.forEach(error -> log.error("  - {}", error));
            
            if ("prod".equals(activeProfile)) {
                throw new IllegalStateException(
                    "Configuration validation failed. Fix the following issues:\n" +
                    String.join("\n", errors)
                );
            }
        }

        if (errors.isEmpty() && warnings.isEmpty()) {
            log.info("Configuration validation passed");
        }
    }

    private void validateProductionConfig(List<String> errors) {
        // Database configuration
        String dbUrl = environment.getProperty("spring.datasource.url");
        if (dbUrl == null || dbUrl.contains("localhost") || dbUrl.contains("127.0.0.1")) {
            errors.add("Database URL must be set and not use localhost in production");
        }

        String dbUsername = environment.getProperty("spring.datasource.username");
        if (dbUsername == null || dbUsername.equals("root")) {
            errors.add("Database username must be set and not be 'root' in production");
        }

        String dbPassword = environment.getProperty("spring.datasource.password");
        if (dbPassword == null || dbPassword.length() < 12) {
            errors.add("Database password must be set and at least 12 characters in production");
        }

        // Frontend URL
        String frontendUrl = environment.getProperty("app.frontend.url");
        if (frontendUrl == null || frontendUrl.contains("localhost")) {
            errors.add("Frontend URL must be set and not use localhost in production");
        }

        // CORS configuration
        String corsOrigins = environment.getProperty("spring.web.cors.allowed-origins");
        if (corsOrigins == null || corsOrigins.contains("localhost")) {
            errors.add("CORS allowed origins must be set and not include localhost in production");
        }

        // Payment gateway (if enabled)
        String momoPartnerCode = environment.getProperty("payment.momo.partner-code");
        if (momoPartnerCode != null && !momoPartnerCode.isEmpty()) {
            String momoSecretKey = environment.getProperty("payment.momo.secret-key");
            if (momoSecretKey == null || momoSecretKey.isEmpty()) {
                errors.add("Momo secret key must be set if Momo is configured");
            }
        }

        // TLS hardening (if TLS termination at app)
        String sslEnabled = environment.getProperty("server.ssl.enabled");
        if ("true".equalsIgnoreCase(sslEnabled)) {
            String ciphers = environment.getProperty("server.ssl.ciphers", "");
            if (ciphers.contains("TLS_RSA") || ciphers.contains("TLSv1") || ciphers.contains("TLSv1.1")) {
                errors.add("Weak TLS ciphers/protocols detected. Disable TLSv1/1.1 and RSA key exchange");
            }
        }

        // Telemetry guards: ensure no PAN in logs (advisory)
        String logLevel = environment.getProperty("logging.level.com.selfcar", "INFO");
        if ("DEBUG".equalsIgnoreCase(logLevel)) {
            errors.add("Production logging level should not be DEBUG to reduce data exposure risk");
        }
    }

    private void validateDevelopmentConfig(List<String> warnings) {
        // Development warnings (non-blocking)
        String jwtSecret = environment.getProperty("jwt.secret");
        if (jwtSecret != null && jwtSecret.length() < 32) {
            warnings.add("JWT secret is less than 32 characters (dev mode - not blocking)");
        }

        String dbPassword = environment.getProperty("spring.datasource.password");
        if (dbPassword != null && dbPassword.equals("password")) {
            warnings.add("Using default database password 'password' - change for production");
        }
    }

    private void validateJwtSecret(List<String> errors, List<String> warnings) {
        String jwtSecret = environment.getProperty("jwt.secret");
        
        if (jwtSecret == null || jwtSecret.trim().isEmpty()) {
            errors.add("JWT secret is not configured");
            return;
        }

        if (jwtSecret.length() < 32) {
            String message = String.format(
                "JWT secret is only %d characters. Minimum 32 characters (256 bits) required.",
                jwtSecret.length()
            );
            
            if ("prod".equals(activeProfile)) {
                errors.add(message);
            } else {
                warnings.add(message);
            }
        }

        // Check for common weak secrets
        String[] weakSecrets = {
            "secret", "password", "123456", "changeme", "default",
            "selfcar_secret_key", "dev_secret"
        };
        
        for (String weak : weakSecrets) {
            if (jwtSecret.toLowerCase().contains(weak.toLowerCase())) {
                warnings.add("JWT secret appears to be weak (contains common words)");
                break;
            }
        }
    }
}

