package com.selfcar.model.i18n;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "regional_markets")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class RegionalMarket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Market code is required")
    @Column(name = "market_code", nullable = false, unique = true)
    private String marketCode;

    @NotBlank(message = "Market name is required")
    @Column(name = "market_name", nullable = false)
    private String marketName;

    @NotBlank(message = "Country code is required")
    @Column(name = "country_code", nullable = false, length = 2)
    private String countryCode;

    @NotBlank(message = "Default language is required")
    @Column(name = "default_language", nullable = false)
    private String defaultLanguage;

    @NotBlank(message = "Default currency is required")
    @Column(name = "default_currency", nullable = false, length = 3)
    private String defaultCurrency;

    @Column
    private String timezone;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "launch_date")
    private LocalDate launchDate;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}

