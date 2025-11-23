package com.selfcar.service.payment;

import com.selfcar.model.payment.PaymentTransaction;
import com.selfcar.model.auth.User;
import com.selfcar.model.payment.Wallet;

import java.math.BigDecimal;

public interface WalletService {
    Wallet getOrCreateWallet(User user);

    // Wallet management helpers
    Wallet getWalletByUserId(Long userId);
    Wallet addToEscrow(Long walletId, BigDecimal amount);
    Wallet releaseFromEscrow(Long walletId, BigDecimal amount);
    Wallet addToBalance(Long walletId, BigDecimal amount);
    Wallet requestWithdrawal(Long walletId, BigDecimal amount);
    Wallet updateBankDetails(Long walletId, String bankName, String accountNumber, String accountHolderName);

    // Escrow workflow
    PaymentTransaction holdEscrow(User buyer, BigDecimal amount, String description);
    PaymentTransaction releaseEscrowToSeller(String transactionId, User seller, String reason);
    PaymentTransaction refundEscrowToBuyer(String transactionId, String reason);
}
