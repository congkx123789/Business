package com.selfcar.repository.payment;

import com.selfcar.model.payment.Wallet;
import com.selfcar.model.payment.WalletLedgerEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WalletLedgerEntryRepository extends JpaRepository<WalletLedgerEntry, Long> {
    List<WalletLedgerEntry> findByWalletOrderByCreatedAtDesc(Wallet wallet);
}


