package com.selfcar.service.analytics;

import com.selfcar.model.payment.PaymentTransaction;
import com.selfcar.repository.payment.PaymentTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {

    private final PaymentTransactionRepository paymentTransactionRepository;

    @Override
    public Map<String, Object> revenueByDealer(LocalDate from, LocalDate to) {
        // Placeholder aggregation; replace with real dealer-based query
        Map<String, Object> result = new HashMap<>();
        result.put("total", completedAmountBetween(from, to));
        result.put("byDealer", new HashMap<>()); // to be implemented with proper joins
        return result;
    }

    @Override
    public Map<String, Object> revenueByCategory(LocalDate from, LocalDate to) {
        Map<String, Object> result = new HashMap<>();
        result.put("total", completedAmountBetween(from, to));
        result.put("byCategory", new HashMap<>());
        return result;
    }

    @Override
    public Map<String, Object> revenueByLocation(LocalDate from, LocalDate to) {
        Map<String, Object> result = new HashMap<>();
        result.put("total", completedAmountBetween(from, to));
        result.put("byLocation", new HashMap<>());
        return result;
    }

    @Override
    public Map<String, Object> balanceOverview() {
        Map<String, Object> result = new HashMap<>();
        // Extend with wallet sums via WalletRepository if needed
        result.put("escrow", BigDecimal.ZERO);
        result.put("payable", BigDecimal.ZERO);
        result.put("receivable", BigDecimal.ZERO);
        return result;
    }

    private BigDecimal completedAmountBetween(LocalDate from, LocalDate to) {
        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end = LocalDateTime.of(to, LocalTime.MAX);
        BigDecimal deposits = paymentTransactionRepository.getTotalAmountByTypeAndDateRange(
                PaymentTransaction.TransactionType.DEPOSIT, start, end);
        BigDecimal releases = paymentTransactionRepository.getTotalAmountByTypeAndDateRange(
                PaymentTransaction.TransactionType.ESCROW_RELEASE, start, end);
        BigDecimal payouts = paymentTransactionRepository.getTotalAmountByTypeAndDateRange(
                PaymentTransaction.TransactionType.PAYOUT, start, end);
        BigDecimal total = BigDecimal.ZERO;
        if (deposits != null) total = total.add(deposits);
        if (releases != null) total = total.add(releases);
        if (payouts != null) total = total.add(payouts);
        return total;
    }
}


