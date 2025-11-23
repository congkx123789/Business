package com.selfcar.controller.health;

import com.selfcar.dto.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Health Check Controller
 * 
 * Provides health check endpoints for monitoring and load balancers.
 * Implements readiness and liveness probes.
 */
@Slf4j
@RestController
@RequestMapping("/api/health")
@RequiredArgsConstructor
public class HealthController {

    private final DataSource dataSource;

    @Value("${spring.application.name:selfcar-backend}")
    private String applicationName;

    @Value("${spring.profiles.active:dev}")
    private String activeProfile;

    /**
     * Basic health check endpoint
     * Returns 200 if application is running
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("application", applicationName);
        health.put("profile", activeProfile);
        health.put("timestamp", LocalDateTime.now());
        return ResponseEntity.ok(health);
    }

    /**
     * Liveness probe
     * Indicates if the application is alive (should always return 200)
     */
    @GetMapping("/liveness")
    public ResponseEntity<Map<String, Object>> liveness() {
        Map<String, Object> status = new HashMap<>();
        status.put("status", "ALIVE");
        status.put("timestamp", LocalDateTime.now());
        return ResponseEntity.ok(status);
    }

    /**
     * Readiness probe
     * Indicates if the application is ready to serve traffic
     * Checks database connectivity
     */
    @GetMapping("/readiness")
    public ResponseEntity<?> readiness() {
        Map<String, Object> status = new HashMap<>();
        status.put("status", "READY");
        status.put("timestamp", LocalDateTime.now());
        
        // Check database connectivity
        boolean dbHealthy = checkDatabaseHealth();
        status.put("database", dbHealthy ? "UP" : "DOWN");
        
        if (!dbHealthy) {
            status.put("status", "NOT_READY");
            return ResponseEntity.status(503).body(status);
        }
        
        return ResponseEntity.ok(status);
    }

    /**
     * Configuration health check
     * Returns configuration status without exposing sensitive values
     */
    @GetMapping("/config")
    public ResponseEntity<Map<String, Object>> configHealth() {
        Map<String, Object> config = new HashMap<>();
        
        // Check if critical configs are set (without exposing values)
        config.put("jwt_secret_configured", isPropertySet("jwt.secret"));
        config.put("database_configured", isPropertySet("spring.datasource.url"));
        config.put("frontend_url_configured", isPropertySet("app.frontend.url"));
        config.put("profile", activeProfile);
        
        // Check JWT secret strength (length only)
        String jwtSecret = System.getenv("JWT_SECRET");
        if (jwtSecret == null) {
            jwtSecret = System.getProperty("jwt.secret");
        }
        if (jwtSecret != null) {
            config.put("jwt_secret_length", jwtSecret.length());
            config.put("jwt_secret_strong", jwtSecret.length() >= 32);
        }
        
        return ResponseEntity.ok(config);
    }

    /**
     * Checks database connectivity
     */
    private boolean checkDatabaseHealth() {
        try (Connection connection = dataSource.getConnection()) {
            return connection.isValid(2); // 2 second timeout
        } catch (SQLException e) {
            log.error("Database health check failed", e);
            return false;
        }
    }

    /**
     * Checks if a property is set (without exposing value)
     */
    private boolean isPropertySet(String property) {
        try {
            String value = System.getenv(property.toUpperCase().replace(".", "_"));
            if (value == null) {
                value = System.getProperty(property);
            }
            return value != null && !value.trim().isEmpty();
        } catch (Exception e) {
            return false;
        }
    }
}

