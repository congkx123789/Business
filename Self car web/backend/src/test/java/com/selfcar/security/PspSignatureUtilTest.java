package com.selfcar.security;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class PspSignatureUtilTest {

    @Test
    @DisplayName("hmacSha256Hex produces expected hex output for known vector")
    void hmacKnownVector() {
        String secret = "key";
        String message = "The quick brown fox jumps over the lazy dog";
        // Known HMAC-SHA256 with key="key":
        // Computed via OpenSSL: 0f:...:d7
        String expected = "f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8";
        String actual = PspSignatureUtil.hmacSha256Hex(secret, message);
        assertThat(actual).isEqualTo(expected);
    }

    @Test
    @DisplayName("timingSafeEquals correctly compares strings")
    void timingSafeEquals() {
        assertThat(PspSignatureUtil.timingSafeEquals("abc", "abc")).isTrue();
        assertThat(PspSignatureUtil.timingSafeEquals("abc", "abd")).isFalse();
        assertThat(PspSignatureUtil.timingSafeEquals(null, "abc")).isFalse();
        assertThat(PspSignatureUtil.timingSafeEquals("", "")).isTrue();
    }
}


