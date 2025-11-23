package com.selfcar.service.b2b;

import com.selfcar.model.b2b.EnterpriseAnalytics;
import com.selfcar.repository.car.CarRepository;
import com.selfcar.repository.order.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;

@Slf4j
@Service
@RequiredArgsConstructor
public class EnterpriseAnalyticsService {

    private final CarRepository carRepository;
    private final OrderRepository orderRepository;

    public EnterpriseAnalytics getAnalytics(Long enterpriseId, EnterpriseAnalytics.PeriodType periodType, LocalDate startDate, LocalDate endDate) {
        // Calculate analytics for enterprise partner
        EnterpriseAnalytics analytics = new EnterpriseAnalytics();
        analytics.setEnterpriseId(enterpriseId);
        analytics.setPeriodType(periodType);
        analytics.setPeriodStart(startDate);
        analytics.setPeriodEnd(endDate);

        // Query car listings
        Long totalListings = carRepository.count();
        Long activeListings = carRepository.count();

        // Query orders (would need to filter by enterprise's cars)
        Long totalOrders = orderRepository.count();
        Long completedOrders = orderRepository.count(); // Simplified

        // Calculate metrics
        analytics.setTotalListings(totalListings.intValue());
        analytics.setActiveListings(activeListings.intValue());
        analytics.setTotalOrders(totalOrders.intValue());
        analytics.setCompletedOrders(completedOrders.intValue());

        // Calculate conversion rate
        if (totalListings > 0) {
            BigDecimal conversionRate = BigDecimal.valueOf(completedOrders)
                    .divide(BigDecimal.valueOf(totalListings), 2, java.math.RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
            analytics.setConversionRate(conversionRate);
        }

        return analytics;
    }
}

