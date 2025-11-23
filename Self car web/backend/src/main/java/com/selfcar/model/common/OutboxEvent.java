package com.selfcar.model.common;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity(name = "CommonOutboxEvent")
@Table(name = "outbox_events_v2")
@Data
@NoArgsConstructor
public class OutboxEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 64)
    private String aggregateType; // e.g., LISTING

    @Column(nullable = false)
    private Long aggregateId; // e.g., listingId (car id)

    @Column(nullable = false, length = 64)
    private String eventType; // e.g., LISTING_CREATED

    @Lob
    @Column(nullable = false)
    private String payloadJson; // serialized event payload

    @Column(nullable = false)
    private Long version; // optimistic version from write model

    @CreationTimestamp
    private LocalDateTime createdAt;

    private LocalDateTime publishedAt;

    @Column(nullable = false, length = 16)
    private String status = "PENDING"; // PENDING | PUBLISHED | FAILED

    @Column(nullable = false, unique = true, length = 64)
    private String eventId = UUID.randomUUID().toString();

    @Builder
    public OutboxEvent(String aggregateType, Long aggregateId, String eventType, String payloadJson, Long version) {
        this.aggregateType = aggregateType;
        this.aggregateId = aggregateId;
        this.eventType = eventType;
        this.payloadJson = payloadJson;
        this.version = version != null ? version : 0L;
    }
}


