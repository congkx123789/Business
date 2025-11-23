package com.selfcar.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Cache-Control Header Configuration
 * 
 * Layer 1: Browser Cache - 7-30 days for static assets
 * Layer 2: CDN Cache - 1-7 days for assets (configured in CloudFront)
 * Layer 3: API Gateway Cache - 5-15 minutes (if using API Gateway)
 * Layer 4: Application Cache - 15-60 minutes (configured in CacheConfig)
 * Layer 5: Database - No caching, always fresh
 * 
 * Defense-in-depth: Each layer shields the costlier layer below
 */
@Slf4j
@Component
public class CacheControlConfig implements WebMvcConfigurer, HandlerInterceptor {

    // Cache-Control constants
    private static final String CACHE_STATIC = "public, max-age=2592000, immutable"; // 30 days
    private static final String CACHE_CDN_ONLY = "public, max-age=604800, s-maxage=604800"; // 7 days
    private static final String CACHE_SEMI_STATIC = "public, max-age=86400, s-maxage=86400"; // 1 day
    private static final String CACHE_DYNAMIC = "public, max-age=900, s-maxage=900"; // 15 minutes
    private static final String CACHE_INVENTORY = "public, max-age=600, s-maxage=600"; // 10 minutes
    private static final String CACHE_REALTIME = "public, max-age=300, s-maxage=300"; // 5 minutes
    private static final String NO_CACHE = "no-cache, no-store, must-revalidate";

    @Override
    public void addInterceptors(@NonNull InterceptorRegistry registry) {
        registry.addInterceptor(this)
                .addPathPatterns("/api/**")
                .excludePathPatterns(
                        "/api/auth/**",
                        "/api/metrics/**",
                        "/actuator/**"
                );
    }

    @Override
    public boolean preHandle(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull Object handler) {
        String path = request.getRequestURI();
        String method = request.getMethod();

        // Don't cache non-GET requests
        if (!"GET".equals(method)) {
            response.setHeader("Cache-Control", NO_CACHE);
            response.setHeader("Pragma", "no-cache");
            response.setHeader("Expires", "0");
            return true;
        }

        // Set cache headers based on content type
        String cacheControl = determineCacheControl(path);
        response.setHeader("Cache-Control", cacheControl);
        
        // Add Vary header for content negotiation
        response.setHeader("Vary", "Accept, Accept-Encoding");

        // Add ETag support for better cache validation
        response.setHeader("ETag", generateETag(request));

        return true;
    }

    /**
     * Determine cache control based on content volatility
     */
    private String determineCacheControl(String path) {
        // Static assets - 30 days
        if (path.matches(".*\\.(jpg|jpeg|png|webp|avif|gif|svg|css|js|woff|woff2|ttf|eot|ico)$")) {
            return CACHE_STATIC;
        }

        // Static API endpoints - 1 day (car types, brands, etc.)
        if (path.matches("/api/cars/types|/api/cars/brands|/api/config/.*")) {
            return CACHE_SEMI_STATIC;
        }

        // Featured cars - 1 day (semi-static)
        if (path.matches("/api/cars/featured")) {
            return CACHE_SEMI_STATIC;
        }

        // VDP
        if (path.matches("/api/cars/\\d+")) {
            return CACHE_DYNAMIC;
        }

        // SERP/search listing
        if (path.matches("/api/cars($|/|\\?.*)")) {
            return CACHE_DYNAMIC;
        }

        // Dealer pages
        if (path.matches("/api/dealers($|/.*)")) {
            return CACHE_SEMI_STATIC;
        }

        // Compare pages
        if (path.matches("/api/compare($|/.*)")) {
            return CACHE_DYNAMIC;
        }

        // Car images - 7 days (CDN cached)
        if (path.matches("/api/car-images/.*")) {
            return CACHE_CDN_ONLY;
        }

        // Inventory/availability - 10 minutes (changes frequently)
        if (path.matches("/api/cars/.*/availability|/api/cars/.*/pricing")) {
            return CACHE_INVENTORY;
        }

        // Bookings - 5 minutes (real-time)
        if (path.matches("/api/bookings/.*")) {
            return CACHE_REALTIME;
        }

        // User profile - 1 day (semi-static)
        if (path.matches("/api/users/profile|/api/users/\\d+")) {
            return CACHE_SEMI_STATIC;
        }

        // Analytics - 5 minutes (real-time)
        if (path.matches("/api/analytics/.*")) {
            return CACHE_REALTIME;
        }

        // Default: 15 minutes for dynamic content
        return CACHE_DYNAMIC;
    }

    /**
     * Generate ETag for cache validation
     * In production, use content hash or version
     */
    private String generateETag(HttpServletRequest request) {
        // Simple ETag based on path and query string
        String etagContent = request.getRequestURI() + 
                            (request.getQueryString() != null ? "?" + request.getQueryString() : "");
        return "\"" + Integer.toHexString(etagContent.hashCode()) + "\"";
    }
}

