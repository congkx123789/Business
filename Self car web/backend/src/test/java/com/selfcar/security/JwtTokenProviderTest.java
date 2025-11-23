package com.selfcar.security;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {

    @Test
    void validateJwtSecret_throwsInProdWhenTooShort() {
        JwtTokenProvider provider = new JwtTokenProvider();
        // Reflectively set fields (no Spring context)
        setField(provider, "jwtSecret", "short-secret");
        setField(provider, "activeProfile", "prod");

        IllegalStateException ex = assertThrows(IllegalStateException.class, provider::validateJwtSecret);
        assertTrue(ex.getMessage().contains("at least 32 characters"));
    }

    @Test
    void validateJwtSecret_allowsProdWhenStrong() {
        JwtTokenProvider provider = new JwtTokenProvider();
        setField(provider, "jwtSecret", "x".repeat(32));
        setField(provider, "activeProfile", "prod");

        assertDoesNotThrow(provider::validateJwtSecret);
    }

    private static void setField(Object target, String field, Object value) {
        try {
            java.lang.reflect.Field f = target.getClass().getDeclaredField(field);
            f.setAccessible(true);
            f.set(target, value);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}


