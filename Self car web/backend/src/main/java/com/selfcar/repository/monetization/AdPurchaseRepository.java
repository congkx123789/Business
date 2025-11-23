package com.selfcar.repository.monetization;

import com.selfcar.model.monetization.AdPurchase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AdPurchaseRepository extends JpaRepository<AdPurchase, Long> {
    List<AdPurchase> findByUserId(Long userId);
    List<AdPurchase> findByCarId(Long carId);
    List<AdPurchase> findByStatus(AdPurchase.AdPurchaseStatus status);
    List<AdPurchase> findByStartDateLessThanEqualAndEndDateGreaterThanEqual(
            LocalDate startDate, LocalDate endDate);
}

