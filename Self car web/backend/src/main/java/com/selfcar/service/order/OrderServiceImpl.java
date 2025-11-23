package com.selfcar.service.order;

import com.selfcar.model.booking.Booking;
import com.selfcar.model.car.Car;
import com.selfcar.model.common.Notification;
import com.selfcar.model.order.Order;
import com.selfcar.model.payment.PaymentTransaction;
import com.selfcar.model.auth.User;
import com.selfcar.repository.auth.UserRepository;
import com.selfcar.repository.booking.BookingRepository;
import com.selfcar.repository.car.CarRepository;
import com.selfcar.repository.order.OrderRepository;
import com.selfcar.repository.payment.WalletRepository;
import com.selfcar.service.common.NotificationService;
import com.selfcar.service.payment.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CarRepository carRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final PaymentService paymentService;
    private final WalletRepository walletRepository;
    private final NotificationService notificationService;
    
    @Value("${payment.platform-fee-percentage:2.5}")
    private BigDecimal platformFeePercentage;

    @Override
    @Transactional
    public Order createOrder(@NonNull Long carId, @NonNull Long buyerId, BigDecimal totalAmount, BigDecimal depositAmount, Long bookingId) {
        Objects.requireNonNull(carId, "Car ID cannot be null");
        Objects.requireNonNull(buyerId, "Buyer ID cannot be null");
        
        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new RuntimeException("Car not found"));
        
        User buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> new RuntimeException("Buyer not found"));
        
        if (car.getShop() == null || car.getShop().getOwner() == null) {
            throw new RuntimeException("Car shop or owner not found");
        }
        User seller = car.getShop().getOwner();
        
        Booking booking = null;
        if (bookingId != null) {
            booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new RuntimeException("Booking not found"));
        }

        // Calculate platform fee
        BigDecimal platformFee = totalAmount.multiply(platformFeePercentage)
                .divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);
        BigDecimal remainingAmount = totalAmount.subtract(depositAmount);

        Order order = new Order();
        order.setOrderNumber(generateOrderNumber());
        order.setBuyer(buyer);
        order.setSeller(seller);
        order.setCar(car);
        order.setBooking(booking);
        order.setTotalAmount(totalAmount);
        order.setDepositAmount(depositAmount);
        order.setRemainingAmount(remainingAmount);
        order.setPlatformFee(platformFee);
        order.setStatus(Order.OrderStatus.BOOKED);
        order.setCurrency("VND");

        Order saved = orderRepository.save(order);

        // Create deposit transaction
        try {
            PaymentTransaction deposit = paymentService.createDeposit(
                    bookingId != null ? bookingId : saved.getId(),
                    depositAmount,
                    PaymentTransaction.PaymentGateway.MOMO, // Default, can be changed
                    buyerId,
                    null
            );
            
            // Link transaction to order
            deposit.setOrder(saved);
            // Note: This requires updating PaymentService to accept orderId
        } catch (Exception e) {
            // Handle payment creation failure
            throw new RuntimeException("Failed to create deposit: " + e.getMessage());
        }

        // Send notifications
        notificationService.createNotification(
                buyer.getId(),
                "Order Created",
                "Your order #" + saved.getOrderNumber() + " has been created",
                Notification.NotificationType.ORDER_CREATED,
                "order",
                saved.getId()
        );

        notificationService.createNotification(
                seller.getId(),
                "New Order Received",
                "You have received a new order #" + saved.getOrderNumber(),
                Notification.NotificationType.ORDER_RECEIVED,
                "order",
                saved.getId()
        );

        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public Order getOrderById(@NonNull Long orderId) {
        Objects.requireNonNull(orderId, "Order ID cannot be null");
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }

    @Override
    @Transactional(readOnly = true)
    public Order getOrderByOrderNumber(String orderNumber) {
        return orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Order> getOrdersByBuyer(Long buyerId) {
        return orderRepository.findByBuyerIdOrderByCreatedAtDesc(buyerId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Order> getOrdersBySeller(Long sellerId) {
        return orderRepository.findBySellerIdOrderByCreatedAtDesc(sellerId);
    }

    @Override
    @Transactional
    public Order scheduleInspection(@NonNull Long orderId, LocalDateTime inspectionDate, String inspectionLocation) {
        Objects.requireNonNull(orderId, "Order ID cannot be null");
        Order order = getOrderById(orderId);
        
        if (!order.canTransitionTo(Order.OrderStatus.INSPECTION_SCHEDULED)) {
            throw new IllegalStateException("Cannot schedule inspection from current status: " + order.getStatus());
        }

        order.setInspectionDate(inspectionDate);
        order.setInspectionLocation(inspectionLocation);
        order.setInspectionStatus(Order.InspectionStatus.SCHEDULED);
        order.setStatus(Order.OrderStatus.INSPECTION_SCHEDULED);

        Order saved = orderRepository.save(order);

        notificationService.createNotification(
                order.getBuyer().getId(),
                "Inspection Scheduled",
                "Inspection for order #" + saved.getOrderNumber() + " scheduled for " + inspectionDate,
                Notification.NotificationType.INSPECTION_SCHEDULED,
                "order",
                saved.getId()
        );

        return saved;
    }

    @Override
    @Transactional
    public Order startInspection(@NonNull Long orderId) {
        Objects.requireNonNull(orderId, "Order ID cannot be null");
        Order order = getOrderById(orderId);
        
        if (!order.canTransitionTo(Order.OrderStatus.INSPECTION_IN_PROGRESS)) {
            throw new IllegalStateException("Cannot start inspection from current status: " + order.getStatus());
        }

        order.setStatus(Order.OrderStatus.INSPECTION_IN_PROGRESS);

        return orderRepository.save(order);
    }

    @Override
    @Transactional
    public Order completeInspection(@NonNull Long orderId, String inspectionNotes, Order.InspectionStatus inspectionStatus) {
        Objects.requireNonNull(orderId, "Order ID cannot be null");
        Order order = getOrderById(orderId);
        
        if (!order.canTransitionTo(Order.OrderStatus.INSPECTION_COMPLETED)) {
            throw new IllegalStateException("Cannot complete inspection from current status: " + order.getStatus());
        }

        order.setInspectionNotes(inspectionNotes);
        order.setInspectionStatus(inspectionStatus);
        order.setStatus(Order.OrderStatus.INSPECTION_COMPLETED);

        if (inspectionStatus == Order.InspectionStatus.PASSED) {
            order.setStatus(Order.OrderStatus.PAYMENT_PENDING);
        } else if (inspectionStatus == Order.InspectionStatus.FAILED) {
            // Auto-refund on failed inspection
            return refundOrder(orderId, order.getBuyer().getId(), "Inspection failed");
        }

        Order saved = orderRepository.save(order);

        notificationService.createNotification(
                order.getBuyer().getId(),
                "Inspection Completed",
                "Inspection for order #" + saved.getOrderNumber() + " completed: " + inspectionStatus,
                Notification.NotificationType.INSPECTION_COMPLETED,
                "order",
                saved.getId()
        );

        return saved;
    }

    @Override
    @Transactional
    public Order markInspectionResult(String orderNumber, boolean passed, String notes) {
        Order order = getOrderByOrderNumber(orderNumber);
        Long orderId = Objects.requireNonNull(order.getId(), "Order ID cannot be null");
        Order.InspectionStatus inspectionStatus = passed ? Order.InspectionStatus.PASSED : Order.InspectionStatus.FAILED;
        return completeInspection(orderId, notes, inspectionStatus);
    }

    @Override
    @Transactional
    public Order initiatePayment(@NonNull Long orderId, PaymentTransaction.PaymentGateway gateway, String returnUrl) {
        Objects.requireNonNull(orderId, "Order ID cannot be null");
        Order order = getOrderById(orderId);
        
        if (order.getStatus() != Order.OrderStatus.PAYMENT_PENDING) {
            throw new IllegalStateException("Order is not in payment pending status");
        }

        // Create payment transaction for remaining amount
        PaymentTransaction payment = paymentService.createDeposit(
                order.getBooking() != null ? order.getBooking().getId() : null,
                order.getRemainingAmount(),
                gateway,
                order.getBuyer().getId(),
                returnUrl
        );

        payment.setOrder(order);
        // Note: Save payment transaction via PaymentService

        return order;
    }

    @Override
    @Transactional
    public Order completePayment(@NonNull Long orderId) {
        Objects.requireNonNull(orderId, "Order ID cannot be null");
        Order order = getOrderById(orderId);
        
        if (!order.canTransitionTo(Order.OrderStatus.PAYMENT_COMPLETED)) {
            throw new IllegalStateException("Cannot complete payment from current status: " + order.getStatus());
        }

        order.setStatus(Order.OrderStatus.PAYMENT_COMPLETED);

        Order saved = orderRepository.save(order);

        // Release escrow to seller
        // Verify seller wallet exists
        walletRepository.findByUserId(order.getSeller().getId())
                .orElseThrow(() -> new RuntimeException("Seller wallet not found"));
        
        BigDecimal amountToRelease = order.getTotalAmount().subtract(order.getPlatformFee());
        paymentService.releaseEscrow(
                order.getBooking() != null ? order.getBooking().getId() : null,
                amountToRelease
        );

        notificationService.createNotification(
                order.getSeller().getId(),
                "Payment Received",
                "Payment for order #" + saved.getOrderNumber() + " has been completed",
                Notification.NotificationType.PAYMENT_RECEIVED,
                "order",
                saved.getId()
        );

        return saved;
    }

    @Override
    @Transactional
    public Order schedulePickup(@NonNull Long orderId, LocalDateTime pickupDate, String pickupLocation) {
        Objects.requireNonNull(orderId, "Order ID cannot be null");
        Order order = getOrderById(orderId);
        
        if (!order.canTransitionTo(Order.OrderStatus.PICKUP_SCHEDULED)) {
            throw new IllegalStateException("Cannot schedule pickup from current status: " + order.getStatus());
        }

        order.setPickupDate(pickupDate);
        order.setPickupLocation(pickupLocation);
        order.setStatus(Order.OrderStatus.PICKUP_SCHEDULED);

        return orderRepository.save(order);
    }

    @Override
    @Transactional
    public Order scheduleDelivery(@NonNull Long orderId, LocalDateTime deliveryDate, String deliveryLocation) {
        Objects.requireNonNull(orderId, "Order ID cannot be null");
        Order order = getOrderById(orderId);
        
        if (!order.canTransitionTo(Order.OrderStatus.DELIVERY_SCHEDULED)) {
            throw new IllegalStateException("Cannot schedule delivery from current status: " + order.getStatus());
        }

        order.setDeliveryDate(deliveryDate);
        order.setDeliveryLocation(deliveryLocation);
        order.setStatus(Order.OrderStatus.DELIVERY_SCHEDULED);

        return orderRepository.save(order);
    }

    @Override
    @Transactional
    public Order completeOrder(@NonNull Long orderId) {
        Objects.requireNonNull(orderId, "Order ID cannot be null");
        Order order = getOrderById(orderId);
        
        if (!order.canTransitionTo(Order.OrderStatus.COMPLETED)) {
            throw new IllegalStateException("Cannot complete order from current status: " + order.getStatus());
        }

        order.setStatus(Order.OrderStatus.COMPLETED);
        order.setCompletedAt(LocalDateTime.now());

        Order saved = orderRepository.save(order);

        notificationService.createNotification(
                order.getBuyer().getId(),
                "Order Completed",
                "Your order #" + saved.getOrderNumber() + " has been completed",
                Notification.NotificationType.ORDER_COMPLETED,
                "order",
                saved.getId()
        );

        return saved;
    }

    @Override
    @Transactional
    public Order cancelOrder(@NonNull Long orderId, @NonNull Long cancelledById, String reason) {
        Objects.requireNonNull(orderId, "Order ID cannot be null");
        Objects.requireNonNull(cancelledById, "Cancelled by user ID cannot be null");
        Order order = getOrderById(orderId);
        User cancelledBy = userRepository.findById(cancelledById)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (order.getStatus() == Order.OrderStatus.COMPLETED || 
            order.getStatus() == Order.OrderStatus.CANCELLED) {
            throw new IllegalStateException("Cannot cancel order in status: " + order.getStatus());
        }

        order.setStatus(Order.OrderStatus.CANCELLED);
        order.setCancellationReason(reason);
        order.setCancelledBy(cancelledBy);
        order.setCancelledAt(LocalDateTime.now());

        Order saved = orderRepository.save(order);

        // Refund deposit if already paid
        if (order.getStatus() != Order.OrderStatus.BOOKED) {
            refundOrder(orderId, "Order cancelled: " + reason);
        }

        notificationService.createNotification(
                order.getBuyer().getId(),
                "Order Cancelled",
                "Order #" + saved.getOrderNumber() + " has been cancelled",
                Notification.NotificationType.ORDER_CANCELLED,
                "order",
                saved.getId()
        );

        return saved;
    }

    @Override
    @Transactional
    public Order refundOrder(@NonNull Long orderId, String reason) {
        Objects.requireNonNull(orderId, "Order ID cannot be null");
        return refundOrder(orderId, null, reason);
    }

    private Order refundOrder(@NonNull Long orderId, Long refundedBy, String reason) {
        Objects.requireNonNull(orderId, "Order ID cannot be null");
        Order order = getOrderById(orderId);
        
        order.setStatus(Order.OrderStatus.REFUNDED);
        Order saved = orderRepository.save(order);

        // Process refund through payment service
        // This would need to find the payment transactions and refund them
        // Implementation depends on PaymentService.refund method

        notificationService.createNotification(
                order.getBuyer().getId(),
                "Order Refunded",
                "Order #" + saved.getOrderNumber() + " has been refunded: " + reason,
                Notification.NotificationType.REFUND_PROCESSED,
                "order",
                saved.getId()
        );

        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Order> getOrdersByStatus(Order.OrderStatus status) {
        return orderRepository.findByStatus(status);
    }

    private String generateOrderNumber() {
        return "ORD-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"))
                + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
