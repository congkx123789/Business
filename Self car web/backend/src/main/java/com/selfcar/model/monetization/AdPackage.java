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
@Table(name = "ad_packages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class AdPackage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Package name is required")
    @Column(name = "package_name", nullable = false)
    private String packageName;

    @NotBlank(message = "Package code is required")
    @Column(name = "package_code", nullable = false, unique = true)
    private String packageCode;

    @NotNull(message = "Ad type is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "ad_type", nullable = false)
    private AdType adType;

    @Column(columnDefinition = "TEXT")
    private String description;

    @NotNull(message = "Duration is required")
    @Column(name = "duration_days", nullable = false)
    private Integer durationDays;

    @NotNull(message = "Price is required")
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(length = 3)
    private String currency = "VND";

    @Column(name = "max_impressions")
    private Integer maxImpressions;

    @Column(name = "max_clicks")
    private Integer maxClicks;

    @Column(name = "priority_level")
    private Integer priorityLevel = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PackageStatus status = PackageStatus.ACTIVE;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum AdType {
        FEATURED,
        BANNER,
        SPONSORED,
        HOMEPAGE,
        SEARCH_RESULT,
        CAROUSEL
    }

    public enum PackageStatus {
        ACTIVE,
        INACTIVE
    }
}

