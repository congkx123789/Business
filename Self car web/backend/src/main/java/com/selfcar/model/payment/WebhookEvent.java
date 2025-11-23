package com.selfcar.model.payment;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "webhook_events", indexes = {
        @Index(name = "idx_webhook_source_event", columnList = "source,eventId", unique = true),
        @Index(name = "idx_webhook_payload_hash", columnList = "payloadHash")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class WebhookEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String source; // MOMO, ZALOPAY, STRIPE_CONNECT

    @Column(length = 200)
    private String eventId; // external event id if available

    @Column(nullable = false, length = 64)
    private String payloadHash; // SHA-256 of raw payload

    @Column(columnDefinition = "TEXT")
    private String payload; // raw json

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProcessingStatus status = ProcessingStatus.RECEIVED;

    @Column(length = 500)
    private String errorMessage;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime receivedAt;

    @Column
    private LocalDateTime processedAt;

    public enum ProcessingStatus {
        RECEIVED,
        PROCESSED,
        FAILED
    }
}


