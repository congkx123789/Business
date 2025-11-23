package com.selfcar.service.payment;

import com.selfcar.model.payment.PaymentTransaction;
import com.selfcar.model.auth.User;
import com.selfcar.model.payment.Wallet;
import com.selfcar.model.payment.WalletLedgerEntry;
import com.selfcar.repository.payment.PaymentTransactionRepository;
import com.selfcar.repository.payment.WalletLedgerEntryRepository;
import com.selfcar.repository.payment.WalletRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class WalletServiceImpl implements WalletService {

    private final WalletRepository walletRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final WalletLedgerEntryRepository walletLedgerEntryRepository;

    @Override
    @Transactional
    public Wallet getOrCreateWallet(User user) {
        return walletRepository.findByUserId(user.getId()).orElseGet(() -> {
            Wallet wallet = new Wallet();
            wallet.setUser(user);
            return walletRepository.save(wallet);
        });
    }

    @Override
    public Wallet getWalletByUserId(Long userId) {
        if (userId == null) {
            throw new IllegalArgumentException("userId is required");
        }
        return walletRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Wallet not found"));
    }

    @Override
    @Transactional
    public PaymentTransaction holdEscrow(User buyer, BigDecimal amount, String description) {
        Wallet buyerWallet = getOrCreateWallet(buyer);

        PaymentTransaction tx = new PaymentTransaction();
        tx.setTransactionId(generateTxId());
        tx.setUser(buyer);
        tx.setWallet(buyerWallet);
        tx.setType(PaymentTransaction.TransactionType.ESCROW_HOLD);
        tx.setStatus(PaymentTransaction.TransactionStatus.PROCESSING);
        tx.setGateway(PaymentTransaction.PaymentGateway.WALLET);
        tx.setAmount(amount);
        tx.setNetAmount(amount);
        tx.setDescription(description);
        tx.setProcessedAt(LocalDateTime.now());
        paymentTransactionRepository.save(tx);

        // Move funds from balance to escrow
        buyerWallet.setEscrowBalance(buyerWallet.getEscrowBalance().add(amount));
        walletRepository.save(buyerWallet);

        WalletLedgerEntry ledger = new WalletLedgerEntry();
        ledger.setWallet(buyerWallet);
        ledger.setType(WalletLedgerEntry.EntryType.ESCROW_HOLD);
        ledger.setAmount(amount);
        ledger.setBalanceAfter(buyerWallet.getBalance());
        ledger.setEscrowBalanceAfter(buyerWallet.getEscrowBalance());
        ledger.setReferenceId(tx.getTransactionId());
        ledger.setReferenceType("PAYMENT_TRANSACTION");
        ledger.setDescription("Escrow hold: " + description);
        walletLedgerEntryRepository.save(ledger);

        tx.setStatus(PaymentTransaction.TransactionStatus.COMPLETED);
        return paymentTransactionRepository.save(tx);
    }

    @Override
    @Transactional
    public PaymentTransaction releaseEscrowToSeller(String transactionId, User seller, String reason) {
        PaymentTransaction escrowTx = paymentTransactionRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found: " + transactionId));

        BigDecimal amount = escrowTx.getAmount();

        // Decrease buyer escrow, credit seller balance
        Wallet buyerWallet = escrowTx.getWallet();
        buyerWallet.setEscrowBalance(buyerWallet.getEscrowBalance().subtract(amount));
        walletRepository.save(buyerWallet);

        Wallet sellerWallet = getOrCreateWallet(seller);
        sellerWallet.setBalance(sellerWallet.getBalance().add(amount));
        sellerWallet.setTotalEarned(sellerWallet.getTotalEarned().add(amount));
        walletRepository.save(sellerWallet);

        // Log buyer escrow release
        WalletLedgerEntry buyerLedger = new WalletLedgerEntry();
        buyerLedger.setWallet(buyerWallet);
        buyerLedger.setType(WalletLedgerEntry.EntryType.ESCROW_RELEASE);
        buyerLedger.setAmount(amount.negate());
        buyerLedger.setBalanceAfter(buyerWallet.getBalance());
        buyerLedger.setEscrowBalanceAfter(buyerWallet.getEscrowBalance());
        buyerLedger.setReferenceId(transactionId);
        buyerLedger.setReferenceType("PAYMENT_TRANSACTION");
        buyerLedger.setDescription("Escrow released to seller: " + reason);
        walletLedgerEntryRepository.save(buyerLedger);

        // Log seller credit
        WalletLedgerEntry sellerLedger = new WalletLedgerEntry();
        sellerLedger.setWallet(sellerWallet);
        sellerLedger.setType(WalletLedgerEntry.EntryType.CREDIT);
        sellerLedger.setAmount(amount);
        sellerLedger.setBalanceAfter(sellerWallet.getBalance());
        sellerLedger.setEscrowBalanceAfter(sellerWallet.getEscrowBalance());
        sellerLedger.setReferenceId(transactionId);
        sellerLedger.setReferenceType("PAYMENT_TRANSACTION");
        sellerLedger.setDescription("Payout from escrow release");
        walletLedgerEntryRepository.save(sellerLedger);

        // Create payout transaction record for seller
        PaymentTransaction payoutTx = new PaymentTransaction();
        payoutTx.setTransactionId(generateTxId());
        payoutTx.setUser(seller);
        payoutTx.setWallet(sellerWallet);
        payoutTx.setType(PaymentTransaction.TransactionType.PAYOUT);
        payoutTx.setStatus(PaymentTransaction.TransactionStatus.COMPLETED);
        payoutTx.setGateway(PaymentTransaction.PaymentGateway.WALLET);
        payoutTx.setAmount(amount);
        payoutTx.setNetAmount(amount);
        payoutTx.setDescription("Escrow release from " + transactionId);
        payoutTx.setProcessedAt(LocalDateTime.now());
        paymentTransactionRepository.save(payoutTx);

        return payoutTx;
    }

    @Override
    @Transactional
    public PaymentTransaction refundEscrowToBuyer(String transactionId, String reason) {
        PaymentTransaction escrowTx = paymentTransactionRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found: " + transactionId));

        BigDecimal amount = escrowTx.getAmount();
        Wallet buyerWallet = escrowTx.getWallet();
        buyerWallet.setEscrowBalance(buyerWallet.getEscrowBalance().subtract(amount));
        buyerWallet.setBalance(buyerWallet.getBalance().add(amount));
        walletRepository.save(buyerWallet);

        WalletLedgerEntry ledger = new WalletLedgerEntry();
        ledger.setWallet(buyerWallet);
        ledger.setType(WalletLedgerEntry.EntryType.ESCROW_RELEASE);
        ledger.setAmount(amount);
        ledger.setBalanceAfter(buyerWallet.getBalance());
        ledger.setEscrowBalanceAfter(buyerWallet.getEscrowBalance());
        ledger.setReferenceId(transactionId);
        ledger.setReferenceType("PAYMENT_TRANSACTION");
        ledger.setDescription("Refund from escrow: " + reason);
        walletLedgerEntryRepository.save(ledger);

        PaymentTransaction refundTx = new PaymentTransaction();
        refundTx.setTransactionId(generateTxId());
        refundTx.setUser(escrowTx.getUser());
        refundTx.setWallet(buyerWallet);
        refundTx.setType(PaymentTransaction.TransactionType.REFUND);
        refundTx.setStatus(PaymentTransaction.TransactionStatus.COMPLETED);
        refundTx.setGateway(PaymentTransaction.PaymentGateway.WALLET);
        refundTx.setAmount(amount);
        refundTx.setNetAmount(amount);
        refundTx.setDescription("Escrow refund from " + transactionId);
        refundTx.setProcessedAt(LocalDateTime.now());
        return paymentTransactionRepository.save(refundTx);
    }

    private String generateTxId() {
        return "tx_" + UUID.randomUUID().toString().replace("-", "");
    }

    @Override
    @Transactional
    public Wallet addToEscrow(Long walletId, BigDecimal amount) {
        if (walletId == null) {
            throw new IllegalArgumentException("walletId is required");
        }
        Wallet wallet = walletRepository.findById(Objects.requireNonNull(walletId))
                .orElseThrow(() -> new RuntimeException("Wallet not found"));
        wallet.setEscrowBalance(wallet.getEscrowBalance().add(amount));
        return walletRepository.save(wallet);
    }

    @Override
    @Transactional
    public Wallet releaseFromEscrow(Long walletId, BigDecimal amount) {
        if (walletId == null) {
            throw new IllegalArgumentException("walletId is required");
        }
        Wallet wallet = walletRepository.findById(Objects.requireNonNull(walletId))
                .orElseThrow(() -> new RuntimeException("Wallet not found"));
        if (wallet.getEscrowBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient escrow balance");
        }
        wallet.setEscrowBalance(wallet.getEscrowBalance().subtract(amount));
        wallet.setBalance(wallet.getBalance().add(amount));
        wallet.setTotalEarned(wallet.getTotalEarned().add(amount));
        return walletRepository.save(wallet);
    }

    @Override
    @Transactional
    public Wallet addToBalance(Long walletId, BigDecimal amount) {
        if (walletId == null) {
            throw new IllegalArgumentException("walletId is required");
        }
        Wallet wallet = walletRepository.findById(Objects.requireNonNull(walletId))
                .orElseThrow(() -> new RuntimeException("Wallet not found"));
        wallet.setBalance(wallet.getBalance().add(amount));
        return walletRepository.save(wallet);
    }

    @Override
    @Transactional
    public Wallet requestWithdrawal(Long walletId, BigDecimal amount) {
        if (walletId == null) {
            throw new IllegalArgumentException("walletId is required");
        }
        Wallet wallet = walletRepository.findById(Objects.requireNonNull(walletId))
                .orElseThrow(() -> new RuntimeException("Wallet not found"));
        if (wallet.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient balance");
        }
        wallet.setBalance(wallet.getBalance().subtract(amount));
        wallet.setPendingBalance(wallet.getPendingBalance().add(amount));
        return walletRepository.save(wallet);
    }

    @Override
    @Transactional
    public Wallet updateBankDetails(Long walletId, String bankName, String accountNumber, String accountHolderName) {
        if (walletId == null) {
            throw new IllegalArgumentException("walletId is required");
        }
        Wallet wallet = walletRepository.findById(Objects.requireNonNull(walletId))
                .orElseThrow(() -> new RuntimeException("Wallet not found"));
        wallet.setBankName(bankName);
        wallet.setBankAccountNumber(accountNumber);
        wallet.setAccountHolderName(accountHolderName);
        return walletRepository.save(wallet);
    }
}


