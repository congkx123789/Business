package com.selfcar.repository.b2b;

import com.selfcar.model.b2b.EnterpriseAnalytics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface EnterpriseAnalyticsRepository extends JpaRepository<EnterpriseAnalytics, Long> {
    List<EnterpriseAnalytics> findByEnterpriseId(Long enterpriseId);
    Optional<EnterpriseAnalytics> findByEnterpriseIdAndPeriodTypeAndPeriodStart(
            Long enterpriseId, EnterpriseAnalytics.PeriodType periodType, LocalDate periodStart);
}

