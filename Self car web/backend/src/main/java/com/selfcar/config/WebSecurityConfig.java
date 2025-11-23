package com.selfcar.config;

import com.selfcar.security.BotDetectionInterceptor;
import com.selfcar.security.MfaEnforcementInterceptor;
import com.selfcar.security.RateLimitInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web Security Configuration
 * 
 * Registers security interceptors for rate limiting and bot detection.
 */
@Configuration
@RequiredArgsConstructor
public class WebSecurityConfig implements WebMvcConfigurer {

    private final RateLimitInterceptor rateLimitInterceptor;
    private final BotDetectionInterceptor botDetectionInterceptor;
    private final PaymentPageSecurityConfig paymentPageSecurityConfig;
    private final MfaEnforcementInterceptor mfaEnforcementInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // Payment page security (CSP headers) - should run first
        registry.addInterceptor(paymentPageSecurityConfig)
            .addPathPatterns("/payment/**", "/checkout/**", "/pay/**", "/api/payments/**");

        // Bot detection should run before rate limiting
        registry.addInterceptor(botDetectionInterceptor)
            .addPathPatterns("/api/**")
            .excludePathPatterns("/api/health/**");

        // Rate limiting
        registry.addInterceptor(rateLimitInterceptor)
            .addPathPatterns("/api/**")
            .excludePathPatterns("/api/health/**");

        // MFA enforcement for payment/admin routes
        registry.addInterceptor(mfaEnforcementInterceptor)
            .addPathPatterns("/api/payments/**", "/api/admin/**");
    }
}

