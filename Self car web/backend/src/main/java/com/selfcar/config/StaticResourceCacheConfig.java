package com.selfcar.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Static Resource Cache Configuration
 * 
 * Layer 1: Browser Cache for Static Assets
 * - 7-30 days for immutable assets (images, fonts, CSS, JS)
 * - Strong cache headers to prevent unnecessary requests
 */
@Configuration
public class StaticResourceCacheConfig implements WebMvcConfigurer {

    // Cache durations in seconds
    private static final int CACHE_DAYS_30 = 30 * 24 * 60 * 60; // 30 days
    private static final int CACHE_DAYS_7 = 7 * 24 * 60 * 60;   // 7 days
    private static final int CACHE_HOURS_24 = 24 * 60 * 60;     // 24 hours

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Images - 30 days (immutable)
        registry.addResourceHandler("/images/**")
                .addResourceLocations("classpath:/static/images/")
                .setCachePeriod(CACHE_DAYS_30)
                .resourceChain(true);

        // CSS and JS - 30 days (immutable with versioning)
        registry.addResourceHandler("/css/**", "/js/**")
                .addResourceLocations("classpath:/static/css/", "classpath:/static/js/")
                .setCachePeriod(CACHE_DAYS_30)
                .resourceChain(true);

        // Fonts - 30 days (immutable)
        registry.addResourceHandler("/fonts/**")
                .addResourceLocations("classpath:/static/fonts/")
                .setCachePeriod(CACHE_DAYS_30)
                .resourceChain(true);

        // Other static assets - 7 days
        registry.addResourceHandler("/static/**")
                .addResourceLocations("classpath:/static/")
                .setCachePeriod(CACHE_DAYS_7)
                .resourceChain(true);
    }
}

