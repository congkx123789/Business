package com.selfcar.model.analytics;

import com.selfcar.model.auth.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
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
@Table(name = "financial_summary",
       uniqueConstraints = @UniqueConstraint(
           columnNames = {"period_type", "period_start", "dealer_id", "category", "location"},
           name = "unique_period"
       ))
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class FinancialSummary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "period_type", nullable = false)
    private PeriodType periodType;

    @NotNull(message = "Period start is required")
    @Column(name = "period_start", nullable = false)
    private LocalDate periodStart;

    @NotNull(message = "Period end is required")
    @Column(name = "period_end", nullable = false)
    private LocalDate periodEnd;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dealer_id")
    private User dealer;

    @Column(length = 100)
    private String category;

    @Column(length = 255)
    private String location;

    @Column(name = "total_revenue", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalRevenue = BigDecimal.ZERO;

    @Column(name = "total_orders", nullable = false)
    private Integer totalOrders = 0;

    @Column(name = "completed_orders", nullable = false)
    private Integer completedOrders = 0;

    @Column(name = "cancelled_orders", nullable = false)
    private Integer cancelledOrders = 0;

    @Column(name = "platform_fees", nullable = false, precision = 15, scale = 2)
    private BigDecimal platformFees = BigDecimal.ZERO;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal refunds = BigDecimal.ZERO;

    @Column(name = "net_profit", nullable = false, precision = 15, scale = 2)
    private BigDecimal netProfit = BigDecimal.ZERO;

    @Column(name = "average_order_value", nullable = false, precision = 15, scale = 2)
    private BigDecimal averageOrderValue = BigDecimal.ZERO;

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
