package com.selfcar.controller.metrics;

import com.selfcar.dto.common.ApiResponse;
import com.selfcar.dto.metrics.PerformanceMetricsRequest;
import com.selfcar.service.metrics.PerformanceMetricsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Performance Metrics Controller
 * Collects and aggregates performance metrics from frontend
 */
@Slf4j
@RestController
@RequestMapping("/api/metrics")
@RequiredArgsConstructor
public class PerformanceMetricsController {

    private final PerformanceMetricsService metricsService;

    @PostMapping("/performance")
    public ResponseEntity<ApiResponse> collectMetrics(@RequestBody PerformanceMetricsRequest request) {
        try {
            metricsService.recordMetrics(request);
            return ResponseEntity.ok(new ApiResponse(true, "Metrics recorded"));
        } catch (Exception e) {
            log.error("Error recording metrics", e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, "Failed to record metrics: " + e.getMessage()));
        }
    }

    @GetMapping("/performance/baseline")
    public ResponseEntity<?> getBaselineMetrics() {
        try {
            return ResponseEntity.ok(metricsService.getBaselineMetrics());
        } catch (Exception e) {
            log.error("Error retrieving baseline metrics", e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, "Failed to retrieve metrics: " + e.getMessage()));
        }
    }
}

