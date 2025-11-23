package com.selfcar.service.payment;

import com.selfcar.model.payment.PaymentTransaction;
import com.selfcar.model.payment.Reconciliation;
import com.selfcar.repository.payment.ReconciliationRepository;
import com.selfcar.repository.payment.PaymentTransactionRepository;
import com.selfcar.repository.auth.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service("paymentReconciliationService")
@RequiredArgsConstructor
@Slf4j
public class ReconciliationService {

    private final ReconciliationRepository reconciliationRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final UserRepository userRepository;

    @Scheduled(cron = "0 0 2 * * *") // Run daily at 2 AM
    @Transactional
    public void performDailyReconciliation() {
        log.info("Starting daily reconciliation...");
        
        LocalDate reconciliationDate = LocalDate.now().minusDays(1); // Reconcile yesterday's transactions
        
        for (PaymentTransaction.PaymentGateway gateway : PaymentTransaction.PaymentGateway.values()) {
            if (gateway == PaymentTransaction.PaymentGateway.WALLET || 
                gateway == PaymentTransaction.PaymentGateway.BANK_TRANSFER) {
                continue; // Skip internal gateways
            }
            
            try {
                performReconciliation(gateway, reconciliationDate, null);
            } catch (Exception e) {
                log.error("Error reconciling gateway {} for date {}", gateway, reconciliationDate, e);
            }
        }
        
        log.info("Daily reconciliation completed");
    }

    @Transactional
    public Reconciliation performReconciliation(PaymentTransaction.PaymentGateway gateway,
                                               LocalDate reconciliationDate,
                                               Long reconciledByUserId) {
        Reconciliation reconciliation = new Reconciliation();
        reconciliation.setReconciliationDate(reconciliationDate);
        reconciliation.setGateway(gateway);
        reconciliation.setStatus(Reconciliation.ReconciliationStatus.IN_PROGRESS);
        
        if (reconciledByUserId != null) {
            reconciliation.setReconciledBy(userRepository.findById(Objects.requireNonNull(reconciledByUserId)).orElse(null));
        }

        LocalDateTime startDateTime = reconciliationDate.atStartOfDay();
        LocalDateTime endDateTime = reconciliationDate.atTime(23, 59, 59);

        // Get all completed transactions for this gateway on this date
        List<PaymentTransaction> transactions = paymentTransactionRepository
                .findByDateRange(startDateTime, endDateTime).stream()
                .filter(t -> t.getGateway() == gateway &&
                            (t.getStatus() == PaymentTransaction.TransactionStatus.COMPLETED ||
                             t.getStatus() == PaymentTransaction.TransactionStatus.FAILED))
                .collect(Collectors.toList());

        // Calculate expected amount (sum of all completed transactions)
        BigDecimal expectedAmount = transactions.stream()
                .filter(t -> t.getStatus() == PaymentTransaction.TransactionStatus.COMPLETED)
                .map(PaymentTransaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // In production, fetch actual amount from gateway API
        // For now, use expected amount as actual (assuming no discrepancies)
        BigDecimal actualAmount = expectedAmount;

        BigDecimal difference = actualAmount.subtract(expectedAmount);
        
        reconciliation.setExpectedAmount(expectedAmount);
        reconciliation.setActualAmount(actualAmount);
        reconciliation.setDifference(difference);
        reconciliation.setTransactionCount(transactions.size());
        
        // Count matched transactions
        int matchedCount = (int) transactions.stream()
                .filter(t -> t.getGatewayTransactionId() != null && !t.getGatewayTransactionId().isEmpty())
                .count();
        
        reconciliation.setMatchedCount(matchedCount);
        reconciliation.setUnmatchedCount(transactions.size() - matchedCount);

        // Determine status
        int unmatchedCount = transactions.size() - matchedCount;
        if (difference.compareTo(BigDecimal.ZERO) == 0 && unmatchedCount == 0) {
            reconciliation.setStatus(Reconciliation.ReconciliationStatus.COMPLETED);
        } else if (difference.compareTo(BigDecimal.ZERO) != 0 || unmatchedCount > 0) {
            reconciliation.setStatus(Reconciliation.ReconciliationStatus.DISCREPANCY);
            reconciliation.setNotes("Discrepancy found: Difference = " + difference + 
                    ", Unmatched transactions = " + unmatchedCount);
        }

        reconciliation.setReconciledAt(LocalDateTime.now());
        
        Reconciliation saved = reconciliationRepository.save(reconciliation);
        log.info("Reconciliation completed for gateway {} on date {}: Status = {}", 
                gateway, reconciliationDate, saved.getStatus());
        
        return saved;
    }

    @Transactional
    public Reconciliation resolveDiscrepancy(Long reconciliationId, String notes, Long resolvedByUserId) {
        Objects.requireNonNull(reconciliationId, "Reconciliation ID cannot be null");
        
        Reconciliation reconciliation = reconciliationRepository.findById(Objects.requireNonNull(reconciliationId))
                .orElseThrow(() -> {
                    log.warn("Reconciliation not found with ID: {}", reconciliationId);
                    return new RuntimeException("Reconciliation not found");
                });

        if (reconciliation.getStatus() != Reconciliation.ReconciliationStatus.DISCREPANCY) {
            log.warn("Attempted to resolve non-discrepancy reconciliation ID: {} with status: {}", 
                    reconciliationId, reconciliation.getStatus());
            throw new RuntimeException("Can only resolve discrepancies");
        }
        
        log.info("Resolving discrepancy for reconciliation ID: {} by user ID: {}", 
                reconciliationId, resolvedByUserId);

        reconciliation.setStatus(Reconciliation.ReconciliationStatus.RESOLVED);
        reconciliation.setNotes(notes);
        if (resolvedByUserId != null) {
            reconciliation.setReconciledBy(userRepository.findById(Objects.requireNonNull(resolvedByUserId)).orElse(null));
        }
        reconciliation.setReconciledAt(LocalDateTime.now());

        return reconciliationRepository.save(reconciliation);
    }

    public List<Reconciliation> getReconciliations(LocalDate startDate, LocalDate endDate,
                                                   PaymentTransaction.PaymentGateway gateway) {
        final LocalDate finalStartDate = startDate != null ? startDate : LocalDate.now().minusDays(30);
        final LocalDate finalEndDate = endDate != null ? endDate : LocalDate.now();

        List<Reconciliation> reconciliations = reconciliationRepository.findAll().stream()
                .filter(r -> !r.getReconciliationDate().isBefore(finalStartDate) &&
                            !r.getReconciliationDate().isAfter(finalEndDate))
                .collect(Collectors.toList());

        if (gateway != null) {
            reconciliations = reconciliations.stream()
                    .filter(r -> r.getGateway() == gateway)
                    .collect(Collectors.toList());
        }

        return reconciliations;
    }
}
