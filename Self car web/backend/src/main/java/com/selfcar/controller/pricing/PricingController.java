package com.selfcar.controller.pricing;

import com.selfcar.dto.common.ApiResponse;
import com.selfcar.service.pricing.DynamicPricingService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pricing")
@RequiredArgsConstructor
public class PricingController {

    private final DynamicPricingService dynamicPricingService;

    @PostMapping("/predict")
    public ResponseEntity<?> predict(@RequestBody PredictRequest req) {
        long priceMinor = dynamicPricingService.predictPriceMinor(req.getListingId());
        return ResponseEntity.ok(new ApiResponse(true, String.valueOf(priceMinor)));
    }

    @Data
    public static class PredictRequest {
        private Long listingId;
    }
}


