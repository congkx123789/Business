package com.selfcar.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * MFA Enforcement for payment-adjacent routes (Req 7–8).
 * Expects an upstream IdP/reverse-proxy to set X-MFA-Verified:true when MFA is satisfied.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class MfaEnforcementInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String path = request.getRequestURI();
        if (path.startsWith("/api/payments") || path.startsWith("/api/admin")) {
            String mfa = request.getHeader("X-MFA-Verified");
            if (!"true".equalsIgnoreCase(mfa)) {
                log.warn("MFA required on {} but missing header", path);
                response.setStatus(401);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"MFA required\"}");
                return false;
            }
        }
        return true;
    }
}


