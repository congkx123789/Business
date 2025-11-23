package com.selfcar.security;

import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
class RateLimitingServiceTest {

    @Mock
    private SecurityEventLogger securityEventLogger;

    @InjectMocks
    private RateLimitingService rateLimitingService;

    @BeforeEach
    void setup() {
        // Make windows small for fast tests
        ReflectionTestUtils.setField(rateLimitingService, "loginMaxRequests", 2);
        ReflectionTestUtils.setField(rateLimitingService, "loginWindowSeconds", 10);
        ReflectionTestUtils.setField(rateLimitingService, "apiMaxRequests", 2);
        ReflectionTestUtils.setField(rateLimitingService, "apiWindowSeconds", 10);
    }

    @Test
    @DisplayName("isLoginAllowed enforces max requests within window")
    void loginRateLimit() {
        String id = "USER:1";
        assertThat(rateLimitingService.isLoginAllowed(id)).isTrue();
        assertThat(rateLimitingService.isLoginAllowed(id)).isTrue();
        assertThat(rateLimitingService.isLoginAllowed(id)).isFalse();

        Mockito.verify(securityEventLogger).logRateLimitExceeded(Mockito.contains("LOGIN:"), Mockito.anyInt(), Mockito.eq(2));
    }

    @Test
    @DisplayName("getClientIdentifier prefers userId over IP headers")
    void getClientIdentifier_userOverIp() {
        HttpServletRequest request = Mockito.mock(HttpServletRequest.class);
        String id = rateLimitingService.getClientIdentifier(request, 99L);
        assertThat(id).isEqualTo("USER:99");
    }

    @Test
    @DisplayName("getClientIdentifier extracts original client IP from headers")
    void getClientIdentifier_fromHeaders() {
        HttpServletRequest request = Mockito.mock(HttpServletRequest.class);
        Mockito.when(request.getHeader("X-Forwarded-For")).thenReturn("2.2.2.2, 3.3.3.3");
        String id = rateLimitingService.getClientIdentifier(request, null);
        assertThat(id).isEqualTo("IP:2.2.2.2");
    }
}


