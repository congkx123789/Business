package com.selfcar.repository.payment;

import com.selfcar.model.payment.WalletTransactionLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WalletTransactionLogRepository extends JpaRepository<WalletTransactionLog, Long> {
    List<WalletTransactionLog> findByWalletIdOrderByCreatedAtDesc(Long walletId);

    Page<WalletTransactionLog> findByWalletIdOrderByCreatedAtDesc(Long walletId, Pageable pageable);

    List<WalletTransactionLog> findByTransactionId(Long transactionId);
}
