package com.selfcar.service.monetization;

import com.selfcar.model.monetization.TransactionFee;
import com.selfcar.model.monetization.TransactionFeeConfig;
import com.selfcar.model.order.Order;
import com.selfcar.model.payment.PaymentTransaction;
import com.selfcar.repository.monetization.TransactionFeeConfigRepository;
import com.selfcar.repository.monetization.TransactionFeeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Objects;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class TransactionFeeService {

    private final TransactionFeeConfigRepository feeConfigRepository;
    private final TransactionFeeRepository feeRepository;

    public TransactionFee calculateAndCreateFee(
            PaymentTransaction transaction,
            Order order,
            TransactionFeeConfig.FeeType feeType,
            String subscriptionTier) {

        // Get applicable fee config
        TransactionFeeConfig feeConfig = getApplicableFeeConfig(feeType, subscriptionTier);

        if (feeConfig == null) {
            log.warn("No fee config found for type: {} and tier: {}", feeType, subscriptionTier);
            return null;
        }

        BigDecimal transactionAmount = transaction.getAmount();
        BigDecimal feePercentage = feeConfig.getFeePercentage();

        // Calculate base fee
        BigDecimal baseFeeAmount = transactionAmount.multiply(feePercentage)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        // Apply min/max constraints
        if (feeConfig.getMinFeeAmount() != null && baseFeeAmount.compareTo(feeConfig.getMinFeeAmount()) < 0) {
            baseFeeAmount = feeConfig.getMinFeeAmount();
        }
        if (feeConfig.getMaxFeeAmount() != null && baseFeeAmount.compareTo(feeConfig.getMaxFeeAmount()) > 0) {
            baseFeeAmount = feeConfig.getMaxFeeAmount();
        }

        // Apply subscription discount
        BigDecimal discountAmount = BigDecimal.ZERO;
        if (feeConfig.getDiscountPercentage().compareTo(BigDecimal.ZERO) > 0) {
            discountAmount = baseFeeAmount.multiply(feeConfig.getDiscountPercentage())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        }

        BigDecimal netFeeAmount = baseFeeAmount.subtract(discountAmount);

        // Create fee record
        TransactionFee fee = new TransactionFee();
        fee.setTransaction(transaction);
        fee.setTransactionId(transaction.getId());
        fee.setOrder(order);
        if (order != null) {
            fee.setOrderId(order.getId());
        }
        fee.setFeeConfig(feeConfig);
        fee.setFeeConfigId(feeConfig.getId());
        fee.setTransactionAmount(transactionAmount);
        fee.setFeePercentage(feePercentage);
        fee.setFeeAmount(baseFeeAmount);
        fee.setDiscountAmount(discountAmount);
        fee.setNetFeeAmount(netFeeAmount);
        fee.setCurrency(transaction.getCurrency());
        fee.setSubscriptionTier(subscriptionTier);
        fee.setStatus(TransactionFee.FeeStatus.PENDING);

        return feeRepository.save(fee);
    }

    private TransactionFeeConfig getApplicableFeeConfig(
            TransactionFeeConfig.FeeType feeType,
            String subscriptionTier) {

        // Try to find config for specific tier
        if (subscriptionTier != null && !subscriptionTier.equals("BASIC")) {
            TransactionFeeConfig.SubscriptionTier tier = parseSubscriptionTier(subscriptionTier);
            Optional<TransactionFeeConfig> tierConfig = feeConfigRepository
                    .findByFeeTypeAndSubscriptionTierAndStatus(
                            feeType, tier, TransactionFeeConfig.ConfigStatus.ACTIVE);
            if (tierConfig.isPresent()) {
                return tierConfig.get();
            }
        }

        // Fallback to ALL tier config
        Optional<TransactionFeeConfig> allTierConfig = feeConfigRepository
                .findByFeeTypeAndSubscriptionTierAndStatus(
                        feeType, TransactionFeeConfig.SubscriptionTier.ALL,
                        TransactionFeeConfig.ConfigStatus.ACTIVE);
        return allTierConfig.orElse(null);
    }

    private TransactionFeeConfig.SubscriptionTier parseSubscriptionTier(String tier) {
        try {
            return TransactionFeeConfig.SubscriptionTier.valueOf(tier.toUpperCase());
        } catch (IllegalArgumentException e) {
            return TransactionFeeConfig.SubscriptionTier.ALL;
        }
    }

    @Transactional
    public TransactionFee collectFee(Long feeId) {
        TransactionFee fee = feeRepository.findById(Objects.requireNonNull(feeId))
                .orElseThrow(() -> new RuntimeException("Transaction fee not found"));
        fee.setStatus(TransactionFee.FeeStatus.COLLECTED);
        fee.setCollectedAt(java.time.LocalDateTime.now());
        return feeRepository.save(fee);
    }
}

