package com.selfcar.repository.monetization;

import com.selfcar.model.monetization.SubscriptionPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlan, Long> {
    Optional<SubscriptionPlan> findByPlanCode(String planCode);
    List<SubscriptionPlan> findByStatus(SubscriptionPlan.PlanStatus status);
    List<SubscriptionPlan> findByTier(SubscriptionPlan.SubscriptionTier tier);
}

