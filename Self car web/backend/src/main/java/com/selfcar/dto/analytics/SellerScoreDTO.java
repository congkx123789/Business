package com.selfcar.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Seller Score DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SellerScoreDTO {
    private Long sellerId;
    private String sellerName;
    private Long shopId;
    private String shopName;
    
    private BigDecimal totalScore;
    private BadgeLevel badgeLevel;
    private Boolean isTopVerified;
    private Boolean isVerifiedDealer;
    
    // Component scores
    private BigDecimal responseTimeScore;
    private BigDecimal completionRateScore;
    private BigDecimal ratingScore;
    private BigDecimal onTimeDeliveryScore;
    private BigDecimal customerSatisfactionScore;
    
    // Metrics
    private BigDecimal avgResponseTimeHours;
    private Long totalOrders;
    private Long completedOrders;
    private BigDecimal completionRate; // Percentage
    private BigDecimal avgRating;
    private Long totalReviews;
    private BigDecimal onTimeDeliveryRate; // Percentage
    
    public enum BadgeLevel {
        BRONZE,
        SILVER,
        GOLD,
        PLATINUM,
        DIAMOND
    }
}

