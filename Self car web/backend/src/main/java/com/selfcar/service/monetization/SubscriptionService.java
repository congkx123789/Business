package com.selfcar.service.monetization;

import com.selfcar.model.monetization.DealerSubscription;
import com.selfcar.model.monetization.SubscriptionPlan;
import com.selfcar.model.auth.User;
import com.selfcar.repository.monetization.DealerSubscriptionRepository;
import com.selfcar.repository.monetization.SubscriptionPlanRepository;
import com.selfcar.repository.auth.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final SubscriptionPlanRepository planRepository;
    private final DealerSubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;

    public List<SubscriptionPlan> getAllPlans() {
        return planRepository.findByStatus(SubscriptionPlan.PlanStatus.ACTIVE);
    }

    public SubscriptionPlan getPlanById(Long id) {
        return planRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("Subscription plan not found"));
    }

    public SubscriptionPlan getPlanByCode(String planCode) {
        return planRepository.findByPlanCode(planCode)
                .orElseThrow(() -> new RuntimeException("Subscription plan not found"));
    }

    public List<DealerSubscription> getSubscriptionsByUser(Long userId) {
        return subscriptionRepository.findByUserId(userId);
    }

    public DealerSubscription getActiveSubscription(Long userId) {
        return subscriptionRepository.findByUserIdAndStatus(userId, DealerSubscription.SubscriptionStatus.ACTIVE)
                .orElse(null);
    }

    @Transactional
    public DealerSubscription createSubscription(Long userId, Long planId, DealerSubscription.BillingCycle billingCycle) {
        User user = userRepository.findById(Objects.requireNonNull(userId))
                .orElseThrow(() -> new RuntimeException("User not found"));
        SubscriptionPlan plan = getPlanById(planId);

        // Check if user already has an active subscription
        DealerSubscription existing = getActiveSubscription(userId);
        if (existing != null && existing.getStatus() == DealerSubscription.SubscriptionStatus.ACTIVE) {
            throw new RuntimeException("User already has an active subscription");
        }

        LocalDate startDate = LocalDate.now();
        LocalDate endDate = billingCycle == DealerSubscription.BillingCycle.MONTHLY
                ? startDate.plusMonths(1)
                : startDate.plusYears(1);
        LocalDate nextBillingDate = endDate;

        BigDecimal price = billingCycle == DealerSubscription.BillingCycle.MONTHLY
                ? plan.getMonthlyPrice()
                : plan.getYearlyPrice();

        DealerSubscription subscription = new DealerSubscription();
        subscription.setSubscriptionNumber("SUB-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        subscription.setUser(user);
        subscription.setUserId(userId);
        subscription.setPlan(plan);
        subscription.setPlanId(planId);
        subscription.setBillingCycle(billingCycle);
        subscription.setStatus(DealerSubscription.SubscriptionStatus.ACTIVE);
        subscription.setStartDate(startDate);
        subscription.setEndDate(endDate);
        subscription.setNextBillingDate(nextBillingDate);
        subscription.setPricePaid(price);
        subscription.setCurrency(plan.getCurrency());

        return subscriptionRepository.save(subscription);
    }

    @Transactional
    public DealerSubscription cancelSubscription(Long subscriptionId, String reason) {
        DealerSubscription subscription = subscriptionRepository.findById(Objects.requireNonNull(subscriptionId))
                .orElseThrow(() -> new RuntimeException("Subscription not found"));
        subscription.setStatus(DealerSubscription.SubscriptionStatus.CANCELLED);
        subscription.setCancelledAt(java.time.LocalDateTime.now());
        subscription.setCancellationReason(reason);
        subscription.setAutoRenew(false);
        return subscriptionRepository.save(subscription);
    }

    @Transactional
    public void processExpiredSubscriptions() {
        LocalDate today = LocalDate.now();
        List<DealerSubscription> expiredSubscriptions = subscriptionRepository
                .findByEndDateLessThanAndStatus(today, DealerSubscription.SubscriptionStatus.ACTIVE);

        for (DealerSubscription subscription : expiredSubscriptions) {
            if (subscription.getAutoRenew()) {
                // Auto-renew logic would go here
                log.info("Auto-renewing subscription: {}", subscription.getId());
            } else {
                subscription.setStatus(DealerSubscription.SubscriptionStatus.EXPIRED);
                subscriptionRepository.save(subscription);
            }
        }
    }
}

