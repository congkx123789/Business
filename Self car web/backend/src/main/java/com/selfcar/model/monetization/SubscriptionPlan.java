package com.selfcar.model.monetization;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
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
@Table(name = "subscription_plans")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class SubscriptionPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Plan name is required")
    @Column(name = "plan_name", nullable = false, unique = true)
    private String planName;

    @NotBlank(message = "Plan code is required")
    @Column(name = "plan_code", nullable = false, unique = true)
    private String planCode;

    @NotNull(message = "Tier is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubscriptionTier tier;

    @Column(columnDefinition = "TEXT")
    private String description;

    @NotNull(message = "Monthly price is required")
    @Column(name = "monthly_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal monthlyPrice;

    @Column(name = "yearly_price", precision = 10, scale = 2)
    private BigDecimal yearlyPrice;

    @Column(length = 3)
    private String currency = "VND";

    @Column(name = "max_listings")
    private Integer maxListings = 50;

    @Column(name = "max_users")
    private Integer maxUsers = 3;

    @Column(name = "featured_listings_enabled")
    private Boolean featuredListingsEnabled = false;

    @Column(name = "analytics_enabled")
    private Boolean analyticsEnabled = true;

    @Column(name = "api_access_enabled")
    private Boolean apiAccessEnabled = false;

    @Column(name = "priority_support")
    private Boolean prioritySupport = false;

    @Column(name = "ad_credits_monthly")
    private Integer adCreditsMonthly = 0;

    @Column(name = "transaction_fee_discount", precision = 5, scale = 2)
    private BigDecimal transactionFeeDiscount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PlanStatus status = PlanStatus.ACTIVE;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum SubscriptionTier {
        BASIC,
        PRO,
        PREMIUM,
        ENTERPRISE
    }

    public enum PlanStatus {
        ACTIVE,
        INACTIVE,
        ARCHIVED
    }
}

