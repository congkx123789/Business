package com.selfcar.repository.monetization;

import com.selfcar.model.monetization.DealerSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DealerSubscriptionRepository extends JpaRepository<DealerSubscription, Long> {
    List<DealerSubscription> findByUserId(Long userId);
    Optional<DealerSubscription> findByUserIdAndStatus(Long userId, DealerSubscription.SubscriptionStatus status);
    List<DealerSubscription> findByStatus(DealerSubscription.SubscriptionStatus status);
    List<DealerSubscription> findByEndDateLessThanAndStatus(LocalDate date, DealerSubscription.SubscriptionStatus status);
}

