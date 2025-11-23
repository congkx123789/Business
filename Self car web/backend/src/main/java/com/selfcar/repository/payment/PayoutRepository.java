package com.selfcar.repository.payment;

import com.selfcar.model.payment.Payout;
import com.selfcar.model.payment.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PayoutRepository extends JpaRepository<Payout, Long> {
    List<Payout> findByWallet(Wallet wallet);
}


