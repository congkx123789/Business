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
import java.time.LocalDateTime;

@Entity
@Table(name = "wallets")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Wallet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user; // Seller's wallet

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal balance = BigDecimal.ZERO; // Available balance

    @Column(name = "escrow_balance", nullable = false, precision = 15, scale = 2)
    private BigDecimal escrowBalance = BigDecimal.ZERO; // Funds held in escrow

    @Column(name = "pending_balance", nullable = false, precision = 15, scale = 2)
    private BigDecimal pendingBalance = BigDecimal.ZERO; // Pending withdrawal requests

    @Column(name = "total_earned", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalEarned = BigDecimal.ZERO; // Total lifetime earnings

    @Column(name = "total_withdrawn", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalWithdrawn = BigDecimal.ZERO; // Total amount withdrawn

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WalletStatus status = WalletStatus.ACTIVE;

    @Column(name = "bank_account_number")
    private String bankAccountNumber; // For payouts

    @Column(name = "bank_name")
    private String bankName;

    @Column(name = "account_holder_name")
    private String accountHolderName;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum WalletStatus {
        ACTIVE,
        SUSPENDED,
        CLOSED
    }

    public BigDecimal getTotalBalance() {
        return balance.add(escrowBalance);
    }
}
