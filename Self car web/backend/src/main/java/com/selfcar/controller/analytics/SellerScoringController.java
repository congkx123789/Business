package com.selfcar.controller.analytics;

import com.selfcar.dto.analytics.SellerScoreDTO;
import com.selfcar.service.analytics.SellerScoringService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Seller Scoring Controller
 */
@RestController
@RequestMapping("/api/seller-scores")
@RequiredArgsConstructor
public class SellerScoringController {

    private final SellerScoringService sellerScoringService;

    /**
     * Get seller score
     */
    @GetMapping("/sellers/{sellerId}")
    public ResponseEntity<SellerScoreDTO> getSellerScore(@PathVariable Long sellerId) {
        return ResponseEntity.ok(sellerScoringService.getSellerScore(sellerId));
    }

    /**
     * Get top verified dealers
     */
    @GetMapping("/top-verified")
    public ResponseEntity<List<SellerScoreDTO>> getTopVerifiedDealers(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(sellerScoringService.getTopVerifiedDealers(limit));
    }

    /**
     * Get seller rankings
     */
    @GetMapping("/rankings")
    public ResponseEntity<List<SellerScoreDTO>> getSellerRankings(
            @RequestParam(defaultValue = "50") int limit) {
        return ResponseEntity.ok(sellerScoringService.getSellerRankings(limit));
    }

    /**
     * Calculate seller score (admin/background job)
     */
    @PostMapping("/sellers/{sellerId}/calculate")
    public ResponseEntity<Void> calculateSellerScore(@PathVariable Long sellerId) {
        sellerScoringService.calculateSellerScore(sellerId);
        return ResponseEntity.ok().build();
    }

    /**
     * Recalculate all seller scores (admin/background job)
     */
    @PostMapping("/recalculate-all")
    public ResponseEntity<Void> recalculateAllScores() {
        sellerScoringService.recalculateAllSellerScores();
        return ResponseEntity.ok().build();
    }
}

