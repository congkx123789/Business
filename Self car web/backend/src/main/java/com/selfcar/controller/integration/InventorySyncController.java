package com.selfcar.controller.integration;

import com.selfcar.dto.common.ApiResponse;
import com.selfcar.model.car.Car;
import com.selfcar.model.integration.ExternalDealership;
import com.selfcar.service.integration.InventorySyncService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/integration/dealerships")
@RequiredArgsConstructor
public class InventorySyncController {

    private final InventorySyncService inventorySyncService;

    @GetMapping
    public ResponseEntity<List<ExternalDealership>> getAllDealerships() {
        return ResponseEntity.ok(inventorySyncService.getAllDealerships());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExternalDealership> getDealershipById(@PathVariable Long id) {
        return ResponseEntity.ok(inventorySyncService.getDealershipById(id));
    }

    @PostMapping
    public ResponseEntity<?> createDealership(@RequestBody ExternalDealership dealership) {
        try {
            return ResponseEntity.ok(inventorySyncService.createDealership(dealership));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/{dealershipId}/sync")
    public ResponseEntity<?> syncInventory(@PathVariable Long dealershipId, @RequestBody List<Car> cars) {
        try {
            inventorySyncService.syncInventory(dealershipId, cars);
            return ResponseEntity.ok(new ApiResponse(true, "Inventory sync initiated"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
}

