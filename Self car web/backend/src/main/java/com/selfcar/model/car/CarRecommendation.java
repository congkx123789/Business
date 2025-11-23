package com.selfcar.model.car;

import com.selfcar.model.auth.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * AI-generated car recommendations
 * Stores recommendation results for caching and learning
 */
@Entity
@Table(name = "car_recommendations", indexes = {
    @Index(name = "idx_car_rec_source", columnList = "source_car_id"),
    @Index(name = "idx_car_rec_target", columnList = "target_car_id"),
    @Index(name = "idx_car_rec_user", columnList = "user_id"),
    @Index(name = "idx_car_rec_score", columnList = "similarity_score")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class CarRecommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_car_id")
    private Car sourceCar; // Car being viewed (for "similar cars")

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_car_id", nullable = false)
    private Car targetCar; // Recommended car

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user; // User receiving recommendation (for personalized)

    @Column(name = "similarity_score", precision = 5, scale = 4)
    private BigDecimal similarityScore; // 0-1 similarity score

    @Column(name = "recommendation_type")
    @Enumerated(EnumType.STRING)
    private RecommendationType recommendationType;

    @Column(name = "reason", length = 500)
    private String reason; // Why this car was recommended

    @Column(name = "clicked", nullable = false)
    private Boolean clicked = false;

    @Column(name = "converted", nullable = false)
    private Boolean converted = false; // User made a purchase after clicking

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "clicked_at")
    private LocalDateTime clickedAt;

    public enum RecommendationType {
        SIMILAR_CARS,           // "You may also like" - based on car attributes
        PERSONALIZED,          // Based on user browsing history
        POPULAR,               // Trending cars
        PRICE_RANGE,           // Similar price range
        BRAND_CATEGORY,        // Same brand/category
        DEMAND_PREDICTION      // Predicted high demand
    }
}

