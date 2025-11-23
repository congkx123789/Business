package com.selfcar.model.order;

import com.selfcar.model.booking.Booking;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "order_workflows")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class OrderWorkflow {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false, unique = true)
    private Booking booking;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WorkflowStage currentStage = WorkflowStage.BOOKED;

    @Column(name = "booked_at")
    private LocalDateTime bookedAt;

    @Column(name = "inspection_scheduled_at")
    private LocalDateTime inspectionScheduledAt;

    @Column(name = "inspection_completed_at")
    private LocalDateTime inspectionCompletedAt;

    @Column(name = "inspection_result", columnDefinition = "TEXT")
    private String inspectionResult; // Pass/Fail and notes

    @Column(name = "inspection_status")
    @Enumerated(EnumType.STRING)
    private InspectionStatus inspectionStatus;

    @Column(name = "payment_completed_at")
    private LocalDateTime paymentCompletedAt;

    @Column(name = "delivery_scheduled_at")
    private LocalDateTime deliveryScheduledAt;

    @Column(name = "delivery_completed_at")
    private LocalDateTime deliveryCompletedAt;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "cancellation_reason", columnDefinition = "TEXT")
    private String cancellationReason;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum WorkflowStage {
        BOOKED,              // Booking confirmed
        INSPECTION_SCHEDULED, // Inspection appointment set
        INSPECTION_IN_PROGRESS, // Inspection happening
        INSPECTION_COMPLETED,   // Inspection done
        PAYMENT_PENDING,     // Awaiting payment
        PAYMENT_COMPLETED,   // Payment received
        DELIVERY_SCHEDULED,  // Delivery appointment set
        DELIVERY_IN_PROGRESS, // Car being delivered
        COMPLETED,           // Order completed
        CANCELLED            // Order cancelled
    }

    public enum InspectionStatus {
        PENDING,
        PASSED,
        FAILED,
        CONDITIONAL        // Passed with conditions/notes
    }
}
