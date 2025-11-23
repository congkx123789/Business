package com.selfcar.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Rate Limiting Interceptor
 * 
 * Intercepts requests and enforces rate limits before processing.
 * Returns 429 Too Many Requests when rate limit is exceeded.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RateLimitInterceptor implements HandlerInterceptor {

    private final RateLimitingService rateLimitingService;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, 
                            Object handler) throws Exception {
        String path = request.getRequestURI();

        String identifier = rateLimitingService.getClientIdentifier(request, SecurityUtils.getCurrentUserId());

        // Check global rate limit
        if (!rateLimitingService.isGlobalAllowed(identifier)) {
            log.warn("Global rate limit exceeded for: {}", identifier);
            response.setStatus(429); // Too Many Requests
            response.setHeader("Retry-After", "60");
            response.getWriter().write("{\"error\":\"Rate limit exceeded. Please try again later.\"}");
            response.setContentType("application/json");
            return false;
        }

        // Check endpoint-specific rate limits
        if (path.contains("/api/auth/login")) {
            if (!rateLimitingService.isLoginAllowed(identifier)) {
                log.warn("Login rate limit exceeded for: {}", identifier);
                response.setStatus(429); // Too Many Requests
                response.setHeader("Retry-After", "60");
                response.getWriter().write("{\"error\":\"Too many login attempts. Please try again later.\"}");
                response.setContentType("application/json");
                return false;
            }
        } else if (path.contains("/api/auth/otp") || path.contains("/api/auth/verify-otp")) {
            if (!rateLimitingService.isOtpAllowed(identifier)) {
                log.warn("OTP rate limit exceeded for: {}", identifier);
                response.setStatus(429); // Too Many Requests
                response.setHeader("Retry-After", "300");
                response.getWriter().write("{\"error\":\"Too many OTP requests. Please try again later.\"}");
                response.setContentType("application/json");
                return false;
            }
        } else if (path.contains("/api/cars/search") || path.contains("/api/cars") && "GET".equals(request.getMethod())) {
            if (!rateLimitingService.isSearchAllowed(identifier)) {
                log.warn("Search rate limit exceeded for: {}", identifier);
                response.setStatus(429); // Too Many Requests
                response.setHeader("Retry-After", "60");
                response.getWriter().write("{\"error\":\"Search rate limit exceeded. Please try again later.\"}");
                response.setContentType("application/json");
                return false;
            }
        } else if (path.startsWith("/api/")) {
            if (!rateLimitingService.isApiAllowed(identifier)) {
                log.warn("API rate limit exceeded for: {}", identifier);
                response.setStatus(429); // Too Many Requests
                response.setHeader("Retry-After", "60");
                response.getWriter().write("{\"error\":\"API rate limit exceeded. Please try again later.\"}");
                response.setContentType("application/json");
                return false;
            }
        }

        return true;
    }
}

