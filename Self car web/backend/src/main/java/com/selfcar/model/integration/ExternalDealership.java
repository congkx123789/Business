package com.selfcar.model.integration;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "external_dealerships")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class ExternalDealership {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Dealership name is required")
    @Column(name = "dealership_name", nullable = false)
    private String dealershipName;

    @NotBlank(message = "API key is required")
    @Column(name = "api_key", nullable = false, unique = true)
    private String apiKey;

    @NotBlank(message = "API secret is required")
    @Column(name = "api_secret", nullable = false)
    private String apiSecret;

    @Column(name = "webhook_url")
    private String webhookUrl;

    @Column(name = "inventory_sync_enabled", nullable = false)
    private Boolean inventorySyncEnabled = true;

    @Enumerated(EnumType.STRING)
    @Column(name = "sync_frequency", nullable = false)
    private SyncFrequency syncFrequency = SyncFrequency.DAILY;

    @Column(name = "last_sync_at")
    private LocalDateTime lastSyncAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DealershipStatus status = DealershipStatus.PENDING;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum SyncFrequency {
        REAL_TIME,
        HOURLY,
        DAILY
    }

    public enum DealershipStatus {
        PENDING,
        ACTIVE,
        SUSPENDED,
        INACTIVE
    }
}

