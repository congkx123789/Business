package com.selfcar.model.shop;

import com.selfcar.model.auth.User;
import com.selfcar.model.car.Car;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "shops")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Shop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Shop name is required")
    @Column(nullable = false, unique = true)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String logoUrl;

    private String bannerUrl;

    @Column(name = "primary_color", length = 7)
    private String primaryColor; // Hex color code for shop theme

    @Column(name = "secondary_color", length = 7)
    private String secondaryColor; // Secondary theme color

    @Column(name = "intro_video_url")
    private String introVideoUrl; // Shop introduction video URL

    @Column(name = "featured_listings", columnDefinition = "TEXT")
    private String featuredListings; // JSON array of car IDs for featured listings

    @Column(name = "custom_banner_url")
    private String customBannerUrl; // Additional custom banner image

    @NotBlank(message = "Address is required")
    @Column(nullable = false, columnDefinition = "TEXT")
    private String address;

    @Column(name = "pickup_points", columnDefinition = "TEXT")
    private String pickupPoints; // JSON array of pickup locations

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ShopStatus status = ShopStatus.PENDING;

    @Column(nullable = false)
    private Boolean active = true;

    @OneToMany(mappedBy = "shop", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Car> cars;

    @OneToMany(mappedBy = "shop", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<ShopReview> reviews;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum ShopStatus {
        PENDING,      // Awaiting verification
        VERIFIED,     // Verified and active
        SUSPENDED,    // Temporarily suspended
        REJECTED      // Verification rejected
    }
}
