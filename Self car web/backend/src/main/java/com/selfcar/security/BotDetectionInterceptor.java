package com.selfcar.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Bot Detection Interceptor
 * 
 * Analyzes requests for bot indicators and challenges suspicious traffic.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class BotDetectionInterceptor implements HandlerInterceptor {

    private final BotDetectionService botDetectionService;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, 
                            Object handler) throws Exception {
        // Skip bot detection for health checks and static resources
        String path = request.getRequestURI();
        if (path.startsWith("/api/health") || path.startsWith("/static")) {
            return true;
        }

        BotDetectionService.BotDetectionResult result = botDetectionService.analyzeRequest(request);

        if (!result.isAllowed()) {
            log.warn("Bot detected - blocking request from: {}", request.getRemoteAddr());
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.getWriter().write("{\"error\":\"Access denied\"}");
            response.setContentType("application/json");
            return false;
        }

        if (result.isRequiresChallenge()) {
            // In production, this would trigger a CAPTCHA or similar challenge
            // For now, we log it and allow the request
            log.info("Bot challenge required for: {} (risk score: {})", 
                request.getRemoteAddr(), result.getRiskScore());
            // Could add a custom header to trigger client-side challenge
            response.setHeader("X-Bot-Challenge", "required");
        }

        return true;
    }
}

