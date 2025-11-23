package com.selfcar.controller.car;

import com.selfcar.dto.common.ApiResponse;
import com.selfcar.model.car.CarAd;
import com.selfcar.service.car.CarAdService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/ads")
@RequiredArgsConstructor
public class CarAdController {

    private final CarAdService carAdService;

    @GetMapping
    public ResponseEntity<?> getAllAds() {
        try {
            return ResponseEntity.ok(carAdService.getAllAds());
        } catch (Exception e) {
            log.error("Error getting all ads", e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getAdById(@PathVariable Long id) {
        try {
            CarAd ad = carAdService.getAdById(id);
            if (ad == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(ad);
        } catch (Exception e) {
            log.error("Error getting ad by id: {}", id, e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> getSearchAds(@RequestParam String keyword) {
        try {
            if (keyword == null || keyword.isBlank()) {
                return ResponseEntity.badRequest()
                        .body(new ApiResponse(false, "Keyword is required"));
            }
            return ResponseEntity.ok(carAdService.getActiveSearchAds(keyword));
        } catch (Exception e) {
            log.error("Error searching ads with keyword: {}", keyword, e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/discovery")
    public ResponseEntity<?> getDiscoveryAds(@RequestParam String location) {
        try {
            if (location == null || location.isBlank()) {
                return ResponseEntity.badRequest()
                        .body(new ApiResponse(false, "Location is required"));
            }
            return ResponseEntity.ok(carAdService.getDiscoveryAds(location));
        } catch (Exception e) {
            log.error("Error getting discovery ads for location: {}", location, e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/car/{carId}")
    public ResponseEntity<?> getAdsByCar(@PathVariable Long carId) {
        try {
            return ResponseEntity.ok(carAdService.getAdsByCar(carId));
        } catch (Exception e) {
            log.error("Error getting ads by car id: {}", carId, e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/shop/{shopId}")
    public ResponseEntity<?> getAdsByShop(@PathVariable Long shopId) {
        try {
            return ResponseEntity.ok(carAdService.getAdsByShop(shopId));
        } catch (Exception e) {
            log.error("Error getting ads by shop id: {}", shopId, e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<?> createAd(@Valid @RequestBody CarAd ad) {
        try {
            return ResponseEntity.ok(carAdService.createAd(ad));
        } catch (Exception e) {
            log.error("Error creating ad", e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<?> updateAd(@PathVariable Long id, @Valid @RequestBody CarAd adDetails) {
        try {
            return ResponseEntity.ok(carAdService.updateAd(id, adDetails));
        } catch (Exception e) {
            log.error("Error updating ad with id: {}", id, e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/{id}/click")
    public ResponseEntity<?> recordClick(@PathVariable Long id) {
        try {
            carAdService.incrementClickCount(id);
            return ResponseEntity.ok(new ApiResponse(true, "Click recorded"));
        } catch (Exception e) {
            log.error("Error recording click for ad id: {}", id, e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/{id}/impression")
    public ResponseEntity<?> recordImpression(@PathVariable Long id) {
        try {
            carAdService.incrementImpressionCount(id);
            return ResponseEntity.ok(new ApiResponse(true, "Impression recorded"));
        } catch (Exception e) {
            log.error("Error recording impression for ad id: {}", id, e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteAd(@PathVariable Long id) {
        try {
            carAdService.deleteAd(id);
            return ResponseEntity.ok(new ApiResponse(true, "Ad deleted successfully"));
        } catch (Exception e) {
            log.error("Error deleting ad with id: {}", id, e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/{id}/pause")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<?> pauseAd(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(carAdService.pauseAd(id));
        } catch (Exception e) {
            log.error("Error pausing ad with id: {}", id, e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/{id}/resume")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<?> resumeAd(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(carAdService.resumeAd(id));
        } catch (Exception e) {
            log.error("Error resuming ad with id: {}", id, e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
}
