package com.selfcar.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * Demand prediction DTO by region
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DemandPredictionDTO {
    private String region;
    private String regionCode;
    private List<CarModelDemand> predictedDemand;
    private List<Recommendation> recommendations;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CarModelDemand {
        private String carType;
        private String brand;
        private BigDecimal predictedDemandScore; // 0-100
        private String demandLevel; // HIGH, MEDIUM, LOW
        private String recommendation; // RESTOCK, PROMOTE, MAINTAIN
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Recommendation {
        private String type; // RESTOCK, PROMOTE, DISCOUNT
        private String description;
        private String carType;
        private String brand;
        private BigDecimal suggestedDiscount; // Percentage
    }
}

