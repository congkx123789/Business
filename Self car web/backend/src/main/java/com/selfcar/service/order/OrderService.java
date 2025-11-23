package com.selfcar.service.order;

import com.selfcar.model.order.Order;
import com.selfcar.model.payment.PaymentTransaction;
import org.springframework.lang.NonNull;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface OrderService {
    Order createOrder(@NonNull Long carId, @NonNull Long buyerId, BigDecimal totalAmount, BigDecimal depositAmount, Long bookingId);
    
    Order getOrderById(@NonNull Long orderId);
    
    Order getOrderByOrderNumber(String orderNumber);
    
    List<Order> getOrdersByBuyer(Long buyerId);
    
    List<Order> getOrdersBySeller(Long sellerId);
    
    Order scheduleInspection(@NonNull Long orderId, LocalDateTime inspectionDate, String inspectionLocation);
    
    Order startInspection(@NonNull Long orderId);
    
    Order completeInspection(@NonNull Long orderId, String inspectionNotes, Order.InspectionStatus inspectionStatus);
    
    Order markInspectionResult(String orderNumber, boolean passed, String notes);
    
    Order initiatePayment(@NonNull Long orderId, PaymentTransaction.PaymentGateway gateway, String returnUrl);
    
    Order completePayment(@NonNull Long orderId);
    
    Order schedulePickup(@NonNull Long orderId, LocalDateTime pickupDate, String pickupLocation);
    
    Order scheduleDelivery(@NonNull Long orderId, LocalDateTime deliveryDate, String deliveryLocation);
    
    Order completeOrder(@NonNull Long orderId);
    
    Order cancelOrder(@NonNull Long orderId, @NonNull Long cancelledById, String reason);
    
    Order refundOrder(@NonNull Long orderId, String reason);
    
    List<Order> getOrdersByStatus(Order.OrderStatus status);
}


