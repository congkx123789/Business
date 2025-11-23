package com.selfcar.controller.analytics;

import com.selfcar.dto.analytics.BusinessInsightsDTO;
import com.selfcar.model.car.CarView;
import com.selfcar.service.analytics.BusinessInsightsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Business Insights Controller - mirrors Shopee Business Insights
 */
@RestController
@RequestMapping("/api/business-insights")
@RequiredArgsConstructor
public class BusinessInsightsController {

    private final BusinessInsightsService businessInsightsService;

    /**
     * Get business insights for a specific car
     */
    @GetMapping("/cars/{carId}")
    public ResponseEntity<BusinessInsightsDTO> getCarInsights(
            @PathVariable Long carId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime periodStart,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime periodEnd) {
        return ResponseEntity.ok(businessInsightsService.getCarInsights(carId, periodStart, periodEnd));
    }

    /**
     * Get sales performance by car model
     */
    @GetMapping("/sales-performance")
    public ResponseEntity<List<BusinessInsightsDTO.SalesPerformance>> getSalesPerformanceByModel(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime periodStart,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime periodEnd) {
        return ResponseEntity.ok(businessInsightsService.getSalesPerformanceByModel(periodStart, periodEnd));
    }

    /**
     * Get conversion metrics: views → deposits → purchases
     */
    @GetMapping("/cars/{carId}/conversion")
    public ResponseEntity<BusinessInsightsDTO.ConversionMetrics> getConversionMetrics(
            @PathVariable Long carId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime periodStart,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime periodEnd) {
        return ResponseEntity.ok(businessInsightsService.getConversionMetrics(carId, periodStart, periodEnd));
    }

    /**
     * Get advertising ROI by channel
     */
    @GetMapping("/cars/{carId}/advertising-roi")
    public ResponseEntity<BusinessInsightsDTO.AdvertisingROI> getAdvertisingROI(
            @PathVariable Long carId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime periodStart,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime periodEnd) {
        return ResponseEntity.ok(businessInsightsService.getAdvertisingROI(carId, periodStart, periodEnd));
    }

    /**
     * Track a car view (called when user views a car)
     */
    @PostMapping("/cars/{carId}/track-view")
    public ResponseEntity<Void> trackCarView(
            @PathVariable Long carId,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String ipAddress,
            @RequestParam(required = false) String userAgent,
            @RequestParam(required = false) String referrer,
            @RequestParam(required = false) String trafficSource) {
        CarView.TrafficSource source = trafficSource != null ?
                CarView.TrafficSource.valueOf(trafficSource.toUpperCase()) :
                CarView.TrafficSource.ORGANIC;
        
        businessInsightsService.trackCarView(carId, userId, ipAddress, userAgent, referrer, source);
        return ResponseEntity.ok().build();
    }
}

