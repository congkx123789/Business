package com.selfcar.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FinancialDashboardDTO {
    
    // Overall summary
    private BigDecimal totalRevenue;
    private BigDecimal totalCost;
    private BigDecimal grossProfit;
    private BigDecimal platformFees;
    private BigDecimal netProfit;
    private Integer totalTransactions;
    private Integer completedBookings;
    
    // Period summary (daily, weekly, monthly)
    private String period;
    private LocalDate startDate;
    private LocalDate endDate;
    
    // Revenue by category
    private Map<String, BigDecimal> revenueByCategory;
    
    // Revenue by location
    private Map<String, BigDecimal> revenueByLocation;
    
    // Revenue by dealer
    private List<DealerRevenueDTO> revenueByDealer;
    
    // Recent transactions
    private List<TransactionSummaryDTO> recentTransactions;
    
    // Payment tracking
    private PaymentTrackingDTO paymentTracking;
    
    // Balance overview
    private BalanceOverviewDTO balanceOverview;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DealerRevenueDTO {
        private Long dealerId;
        private String dealerName;
        private BigDecimal revenue;
        private BigDecimal profit;
        private Integer bookingCount;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TransactionSummaryDTO {
        private String transactionId;
        private BigDecimal amount;
        private String type;
        private String status;
        private LocalDate date;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentTrackingDTO {
        private BigDecimal pendingPayments;
        private BigDecimal completedPayments;
        private BigDecimal refundedPayments;
        private Integer pendingCount;
        private Integer completedCount;
        private Integer refundedCount;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BalanceOverviewDTO {
        private BigDecimal totalWalletBalance;
        private BigDecimal totalEscrowBalance;
        private BigDecimal totalPendingWithdrawals;
        private Integer activeWallets;
    }
}
