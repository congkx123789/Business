package com.selfcar.model.logistics;

import com.selfcar.model.order.Order;
import com.selfcar.model.auth.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "logistics_tasks")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class LogisticsTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "task_number", nullable = false, unique = true, length = 50)
    private String taskNumber;

    @NotNull(message = "Order is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Enumerated(EnumType.STRING)
    @Column(name = "task_type", nullable = false)
    private TaskType taskType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskStatus status = TaskStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_driver_id")
    private User assignedDriver;

    @Column(name = "scheduled_date")
    private LocalDateTime scheduledDate;

    @Column(name = "actual_start_date")
    private LocalDateTime actualStartDate;

    @Column(name = "actual_completion_date")
    private LocalDateTime actualCompletionDate;

    @Column(name = "pickup_location", length = 500)
    private String pickupLocation;

    @Column(name = "delivery_location", length = 500)
    private String deliveryLocation;

    @Column(name = "vehicle_condition_notes", columnDefinition = "TEXT")
    private String vehicleConditionNotes;

    @Column(name = "driver_notes", columnDefinition = "TEXT")
    private String driverNotes;

    @Column(name = "reason_code", length = 100)
    private String reasonCode;

    @Column(name = "customer_contact_name", length = 255)
    private String customerContactName;

    @Column(name = "customer_contact_phone", length = 20)
    private String customerContactPhone;

    @Column(name = "estimated_duration_minutes")
    private Integer estimatedDurationMinutes;

    @Column(name = "actual_duration_minutes")
    private Integer actualDurationMinutes;

    @Column(name = "distance_km", precision = 10, scale = 2)
    private BigDecimal distanceKm;

    @Column(name = "logistics_cost", precision = 10, scale = 2)
    private BigDecimal logisticsCost;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum TaskType {
        INSPECTION,
        PICKUP,
        DELIVERY
    }

    public enum TaskStatus {
        PENDING,
        SCHEDULED,
        ASSIGNED,
        IN_PROGRESS,
        COMPLETED,
        CANCELLED
    }

    public boolean canTransitionTo(TaskStatus newStatus) {
        return switch (this.status) {
            case PENDING -> newStatus == TaskStatus.SCHEDULED || 
                           newStatus == TaskStatus.CANCELLED;
            case SCHEDULED -> newStatus == TaskStatus.ASSIGNED ||
                             newStatus == TaskStatus.CANCELLED;
            case ASSIGNED -> newStatus == TaskStatus.IN_PROGRESS ||
                            newStatus == TaskStatus.CANCELLED;
            case IN_PROGRESS -> newStatus == TaskStatus.COMPLETED ||
                               newStatus == TaskStatus.CANCELLED;
            default -> false;
        };
    }
}


