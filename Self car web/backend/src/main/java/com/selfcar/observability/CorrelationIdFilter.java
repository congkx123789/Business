package com.selfcar.observability;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Optional;
import java.util.UUID;

@Component
public class CorrelationIdFilter implements Filter {

    private static final String HEADER_REQUEST_ID = "X-Request-ID";
    private static final String MDC_CORRELATION_ID = "correlation_id";
    private static final String MDC_USER_ID = "user_id";
    private static final String MDC_ORDER_ID = "order_id";
    private static final String MDC_VIN = "vin";

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        try {
            if (request instanceof HttpServletRequest http) {
                String correlationId = Optional.ofNullable(http.getHeader(HEADER_REQUEST_ID))
                        .filter(s -> !s.isBlank())
                        .orElse(UUID.randomUUID().toString());
                MDC.put(MDC_CORRELATION_ID, correlationId);

                // Optionally capture common ids if present as headers (can be set by gateway/services)
                putIfHeaderPresent(http, "X-User-ID", MDC_USER_ID);
                putIfHeaderPresent(http, "X-Order-ID", MDC_ORDER_ID);
                putIfHeaderPresent(http, "X-VIN", MDC_VIN);
            }
            chain.doFilter(request, response);
        } finally {
            MDC.clear();
        }
    }

    private void putIfHeaderPresent(HttpServletRequest http, String headerName, String mdcKey) {
        String value = http.getHeader(headerName);
        if (value != null && !value.isBlank()) {
            MDC.put(mdcKey, value);
        }
    }
}


