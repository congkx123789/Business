package com.selfcar.service.analytics;

import com.selfcar.dto.analytics.BusinessInsightsDTO;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Business Insights Service - mirrors Shopee Business Insights
 * Provides analytics on sales performance, conversion rates, and ROI
 */
public interface BusinessInsightsService {
    
    /**
     * Get business insights for a specific car
     */
    BusinessInsightsDTO getCarInsights(Long carId, LocalDateTime periodStart, LocalDateTime periodEnd);
    
    /**
     * Get sales performance by car model
     */
    List<BusinessInsightsDTO.SalesPerformance> getSalesPerformanceByModel(LocalDateTime periodStart, LocalDateTime periodEnd);
    
    /**
     * Get conversion rate metrics: views → deposits → purchases
     */
    BusinessInsightsDTO.ConversionMetrics getConversionMetrics(Long carId, LocalDateTime periodStart, LocalDateTime periodEnd);
    
    /**
     * Get advertising ROI by channel
     */
    BusinessInsightsDTO.AdvertisingROI getAdvertisingROI(Long carId, LocalDateTime periodStart, LocalDateTime periodEnd);
    
    /**
     * Track a car view (called when user views a car)
     */
    void trackCarView(Long carId, Long userId, String ipAddress, String userAgent, String referrer, 
                     com.selfcar.model.car.CarView.TrafficSource trafficSource);
    
    /**
     * Calculate and update analytics for a car (called periodically)
     */
    void calculateCarAnalytics(Long carId, LocalDateTime periodStart, LocalDateTime periodEnd);
}

