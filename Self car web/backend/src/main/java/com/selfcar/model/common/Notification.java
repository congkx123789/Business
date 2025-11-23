package com.selfcar.model.common;

import com.selfcar.model.auth.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotBlank(message = "Title is required")
    @Column(nullable = false, length = 200)
    private String title;

    @NotBlank(message = "Message is required")
    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationStatus status = NotificationStatus.UNREAD;

    @Column(name = "related_entity_type")
    private String relatedEntityType; // "booking", "chat", "payment", "car", etc.

    @Column(name = "related_entity_id")
    private Long relatedEntityId; // ID of the related entity

    @Column(name = "action_url")
    private String actionUrl; // URL to navigate when notification is clicked                                                                 

    @Column(name = "`read`", nullable = false)
    private Boolean read = false;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum NotificationType {
        CHAT_MESSAGE,          // New chat message received
        CHAT_REPLY,            // Reply to chat message
        PAYMENT_RECEIVED,      // Payment received
        PAYMENT_FAILED,        // Payment failed
        BOOKING_CONFIRMED,     // Booking confirmed
        BOOKING_CANCELLED,     // Booking cancelled
        BOOKING_REMINDER,      // Booking reminder
        CAR_LISTED,            // Car listed (for followers)
        REVIEW_RECEIVED,       // New review received
        FLASH_SALE,            // Flash sale started
        VOUCHER,               // Voucher available
        ORDER_CREATED,         // Order created
        ORDER_RECEIVED,        // New order received
        ORDER_COMPLETED,       // Order completed
        ORDER_CANCELLED,       // Order cancelled
        INSPECTION_SCHEDULED,  // Inspection scheduled
        INSPECTION_COMPLETED,  // Inspection completed
        REFUND_PROCESSED,      // Refund processed
        SYSTEM                 // System notification
    }

    public enum NotificationStatus {
        UNREAD,
        READ,
        ARCHIVED
    }

    public void markAsRead() {
        this.read = true;
        this.status = NotificationStatus.READ;
        this.readAt = LocalDateTime.now();
    }
}
