package com.selfcar.controller.car;

import com.selfcar.dto.common.ApiResponse;
import com.selfcar.model.car.FlashSale;
import com.selfcar.service.car.FlashSaleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/flash-sales")
@RequiredArgsConstructor
public class FlashSaleController {

    private final FlashSaleService flashSaleService;

    @GetMapping
    public ResponseEntity<?> getAllFlashSales() {
        try {
            return ResponseEntity.ok(flashSaleService.getAllFlashSales());
        } catch (Exception e) {
            log.error("Error getting all flash sales", e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/active")
    public ResponseEntity<?> getActiveFlashSales() {
        try {
            return ResponseEntity.ok(flashSaleService.getActiveFlashSales());
        } catch (Exception e) {
            log.error("Error getting active flash sales", e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/available")
    public ResponseEntity<?> getAvailableFlashSales() {
        try {
            return ResponseEntity.ok(flashSaleService.getAvailableFlashSales());
        } catch (Exception e) {
            log.error("Error getting available flash sales", e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getFlashSaleById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(flashSaleService.getFlashSaleById(id));
        } catch (Exception e) {
            log.error("Error getting flash sale by id: {}", id, e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/car/{carId}")
    public ResponseEntity<?> getFlashSaleByCar(@PathVariable Long carId) {
        try {
            FlashSale flashSale = flashSaleService.getFlashSaleByCar(carId);
            if (flashSale != null) {
                return ResponseEntity.ok(flashSale);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error getting flash sale by car id: {}", carId, e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<?> createFlashSale(@Valid @RequestBody FlashSale flashSale) {
        try {
            return ResponseEntity.ok(flashSaleService.createFlashSale(flashSale));
        } catch (Exception e) {
            log.error("Error creating flash sale", e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<?> updateFlashSale(@PathVariable Long id, @Valid @RequestBody FlashSale flashSaleDetails) {
        try {
            return ResponseEntity.ok(flashSaleService.updateFlashSale(id, flashSaleDetails));
        } catch (Exception e) {
            log.error("Error updating flash sale with id: {}", id, e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteFlashSale(@PathVariable Long id) {
        try {
            flashSaleService.deleteFlashSale(id);
            return ResponseEntity.ok(new ApiResponse(true, "Flash sale deleted successfully"));
        } catch (Exception e) {
            log.error("Error deleting flash sale with id: {}", id, e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
}
