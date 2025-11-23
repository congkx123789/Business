package com.selfcar.controller.analytics;

import com.selfcar.dto.car.CarRecommendationDTO;
import com.selfcar.dto.analytics.DemandPredictionDTO;
import com.selfcar.dto.analytics.SellerOptimizationDTO;
import com.selfcar.service.analytics.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * AI Recommendation Controller
 */
@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;

    /**
     * Get similar vehicles ("You may also like")
     */
    @GetMapping("/cars/{carId}/similar")
    public ResponseEntity<List<CarRecommendationDTO>> getSimilarCars(
            @PathVariable Long carId,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(recommendationService.getSimilarCars(carId, limit));
    }

    /**
     * Get personalized recommendations for a user
     */
    @GetMapping("/users/{userId}/personalized")
    public ResponseEntity<List<CarRecommendationDTO>> getPersonalizedRecommendations(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(recommendationService.getPersonalizedRecommendations(userId, limit));
    }

    /**
     * Get seller optimization recommendations
     */
    @GetMapping("/sellers/{sellerId}/optimizations")
    public ResponseEntity<SellerOptimizationDTO> getSellerOptimizations(@PathVariable Long sellerId) {
        return ResponseEntity.ok(recommendationService.getSellerOptimizations(sellerId));
    }

    /**
     * Predict demand by region
     */
    @GetMapping("/demand-prediction")
    public ResponseEntity<List<DemandPredictionDTO>> predictDemandByRegion(
            @RequestParam String region) {
        return ResponseEntity.ok(recommendationService.predictDemandByRegion(region));
    }

    /**
     * Record recommendation click
     */
    @PostMapping("/{recommendationId}/click")
    public ResponseEntity<Void> recordClick(@PathVariable Long recommendationId) {
        recommendationService.recordRecommendationClick(recommendationId);
        return ResponseEntity.ok().build();
    }

    /**
     * Record recommendation conversion
     */
    @PostMapping("/{recommendationId}/conversion")
    public ResponseEntity<Void> recordConversion(
            @PathVariable Long recommendationId,
            @RequestParam Long orderId) {
        recommendationService.recordRecommendationConversion(recommendationId, orderId);
        return ResponseEntity.ok().build();
    }
}

