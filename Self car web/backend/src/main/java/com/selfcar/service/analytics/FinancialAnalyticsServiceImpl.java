package com.selfcar.service.analytics;

import com.selfcar.model.analytics.FinancialSummary;
import com.selfcar.model.booking.Booking;
import com.selfcar.model.car.Car;
import com.selfcar.model.payment.PaymentTransaction;
import com.selfcar.repository.analytics.FinancialSummaryRepository;
import com.selfcar.repository.auth.UserRepository;
import com.selfcar.repository.booking.BookingRepository;
import com.selfcar.repository.payment.PaymentTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FinancialAnalyticsServiceImpl implements FinancialAnalyticsService {

    private final PaymentTransactionRepository paymentTransactionRepository;
    private final BookingRepository bookingRepository;
    private final FinancialSummaryRepository financialSummaryRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public FinancialSummary generateSummary(FinancialSummary.PeriodType periodType,
                                           LocalDate startDate, LocalDate endDate,
                                           Long dealerId, String category, String location) {
        // Check if summary already exists
        Optional<FinancialSummary> existing = financialSummaryRepository
                .findByPeriodTypeAndPeriodStartAndDealer_IdAndCategoryAndLocation(
                        periodType, startDate, dealerId, category, location);

        if (existing.isPresent()) {
            return existing.get();
        }

        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);

        // Get transactions for the period
        List<PaymentTransaction> transactions = getTransactions(dealerId, category, location,
                startDateTime, endDateTime);

        // Calculate metrics
        BigDecimal totalRevenue = calculateTotalRevenue(transactions);
        BigDecimal platformFees = calculatePlatformFees(transactions);
        BigDecimal refunds = calculateRefunds(transactions);
        BigDecimal netProfit = totalRevenue.subtract(platformFees).subtract(refunds);

        int totalOrders = getTotalOrdersCount(dealerId, category, location, startDateTime, endDateTime);
        int completedOrders = getCompletedOrdersCount(dealerId, category, location, startDateTime, endDateTime);
        int cancelledOrders = totalOrders - completedOrders;

        BigDecimal averageOrderValue = totalOrders > 0
                ? totalRevenue.divide(new BigDecimal(totalOrders), 2, java.math.RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        // Create and save summary
        FinancialSummary summary = new FinancialSummary();
        summary.setPeriodType(periodType);
        summary.setPeriodStart(startDate);
        summary.setPeriodEnd(endDate);
        if (dealerId != null) {
            summary.setDealer(userRepository.findById(Objects.requireNonNull(dealerId)).orElse(null));
        }
        summary.setCategory(category);
        summary.setLocation(location);
        summary.setTotalRevenue(totalRevenue);
        summary.setTotalOrders(totalOrders);
        summary.setCompletedOrders(completedOrders);
        summary.setCancelledOrders(cancelledOrders);
        summary.setPlatformFees(platformFees);
        summary.setRefunds(refunds);
        summary.setNetProfit(netProfit);
        summary.setAverageOrderValue(averageOrderValue);

        return financialSummaryRepository.save(summary);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getDashboardData(Long dealerId, LocalDate startDate, LocalDate endDate) {
        Map<String, Object> dashboard = new HashMap<>();
        
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);

        List<PaymentTransaction> transactions = getTransactions(dealerId, null, null,
                startDateTime, endDateTime);

        dashboard.put("totalRevenue", getTotalRevenue(dealerId, startDate, endDate));
        dashboard.put("totalProfit", getTotalProfit(dealerId, startDate, endDate));
        dashboard.put("platformFees", getPlatformFees(dealerId, startDate, endDate));
        dashboard.put("totalTransactions", transactions.size());
        dashboard.put("revenueByCategory", getRevenueByCategory(dealerId, startDate, endDate));
        dashboard.put("revenueByLocation", getRevenueByLocation(dealerId, startDate, endDate));

        return dashboard;
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getRevenueByCategory(Long dealerId, LocalDate startDate, LocalDate endDate) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);

        List<PaymentTransaction> transactions = getTransactions(dealerId, null, null,
                startDateTime, endDateTime);

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

        Map<String, Object> result = new HashMap<>();
        result.put("data", revenueByCategory);
        result.put("total", revenueByCategory.values().stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add));
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getRevenueByLocation(Long dealerId, LocalDate startDate, LocalDate endDate) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);

        List<Booking> bookings = bookingRepository.findAll().stream()
                .filter(b -> {
                    if (b.getCreatedAt() == null) return false;
                    if (b.getCreatedAt().isBefore(startDateTime) || b.getCreatedAt().isAfter(endDateTime)) {
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

        Map<String, BigDecimal> revenueByLocation = new HashMap<>();
        bookings.forEach(b -> {
            String location = b.getPickupLocation() != null ? b.getPickupLocation() : "UNKNOWN";
            revenueByLocation.merge(location, b.getTotalPrice(), BigDecimal::add);
        });

        Map<String, Object> result = new HashMap<>();
        result.put("data", revenueByLocation);
        result.put("total", revenueByLocation.values().stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add));
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal getTotalRevenue(Long dealerId, LocalDate startDate, LocalDate endDate) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);

        List<PaymentTransaction> transactions = getTransactions(dealerId, null, null,
                startDateTime, endDateTime);

        return calculateTotalRevenue(transactions);
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal getTotalProfit(Long dealerId, LocalDate startDate, LocalDate endDate) {
        BigDecimal revenue = getTotalRevenue(dealerId, startDate, endDate);
        BigDecimal fees = getPlatformFees(dealerId, startDate, endDate);
        return revenue.subtract(fees);
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal getPlatformFees(Long dealerId, LocalDate startDate, LocalDate endDate) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);

        List<PaymentTransaction> transactions = getTransactions(dealerId, null, null,
                startDateTime, endDateTime);

        return calculatePlatformFees(transactions);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FinancialSummary> getFinancialHistory(Long dealerId, FinancialSummary.PeriodType periodType) {
        return financialSummaryRepository.findByDealerAndPeriodType(dealerId, periodType);
    }

    @Override
    @Transactional
    public void reconcileTransactions(Long dealerId, LocalDate date) {
        // Generate summary for the date to reconcile transactions
        generateSummary(FinancialSummary.PeriodType.DAILY, date, date, dealerId, null, null);
    }

    private List<PaymentTransaction> getTransactions(Long dealerId, String category, String location,
                                                      LocalDateTime startDate, LocalDateTime endDate) {
        List<PaymentTransaction> transactions = paymentTransactionRepository
                .findByDateRange(startDate, endDate);

        if (dealerId != null || category != null || location != null) {
            transactions = transactions.stream()
                    .filter(t -> {
                        if (t.getBooking() == null || t.getBooking().getCar() == null) {
                            return false;
                        }
                        Car car = t.getBooking().getCar();
                        
                        if (dealerId != null && (car.getShop() == null || 
                            car.getShop().getOwner() == null || 
                            !car.getShop().getOwner().getId().equals(dealerId))) {
                            return false;
                        }
                        
                        if (category != null && (car.getType() == null || 
                            !car.getType().name().equals(category))) {
                            return false;
                        }
                        
                        if (location != null && (t.getBooking().getPickupLocation() == null ||
                            !t.getBooking().getPickupLocation().equals(location))) {
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

    private BigDecimal calculateRefunds(List<PaymentTransaction> transactions) {
        return transactions.stream()
                .filter(t -> t.getType() == PaymentTransaction.TransactionType.REFUND &&
                            t.getStatus() == PaymentTransaction.TransactionStatus.COMPLETED)
                .map(PaymentTransaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private int getTotalOrdersCount(Long dealerId, String category, String location,
                                   LocalDateTime startDate, LocalDateTime endDate) {
        return (int) bookingRepository.findAll().stream()
                .filter(b -> {
                    if (b.getCreatedAt() == null) return false;
                    if (b.getCreatedAt().isBefore(startDate) || b.getCreatedAt().isAfter(endDate)) {
                        return false;
                    }
                    if (dealerId != null && (b.getCar() == null || b.getCar().getShop() == null ||
                        b.getCar().getShop().getOwner() == null ||
                        !b.getCar().getShop().getOwner().getId().equals(dealerId))) {
                        return false;
                    }
                    if (category != null && (b.getCar() == null || b.getCar().getType() == null ||
                        !b.getCar().getType().name().equals(category))) {
                        return false;
                    }
                    if (location != null && (b.getPickupLocation() == null ||
                        !b.getPickupLocation().equals(location))) {
                        return false;
                    }
                    return true;
                })
                .count();
    }

    private int getCompletedOrdersCount(Long dealerId, String category, String location,
                                       LocalDateTime startDate, LocalDateTime endDate) {
        return (int) bookingRepository.findAll().stream()
                .filter(b -> {
                    if (b.getStatus() != Booking.BookingStatus.COMPLETED) return false;
                    if (b.getCreatedAt() == null) return false;
                    if (b.getCreatedAt().isBefore(startDate) || b.getCreatedAt().isAfter(endDate)) {
                        return false;
                    }
                    if (dealerId != null && (b.getCar() == null || b.getCar().getShop() == null ||
                        b.getCar().getShop().getOwner() == null ||
                        !b.getCar().getShop().getOwner().getId().equals(dealerId))) {
                        return false;
                    }
                    if (category != null && (b.getCar() == null || b.getCar().getType() == null ||
                        !b.getCar().getType().name().equals(category))) {
                        return false;
                    }
                    if (location != null && (b.getPickupLocation() == null ||
                        !b.getPickupLocation().equals(location))) {
                        return false;
                    }
                    return true;
                })
                .count();
    }
}

