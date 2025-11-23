package com.selfcar.model.order;

import com.selfcar.model.auth.User;
import com.selfcar.model.car.Car;
import com.selfcar.model.booking.Booking;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_number", nullable = false, unique = true, length = 50)
    private String orderNumber;

    @NotNull(message = "Buyer is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_id", nullable = false)
    private User buyer;

    @NotNull(message = "Seller is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private User seller;

    @NotNull(message = "Car is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "car_id", nullable = false)
    private Car car;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id")
    private Booking booking;

    @NotNull(message = "Total amount is required")
    @Positive(message = "Total amount must be positive")
    @Column(name = "total_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalAmount;

    @NotNull(message = "Deposit amount is required")
    @Positive(message = "Deposit amount must be positive")
    @Column(name = "deposit_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal depositAmount;

    @NotNull(message = "Remaining amount is required")
    @Column(name = "remaining_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal remainingAmount;

    @Column(name = "platform_fee", nullable = false, precision = 15, scale = 2)
    private BigDecimal platformFee = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status = OrderStatus.BOOKED;

    @Column(length = 3)
    private String currency = "VND";

    // Inspection fields
    @Column(name = "inspection_date")
    private LocalDateTime inspectionDate;

    @Column(name = "inspection_location", length = 500)
    private String inspectionLocation;

    @Column(name = "inspection_notes", columnDefinition = "TEXT")
    private String inspectionNotes;

    @Enumerated(EnumType.STRING)
    @Column(name = "inspection_status")
    private InspectionStatus inspectionStatus = InspectionStatus.PENDING;

    // Pickup fields
    @Column(name = "pickup_date")
    private LocalDateTime pickupDate;

    @Column(name = "pickup_location", length = 500)
    private String pickupLocation;

    // Delivery fields
    @Column(name = "delivery_date")
    private LocalDateTime deliveryDate;

    @Column(name = "delivery_location", length = 500)
    private String deliveryLocation;

    // Cancellation fields
    @Column(name = "cancellation_reason", columnDefinition = "TEXT")
    private String cancellationReason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cancelled_by")
    private User cancelledBy;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum OrderStatus {
        BOOKED,
        INSPECTION_SCHEDULED,
        INSPECTION_IN_PROGRESS,
        INSPECTION_COMPLETED,
        PAYMENT_PENDING,
        PAYMENT_COMPLETED,
        PICKUP_SCHEDULED,
        PICKUP_IN_PROGRESS,
        DELIVERY_SCHEDULED,
        DELIVERY_IN_PROGRESS,
        COMPLETED,
        CANCELLED,
        REFUNDED
    }

    public enum InspectionStatus {
        PENDING,
        SCHEDULED,
        PASSED,
        FAILED,
        RESCHEDULED
    }

    public boolean canTransitionTo(OrderStatus newStatus) {
        return switch (this.status) {
            case BOOKED -> newStatus == OrderStatus.INSPECTION_SCHEDULED || 
                          newStatus == OrderStatus.CANCELLED;
            case INSPECTION_SCHEDULED -> newStatus == OrderStatus.INSPECTION_IN_PROGRESS ||
                                         newStatus == OrderStatus.CANCELLED;
            case INSPECTION_IN_PROGRESS -> newStatus == OrderStatus.INSPECTION_COMPLETED ||
                                           newStatus == OrderStatus.CANCELLED;
            case INSPECTION_COMPLETED -> newStatus == OrderStatus.PAYMENT_PENDING ||
                                         newStatus == OrderStatus.REFUNDED;
            case PAYMENT_PENDING -> newStatus == OrderStatus.PAYMENT_COMPLETED ||
                                    newStatus == OrderStatus.REFUNDED;
            case PAYMENT_COMPLETED -> newStatus == OrderStatus.PICKUP_SCHEDULED ||
                                      newStatus == OrderStatus.DELIVERY_SCHEDULED ||
                                      newStatus == OrderStatus.REFUNDED;
            case PICKUP_SCHEDULED -> newStatus == OrderStatus.PICKUP_IN_PROGRESS ||
                                     newStatus == OrderStatus.CANCELLED;
            case PICKUP_IN_PROGRESS -> newStatus == OrderStatus.DELIVERY_SCHEDULED ||
                                       newStatus == OrderStatus.COMPLETED;
            case DELIVERY_SCHEDULED -> newStatus == OrderStatus.DELIVERY_IN_PROGRESS ||
                                       newStatus == OrderStatus.CANCELLED;
            case DELIVERY_IN_PROGRESS -> newStatus == OrderStatus.COMPLETED;
            default -> false;
        };
    }
}
