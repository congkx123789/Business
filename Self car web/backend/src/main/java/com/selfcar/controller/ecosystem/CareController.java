package com.selfcar.controller.ecosystem;

import com.selfcar.dto.common.ApiResponse;
import com.selfcar.model.ecosystem.CareBooking;
import com.selfcar.model.ecosystem.CareService;
import com.selfcar.model.ecosystem.CareServiceProvider;
import com.selfcar.service.ecosystem.CareServiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/care")
@RequiredArgsConstructor
public class CareController {

    private final CareServiceService careServiceService;

    @GetMapping("/providers")
    public ResponseEntity<List<CareServiceProvider>> getAllProviders() {
        return ResponseEntity.ok(careServiceService.getAllProviders());
    }

    @GetMapping("/providers/{type}")
    public ResponseEntity<List<CareServiceProvider>> getProvidersByType(@PathVariable CareServiceProvider.ProviderType type) {
        return ResponseEntity.ok(careServiceService.getActiveProviders(type));
    }

    @GetMapping("/providers/{id}")
    public ResponseEntity<CareServiceProvider> getProviderById(@PathVariable Long id) {
        return ResponseEntity.ok(careServiceService.getProviderById(id));
    }

    @PostMapping("/providers")
    public ResponseEntity<?> createProvider(@RequestBody CareServiceProvider provider) {
        try {
            return ResponseEntity.ok(careServiceService.createProvider(provider));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/services/provider/{providerId}")
    public ResponseEntity<List<CareService>> getServicesByProvider(@PathVariable Long providerId) {
        return ResponseEntity.ok(careServiceService.getServicesByProvider(providerId));
    }

    @GetMapping("/services/type/{serviceType}")
    public ResponseEntity<List<CareService>> getServicesByType(@PathVariable CareService.ServiceType serviceType) {
        return ResponseEntity.ok(careServiceService.getServicesByType(serviceType));
    }

    @PostMapping("/services")
    public ResponseEntity<?> createService(@RequestBody CareService service) {
        try {
            return ResponseEntity.ok(careServiceService.createService(service));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/bookings/user/{userId}")
    public ResponseEntity<List<CareBooking>> getBookingsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(careServiceService.getBookingsByUser(userId));
    }

    @PostMapping("/bookings")
    public ResponseEntity<?> createBooking(
            @RequestParam Long userId,
            @RequestParam Long carId,
            @RequestParam Long serviceId,
            @RequestParam LocalDateTime scheduledDate) {
        try {
            return ResponseEntity.ok(careServiceService.createBooking(userId, carId, serviceId, scheduledDate));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PatchMapping("/bookings/{bookingId}/status")
    public ResponseEntity<?> updateBookingStatus(
            @PathVariable Long bookingId,
            @RequestParam CareBooking.BookingStatus status) {
        try {
            return ResponseEntity.ok(careServiceService.updateBookingStatus(bookingId, status));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
}

