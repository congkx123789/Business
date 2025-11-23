package com.selfcar.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import jakarta.annotation.PostConstruct;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Slf4j
@Component
public class JwtTokenProvider {

    @Value("${jwt.secret:selfcar_dev_secret_change_me_aaaaaaaaaaaaaaaaaaaaaaaaaaaa}")
    private String jwtSecret;

    @Value("${jwt.expiration:900000}") // 15 minutes default
    private long jwtExpiration;
    
    @Value("${jwt.refresh-expiration:604800000}") // 7 days default
    private long refreshTokenExpiration;

    @Value("${spring.profiles.active:dev}")
    private String activeProfile;

    /**
     * Validates JWT secret on application startup
     * Enforces minimum 32 characters in production
     */
    @PostConstruct
    public void validateJwtSecret() {
        if (jwtSecret == null || jwtSecret.trim().isEmpty()) {
            throw new IllegalStateException(
                "JWT secret is not configured. Please set jwt.secret property or JWT_SECRET environment variable."
            );
        }
        
        // In production, enforce minimum 32 characters (256 bits)
        if ("prod".equals(activeProfile) && jwtSecret.length() < 32) {
            throw new IllegalStateException(
                String.format(
                    "JWT secret must be at least 32 characters (256 bits) in production. " +
                    "Current length: %d. Set JWT_SECRET environment variable with a secure random string.",
                    jwtSecret.length()
                )
            );
        }
        
        // In dev/staging, warn but don't fail
        if (!"prod".equals(activeProfile) && jwtSecret.length() < 32) {
            log.warn(
                "JWT secret is less than 32 characters (current: {}). " +
                "For production, use a secret at least 256 bits (32 characters).",
                jwtSecret.length()
            );
        }
    }

    private SecretKey getSigningKey() {
        if (jwtSecret == null || jwtSecret.trim().isEmpty()) {
            throw new IllegalStateException("JWT secret is not configured. Please set jwt.secret property.");
        }
        
        try {
            return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            log.error("Failed to create JWT signing key", e);
            throw new IllegalStateException("Invalid JWT secret configuration", e);
        }
    }

    public String generateToken(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new IllegalArgumentException("Authentication cannot be null");
        }
        
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        
        if (userPrincipal.getId() == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }

        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpiration);

        return Jwts.builder()
                .subject(Long.toString(userPrincipal.getId()))
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    public Long getUserIdFromToken(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            String subject = claims.getSubject();
            if (subject == null || subject.trim().isEmpty()) {
                log.warn("JWT token has empty subject");
                throw new IllegalArgumentException("Invalid token: empty subject");
            }
            
            return Long.parseLong(subject);
        } catch (NumberFormatException e) {
            log.error("Invalid user ID format in token", e);
            throw new IllegalArgumentException("Invalid token: malformed user ID", e);
        } catch (JwtException e) {
            log.error("JWT parsing error", e);
            throw new IllegalArgumentException("Invalid token", e);
        }
    }

    public boolean validateToken(String token) {
        try {
            if (token == null || token.trim().isEmpty()) {
                return false;
            }
            
            Claims claims = Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            
            // Additional validation: check expiration explicitly
            Date expiration = claims.getExpiration();
            if (expiration != null && expiration.before(new Date())) {
                log.debug("Token has expired");
                return false;
            }
            
            return true;
        } catch (ExpiredJwtException e) {
            log.debug("Token expired: {}", e.getMessage());
            return false;
        } catch (JwtException | IllegalArgumentException e) {
            log.debug("Invalid token: {}", e.getMessage());
            return false;
        } catch (Exception e) {
            log.error("Unexpected error validating token", e);
            return false;
        }
    }
}

