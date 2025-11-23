package com.selfcar.controller.order;

import com.selfcar.model.order.Order;
import com.selfcar.model.payment.PaymentTransaction;
import com.selfcar.security.ObjectLevelAuthorizationService;
import com.selfcar.security.UserPrincipal;
import com.selfcar.service.order.OrderService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final ObjectLevelAuthorizationService objectLevelAuthorizationService;

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Order> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        Long carId = Objects.requireNonNull(request.getCarId(), "Car ID cannot be null");
        Long buyerId = Objects.requireNonNull(request.getBuyerId(), "Buyer ID cannot be null");
        Order order = orderService.createOrder(
                carId,
                buyerId,
                request.getTotalAmount(),
                request.getDepositAmount(),
                request.getBookingId()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Order> getOrder(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null || userPrincipal.getUser() == null) {
            return ResponseEntity.status(401).build();
        }
        Long orderId = Objects.requireNonNull(id, "Order ID cannot be null");
        // BOLA Protection: Verify user has access to the order
        objectLevelAuthorizationService.verifyOrderAccess(
                orderId,
                userPrincipal.getUser().getId(),
                userPrincipal.getUser().getRole().name()
        );
        Order order = orderService.getOrderById(orderId);
        return ResponseEntity.ok(order);
    }

    @GetMapping("/number/{orderNumber}")
    public ResponseEntity<Order> getOrderByNumber(@PathVariable String orderNumber) {
        Order order = orderService.getOrderByOrderNumber(orderNumber);
        return ResponseEntity.ok(order);
    }

    @GetMapping("/buyer/{buyerId}")
    public ResponseEntity<List<Order>> getBuyerOrders(@PathVariable Long buyerId) {
        List<Order> orders = orderService.getOrdersByBuyer(buyerId);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/seller/{sellerId}")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<List<Order>> getSellerOrders(@PathVariable Long sellerId) {
        List<Order> orders = orderService.getOrdersBySeller(sellerId);
        return ResponseEntity.ok(orders);
    }

    @PostMapping("/{id}/schedule-inspection")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<Order> scheduleInspection(
            @PathVariable Long id,
            @Valid @RequestBody ScheduleInspectionRequest request) {
        Long orderId = Objects.requireNonNull(id, "Order ID cannot be null");
        Order order = orderService.scheduleInspection(
                orderId,
                request.getInspectionDate(),
                request.getInspectionLocation()
        );
        return ResponseEntity.ok(order);
    }

    @PostMapping("/{id}/start-inspection")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Order> startInspection(@PathVariable Long id) {
        Long orderId = Objects.requireNonNull(id, "Order ID cannot be null");
        Order order = orderService.startInspection(orderId);
        return ResponseEntity.ok(order);
    }

    @PostMapping("/{id}/complete-inspection")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Order> completeInspection(
            @PathVariable Long id,
            @Valid @RequestBody CompleteInspectionRequest request) {
        Long orderId = Objects.requireNonNull(id, "Order ID cannot be null");
        Order order = orderService.completeInspection(
                orderId,
                request.getInspectionNotes(),
                request.getInspectionStatus()
        );
        return ResponseEntity.ok(order);
    }

    @PostMapping("/{id}/initiate-payment")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Order> initiatePayment(
            @PathVariable Long id,
            @Valid @RequestBody InitiatePaymentRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null || userPrincipal.getUser() == null) {
            return ResponseEntity.status(401).build();
        }
        Long orderId = Objects.requireNonNull(id, "Order ID cannot be null");
        // BOLA Protection: Verify user owns the order before initiating payment
        objectLevelAuthorizationService.verifyOrderAccess(
                orderId,
                userPrincipal.getUser().getId(),
                userPrincipal.getUser().getRole().name()
        );
        Order order = orderService.initiatePayment(
                orderId,
                request.getGateway(),
                request.getReturnUrl()
        );
        return ResponseEntity.ok(order);
    }

    @PostMapping("/{id}/complete-payment")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Order> completePayment(@PathVariable Long id) {
        Long orderId = Objects.requireNonNull(id, "Order ID cannot be null");
        Order order = orderService.completePayment(orderId);
        return ResponseEntity.ok(order);
    }

    @PostMapping("/{id}/schedule-pickup")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<Order> schedulePickup(
            @PathVariable Long id,
            @Valid @RequestBody SchedulePickupRequest request) {
        Long orderId = Objects.requireNonNull(id, "Order ID cannot be null");
        Order order = orderService.schedulePickup(
                orderId,
                request.getPickupDate(),
                request.getPickupLocation()
        );
        return ResponseEntity.ok(order);
    }

    @PostMapping("/{id}/schedule-delivery")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<Order> scheduleDelivery(
            @PathVariable Long id,
            @Valid @RequestBody ScheduleDeliveryRequest request) {
        Long orderId = Objects.requireNonNull(id, "Order ID cannot be null");
        Order order = orderService.scheduleDelivery(
                orderId,
                request.getDeliveryDate(),
                request.getDeliveryLocation()
        );
        return ResponseEntity.ok(order);
    }

    @PostMapping("/{id}/complete")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Order> completeOrder(@PathVariable Long id) {
        Long orderId = Objects.requireNonNull(id, "Order ID cannot be null");
        Order order = orderService.completeOrder(orderId);
        return ResponseEntity.ok(order);
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Order> cancelOrder(
            @PathVariable Long id,
            @Valid @RequestBody CancelOrderRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null || userPrincipal.getUser() == null) {
            return ResponseEntity.status(401).build();
        }
        Long orderId = Objects.requireNonNull(id, "Order ID cannot be null");
        // BOLA Protection: Verify user has access to the order
        objectLevelAuthorizationService.verifyOrderAccess(
                orderId,
                userPrincipal.getUser().getId(),
                userPrincipal.getUser().getRole().name()
        );
        // Use authenticated user ID instead of request body
        Long cancelledById = userPrincipal.getUser().getId();
        Order order = orderService.cancelOrder(
                orderId,
                cancelledById,
                request.getReason()
        );
        return ResponseEntity.ok(order);
    }

    @PostMapping("/{id}/refund")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Order> refundOrder(
            @PathVariable Long id,
            @Valid @RequestBody RefundOrderRequest request) {
        Long orderId = Objects.requireNonNull(id, "Order ID cannot be null");
        Order order = orderService.refundOrder(orderId, request.getReason());
        return ResponseEntity.ok(order);
    }

    // DTOs
    @Data
    static class CreateOrderRequest {
        @NotNull
        private Long carId;
        @NotNull
        private Long buyerId;
        @NotNull
        @Positive
        private BigDecimal totalAmount;
        @NotNull
        @Positive
        private BigDecimal depositAmount;
        private Long bookingId;
    }

    @Data
    static class ScheduleInspectionRequest {
        @NotNull
        private LocalDateTime inspectionDate;
        @NotNull
        private String inspectionLocation;
    }

    @Data
    static class CompleteInspectionRequest {
        private String inspectionNotes;
        @NotNull
        private Order.InspectionStatus inspectionStatus;
    }

    @Data
    static class InitiatePaymentRequest {
        @NotNull
        private PaymentTransaction.PaymentGateway gateway;
        private String returnUrl;
    }

    @Data
    static class SchedulePickupRequest {
        @NotNull
        private LocalDateTime pickupDate;
        @NotNull
        private String pickupLocation;
    }

    @Data
    static class ScheduleDeliveryRequest {
        @NotNull
        private LocalDateTime deliveryDate;
        @NotNull
        private String deliveryLocation;
    }

    @Data
    static class CancelOrderRequest {
        @NotNull
        private String reason;
        // cancelledById removed - will be derived from authenticated user
    }

    @Data
    static class RefundOrderRequest {
        @NotNull
        private String reason;
    }
}
