package com.selfcar.aspect;

import com.selfcar.annotation.CachePolicy;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * Cache Policy Aspect
 * 
 * Intercepts methods annotated with @CachePolicy and sets appropriate cache headers
 */
@Slf4j
@Aspect
@Component
public class CachePolicyAspect {

    @Around("@annotation(cachePolicy)")
    public Object applyCachePolicy(ProceedingJoinPoint joinPoint, CachePolicy cachePolicy) throws Throwable {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes == null) {
            return joinPoint.proceed();
        }

        HttpServletResponse response = attributes.getResponse();
        if (response != null) {
            String cacheControl = buildCacheControlHeader(cachePolicy);
            response.setHeader("Cache-Control", cacheControl);
            
            if (cachePolicy.immutable()) {
                response.setHeader("Vary", "Accept, Accept-Encoding");
            }
        }

        return joinPoint.proceed();
    }

    private String buildCacheControlHeader(CachePolicy cachePolicy) {
        StringBuilder cacheControl = new StringBuilder();
        
        if (cachePolicy.isPublic()) {
            cacheControl.append("public");
        } else {
            cacheControl.append("private");
        }
        
        cacheControl.append(", max-age=").append(cachePolicy.maxAge());
        cacheControl.append(", s-maxage=").append(cachePolicy.sMaxAge());
        
        if (cachePolicy.staleWhileRevalidate() > 0) {
            cacheControl.append(", stale-while-revalidate=").append(cachePolicy.staleWhileRevalidate());
        }
        
        if (cachePolicy.immutable()) {
            cacheControl.append(", immutable");
        }
        
        if (cachePolicy.mustRevalidate()) {
            cacheControl.append(", must-revalidate");
        }
        
        return cacheControl.toString();
    }
}

