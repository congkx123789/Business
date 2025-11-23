package com.selfcar.controller.car;

import com.selfcar.dto.common.ApiResponse;
import com.selfcar.model.car.CarReview;
import com.selfcar.service.car.CarReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class CarReviewController {

    private final CarReviewService carReviewService;

    @GetMapping("/car/{carId}")
    public ResponseEntity<?> getReviewsByCar(@PathVariable Long carId) {
        try {
            return ResponseEntity.ok(carReviewService.getReviewsByCar(carId));
        } catch (Exception e) {
            log.error("Error getting reviews by car id: {}", carId, e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<?> getReviewsBySeller(@PathVariable Long sellerId) {
        try {
            return ResponseEntity.ok(carReviewService.getReviewsBySeller(sellerId));
        } catch (Exception e) {
            log.error("Error getting reviews by seller id: {}", sellerId, e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getReviewById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(carReviewService.getReviewById(id));
        } catch (Exception e) {
            log.error("Error getting review by id: {}", id, e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/car/{carId}/rating")
    public ResponseEntity<?> getCarRating(@PathVariable Long carId) {
        try {
            Double averageRating = carReviewService.getAverageRatingByCar(carId);
            Long reviewCount = carReviewService.getReviewCountByCar(carId);
            return ResponseEntity.ok(Map.of(
                    "averageRating", averageRating,
                    "reviewCount", reviewCount
            ));
        } catch (Exception e) {
            log.error("Error getting car rating for car id: {}", carId, e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/seller/{sellerId}/rating")
    public ResponseEntity<?> getSellerRating(@PathVariable Long sellerId) {
        try {
            Double averageRating = carReviewService.getAverageRatingBySeller(sellerId);
            Long reviewCount = carReviewService.getReviewCountBySeller(sellerId);
            return ResponseEntity.ok(Map.of(
                    "averageRating", averageRating,
                    "reviewCount", reviewCount
            ));
        } catch (Exception e) {
            log.error("Error getting seller rating for seller id: {}", sellerId, e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> createReview(@Valid @RequestBody CarReview review) {
        try {
            return ResponseEntity.ok(carReviewService.createReview(review));
        } catch (Exception e) {
            log.error("Error creating review", e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> updateReview(@PathVariable Long id, @Valid @RequestBody CarReview reviewDetails) {
        try {
            return ResponseEntity.ok(carReviewService.updateReview(id, reviewDetails));
        } catch (Exception e) {
            log.error("Error updating review with id: {}", id, e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteReview(@PathVariable Long id) {
        try {
            carReviewService.deleteReview(id);
            return ResponseEntity.ok(new ApiResponse(true, "Review deleted successfully"));
        } catch (Exception e) {
            log.error("Error deleting review with id: {}", id, e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
}
