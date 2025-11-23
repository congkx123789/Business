package com.selfcar.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Security Headers Filter
 * 
 * Adds security headers including Content Security Policy (CSP) to all responses.
 * Implements PCI DSS 4.0 6.4.3 & 11.6.1 requirements.
 */
@Component
@Order(1) // Execute before other filters
@RequiredArgsConstructor
public class SecurityHeadersConfig extends OncePerRequestFilter {

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${app.security.csp.report-only:false}")
    private boolean cspReportOnly;

    @Value("${app.security.csp.report-endpoint:/api/security/csp-report}")
    private String cspReportEndpoint;

    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                   HttpServletResponse response,
                                   FilterChain filterChain) throws ServletException, IOException {
        
        // Content Security Policy (CSP) - Strict policy for payment pages
        String path = request.getRequestURI();
        boolean isPaymentPage = path.contains("/payment") || path.contains("/checkout");
        
        if (isPaymentPage) {
            // Strict CSP for payment pages (PCI DSS 4.0 6.4.3). No unsafe-inline/eval.
            setCspHeader(response,
                "default-src 'self'; " +
                "script-src 'self' https://*.momo.vn https://*.zalopay.vn https://js.stripe.com; " +
                "style-src 'self'; " +
                "img-src 'self' data: https:; " +
                "font-src 'self' data:; " +
                "connect-src 'self' " + frontendUrl + " https://*.momo.vn https://*.zalopay.vn https://api.stripe.com; " +
                "frame-src https://*.stripe.com; " +
                "object-src 'none'; " +
                "base-uri 'self'; " +
                "form-action 'self'; " +
                "frame-ancestors 'none'; " +
                "report-uri " + cspReportEndpoint + "; " +
                "upgrade-insecure-requests"
            );
        } else {
            // Standard CSP for other pages (no unsafe-inline)
            setCspHeader(response,
                "default-src 'self'; " +
                "script-src 'self'; " +
                "style-src 'self'; " +
                "img-src 'self' data: https:; " +
                "font-src 'self' data:; " +
                "connect-src 'self' " + frontendUrl + "; " +
                "frame-ancestors 'none'; " +
                "report-uri " + cspReportEndpoint + "; " +
                "upgrade-insecure-requests"
            );
        }

        // Other security headers
        response.setHeader("X-Content-Type-Options", "nosniff");
        response.setHeader("X-Frame-Options", "DENY");
        response.setHeader("X-XSS-Protection", "1; mode=block");
        response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
        response.setHeader("Permissions-Policy", 
            "geolocation=(), microphone=(), camera=(), payment=(self)");
        
        // HSTS (only for HTTPS)
        if (request.isSecure()) {
            response.setHeader("Strict-Transport-Security", 
                "max-age=31536000; includeSubDomains; preload");
        }

        filterChain.doFilter(request, response);
    }

    private void setCspHeader(HttpServletResponse response, String policy) {
        if (cspReportOnly) {
            response.setHeader("Content-Security-Policy-Report-Only", policy);
        } else {
            response.setHeader("Content-Security-Policy", policy);
        }
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        // Filter all requests (including API endpoints)
        return false;
    }
}

