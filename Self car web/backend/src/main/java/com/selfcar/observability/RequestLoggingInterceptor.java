package com.selfcar.observability;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class RequestLoggingInterceptor implements HandlerInterceptor {

    private static final String START_TIME_MS = "_start_time_ms";

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        request.setAttribute(START_TIME_MS, System.currentTimeMillis());
        MDC.put("service", "selfcar-backend");
        MDC.put("environment", System.getenv().getOrDefault("SPRING_PROFILES_ACTIVE", "prod"));
        MDC.put("http.method", request.getMethod());
        MDC.put("http.route", request.getRequestURI());
        MDC.put("http.client_ip", request.getRemoteAddr());
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, @Nullable Exception ex) {
        Object started = request.getAttribute(START_TIME_MS);
        if (started instanceof Long start) {
            long duration = System.currentTimeMillis() - start;
            MDC.put("duration_ms", Long.toString(duration));
        }
        MDC.put("http.status_code", Integer.toString(response.getStatus()));
    }
}


