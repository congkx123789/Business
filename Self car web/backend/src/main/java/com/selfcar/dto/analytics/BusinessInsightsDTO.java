package com.selfcar.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Business Insights DTO - mirrors Shopee Business Insights model
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BusinessInsightsDTO {
    private Long carId;
    private String carName;
    private String carBrand;
    
    // Sales Performance
    private SalesPerformance salesPerformance;
    
    // Conversion Metrics
    private ConversionMetrics conversionMetrics;
    
    // Advertising ROI
    private AdvertisingROI advertisingROI;
    
    // Traffic Source Breakdown
    private TrafficSourceBreakdown trafficSourceBreakdown;
    
    private LocalDateTime periodStart;
    private LocalDateTime periodEnd;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SalesPerformance {
        private Long totalUnitsSold;
        private BigDecimal totalRevenue;
        private BigDecimal averageOrderValue;
        private BigDecimal revenueGrowth; // Percentage change from previous period
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConversionMetrics {
        private Long totalViews;
        private Long uniqueViews;
        private Long depositsCreated;
        private Long bookingsCreated;
        private Long purchasesCompleted;
        private BigDecimal viewToDepositRate; // %
        private BigDecimal depositToPurchaseRate; // %
        private BigDecimal viewToPurchaseRate; // %
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdvertisingROI {
        private BigDecimal adSpend;
        private BigDecimal adRevenue;
        private BigDecimal adROI; // Return on investment %
        private Long adViews;
        private Long adConversions;
        private BigDecimal costPerClick;
        private BigDecimal costPerConversion;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrafficSourceBreakdown {
        private Long viewsFromSearch;
        private Long viewsFromOrganic;
        private Long viewsFromRecommendation;
        private Long viewsFromAdvertising;
        private Long viewsFromSocialMedia;
        private BigDecimal searchConversionRate;
        private BigDecimal organicConversionRate;
        private BigDecimal recommendationConversionRate;
        private BigDecimal advertisingConversionRate;
    }
}

