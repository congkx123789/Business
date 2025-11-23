package com.selfcar.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Seller optimization recommendations DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SellerOptimizationDTO {
    private Long sellerId;
    private Long shopId;
    private List<OptimizationRecommendation> recommendations;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OptimizationRecommendation {
        private String type;
        private String title;
        private String description;
        private String priority; // HIGH, MEDIUM, LOW
        private String suggestedAction;
        private String expectedImpact;
        
        public enum RecommendationType {
            UPDATE_PHOTOS,           // "High views, low conversion - update photos"
            ADJUST_PRICE,            // Price too high/low compared to market
            IMPROVE_DESCRIPTION,     // Description is too short or missing details
            RESPONSE_TIME,           // Response time is slow
            ADD_MORE_IMAGES,         // Not enough images
            UPDATE_LISTING_STATUS,   // Mark as featured or update availability
            IMPROVE_RATINGS          // Low ratings affecting sales
        }
    }
}

