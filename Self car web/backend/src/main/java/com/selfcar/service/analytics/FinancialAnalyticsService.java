package com.selfcar.service.analytics;

import com.selfcar.model.analytics.FinancialSummary;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface FinancialAnalyticsService {
    FinancialSummary generateSummary(FinancialSummary.PeriodType periodType, 
                                     LocalDate startDate, LocalDate endDate,
                                     Long dealerId, String category, String location);
    
    Map<String, Object> getDashboardData(Long dealerId, LocalDate startDate, LocalDate endDate);
    
    Map<String, Object> getRevenueByCategory(Long dealerId, LocalDate startDate, LocalDate endDate);
    
    Map<String, Object> getRevenueByLocation(Long dealerId, LocalDate startDate, LocalDate endDate);
    
    BigDecimal getTotalRevenue(Long dealerId, LocalDate startDate, LocalDate endDate);
    
    BigDecimal getTotalProfit(Long dealerId, LocalDate startDate, LocalDate endDate);
    
    BigDecimal getPlatformFees(Long dealerId, LocalDate startDate, LocalDate endDate);
    
    List<FinancialSummary> getFinancialHistory(Long dealerId, FinancialSummary.PeriodType periodType);
    
    void reconcileTransactions(Long dealerId, LocalDate date);
}
