package com.selfcar.repository.monetization;

import com.selfcar.model.monetization.TransactionFee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionFeeRepository extends JpaRepository<TransactionFee, Long> {
    List<TransactionFee> findByTransactionId(Long transactionId);
    List<TransactionFee> findByOrderId(Long orderId);
    List<TransactionFee> findByStatus(TransactionFee.FeeStatus status);
}

