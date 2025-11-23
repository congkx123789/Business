package com.selfcar.model.car;

import com.selfcar.model.auth.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * Tracks car views for analytics (views → deposits → purchases conversion)
 */
@Entity
@Table(name = "car_views", indexes = {
    @Index(name = "idx_car_view_car", columnList = "car_id"),
    @Index(name = "idx_car_view_user", columnList = "user_id"),
    @Index(name = "idx_car_view_created", columnList = "created_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class CarView {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "car_id", nullable = false)
    private Car car;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user; // Nullable for anonymous views

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @Column(name = "referrer", length = 500)
    private String referrer; // Track where the view came from (search, organic, recommendation)

    @Enumerated(EnumType.STRING)
    @Column(name = "traffic_source")
    private TrafficSource trafficSource;

    @Column(name = "view_duration_seconds")
    private Integer viewDurationSeconds; // Time spent viewing

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum TrafficSource {
        SEARCH,           // From search results
        ORGANIC,          // Direct navigation, bookmarks
        RECOMMENDATION,   // AI recommendations
        ADVERTISING,      // Paid ads
        SOCIAL_MEDIA,     // Social media links
        OTHER
    }
}

