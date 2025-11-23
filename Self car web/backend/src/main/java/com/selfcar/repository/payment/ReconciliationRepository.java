package com.selfcar.repository.payment;

import com.selfcar.model.payment.PaymentTransaction;
import com.selfcar.model.payment.Reconciliation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReconciliationRepository extends JpaRepository<Reconciliation, Long> {
    
    Optional<Reconciliation> findByReconciliationDateAndGateway(LocalDate date, 
                                                                 PaymentTransaction.PaymentGateway gateway);
    
    List<Reconciliation> findByReconciliationDateBetween(LocalDate startDate, LocalDate endDate);
    
    List<Reconciliation> findByStatus(Reconciliation.ReconciliationStatus status);
}
