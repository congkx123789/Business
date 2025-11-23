package com.selfcar.model.car;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Aggregated analytics data for cars (similar to Shopee Business Insights)
 * Updated periodically via scheduled jobs
 */
@Entity
@Table(name = "car_analytics", indexes = {
    @Index(name = "idx_car_analytics_car", columnList = "car_id"),
    @Index(name = "idx_car_analytics_period", columnList = "period_start, period_end")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class CarAnalytics {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "car_id", nullable = false)
    private Car car;

    @Column(name = "period_start", nullable = false)
    private LocalDateTime periodStart;

    @Column(name = "period_end", nullable = false)
    private LocalDateTime periodEnd;

    // View metrics
    @Column(name = "total_views", nullable = false)
    private Long totalViews = 0L;

    @Column(name = "unique_views", nullable = false)
    private Long uniqueViews = 0L;

    @Column(name = "avg_view_duration_seconds")
    private Integer avgViewDurationSeconds;

    // Conversion metrics
    @Column(name = "deposits_created", nullable = false)
    private Long depositsCreated = 0L;

    @Column(name = "bookings_created", nullable = false)
    private Long bookingsCreated = 0L;

    @Column(name = "purchases_completed", nullable = false)
    private Long purchasesCompleted = 0L;

    // Conversion rates (calculated percentages)
    @Column(name = "view_to_deposit_rate", precision = 5, scale = 2)
    private BigDecimal viewToDepositRate; // (deposits / views) * 100

    @Column(name = "deposit_to_purchase_rate", precision = 5, scale = 2)
    private BigDecimal depositToPurchaseRate; // (purchases / deposits) * 100

    @Column(name = "view_to_purchase_rate", precision = 5, scale = 2)
    private BigDecimal viewToPurchaseRate; // (purchases / views) * 100

    // Sales metrics
    @Column(name = "total_revenue", precision = 15, scale = 2)
    private BigDecimal totalRevenue;

    @Column(name = "total_units_sold", nullable = false)
    private Long totalUnitsSold = 0L;

    // Traffic source breakdown
    @Column(name = "views_from_search", nullable = false)
    private Long viewsFromSearch = 0L;

    @Column(name = "views_from_organic", nullable = false)
    private Long viewsFromOrganic = 0L;

    @Column(name = "views_from_recommendation", nullable = false)
    private Long viewsFromRecommendation = 0L;

    @Column(name = "views_from_advertising", nullable = false)
    private Long viewsFromAdvertising = 0L;

    // ROI metrics (for advertising)
    @Column(name = "ad_spend", precision = 15, scale = 2)
    private BigDecimal adSpend;

    @Column(name = "ad_revenue", precision = 15, scale = 2)
    private BigDecimal adRevenue;

    @Column(name = "ad_roi", precision = 5, scale = 2)
    private BigDecimal adRoi; // ((revenue - spend) / spend) * 100

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}

