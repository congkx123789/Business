package com.selfcar.repository.monetization;

import com.selfcar.model.monetization.TransactionFeeConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionFeeConfigRepository extends JpaRepository<TransactionFeeConfig, Long> {
    List<TransactionFeeConfig> findByStatus(TransactionFeeConfig.ConfigStatus status);
    Optional<TransactionFeeConfig> findByFeeTypeAndSubscriptionTierAndStatus(
            TransactionFeeConfig.FeeType feeType,
            TransactionFeeConfig.SubscriptionTier subscriptionTier,
            TransactionFeeConfig.ConfigStatus status);
    List<TransactionFeeConfig> findByEffectiveFromLessThanEqualAndEffectiveToGreaterThanEqual(
            LocalDate from, LocalDate to);
}

