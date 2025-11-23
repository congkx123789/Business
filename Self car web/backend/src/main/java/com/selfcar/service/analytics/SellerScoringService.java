package com.selfcar.service.analytics;

import com.selfcar.dto.analytics.SellerScoreDTO;

import java.util.List;

/**
 * Automated Seller Scoring Service
 * Calculates reputation scores based on multiple factors
 */
public interface SellerScoringService {
    
    /**
     * Get seller score for a specific seller
     */
    SellerScoreDTO getSellerScore(Long sellerId);
    
    /**
     * Get top verified dealers (highlighted sellers)
     */
    List<SellerScoreDTO> getTopVerifiedDealers(int limit);
    
    /**
     * Calculate and update seller score (called periodically)
     */
    void calculateSellerScore(Long sellerId);
    
    /**
     * Recalculate all seller scores (batch operation)
     */
    void recalculateAllSellerScores();
    
    /**
     * Get seller rankings by score
     */
    List<SellerScoreDTO> getSellerRankings(int limit);
}

