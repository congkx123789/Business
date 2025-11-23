package com.selfcar.model.i18n;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "translations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Translation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Translation key is required")
    @Column(name = "translation_key", nullable = false)
    private String translationKey;

    @NotBlank(message = "Language code is required")
    @Column(name = "language_code", nullable = false)
    private String languageCode;

    @NotBlank(message = "Translation value is required")
    @Column(name = "translation_value", nullable = false, columnDefinition = "TEXT")
    private String translationValue;

    @Column
    private String category;

    @Column
    private String context;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}

