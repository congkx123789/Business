package com.selfcar.controller.integration;

import com.selfcar.dto.common.ApiResponse;
import com.selfcar.model.integration.CrossListing;
import com.selfcar.model.integration.MarketplaceIntegration;
import com.selfcar.service.integration.CrossListingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/integration/marketplaces")
@RequiredArgsConstructor
public class CrossListingController {

    private final CrossListingService crossListingService;

    @GetMapping
    public ResponseEntity<List<MarketplaceIntegration>> getAllMarketplaces() {
        return ResponseEntity.ok(crossListingService.getAllMarketplaces());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MarketplaceIntegration> getMarketplaceById(@PathVariable Long id) {
        return ResponseEntity.ok(crossListingService.getMarketplaceById(id));
    }

    @PostMapping("/{marketplaceId}/listings")
    public ResponseEntity<?> createCrossListing(
            @PathVariable Long marketplaceId,
            @RequestParam Long carId) {
        try {
            return ResponseEntity.ok(crossListingService.createCrossListing(carId, marketplaceId));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/listings/car/{carId}")
    public ResponseEntity<List<CrossListing>> getCrossListingsByCar(@PathVariable Long carId) {
        return ResponseEntity.ok(crossListingService.getCrossListingsByCar(carId));
    }

    @PostMapping("/sync-all")
    public ResponseEntity<?> syncAllAutoListings() {
        try {
            crossListingService.syncAllAutoListings();
            return ResponseEntity.ok(new ApiResponse(true, "Auto-listing sync completed"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
}

