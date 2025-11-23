package com.selfcar.repository.car;

import com.selfcar.model.car.CarAnalytics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CarAnalyticsRepository extends JpaRepository<CarAnalytics, Long> {
    Optional<CarAnalytics> findByCarIdAndPeriodStartAndPeriodEnd(Long carId, LocalDateTime periodStart, LocalDateTime periodEnd);
    
    List<CarAnalytics> findByCarIdAndPeriodStartAfter(Long carId, LocalDateTime periodStart);
    
    @Query("SELECT ca FROM CarAnalytics ca WHERE ca.car.id = :carId AND ca.periodStart <= :end AND ca.periodEnd >= :start ORDER BY ca.periodStart DESC")
    List<CarAnalytics> findOverlappingPeriods(@Param("carId") Long carId,
                                               @Param("start") LocalDateTime start,
                                               @Param("end") LocalDateTime end);
}

