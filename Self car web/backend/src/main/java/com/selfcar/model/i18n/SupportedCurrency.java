package com.selfcar.model.i18n;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "supported_currencies")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class SupportedCurrency {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Currency code is required")
    @Column(name = "currency_code", nullable = false, unique = true, length = 3)
    private String currencyCode;

    @NotBlank(message = "Currency name is required")
    @Column(name = "currency_name", nullable = false)
    private String currencyName;

    @Column(name = "currency_symbol")
    private String currencySymbol;

    @Column(name = "exchange_rate", precision = 20, scale = 8)
    private BigDecimal exchangeRate = BigDecimal.ONE;

    @Column(name = "base_currency", length = 3)
    private String baseCurrency = "USD";

    @Column(name = "is_default")
    private Boolean isDefault = false;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "decimal_places")
    private Integer decimalPlaces = 2;

    @Column
    private String region;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}

