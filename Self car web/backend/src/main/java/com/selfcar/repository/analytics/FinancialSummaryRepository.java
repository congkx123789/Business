package com.selfcar.repository.analytics;

import com.selfcar.model.analytics.FinancialSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface FinancialSummaryRepository extends JpaRepository<FinancialSummary, Long> {
    @Query("SELECT fs FROM FinancialSummary fs WHERE fs.periodType = :periodType " +
           "AND fs.periodStart = :periodStart AND fs.dealer.id = :dealerId " +
           "AND (fs.category = :category OR (fs.category IS NULL AND :category IS NULL)) " +
           "AND (fs.location = :location OR (fs.location IS NULL AND :location IS NULL))")
    Optional<FinancialSummary> findByPeriodTypeAndPeriodStartAndDealer_IdAndCategoryAndLocation(
            @Param("periodType") FinancialSummary.PeriodType periodType,
            @Param("periodStart") LocalDate periodStart,
            @Param("dealerId") Long dealerId,
            @Param("category") String category,
            @Param("location") String location
    );

    @Query("SELECT fs FROM FinancialSummary fs WHERE fs.dealer.id = :dealerId " +
           "AND fs.periodType = :periodType AND fs.periodStart BETWEEN :startDate AND :endDate")
    List<FinancialSummary> findByDealer_IdAndPeriodTypeAndPeriodStartBetween(
            @Param("dealerId") Long dealerId,
            @Param("periodType") FinancialSummary.PeriodType periodType,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("SELECT fs FROM FinancialSummary fs WHERE fs.dealer.id = :dealerId AND fs.periodType = :periodType ORDER BY fs.periodStart DESC")
    List<FinancialSummary> findByDealerAndPeriodType(@Param("dealerId") Long dealerId,
                                                     @Param("periodType") FinancialSummary.PeriodType periodType);

    @Query("SELECT SUM(fs.totalRevenue) FROM FinancialSummary fs WHERE fs.dealer.id = :dealerId AND fs.periodStart >= :startDate")
    java.math.BigDecimal getTotalRevenueByDealerSince(@Param("dealerId") Long dealerId,
                                                      @Param("startDate") LocalDate startDate);

    @Query("SELECT SUM(fs.netProfit) FROM FinancialSummary fs WHERE fs.dealer.id = :dealerId AND fs.periodStart >= :startDate")
    java.math.BigDecimal getTotalProfitByDealerSince(@Param("dealerId") Long dealerId,
                                                     @Param("startDate") LocalDate startDate);
}
