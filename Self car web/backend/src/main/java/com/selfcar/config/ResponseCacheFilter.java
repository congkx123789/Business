package com.selfcar.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Response Cache Filter
 * 
 * Adds cache-related headers to all responses
 * Ensures consistent caching behavior across all endpoints
 */
@Slf4j
@Component
@Order(1)
public class ResponseCacheFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                   HttpServletResponse response, 
                                   FilterChain filterChain) 
            throws ServletException, IOException {
        
        // Let the request proceed
        filterChain.doFilter(request, response);

        // Add cache headers if not already set
        if (response.getHeader("Cache-Control") == null) {
            // Default: no cache for dynamic content
            response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        }

        // Add security headers
        response.setHeader("X-Content-Type-Options", "nosniff");
        response.setHeader("X-Frame-Options", "DENY");
        response.setHeader("X-XSS-Protection", "1; mode=block");
    }
}

