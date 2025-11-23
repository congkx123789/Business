package com.selfcar.dto.payment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WalletBalanceDTO {
    
    private Long walletId;
    private BigDecimal balance;
    private BigDecimal escrowBalance;
    private BigDecimal pendingBalance;
    private BigDecimal totalBalance;
    private BigDecimal totalEarned;
    private BigDecimal totalWithdrawn;
    private String status;
    private String bankAccountNumber;
    private String bankName;
    private String accountHolderName;
}
