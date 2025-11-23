package com.selfcar.model.payment;

import com.selfcar.model.auth.User;
import com.selfcar.model.booking.Booking;
import com.selfcar.model.order.Order;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment_transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class PaymentTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String transactionId; // Unique transaction identifier

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user; // Buyer or seller

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id")
    private Booking booking; // Related booking

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order; // Related order (vehicle purchase)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wallet_id")
    private Wallet wallet; // Related wallet (for seller payouts)

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionStatus status = TransactionStatus.PENDING;

    @Enumerated(EnumType.STRING)
    private PaymentGateway gateway; // Payment gateway used

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(name = "fee_amount", precision = 15, scale = 2)
    private BigDecimal feeAmount; // Platform or gateway fee

    @Column(name = "net_amount", precision = 15, scale = 2)
    private BigDecimal netAmount; // Amount after fees

    @Column(name = "currency", length = 3)
    private String currency = "VND"; // Currency code

    @Column(name = "gateway_transaction_id", length = 200)
    private String gatewayTransactionId; // External gateway transaction ID

    @Column(name = "gateway_response", columnDefinition = "TEXT")
    private String gatewayResponse; // Full gateway response JSON

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "reference_number", length = 100)
    private String referenceNumber; // Internal reference

    @Column(name = "failure_reason", columnDefinition = "TEXT")
    private String failureReason; // Reason for failure if status is FAILED

    @Column(name = "processed_at")
    private LocalDateTime processedAt; // When transaction was completed

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum TransactionType {
        DEPOSIT,           // Buyer deposits payment
        ESCROW_HOLD,       // Funds held in escrow
        ESCROW_RELEASE,    // Release escrow to seller
        REFUND,            // Refund to buyer
        WITHDRAWAL,        // Seller withdraws funds
        PAYOUT,            // Automatic payout to seller
        FEE,               // Platform fee
        ADJUSTMENT         // Manual adjustment
    }

    public enum TransactionStatus {
        PENDING,
        PROCESSING,
        COMPLETED,
        FAILED,
        CANCELLED,
        REFUNDED
    }

    public enum PaymentGateway {
        MOMO,
        ZALOPAY,
        STRIPE_CONNECT,
        WALLET,
        BANK_TRANSFER
    }
}
