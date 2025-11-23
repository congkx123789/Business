package com.selfcar.model.shop;

import com.selfcar.model.auth.User;
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
@Table(name = "seller_verifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class SellerVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VerificationType verificationType;

    @NotBlank(message = "Document number is required")
    @Column(nullable = false)
    private String documentNumber; // ID number or dealer license number

    @Column(name = "document_front_url", nullable = false)
    private String documentFrontUrl;

    @Column(name = "document_back_url")
    private String documentBackUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VerificationStatus status = VerificationStatus.PENDING;

    @Column(columnDefinition = "TEXT")
    private String rejectionReason; // Reason if rejected

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy; // Admin who reviewed

    private LocalDateTime reviewedAt;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum VerificationType {
        NATIONAL_ID,      // National ID card
        DEALER_LICENSE,   // Dealer license
        BUSINESS_LICENSE  // Business registration
    }

    public enum VerificationStatus {
        PENDING,    // Awaiting review
        APPROVED,   // Approved
        REJECTED    // Rejected
    }
}
