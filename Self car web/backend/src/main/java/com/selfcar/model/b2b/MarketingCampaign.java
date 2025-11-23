package com.selfcar.model.b2b;

import com.selfcar.model.auth.User;
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
@Table(name = "marketing_campaigns")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class MarketingCampaign {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enterprise_id", nullable = false)
    private EnterprisePartner enterprise;

    @Column(name = "enterprise_id", insertable = false, updatable = false)
    private Long enterpriseId;

    @NotBlank(message = "Campaign name is required")
    @Column(name = "campaign_name", nullable = false)
    private String campaignName;

    @NotNull(message = "Campaign type is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "campaign_type", nullable = false)
    private CampaignType campaignType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CampaignStatus status = CampaignStatus.DRAFT;

    @NotNull(message = "Start date is required")
    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @NotNull(message = "End date is required")
    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;

    @Column(precision = 15, scale = 2)
    private java.math.BigDecimal budget;

    @Column(name = "spent_amount", precision = 15, scale = 2)
    private java.math.BigDecimal spentAmount = java.math.BigDecimal.ZERO;

    @Column(name = "target_audience", columnDefinition = "JSON")
    private String targetAudience;

    @Column(name = "campaign_config", columnDefinition = "JSON")
    private String campaignConfig;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @Column(name = "created_by", insertable = false, updatable = false)
    private Long createdById;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum CampaignType {
        DISCOUNT,
        FLASH_SALE,
        PROMOTION,
        ADVERTISING,
        EMAIL,
        SMS
    }

    public enum CampaignStatus {
        DRAFT,
        SCHEDULED,
        ACTIVE,
        PAUSED,
        COMPLETED,
        CANCELLED
    }
}

