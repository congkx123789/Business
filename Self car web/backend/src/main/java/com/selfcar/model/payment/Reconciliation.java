package com.selfcar.model.payment;

import com.selfcar.model.auth.User;
import jakarta.persistence.*;
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
@Table(name = "reconciliations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Reconciliation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "reconciliation_date", nullable = false)
    private LocalDate reconciliationDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReconciliationStatus status = ReconciliationStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_gateway")
    private PaymentTransaction.PaymentGateway gateway;

    @Column(name = "expected_amount", precision = 15, scale = 2)
    private BigDecimal expectedAmount; // Expected from gateway

    @Column(name = "actual_amount", precision = 15, scale = 2)
    private BigDecimal actualAmount; // Actual received

    @Column(name = "difference", precision = 15, scale = 2)
    private BigDecimal difference; // Difference (actual - expected)

    @Column(name = "transaction_count")
    private Integer transactionCount;

    @Column(name = "matched_count")
    private Integer matchedCount;

    @Column(name = "unmatched_count")
    private Integer unmatchedCount;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "reconciled_at")
    private LocalDateTime reconciledAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reconciled_by")
    private User reconciledBy; // User who performed reconciliation

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum ReconciliationStatus {
        PENDING,
        IN_PROGRESS,
        COMPLETED,
        DISCREPANCY,  // Difference found
        RESOLVED      // Discrepancy resolved
    }
}
