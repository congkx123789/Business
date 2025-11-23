package com.selfcar.repository.payment;

import com.selfcar.model.payment.RefundRequest;
import com.selfcar.model.payment.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RefundRequestRepository extends JpaRepository<RefundRequest, Long> {
    List<RefundRequest> findByPaymentTransaction(PaymentTransaction paymentTransaction);
}


