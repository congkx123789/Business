package com.selfcar.controller.ecosystem;

import com.selfcar.dto.common.ApiResponse;
import com.selfcar.model.ecosystem.DeliveryBooking;
import com.selfcar.model.ecosystem.DeliveryPartner;
import com.selfcar.service.ecosystem.DeliveryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/delivery")
@RequiredArgsConstructor
public class DeliveryController {

    private final DeliveryService deliveryService;

    @GetMapping("/partners")
    public ResponseEntity<List<DeliveryPartner>> getAllPartners() {
        return ResponseEntity.ok(deliveryService.getAllPartners());
    }

    @GetMapping("/partners/active")
    public ResponseEntity<List<DeliveryPartner>> getActivePartners() {
        return ResponseEntity.ok(deliveryService.getActivePartners());
    }

    @GetMapping("/bookings/user/{userId}")
    public ResponseEntity<List<DeliveryBooking>> getBookingsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(deliveryService.getBookingsByUser(userId));
    }

    @GetMapping("/bookings/order/{orderId}")
    public ResponseEntity<List<DeliveryBooking>> getBookingsByOrder(@PathVariable Long orderId) {
        return ResponseEntity.ok(deliveryService.getBookingsByOrder(orderId));
    }

    @PostMapping("/bookings")
    public ResponseEntity<?> createDeliveryBooking(
            @RequestParam Long userId,
            @RequestParam Long carId,
            @RequestParam Long partnerId,
            @RequestParam DeliveryBooking.DeliveryType deliveryType,
            @RequestParam String pickupLocation,
            @RequestParam(required = false) BigDecimal pickupLatitude,
            @RequestParam(required = false) BigDecimal pickupLongitude,
            @RequestParam String deliveryLocation,
            @RequestParam(required = false) BigDecimal deliveryLatitude,
            @RequestParam(required = false) BigDecimal deliveryLongitude,
            @RequestParam LocalDateTime scheduledDate) {
        try {
            return ResponseEntity.ok(deliveryService.createDeliveryBooking(
                    userId, carId, partnerId, deliveryType,
                    pickupLocation, pickupLatitude, pickupLongitude,
                    deliveryLocation, deliveryLatitude, deliveryLongitude,
                    scheduledDate));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PatchMapping("/bookings/{bookingId}/status")
    public ResponseEntity<?> updateDeliveryStatus(
            @PathVariable Long bookingId,
            @RequestParam DeliveryBooking.DeliveryStatus status) {
        try {
            return ResponseEntity.ok(deliveryService.updateDeliveryStatus(bookingId, status));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/bookings/{bookingId}/assign-driver")
    public ResponseEntity<?> assignDriver(
            @PathVariable Long bookingId,
            @RequestParam Long driverId,
            @RequestParam String driverName,
            @RequestParam String driverPhone,
            @RequestParam String vehiclePlateNumber) {
        try {
            return ResponseEntity.ok(deliveryService.assignDriver(bookingId, driverId, driverName, driverPhone, vehiclePlateNumber));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
}

