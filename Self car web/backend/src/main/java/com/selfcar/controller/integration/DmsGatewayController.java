package com.selfcar.controller.integration;

import com.selfcar.dto.common.ApiResponse;
import com.selfcar.service.common.OutboxService;
import com.selfcar.service.integration.VinDecoderService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/integration/dms")
@RequiredArgsConstructor
public class DmsGatewayController {

    private final OutboxService outboxService;
    private final VinDecoderService vinDecoderService;

    @PostMapping("/vin/update")
    public ResponseEntity<?> vinUpdate(@RequestBody VinUpdate req) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("listingId", req.getListingId());
        payload.put("pricePerDay", req.getPricePerDay());
        payload.put("available", req.getAvailable());
        if (req.getVin() != null && !req.getVin().isBlank()) {
            var info = vinDecoderService.decode(req.getVin());
            payload.put("vin", req.getVin());
            payload.put("brand", info.getMake());
            payload.put("model", info.getModel());
            payload.put("year", info.getYear());
            payload.put("trim", info.getTrim());
        }
        outboxService.enqueue("LISTING", req.getListingId(), "External_VIN_Update", payload, 0L);
        return ResponseEntity.ok(new ApiResponse(true, "enqueued"));
    }

    @Data
    public static class VinUpdate {
        private Long listingId;
        private Long pricePerDay;
        private Boolean available;
        private String vin;
    }
}


