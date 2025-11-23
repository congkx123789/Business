package com.selfcar.model.b2b;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "enterprise_analytics")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class EnterpriseAnalytics {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "enterprise_id", nullable = false)
    private Long enterpriseId;

    @Enumerated(EnumType.STRING)
    @Column(name = "period_type", nullable = false)
    private PeriodType periodType;

    @Column(name = "period_start", nullable = false)
    private LocalDate periodStart;

    @Column(name = "period_end", nullable = false)
    private LocalDate periodEnd;

    @Column(name = "total_listings")
    private Integer totalListings = 0;

    @Column(name = "active_listings")
    private Integer activeListings = 0;

    @Column(name = "total_views")
    private Long totalViews = 0L;

    @Column(name = "total_inquiries")
    private Integer totalInquiries = 0;

    @Column(name = "total_orders")
    private Integer totalOrders = 0;

    @Column(name = "completed_orders")
    private Integer completedOrders = 0;

    @Column(name = "cancelled_orders")
    private Integer cancelledOrders = 0;

    @Column(name = "total_revenue", precision = 15, scale = 2)
    private BigDecimal totalRevenue = BigDecimal.ZERO;

    @Column(name = "average_order_value", precision = 15, scale = 2)
    private BigDecimal averageOrderValue = BigDecimal.ZERO;

    @Column(name = "conversion_rate", precision = 5, scale = 2)
    private BigDecimal conversionRate = BigDecimal.ZERO;

    @Column(name = "top_performing_cars", columnDefinition = "JSON")
    private String topPerformingCars;

    @Column(name = "traffic_sources", columnDefinition = "JSON")
    private String trafficSources;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum PeriodType {
        DAILY,
        WEEKLY,
        MONTHLY,
        YEARLY
    }
}

