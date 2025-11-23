package com.selfcar.validation;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.regex.Pattern;

/**
 * Centralized Validation Service
 * 
 * Provides consistent validation across the application with configurable limits.
 * Prevents injection attacks and DoS through size/format restrictions.
 */
@Slf4j
@Service
public class ValidationService {

    @Value("${validation.string.max-length:1000}")
    private int maxStringLength;

    @Value("${validation.email.max-length:255}")
    private int maxEmailLength;

    @Value("${validation.password.min-length:8}")
    private int minPasswordLength;

    @Value("${validation.password.max-length:128}")
    private int maxPasswordLength;

    @Value("${validation.array.max-size:100}")
    private int maxArraySize;

    @Value("${validation.request-body.max-size:1048576}") // 1MB
    private int maxRequestBodySize;

    // Allow-list patterns
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
    );

    private static final Pattern ALPHANUMERIC_PATTERN = Pattern.compile("^[a-zA-Z0-9]+$");
    
    private static final Pattern SAFE_STRING_PATTERN = Pattern.compile("^[a-zA-Z0-9\\s._-]+$");

    /**
     * Validates email format and length
     */
    public boolean isValidEmail(String email) {
        if (email == null || email.isEmpty()) {
            return false;
        }
        
        if (email.length() > maxEmailLength) {
            log.warn("Email exceeds maximum length: {}", email.length());
            return false;
        }
        
        return EMAIL_PATTERN.matcher(email).matches();
    }

    /**
     * Validates password strength
     */
    public boolean isValidPassword(String password) {
        if (password == null) {
            return false;
        }
        
        if (password.length() < minPasswordLength) {
            log.warn("Password too short: {} characters", password.length());
            return false;
        }
        
        if (password.length() > maxPasswordLength) {
            log.warn("Password too long: {} characters", password.length());
            return false;
        }
        
        // Additional checks: at least one letter and one number
        boolean hasLetter = password.chars().anyMatch(Character::isLetter);
        boolean hasDigit = password.chars().anyMatch(Character::isDigit);
        
        return hasLetter && hasDigit;
    }

    /**
     * Validates string length
     */
    public boolean isValidStringLength(String value, int maxLength) {
        if (value == null) {
            return true; // Null is valid, use @NotNull for required fields
        }
        
        if (value.length() > maxLength) {
            log.warn("String exceeds maximum length: {} > {}", value.length(), maxLength);
            return false;
        }
        
        return true;
    }

    /**
     * Validates string length with default max
     */
    public boolean isValidStringLength(String value) {
        return isValidStringLength(value, maxStringLength);
    }

    /**
     * Validates array size
     */
    public <T> boolean isValidArraySize(T[] array) {
        if (array == null) {
            return true;
        }
        
        if (array.length > maxArraySize) {
            log.warn("Array exceeds maximum size: {} > {}", array.length, maxArraySize);
            return false;
        }
        
        return true;
    }

    /**
     * Validates request body size
     */
    public boolean isValidRequestBodySize(int size) {
        if (size > maxRequestBodySize) {
            log.warn("Request body exceeds maximum size: {} > {}", size, maxRequestBodySize);
            return false;
        }
        
        return true;
    }

    /**
     * Validates alphanumeric string (allow-list approach)
     */
    public boolean isAlphanumeric(String value) {
        if (value == null || value.isEmpty()) {
            return false;
        }
        
        return ALPHANUMERIC_PATTERN.matcher(value).matches();
    }

    /**
     * Validates safe string (allows letters, numbers, spaces, dots, underscores, hyphens)
     */
    public boolean isSafeString(String value) {
        if (value == null || value.isEmpty()) {
            return false;
        }
        
        return SAFE_STRING_PATTERN.matcher(value).matches();
    }

    /**
     * Sanitizes string by removing potentially dangerous characters
     * Use validation instead of sanitization when possible
     */
    public String sanitizeString(String value) {
        if (value == null) {
            return null;
        }
        
        // Remove control characters and normalize whitespace
        return value.replaceAll("[\\x00-\\x1F\\x7F]", "")
                   .replaceAll("\\s+", " ")
                   .trim();
    }
}

