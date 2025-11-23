package com.selfcar.controller.car;

import com.selfcar.dto.common.ApiResponse;
import com.selfcar.model.car.Car;
import com.selfcar.service.car.CarService;
import com.selfcar.service.common.OutboxService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;


@Slf4j
@RestController
@RequestMapping("/api/cars")
@RequiredArgsConstructor
public class CarController {

    private final CarService carService;
    private final OutboxService outboxService;

    @GetMapping
    public ResponseEntity<?> getAllCars() {
        try {
            return ResponseEntity.ok(carService.getAllCars());
        } catch (Exception e) {
            log.error("Error getting all cars", e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCarById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(carService.getCarById(id));
        } catch (Exception e) {
            log.error("Error getting car by id: {}", id, e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/available")
    public ResponseEntity<?> getAvailableCars() {
        try {
            return ResponseEntity.ok(carService.getAvailableCars());
        } catch (Exception e) {
            log.error("Error getting available cars", e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/featured")
    public ResponseEntity<?> getFeaturedCars() {
        try {
            return ResponseEntity.ok(carService.getFeaturedCars());
        } catch (Exception e) {
            log.error("Error getting featured cars", e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createCar(@Valid @RequestBody Car car) {
        try {
            Car createdCar = carService.createCar(car);
            // Enqueue outbox event for search indexing
            java.util.Map<String, Object> payload = new java.util.HashMap<>();
            payload.put("listingId", createdCar.getId());
            payload.put("eventId", java.util.UUID.randomUUID().toString());
            payload.put("name", createdCar.getName());
            payload.put("brand", createdCar.getBrand());
            payload.put("year", createdCar.getYear());
            payload.put("pricePerDay", createdCar.getPricePerDay());
            payload.put("version", createdCar.getVersion());
            outboxService.enqueue("LISTING", createdCar.getId(), "VIN_Listed", payload, createdCar.getVersion());
            return ResponseEntity.ok(createdCar);
        } catch (Exception e) {
            log.error("Error creating car", e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateCar(@PathVariable Long id, @Valid @RequestBody Car car) {
        try {
            Car updatedCar = carService.updateCar(id, car);
            java.util.Map<String, Object> payload = new java.util.HashMap<>();
            payload.put("listingId", updatedCar.getId());
            payload.put("eventId", java.util.UUID.randomUUID().toString());
            payload.put("pricePerDay", updatedCar.getPricePerDay());
            payload.put("available", updatedCar.getAvailable());
            payload.put("version", updatedCar.getVersion());
            outboxService.enqueue("LISTING", updatedCar.getId(), "Price_Updated", payload, updatedCar.getVersion());
            return ResponseEntity.ok(updatedCar);
        } catch (Exception e) {
            log.error("Error updating car with id: {}", id, e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteCar(@PathVariable Long id) {
        try {
            carService.deleteCar(id);
            java.util.Map<String, Object> payload = new java.util.HashMap<>();
            payload.put("eventId", java.util.UUID.randomUUID().toString());
            payload.put("listingId", id);
            outboxService.enqueue("LISTING", id, "VIN_Sold", payload, 0L);
            return ResponseEntity.ok(new ApiResponse(true, "Car deleted successfully"));
        } catch (Exception e) {
            log.error("Error deleting car with id: {}", id, e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PatchMapping("/{id}/toggle-availability")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> toggleAvailability(@PathVariable Long id) {
        try {
            var updated = carService.toggleAvailability(id);
            java.util.Map<String, Object> payload = new java.util.HashMap<>();
            payload.put("eventId", java.util.UUID.randomUUID().toString());
            payload.put("listingId", id);
            payload.put("available", updated.getAvailable());
            payload.put("version", updated.getVersion());
            // Map availability: false -> sold, true -> relisted
            String evt = Boolean.TRUE.equals(updated.getAvailable()) ? "VIN_Relisted" : "VIN_Sold";
            outboxService.enqueue("LISTING", id, evt, payload, updated.getVersion());
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            log.error("Error toggling availability for car with id: {}", id, e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
}