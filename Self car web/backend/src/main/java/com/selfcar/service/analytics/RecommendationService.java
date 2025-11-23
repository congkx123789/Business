package com.selfcar.service.analytics;

import com.selfcar.dto.car.CarRecommendationDTO;
import com.selfcar.dto.analytics.DemandPredictionDTO;
import com.selfcar.dto.analytics.SellerOptimizationDTO;

import java.util.List;

/**
 * AI Recommendation Service
 * Provides personalized car recommendations and seller optimizations
 */
public interface RecommendationService {
    
    /**
     * Get similar vehicles to the one being viewed ("You may also like")
     */
    List<CarRecommendationDTO> getSimilarCars(Long carId, int limit);
    
    /**
     * Get personalized recommendations for a user
     */
    List<CarRecommendationDTO> getPersonalizedRecommendations(Long userId, int limit);
    
    /**
     * Get seller optimization recommendations
     * ("High views, low conversion — update photos or price")
     */
    SellerOptimizationDTO getSellerOptimizations(Long sellerId);
    
    /**
     * Predict demand per region and suggest restocking or promotions
     */
    List<DemandPredictionDTO> predictDemandByRegion(String region);
    
    /**
     * Record recommendation click for learning
     */
    void recordRecommendationClick(Long recommendationId);
    
    /**
     * Record recommendation conversion (purchase after click)
     */
    void recordRecommendationConversion(Long recommendationId, Long orderId);
}

