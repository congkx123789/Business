package com.selfcar.dto.car;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Car Recommendation DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CarRecommendationDTO {
    private Long carId;
    private String carName;
    private String carBrand;
    private String carType;
    private Integer year;
    private BigDecimal price;
    private String imageUrl;
    private BigDecimal similarityScore;
    private String recommendationReason;
    private RecommendationType recommendationType;
    
    public enum RecommendationType {
        SIMILAR_CARS,
        PERSONALIZED,
        POPULAR,
        PRICE_RANGE,
        BRAND_CATEGORY,
        DEMAND_PREDICTION
    }
}

