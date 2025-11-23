package com.selfcar.service.payment;

import com.selfcar.model.payment.PaymentTransaction;
import com.selfcar.repository.payment.PaymentTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReconciliationServiceImpl implements ReconciliationJobService {

    private final PaymentTransactionRepository paymentTransactionRepository;
    private final PaymentOrchestratorService orchestratorService;

    @Override
    @Transactional
    @Scheduled(fixedDelayString = "${reconciliation.poll-ms:60000}")
    public void reconcilePendingTransactions() {
        List<PaymentTransaction> pending = paymentTransactionRepository
                .findByTypeAndStatus(PaymentTransaction.TransactionType.DEPOSIT,
                        PaymentTransaction.TransactionStatus.PROCESSING);
        for (PaymentTransaction tx : pending) {
            try {
                var status = orchestratorService.getGateway(tx.getGateway())
                        .checkPaymentStatus(tx.getGatewayTransactionId());
                if (status.getStatus() != null && status.getStatus() != tx.getStatus()) {
                    tx.setStatus(status.getStatus());
                    paymentTransactionRepository.save(tx);
                }
            } catch (Exception e) {
                log.warn("Failed to reconcile tx {}: {}", tx.getTransactionId(), e.getMessage());
            }
        }
    }
}


