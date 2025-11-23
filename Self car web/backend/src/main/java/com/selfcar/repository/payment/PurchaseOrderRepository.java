package com.selfcar.repository.payment;

import com.selfcar.model.payment.PurchaseOrder;
import com.selfcar.model.auth.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {
    Optional<PurchaseOrder> findByOrderNumber(String orderNumber);
    List<PurchaseOrder> findByBuyer(User buyer);
    List<PurchaseOrder> findBySeller(User seller);
}


