package com.selfcar.model.b2b;

import com.selfcar.model.auth.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "enterprise_partners")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class EnterprisePartner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Company name is required")
    @Column(name = "company_name", nullable = false)
    private String companyName;

    @NotBlank(message = "Business license is required")
    @Column(name = "business_license", nullable = false)
    private String businessLicense;

    @Column(name = "tax_id")
    private String taxId;

    @NotBlank(message = "Contact email is required")
    @Column(name = "contact_email", nullable = false)
    private String contactEmail;

    @NotBlank(message = "Contact phone is required")
    @Column(name = "contact_phone", nullable = false)
    private String contactPhone;

    @Column(columnDefinition = "TEXT")
    private String address;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "user_id", insertable = false, updatable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "subscription_tier", nullable = false)
    private SubscriptionTier subscriptionTier = SubscriptionTier.BASIC;

    @Enumerated(EnumType.STRING)
    @Column(name = "subscription_status", nullable = false)
    private SubscriptionStatus subscriptionStatus = SubscriptionStatus.TRIAL;

    @Column(name = "subscription_start_date")
    private LocalDate subscriptionStartDate;

    @Column(name = "subscription_end_date")
    private LocalDate subscriptionEndDate;

    @Column(name = "max_users", nullable = false)
    private Integer maxUsers = 5;

    @Column(name = "max_listings", nullable = false)
    private Integer maxListings = 100;

    @Column(name = "api_access_enabled", nullable = false)
    private Boolean apiAccessEnabled = false;

    @Column(name = "bi_dashboard_enabled", nullable = false)
    private Boolean biDashboardEnabled = true;

    @Column(name = "campaign_management_enabled", nullable = false)
    private Boolean campaignManagementEnabled = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PartnerStatus status = PartnerStatus.PENDING;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum SubscriptionTier {
        BASIC,
        PROFESSIONAL,
        ENTERPRISE,
        CUSTOM
    }

    public enum SubscriptionStatus {
        TRIAL,
        ACTIVE,
        SUSPENDED,
        CANCELLED
    }

    public enum PartnerStatus {
        PENDING,
        VERIFIED,
        ACTIVE,
        SUSPENDED
    }
}

