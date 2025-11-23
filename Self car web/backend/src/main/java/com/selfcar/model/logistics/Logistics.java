package com.selfcar.model.logistics;

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
@Table(name = "logistics")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Logistics {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LogisticsType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LogisticsStatus status = LogisticsStatus.PENDING;

    @Column(name = "scheduled_date_time")
    private LocalDateTime scheduledDateTime;

    @Column(name = "actual_date_time")
    private LocalDateTime actualDateTime;

    @Column(name = "pickup_location", columnDefinition = "TEXT")
    private String pickupLocation; // For pickup/delivery

    @Column(name = "delivery_location", columnDefinition = "TEXT")
    private String deliveryLocation; // For delivery

    @Column(name = "inspector_name")
    private String inspectorName; // For inspection

    @Column(name = "inspector_contact")
    private String inspectorContact;

    @Column(name = "driver_name")
    private String driverName; // For delivery

    @Column(name = "driver_contact")
    private String driverContact;

    @Column(name = "vehicle_plate_number")
    private String vehiclePlateNumber; // Delivery vehicle

    @Column(name = "tracking_number", length = 100)
    private String trackingNumber;

    @Column(name = "estimated_duration_minutes")
    private Integer estimatedDurationMinutes;

    @Column(name = "actual_duration_minutes")
    private Integer actualDurationMinutes;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum LogisticsType {
        PICKUP,        // Pickup from seller location
        INSPECTION,    // Vehicle inspection
        DELIVERY       // Delivery to buyer
    }

    public enum LogisticsStatus {
        PENDING,
        SCHEDULED,
        IN_PROGRESS,
        COMPLETED,
        CANCELLED,
        DELAYED
    }
}
