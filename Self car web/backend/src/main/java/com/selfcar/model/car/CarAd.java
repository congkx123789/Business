package com.selfcar.model.car;

import com.selfcar.model.shop.Shop;
import jakarta.persistence.*;
import jakarta.validation.constraints.Positive;
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
@Table(name = "car_ads")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class CarAd {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "car_id", nullable = false)
    private Car car;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shop_id", nullable = false)
    private Shop shop;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AdType type;

    @Column(name = "keywords", columnDefinition = "TEXT")
    private String keywords; // Comma-separated keywords for search ads like "Toyota Fortuner 2022"

    @Positive(message = "Bid amount must be positive")
    @Column(precision = 10, scale = 2)
    private BigDecimal bidAmount; // Cost per click/impression for search ads

    @Column(name = "placement_location")
    private String placementLocation; // "homepage", "car_listing", "related_cars", etc.

    @Column(nullable = false)
    private Boolean active = true;

    @Column(name = "click_count")
    private Long clickCount = 0L;

    @Column(name = "impression_count")
    private Long impressionCount = 0L;

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    @Column(name = "daily_budget", precision = 10, scale = 2)
    private BigDecimal dailyBudget;

    @Column(name = "spent_today", precision = 10, scale = 2)
    private BigDecimal spentToday = BigDecimal.ZERO;

    @Column(name = "budget_reset_date")
    private LocalDate budgetResetDate; // Date when spentToday last reset

    @Column(name = "paused", nullable = false)
    private Boolean paused = false; // Auto-pause when budget exceeded

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum AdType {
        SEARCH_AD,      // Keyword bidding for searches
        DISCOVERY_AD,   // Smart placement in homepage and related listings
        PROMOTION       // General promotion
    }
}
