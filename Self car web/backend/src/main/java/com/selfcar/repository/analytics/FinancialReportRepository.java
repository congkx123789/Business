package com.selfcar.repository.analytics;

import com.selfcar.model.analytics.FinancialReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface FinancialReportRepository extends JpaRepository<FinancialReport, Long> {
    
    List<FinancialReport> findByShopIdAndReportDateBetween(Long shopId, LocalDate startDate, LocalDate endDate);
    
    List<FinancialReport> findByDealerIdAndReportDateBetween(Long dealerId, LocalDate startDate, LocalDate endDate);
    
    List<FinancialReport> findByReportDateBetween(LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT fr FROM FinancialReport fr WHERE fr.reportDate = :date AND fr.period = :period")
    List<FinancialReport> findByDateAndPeriod(@Param("date") LocalDate date, 
                                               @Param("period") FinancialReport.ReportPeriod period);
}
