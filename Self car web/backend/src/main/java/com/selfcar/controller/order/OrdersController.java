package com.selfcar.controller.order;

import com.selfcar.dto.common.ApiResponse;
import com.selfcar.model.order.Order;
import com.selfcar.service.order.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Objects;

@RestController
@RequestMapping("/api/orders/legacy")
@RequiredArgsConstructor
public class OrdersController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<?> create(@RequestParam Long buyerId,
                                   @RequestParam Long sellerId,
                                   @RequestParam Long carId,
                                   @RequestParam BigDecimal totalAmount) {
        try {
            if (buyerId == null || sellerId == null || carId == null || totalAmount == null || totalAmount.compareTo(BigDecimal.ZERO) <= 0) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "Invalid parameters"));
            }
            return ResponseEntity.ok(orderService.createOrder(carId, buyerId, totalAmount, BigDecimal.ZERO, null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/{orderNumber}/inspection/schedule")
    public ResponseEntity<?> scheduleInspection(@PathVariable String orderNumber,
                                                @RequestParam String scheduleTime,
                                                @RequestParam String inspectionLocation,
                                                @SuppressWarnings("unused") @RequestParam(required = false) String inspectorName) {
        try {
            if (orderNumber == null || orderNumber.isBlank() || scheduleTime == null || scheduleTime.isBlank()) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "Invalid parameters"));
            }
            Order order = orderService.getOrderByOrderNumber(orderNumber);
            Long orderId = Objects.requireNonNull(order.getId(), "Order ID cannot be null");
            java.time.LocalDateTime inspectionDate = java.time.LocalDateTime.parse(scheduleTime);
            return ResponseEntity.ok(orderService.scheduleInspection(orderId, inspectionDate, inspectionLocation));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/{orderNumber}/inspection/result")
    public ResponseEntity<?> inspectionResult(@PathVariable String orderNumber,
                                              @RequestParam boolean passed,
                                              @RequestParam(required = false) String notes) {
        try {
            if (orderNumber == null || orderNumber.isBlank()) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "Order number is required"));
            }
            return ResponseEntity.ok(orderService.markInspectionResult(orderNumber, passed, notes));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/{orderNumber}/mark-paid")
    public ResponseEntity<?> markPaid(@PathVariable String orderNumber,
                                      @SuppressWarnings("unused") @RequestParam(required = false) String escrowTransactionId) {
        try {
            if (orderNumber == null || orderNumber.isBlank()) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "Order number is required"));
            }
            Order order = orderService.getOrderByOrderNumber(orderNumber);
            Long orderId = Objects.requireNonNull(order.getId(), "Order ID cannot be null");
            return ResponseEntity.ok(orderService.completePayment(orderId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }
}


