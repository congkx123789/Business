package com.selfcar.dto.metrics;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class PerformanceMetricsRequest {
    private List<MetricEntry> metrics;
    private String page;
    private String userAgent;
    private Viewport viewport;
    
    @Data
    public static class MetricEntry {
        private String metric; // LCP, TTFB, CLS, INP, CACHE_HIT_RATE, API_LATENCY
        private Double value;
        private String url;
        private String method;
        private Integer status;
        private String error;
        private Long timestamp;
        private Map<String, Object> additionalData;
    }
    
    @Data
    public static class Viewport {
        private Integer width;
        private Integer height;
    }
}

