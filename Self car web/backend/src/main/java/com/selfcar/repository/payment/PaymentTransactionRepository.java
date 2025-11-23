package com.selfcar.repository.payment;

import com.selfcar.model.payment.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {
    
    Optional<PaymentTransaction> findByTransactionId(String transactionId);

    List<PaymentTransaction> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<PaymentTransaction> findByBookingIdOrderByCreatedAtDesc(Long bookingId);

    List<PaymentTransaction> findByWalletIdOrderByCreatedAtDesc(Long walletId);

    List<PaymentTransaction> findByTypeAndStatus(PaymentTransaction.TransactionType type, 
                                                  PaymentTransaction.TransactionStatus status);

    List<PaymentTransaction> findByGateway(PaymentTransaction.PaymentGateway gateway);

    @Query("SELECT pt FROM PaymentTransaction pt WHERE pt.createdAt BETWEEN :startDate AND :endDate")
    List<PaymentTransaction> findByDateRange(@Param("startDate") LocalDateTime startDate, 
                                             @Param("endDate") LocalDateTime endDate);

    @Query("SELECT SUM(pt.amount) FROM PaymentTransaction pt WHERE pt.type = :type " +
           "AND pt.status = 'COMPLETED' AND pt.createdAt BETWEEN :startDate AND :endDate")
    java.math.BigDecimal getTotalAmountByTypeAndDateRange(
            @Param("type") PaymentTransaction.TransactionType type,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
}
