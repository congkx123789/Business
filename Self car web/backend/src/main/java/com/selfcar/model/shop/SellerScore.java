package com.selfcar.model.shop;

import com.selfcar.model.auth.User;
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
 * Automated seller scoring system (similar to Shopee's seller reputation)
 * Calculated based on multiple factors: response time, completion rate, ratings, etc.
 */
@Entity
@Table(name = "seller_scores", indexes = {
    @Index(name = "idx_seller_score_user", columnList = "seller_id"),
    @Index(name = "idx_seller_score_shop", columnList = "shop_id"),
    @Index(name = "idx_seller_score_total", columnList = "total_score")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class SellerScore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private User seller;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shop_id")
    private Shop shop;

    // Overall score (0-100)
    @Column(name = "total_score", nullable = false, precision = 5, scale = 2)
    private BigDecimal totalScore = BigDecimal.ZERO;

    // Component scores (0-100 each)
    @Column(name = "response_time_score", precision = 5, scale = 2)
    private BigDecimal responseTimeScore; // Based on average response time

    @Column(name = "completion_rate_score", precision = 5, scale = 2)
    private BigDecimal completionRateScore; // Orders completed / orders created

    @Column(name = "rating_score", precision = 5, scale = 2)
    private BigDecimal ratingScore; // Average rating normalized to 0-100

    @Column(name = "on_time_delivery_score", precision = 5, scale = 2)
    private BigDecimal onTimeDeliveryScore; // On-time deliveries / total deliveries

    @Column(name = "customer_satisfaction_score", precision = 5, scale = 2)
    private BigDecimal customerSatisfactionScore; // Based on reviews and complaints

    // Metrics
    @Column(name = "avg_response_time_hours", precision = 5, scale = 2)
    private BigDecimal avgResponseTimeHours;

    @Column(name = "total_orders", nullable = false)
    private Long totalOrders = 0L;

    @Column(name = "completed_orders", nullable = false)
    private Long completedOrders = 0L;

    @Column(name = "cancelled_orders", nullable = false)
    private Long cancelledOrders = 0L;

    @Column(name = "avg_rating", precision = 3, scale = 2)
    private BigDecimal avgRating; // 1-5 scale

    @Column(name = "total_reviews", nullable = false)
    private Long totalReviews = 0L;

    @Column(name = "on_time_deliveries", nullable = false)
    private Long onTimeDeliveries = 0L;

    @Column(name = "total_deliveries", nullable = false)
    private Long totalDeliveries = 0L;

    // Verification status
    @Column(name = "is_top_verified", nullable = false)
    private Boolean isTopVerified = false; // Top 10% of sellers

    @Column(name = "is_verified_dealer", nullable = false)
    private Boolean isVerifiedDealer = false; // Verified by platform

    @Column(name = "badge_level")
    @Enumerated(EnumType.STRING)
    private BadgeLevel badgeLevel = BadgeLevel.BRONZE;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @Column(name = "last_calculated_at")
    private LocalDateTime lastCalculatedAt;

    public enum BadgeLevel {
        BRONZE,    // 0-40 score
        SILVER,    // 41-60 score
        GOLD,      // 61-80 score
        PLATINUM,  // 81-95 score
        DIAMOND    // 96-100 score
    }

    /**
     * Calculate badge level based on total score
     */
    public void updateBadgeLevel() {
        if (totalScore.compareTo(new BigDecimal("96")) >= 0) {
            this.badgeLevel = BadgeLevel.DIAMOND;
        } else if (totalScore.compareTo(new BigDecimal("81")) >= 0) {
            this.badgeLevel = BadgeLevel.PLATINUM;
        } else if (totalScore.compareTo(new BigDecimal("61")) >= 0) {
            this.badgeLevel = BadgeLevel.GOLD;
        } else if (totalScore.compareTo(new BigDecimal("41")) >= 0) {
            this.badgeLevel = BadgeLevel.SILVER;
        } else {
            this.badgeLevel = BadgeLevel.BRONZE;
        }
    }
}

