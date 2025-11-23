package com.selfcar.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

/**
 * Database Security Configuration
 * 
 * Validates database security configuration and ensures least-privilege principles.
 * 
 * Owner: DevOps
 * 
 * Requirements:
 * - Database should be in private network
 * - Use least-privileged database users per service
 * - No direct internet access to database
 * - Security groups restrict access to application servers only
 */
@Slf4j
@Component
public class DatabaseSecurityConfig {

    private final Environment environment;

    @Value("${spring.profiles.active:dev}")
    private String activeProfile;

    @Value("${spring.datasource.username:}")
    private String dbUsername;

    @Value("${db.security.least-privilege.enabled:true}")
    private boolean leastPrivilegeEnabled;

    public DatabaseSecurityConfig(Environment environment) {
        this.environment = environment;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void validateDatabaseSecurity() {
        if (!"prod".equals(activeProfile)) {
            log.debug("Database security validation skipped for non-production environment");
            return;
        }

        log.info("Validating database security configuration...");

        // Check if using least-privileged user
        if (leastPrivilegeEnabled) {
            validateLeastPrivilegeUser();
        }

        // Check database URL (should not be localhost in production)
        String dbUrl = environment.getProperty("spring.datasource.url");
        if (dbUrl != null && (dbUrl.contains("localhost") || dbUrl.contains("127.0.0.1"))) {
            log.warn("Database URL contains localhost - ensure database is in private network");
        }

        // Check if username is 'root' (should not be in production)
        if ("root".equals(dbUsername)) {
            log.error("CRITICAL: Using 'root' database user in production. " +
                    "This violates least-privilege principle. Use service-specific users.");
        }

        log.info("Database security validation completed");
    }

    /**
     * Validate that we're using a least-privileged database user
     */
    private void validateLeastPrivilegeUser() {
        if (dbUsername == null || dbUsername.trim().isEmpty()) {
            log.warn("Database username is not set");
            return;
        }

        // Common privileged usernames to avoid
        String[] privilegedUsers = {"root", "admin", "administrator", "sa"};
        for (String privileged : privilegedUsers) {
            if (privileged.equalsIgnoreCase(dbUsername)) {
                log.error("CRITICAL: Using privileged database user '{}' in production. " +
                        "Create and use least-privileged service-specific users.", dbUsername);
                break;
            }
        }

        // Log current user (don't log password)
        log.info("Database connection using user: {}", dbUsername);
        
        // Suggest service-specific naming convention
        if (!dbUsername.contains("_user") && !dbUsername.contains("_service")) {
            log.info("Consider using service-specific user naming convention " +
                    "(e.g., 'app_user', 'readonly_user', 'analytics_user')");
        }
    }

    /**
     * Get recommended database user permissions for application user
     * 
     * @return SQL statements for creating least-privileged user
     */
    public static String getRecommendedAppUserPermissions() {
        return """
            -- Create application user with least privileges
            CREATE USER 'app_user'@'%' IDENTIFIED BY 'secure_password_here';
            
            -- Grant only necessary permissions
            GRANT SELECT, INSERT, UPDATE, DELETE ON selfcar_db.* TO 'app_user'@'%';
            
            -- Revoke dangerous permissions
            REVOKE DROP, CREATE, ALTER, INDEX, REFERENCES ON *.* FROM 'app_user'@'%';
            
            -- Flush privileges
            FLUSH PRIVILEGES;
            """;
    }

    /**
     * Get recommended database user permissions for read-only user
     */
    public static String getRecommendedReadOnlyUserPermissions() {
        return """
            -- Create read-only user for reporting/analytics
            CREATE USER 'readonly_user'@'%' IDENTIFIED BY 'secure_password_here';
            
            -- Grant only SELECT permission
            GRANT SELECT ON selfcar_db.* TO 'readonly_user'@'%';
            
            -- Flush privileges
            FLUSH PRIVILEGES;
            """;
    }
}

