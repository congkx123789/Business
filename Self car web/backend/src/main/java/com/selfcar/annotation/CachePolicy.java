package com.selfcar.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Cache Policy Annotation
 * 
 * Allows fine-grained cache control at the method/controller level
 * 
 * Usage:
 * @CachePolicy(ttl = 300, maxAge = 900, sMaxAge = 900, staleWhileRevalidate = 60)
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface CachePolicy {
    
    /**
     * Time to live in seconds for application cache (Redis)
     */
    int ttl() default 900; // 15 minutes default
    
    /**
     * Max-age for browser cache (Cache-Control: max-age)
     */
    int maxAge() default 900; // 15 minutes default
    
    /**
     * Shared max-age for CDN/proxy cache (Cache-Control: s-maxage)
     */
    int sMaxAge() default 900; // 15 minutes default
    
    /**
     * Stale-while-revalidate in seconds
     * Allows serving stale content while revalidating in background
     */
    int staleWhileRevalidate() default 0;
    
    /**
     * Whether content is public (public) or private (private)
     */
    boolean isPublic() default true;
    
    /**
     * Whether content is immutable (immutable)
     */
    boolean immutable() default false;
    
    /**
     * Whether to include must-revalidate
     */
    boolean mustRevalidate() default false;
    
    /**
     * Cache key prefix (for application cache)
     */
    String cacheName() default "";
}

