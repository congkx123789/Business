package com.selfcar.service.metrics;

import com.selfcar.dto.metrics.PerformanceMetricsRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.Gauge;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Performance Metrics Service
 * Aggregates and stores performance metrics for analysis
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PerformanceMetricsService {

    private final MeterRegistry meterRegistry;
    
    // Store baseline metrics for aggregation
    private final Map<String, AtomicLong> metricCounts = new ConcurrentHashMap<>();
    private final Map<String, AtomicLong> metricSums = new ConcurrentHashMap<>();
    private final Map<String, Double> metricMins = new ConcurrentHashMap<>();
    private final Map<String, Double> metricMaxs = new ConcurrentHashMap<>();

    /**
     * Record metrics from frontend
     */
    public void recordMetrics(PerformanceMetricsRequest request) {
        if (request.getMetrics() == null) {
            return;
        }

        request.getMetrics().forEach(metric -> {
            String metricName = metric.getMetric();
            Double value = metric.getValue();

            if (value != null) {
                // Record to Micrometer
                recordToMicrometer(metricName, value, metric);

                // Aggregate for baseline
                aggregateBaselineMetric(metricName, value);
            }
        });

        log.debug("Recorded {} metrics from page: {}", request.getMetrics().size(), request.getPage());
    }

    private void recordToMicrometer(String metricName, Double value, PerformanceMetricsRequest.MetricEntry metric) {
        String fullMetricName = "performance." + metricName.toLowerCase();

        switch (metricName) {
            case "LCP":
            case "TTFB":
            case "CLS":
            case "INP":
                // Record as timer (for latency metrics)
                Timer.builder(fullMetricName)
                        .tag("page", metric.getUrl() != null ? metric.getUrl() : "unknown")
                        .register(meterRegistry)
                        .record((long) (value * 1_000_000), java.util.concurrent.TimeUnit.NANOSECONDS);
                break;

            case "API_LATENCY":
                Timer.builder(fullMetricName)
                        .tag("method", metric.getMethod() != null ? metric.getMethod() : "unknown")
                        .tag("status", metric.getStatus() != null ? String.valueOf(metric.getStatus()) : "unknown")
                        .register(meterRegistry)
                        .record((long) (value * 1_000_000), java.util.concurrent.TimeUnit.NANOSECONDS);
                break;

            case "CACHE_HIT_RATE":
                // Record as gauge
                Gauge.builder(fullMetricName + ".browser", 
                        () -> metric.getAdditionalData() != null 
                            ? (Double) metric.getAdditionalData().getOrDefault("browserCacheHitRate", 0.0)
                            : 0.0)
                        .register(meterRegistry);
                Gauge.builder(fullMetricName + ".cdn",
                        () -> metric.getAdditionalData() != null
                            ? (Double) metric.getAdditionalData().getOrDefault("cdnCacheHitRate", 0.0)
                            : 0.0)
                        .register(meterRegistry);
                break;

            default:
                // Record as generic gauge
                Gauge.builder(fullMetricName, () -> value).register(meterRegistry);
        }
    }

    private void aggregateBaselineMetric(String metricName, Double value) {
        metricCounts.computeIfAbsent(metricName, k -> new AtomicLong(0)).incrementAndGet();
        metricSums.computeIfAbsent(metricName, k -> new AtomicLong(0)).addAndGet((long) (value * 1000)); // Store as milliseconds

        metricMins.put(metricName, Math.min(metricMins.getOrDefault(metricName, Double.MAX_VALUE), value));
        metricMaxs.put(metricName, Math.max(metricMaxs.getOrDefault(metricName, Double.MIN_VALUE), value));
    }

    /**
     * Get baseline metrics (aggregated statistics)
     */
    public Map<String, Object> getBaselineMetrics() {
        Map<String, Object> baseline = new HashMap<>();

        metricCounts.forEach((metricName, count) -> {
            if (count.get() > 0) {
                long sum = metricSums.getOrDefault(metricName, new AtomicLong(0)).get();
                double avg = sum / (double) count.get() / 1000.0; // Convert back to seconds
                double min = metricMins.getOrDefault(metricName, 0.0);
                double max = metricMaxs.getOrDefault(metricName, 0.0);

                // Calculate p95 (approximate - would need proper percentile calculation in production)
                double p95 = avg * 1.65; // Rough approximation

                Map<String, Object> stats = new HashMap<>();
                stats.put("count", count.get());
                stats.put("avg", avg);
                stats.put("min", min);
                stats.put("max", max);
                stats.put("p95", p95);
                stats.put("sum", sum / 1000.0);

                baseline.put(metricName, stats);
            }
        });

        return baseline;
    }
}

