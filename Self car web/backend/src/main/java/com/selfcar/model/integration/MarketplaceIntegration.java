package com.selfcar.model.integration;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "marketplace_integrations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class MarketplaceIntegration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Marketplace name is required")
    @Column(name = "marketplace_name", nullable = false, unique = true)
    private String marketplaceName;

    @NotNull(message = "Marketplace type is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "marketplace_type", nullable = false)
    private MarketplaceType marketplaceType;

    @Column(name = "api_endpoint")
    private String apiEndpoint;

    @Column(name = "api_key")
    private String apiKey;

    @Column(name = "api_secret")
    private String apiSecret;

    @Column(name = "auto_listing_enabled", nullable = false)
    private Boolean autoListingEnabled = false;

    @Column(name = "auto_delisting_enabled", nullable = false)
    private Boolean autoDelistingEnabled = false;

    @Column(name = "listing_template", columnDefinition = "JSON")
    private String listingTemplate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private IntegrationStatus status = IntegrationStatus.PENDING;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum MarketplaceType {
        CHOTOT_AUTO,
        CARMUDI,
        BONBANH,
        OTHER
    }

    public enum IntegrationStatus {
        PENDING,
        ACTIVE,
        SUSPENDED,
        INACTIVE
    }
}

