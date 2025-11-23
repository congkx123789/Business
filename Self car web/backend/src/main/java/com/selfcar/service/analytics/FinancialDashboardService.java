package com.selfcar.service.analytics;

import com.selfcar.dto.analytics.FinancialDashboardDTO;
import com.selfcar.model.analytics.FinancialReport;
import com.selfcar.model.auth.User;
import com.selfcar.model.booking.Booking;
import com.selfcar.model.car.Car;
import com.selfcar.model.payment.PaymentTransaction;
import com.selfcar.model.payment.Wallet;
import com.selfcar.model.shop.Shop;
import com.selfcar.repository.analytics.FinancialReportRepository;
import com.selfcar.repository.auth.UserRepository;
import com.selfcar.repository.booking.BookingRepository;
import com.selfcar.repository.payment.PaymentTransactionRepository;
import com.selfcar.repository.payment.WalletRepository;
import com.selfcar.repository.shop.ShopRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FinancialDashboardService {

    private final PaymentTransactionRepository paymentTransactionRepository;
    private final BookingRepository bookingRepository;
    private final FinancialReportRepository financialReportRepository;
    private final WalletRepository walletRepository;
    private final ShopRepository shopRepository;
    private final UserRepository userRepository;

    public FinancialDashboardDTO getDashboardData(Long shopId, Long dealerId, 
                                                 LocalDate startDate, LocalDate endDate,
                                                 FinancialReport.ReportPeriod period) {
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        if (startDate == null) {
            startDate = calculateStartDate(endDate, period);
        }

        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);

        FinancialDashboardDTO.FinancialDashboardDTOBuilder builder = FinancialDashboardDTO.builder();

        // Get transactions for the period
        List<PaymentTransaction> transactions = getTransactions(shopId, dealerId, startDateTime, endDateTime);

        // Calculate overall summary
        BigDecimal totalRevenue = calculateTotalRevenue(transactions);
        BigDecimal platformFees = calculatePlatformFees(transactions);
        BigDecimal totalCost = BigDecimal.ZERO; // Cost tracking can be added later
        BigDecimal grossProfit = totalRevenue.subtract(totalCost);
        BigDecimal netProfit = grossProfit.subtract(platformFees);

        builder.totalRevenue(totalRevenue)
                .totalCost(totalCost)
                .grossProfit(grossProfit)
                .platformFees(platformFees)
                .netProfit(netProfit)
                .totalTransactions(transactions.size())
                .completedBookings(getCompletedBookingsCount(shopId, dealerId, startDateTime, endDateTime))
                .period(period != null ? period.name() : "CUSTOM")
                .startDate(startDate)
                .endDate(endDate);

        // Revenue by category
        builder.revenueByCategory(calculateRevenueByCategory(transactions));

        // Revenue by location
        builder.revenueByLocation(calculateRevenueByLocation(shopId, dealerId, startDateTime, endDateTime));

        // Revenue by dealer
        builder.revenueByDealer(calculateRevenueByDealer(shopId, startDateTime, endDateTime));

        // Recent transactions
        builder.recentTransactions(getRecentTransactions(shopId, dealerId, 10));

        // Payment tracking
        builder.paymentTracking(calculatePaymentTracking(shopId, dealerId));

        // Balance overview
        builder.balanceOverview(calculateBalanceOverview(shopId, dealerId));

        return builder.build();
    }

    @Transactional
    public FinancialReport generateReport(Long shopId, Long dealerId, 
                                         LocalDate reportDate, 
                                         FinancialReport.ReportPeriod period) {
        LocalDate startDate = calculateStartDate(reportDate, period);
        LocalDate endDate = reportDate;

        FinancialReport report = new FinancialReport();
        report.setShop(shopId != null ? shopRepository.findById(Objects.requireNonNull(shopId)).orElse(null) : null);
        report.setDealer(dealerId != null ? userRepository.findById(Objects.requireNonNull(dealerId)).orElse(null) : null);
        report.setReportDate(reportDate);
        report.setPeriod(period);

        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);

        List<PaymentTransaction> transactions = getTransactions(shopId, dealerId, startDateTime, endDateTime);

        report.setTotalRevenue(calculateTotalRevenue(transactions));
        report.setPlatformFees(calculatePlatformFees(transactions));
        report.setTotalCost(BigDecimal.ZERO);
        report.setGrossProfit(report.getTotalRevenue().subtract(report.getTotalCost()));
        report.setNetProfit(report.getGrossProfit().subtract(report.getPlatformFees()));
        report.setTransactionCount(transactions.size());
        report.setCompletedBookings(getCompletedBookingsCount(shopId, dealerId, startDateTime, endDateTime));

        // Calculate refunds
        BigDecimal refundedAmount = transactions.stream()
                .filter(t -> t.getType() == PaymentTransaction.TransactionType.REFUND &&
                            t.getStatus() == PaymentTransaction.TransactionStatus.COMPLETED)
                .map(PaymentTransaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        report.setRefundedAmount(refundedAmount);
        report.setRefundCount((int) transactions.stream()
                .filter(t -> t.getType() == PaymentTransaction.TransactionType.REFUND)
                .count());

        return financialReportRepository.save(report);
    }

    private List<PaymentTransaction> getTransactions(Long shopId, Long dealerId, 
                                                    LocalDateTime startDate, LocalDateTime endDate) {
        List<PaymentTransaction> transactions = paymentTransactionRepository.findByDateRange(startDate, endDate);

        if (shopId != null || dealerId != null) {
            transactions = transactions.stream()
                    .filter(t -> {
                        if (t.getBooking() == null || t.getBooking().getCar() == null) {
                            return false;
                        }
                        Car car = t.getBooking().getCar();
                        if (shopId != null && (car.getShop() == null || !car.getShop().getId().equals(shopId))) {
                            return false;
                        }
                        if (dealerId != null && (car.getShop() == null || 
                            car.getShop().getOwner() == null || 
                            !car.getShop().getOwner().getId().equals(dealerId))) {
                            return false;
                        }
                        return true;
                    })
                    .collect(Collectors.toList());
        }

        return transactions;
    }

    private BigDecimal calculateTotalRevenue(List<PaymentTransaction> transactions) {
        return transactions.stream()
                .filter(t -> t.getType() == PaymentTransaction.TransactionType.ESCROW_RELEASE &&
                            t.getStatus() == PaymentTransaction.TransactionStatus.COMPLETED)
                .map(PaymentTransaction::getNetAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calculatePlatformFees(List<PaymentTransaction> transactions) {
        return transactions.stream()
                .filter(t -> t.getType() == PaymentTransaction.TransactionType.FEE &&
                            t.getStatus() == PaymentTransaction.TransactionStatus.COMPLETED)
                .map(PaymentTransaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private Map<String, BigDecimal> calculateRevenueByCategory(List<PaymentTransaction> transactions) {
        Map<String, BigDecimal> revenueByCategory = new HashMap<>();
        
        transactions.stream()
                .filter(t -> t.getType() == PaymentTransaction.TransactionType.ESCROW_RELEASE &&
                            t.getStatus() == PaymentTransaction.TransactionStatus.COMPLETED)
                .forEach(t -> {
                    if (t.getBooking() != null && t.getBooking().getCar() != null) {
                        String category = t.getBooking().getCar().getType() != null ? 
                                t.getBooking().getCar().getType().name() : "UNKNOWN";
                        revenueByCategory.merge(category, t.getNetAmount(), BigDecimal::add);
                    }
                });

        return revenueByCategory;
    }

    private Map<String, BigDecimal> calculateRevenueByLocation(Long shopId, Long dealerId,
                                                               LocalDateTime startDate, LocalDateTime endDate) {
        Map<String, BigDecimal> revenueByLocation = new HashMap<>();
        
        List<Booking> bookings = bookingRepository.findAll().stream()
                .filter(b -> {
                    if (b.getCreatedAt() == null) return false;
                    if (b.getCreatedAt().isBefore(startDate) || b.getCreatedAt().isAfter(endDate)) {
                        return false;
                    }
                    if (shopId != null && (b.getCar() == null || b.getCar().getShop() == null ||
                        !b.getCar().getShop().getId().equals(shopId))) {
                        return false;
                    }
                    if (dealerId != null && (b.getCar() == null || b.getCar().getShop() == null ||
                        b.getCar().getShop().getOwner() == null ||
                        !b.getCar().getShop().getOwner().getId().equals(dealerId))) {
                        return false;
                    }
                    return true;
                })
                .collect(Collectors.toList());

        bookings.forEach(b -> {
            String location = b.getPickupLocation() != null ? b.getPickupLocation() : "UNKNOWN";
            revenueByLocation.merge(location, b.getTotalPrice(), BigDecimal::add);
        });

        return revenueByLocation;
    }

    private List<FinancialDashboardDTO.DealerRevenueDTO> calculateRevenueByDealer(
            Long shopId, LocalDateTime startDate, LocalDateTime endDate) {
        
        Map<Long, FinancialDashboardDTO.DealerRevenueDTO> dealerMap = new HashMap<>();

        List<PaymentTransaction> transactions = getTransactions(shopId, null, startDate, endDate);
        
        transactions.stream()
                .filter(t -> t.getType() == PaymentTransaction.TransactionType.ESCROW_RELEASE &&
                            t.getStatus() == PaymentTransaction.TransactionStatus.COMPLETED)
                .forEach(t -> {
                    if (t.getBooking() != null && t.getBooking().getCar() != null &&
                        t.getBooking().getCar().getShop() != null &&
                        t.getBooking().getCar().getShop().getOwner() != null) {
                        
                        User dealer = t.getBooking().getCar().getShop().getOwner();
                        Long dealerId = dealer.getId();
                        
                        dealerMap.computeIfAbsent(dealerId, id -> {
                            FinancialDashboardDTO.DealerRevenueDTO dto = new FinancialDashboardDTO.DealerRevenueDTO();
                            dto.setDealerId(id);
                            dto.setDealerName(dealer.getFirstName() + " " + dealer.getLastName());
                            dto.setRevenue(BigDecimal.ZERO);
                            dto.setProfit(BigDecimal.ZERO);
                            dto.setBookingCount(0);
                            return dto;
                        });
                        
                        FinancialDashboardDTO.DealerRevenueDTO dto = dealerMap.get(dealerId);
                        dto.setRevenue(dto.getRevenue().add(t.getNetAmount()));
                        dto.setProfit(dto.getProfit().add(t.getNetAmount())); // Profit = revenue for now
                        dto.setBookingCount(dto.getBookingCount() + 1);
                    }
                });

        return new ArrayList<>(dealerMap.values());
    }

    private List<FinancialDashboardDTO.TransactionSummaryDTO> getRecentTransactions(
            Long shopId, Long dealerId, int limit) {
        List<PaymentTransaction> transactions = getTransactions(shopId, dealerId, 
                LocalDateTime.now().minusDays(30), LocalDateTime.now());

        return transactions.stream()
                .sorted(Comparator.comparing(PaymentTransaction::getCreatedAt).reversed())
                .limit(limit)
                .map(t -> FinancialDashboardDTO.TransactionSummaryDTO.builder()
                        .transactionId(t.getTransactionId())
                        .amount(t.getAmount())
                        .type(t.getType().name())
                        .status(t.getStatus().name())
                        .date(t.getCreatedAt() != null ? t.getCreatedAt().toLocalDate() : LocalDate.now())
                        .build())
                .collect(Collectors.toList());
    }

    private FinancialDashboardDTO.PaymentTrackingDTO calculatePaymentTracking(Long shopId, Long dealerId) {
        List<PaymentTransaction> allTransactions = paymentTransactionRepository.findAll();
        
        if (shopId != null || dealerId != null) {
            allTransactions = allTransactions.stream()
                    .filter(t -> {
                        if (t.getBooking() == null || t.getBooking().getCar() == null) {
                            return false;
                        }
                        Car car = t.getBooking().getCar();
                        if (shopId != null && (car.getShop() == null || !car.getShop().getId().equals(shopId))) {
                            return false;
                        }
                        if (dealerId != null && (car.getShop() == null || 
                            car.getShop().getOwner() == null || 
                            !car.getShop().getOwner().getId().equals(dealerId))) {
                            return false;
                        }
                        return true;
                    })
                    .collect(Collectors.toList());
        }

        BigDecimal pendingPayments = allTransactions.stream()
                .filter(t -> t.getStatus() == PaymentTransaction.TransactionStatus.PENDING ||
                            t.getStatus() == PaymentTransaction.TransactionStatus.PROCESSING)
                .map(PaymentTransaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal completedPayments = allTransactions.stream()
                .filter(t -> t.getStatus() == PaymentTransaction.TransactionStatus.COMPLETED &&
                            t.getType() == PaymentTransaction.TransactionType.ESCROW_RELEASE)
                .map(PaymentTransaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal refundedPayments = allTransactions.stream()
                .filter(t -> t.getType() == PaymentTransaction.TransactionType.REFUND &&
                            t.getStatus() == PaymentTransaction.TransactionStatus.COMPLETED)
                .map(PaymentTransaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long pendingCount = allTransactions.stream()
                .filter(t -> t.getStatus() == PaymentTransaction.TransactionStatus.PENDING ||
                            t.getStatus() == PaymentTransaction.TransactionStatus.PROCESSING)
                .count();

        long completedCount = allTransactions.stream()
                .filter(t -> t.getStatus() == PaymentTransaction.TransactionStatus.COMPLETED)
                .count();

        long refundedCount = allTransactions.stream()
                .filter(t -> t.getType() == PaymentTransaction.TransactionType.REFUND)
                .count();

        return FinancialDashboardDTO.PaymentTrackingDTO.builder()
                .pendingPayments(pendingPayments)
                .completedPayments(completedPayments)
                .refundedPayments(refundedPayments)
                .pendingCount((int) pendingCount)
                .completedCount((int) completedCount)
                .refundedCount((int) refundedCount)
                .build();
    }

    private FinancialDashboardDTO.BalanceOverviewDTO calculateBalanceOverview(Long shopId, Long dealerId) {
        List<Wallet> wallets;
        
        if (dealerId != null) {
            wallets = walletRepository.findAll().stream()
                    .filter(w -> w.getUser() != null && w.getUser().getId().equals(dealerId))
                    .collect(Collectors.toList());
        } else if (shopId != null) {
            Shop shop = shopRepository.findById(Objects.requireNonNull(shopId)).orElse(null);
            if (shop != null && shop.getOwner() != null) {
                wallets = walletRepository.findByUserId(shop.getOwner().getId())
                        .map(Collections::singletonList)
                        .orElse(Collections.emptyList());
            } else {
                wallets = Collections.emptyList();
            }
        } else {
            wallets = walletRepository.findAll();
        }

        BigDecimal totalBalance = wallets.stream()
                .map(Wallet::getBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalEscrow = wallets.stream()
                .map(Wallet::getEscrowBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalPending = wallets.stream()
                .map(Wallet::getPendingBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return FinancialDashboardDTO.BalanceOverviewDTO.builder()
                .totalWalletBalance(totalBalance)
                .totalEscrowBalance(totalEscrow)
                .totalPendingWithdrawals(totalPending)
                .activeWallets((int) wallets.stream()
                        .filter(w -> w.getStatus() == Wallet.WalletStatus.ACTIVE)
                        .count())
                .build();
    }

    private int getCompletedBookingsCount(Long shopId, Long dealerId, 
                                         LocalDateTime startDate, LocalDateTime endDate) {
        return (int) bookingRepository.findAll().stream()
                .filter(b -> {
                    if (b.getStatus() != Booking.BookingStatus.COMPLETED) return false;
                    if (b.getCreatedAt() == null) return false;
                    if (b.getCreatedAt().isBefore(startDate) || b.getCreatedAt().isAfter(endDate)) {
                        return false;
                    }
                    if (shopId != null && (b.getCar() == null || b.getCar().getShop() == null ||
                        !b.getCar().getShop().getId().equals(shopId))) {
                        return false;
                    }
                    if (dealerId != null && (b.getCar() == null || b.getCar().getShop() == null ||
                        b.getCar().getShop().getOwner() == null ||
                        !b.getCar().getShop().getOwner().getId().equals(dealerId))) {
                        return false;
                    }
                    return true;
                })
                .count();
    }

    private LocalDate calculateStartDate(LocalDate endDate, FinancialReport.ReportPeriod period) {
        if (period == null) {
            return endDate.minusDays(30); // Default to 30 days
        }
        
        switch (period) {
            case DAILY:
                return endDate;
            case WEEKLY:
                return endDate.minusWeeks(1);
            case MONTHLY:
                return endDate.minusMonths(1);
            case QUARTERLY:
                return endDate.minusMonths(3);
            case YEARLY:
                return endDate.minusYears(1);
            default:
                return endDate.minusDays(30);
        }
    }
}
