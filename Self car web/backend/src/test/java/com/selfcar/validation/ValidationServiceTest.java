package com.selfcar.validation;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ValidationServiceTest {

    private ValidationService validationService;

    @BeforeEach
    void setup() {
        validationService = new ValidationService();
        // Inject default-property-backed fields via reflection for unit test
        set(validationService, "maxStringLength", 10);
        set(validationService, "maxEmailLength", 255);
        set(validationService, "minPasswordLength", 6);
        set(validationService, "maxPasswordLength", 20);
        set(validationService, "maxArraySize", 3);
        set(validationService, "maxRequestBodySize", 100);
    }

    private static void set(Object target, String field, Object value) {
        try {
            var f = target.getClass().getDeclaredField(field);
            f.setAccessible(true);
            f.set(target, value);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Test
    @DisplayName("Email validation succeeds for proper email and fails for invalid/long")
    void emailValidation() {
        assertThat(validationService.isValidEmail("john@example.com")).isTrue();
        assertThat(validationService.isValidEmail("bad@domain")).isFalse();
        String longEmail = "a".repeat(256) + "@example.com";
        assertThat(validationService.isValidEmail(longEmail)).isFalse();
    }

    @Test
    @DisplayName("Password validation respects length and composition")
    void passwordValidation() {
        assertThat(validationService.isValidPassword("abc123")).isTrue();
        assertThat(validationService.isValidPassword("short")).isFalse();
        assertThat(validationService.isValidPassword("allletters")).isFalse();
        assertThat(validationService.isValidPassword("1234567")).isFalse();
        assertThat(validationService.isValidPassword("a".repeat(25))).isFalse();
    }

    @Test
    @DisplayName("String length checks respect limits and null allowed")
    void stringLength() {
        assertThat(validationService.isValidStringLength(null)).isTrue();
        assertThat(validationService.isValidStringLength("12345")).isTrue();
        assertThat(validationService.isValidStringLength("01234567890")).isFalse();
        assertThat(validationService.isValidStringLength("abcd", 3)).isFalse();
    }

    @Test
    @DisplayName("Array size validates against max size")
    void arraySize() {
        Integer[] ok = {1,2,3};
        Integer[] tooMany = {1,2,3,4};
        assertThat(validationService.isValidArraySize(ok)).isTrue();
        assertThat(validationService.isValidArraySize(tooMany)).isFalse();
    }

    @Test
    @DisplayName("Request body size is limited by max")
    void requestBodySize() {
        assertThat(validationService.isValidRequestBodySize(50)).isTrue();
        assertThat(validationService.isValidRequestBodySize(101)).isFalse();
    }

    @Test
    @DisplayName("Alphanumeric and safe string patterns")
    void patterns() {
        assertThat(validationService.isAlphanumeric("ABC123")).isTrue();
        assertThat(validationService.isAlphanumeric("ABC-123")).isFalse();
        assertThat(validationService.isSafeString("Name_1-2.3 ok")).isTrue();
        assertThat(validationService.isSafeString("Bad!@#")).isFalse();
    }

    @Test
    @DisplayName("Sanitize removes control chars and collapses whitespace")
    void sanitize() {
        String dirty = "a\u0001b   c\n";
        assertThat(validationService.sanitizeString(dirty)).isEqualTo("ab c");
    }
}


