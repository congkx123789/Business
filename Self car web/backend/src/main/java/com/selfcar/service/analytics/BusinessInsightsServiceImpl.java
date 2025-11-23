package com.selfcar.service.analytics;

import com.selfcar.dto.analytics.BusinessInsightsDTO;
import com.selfcar.model.booking.Booking;
import com.selfcar.model.car.Car;
import com.selfcar.model.car.CarAnalytics;
import com.selfcar.model.car.CarView;

import com.selfcar.repository.auth.UserRepository;
import com.selfcar.repository.booking.BookingRepository;
import com.selfcar.repository.car.CarAnalyticsRepository;
import com.selfcar.repository.car.CarRepository;
import com.selfcar.repository.car.CarViewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BusinessInsightsServiceImpl implements BusinessInsightsService {

    private final CarViewRepository carViewRepository;
    private final CarAnalyticsRepository carAnalyticsRepository;
    private final CarRepository carRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public void trackCarView(Long carId, Long userId, String ipAddress, String userAgent, 
                            String referrer, CarView.TrafficSource trafficSource) {
        Car car = carRepository.findById(Objects.requireNonNull(carId))
                .orElseThrow(() -> new RuntimeException("Car not found"));
        
        CarView view = new CarView();
        view.setCar(car);
        if (userId != null) {
            userRepository.findById(Objects.requireNonNull(userId)).ifPresent(view::setUser);
        }
        view.setIpAddress(ipAddress);
        view.setUserAgent(userAgent);
        view.setReferrer(referrer);
        view.setTrafficSource(trafficSource != null ? trafficSource : CarView.TrafficSource.ORGANIC);
        
        carViewRepository.save(view);
    }

    @Override
    @Transactional
    public BusinessInsightsDTO getCarInsights(Long carId, LocalDateTime periodStart, LocalDateTime periodEnd) {
        Car car = carRepository.findById(Objects.requireNonNull(carId))
                .orElseThrow(() -> new RuntimeException("Car not found"));
        
        // Calculate analytics if not exists
        calculateCarAnalytics(carId, periodStart, periodEnd);
        
        CarAnalytics analytics = carAnalyticsRepository
                .findByCarIdAndPeriodStartAndPeriodEnd(carId, periodStart, periodEnd)
                .orElse(new CarAnalytics());
        
        return BusinessInsightsDTO.builder()
                .carId(carId)
                .carName(car.getName())
                .carBrand(car.getBrand())
                .salesPerformance(buildSalesPerformance(analytics, carId, periodStart, periodEnd))
                .conversionMetrics(buildConversionMetrics(analytics))
                .advertisingROI(buildAdvertisingROI(analytics))
                .trafficSourceBreakdown(buildTrafficSourceBreakdown(analytics))
                .periodStart(periodStart)
                .periodEnd(periodEnd)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<BusinessInsightsDTO.SalesPerformance> getSalesPerformanceByModel(LocalDateTime periodStart, LocalDateTime periodEnd) {
        // Get all cars and calculate their sales performance, grouped by model
        // Aggregate by car type and brand for better insights
        Map<String, List<Car>> carsByModel = carRepository.findAll().stream()
                .collect(Collectors.groupingBy(car -> car.getBrand() + " " + car.getType().toString()));
        
        return carsByModel.entrySet().stream()
                .map(entry -> {
                    List<Car> cars = entry.getValue();
                    
                    // Aggregate analytics for all cars of this model
                    CarAnalytics aggregatedAnalytics = new CarAnalytics();
                    long totalViews = 0L;
                    long totalUnitsSold = 0L;
                    BigDecimal totalRevenue = BigDecimal.ZERO;
                    
                    for (Car car : cars) {
                        CarAnalytics analytics = carAnalyticsRepository
                                .findByCarIdAndPeriodStartAndPeriodEnd(car.getId(), periodStart, periodEnd)
                                .orElse(new CarAnalytics());
                        
                        // Aggregate metrics
                        totalViews += (analytics.getTotalViews() != null ? analytics.getTotalViews() : 0L);
                        totalUnitsSold += (analytics.getTotalUnitsSold() != null ? analytics.getTotalUnitsSold() : 0L);
                        if (analytics.getTotalRevenue() != null) {
                            totalRevenue = totalRevenue.add(analytics.getTotalRevenue());
                        }
                    }
                    
                    aggregatedAnalytics.setTotalViews(totalViews);
                    aggregatedAnalytics.setTotalUnitsSold(totalUnitsSold);
                    aggregatedAnalytics.setTotalRevenue(totalRevenue);
                    
                    // Calculate performance metrics for this model
                    BusinessInsightsDTO.SalesPerformance performance = buildSalesPerformance(
                            aggregatedAnalytics, cars.get(0).getId(), periodStart, periodEnd);
                    
                    return performance;
                })
                .sorted((a, b) -> b.getTotalRevenue().compareTo(a.getTotalRevenue()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public BusinessInsightsDTO.ConversionMetrics getConversionMetrics(Long carId, LocalDateTime periodStart, LocalDateTime periodEnd) {
        CarAnalytics analytics = carAnalyticsRepository
                .findByCarIdAndPeriodStartAndPeriodEnd(carId, periodStart, periodEnd)
                .orElse(new CarAnalytics());
        return buildConversionMetrics(analytics);
    }

    @Override
    @Transactional(readOnly = true)
    public BusinessInsightsDTO.AdvertisingROI getAdvertisingROI(Long carId, LocalDateTime periodStart, LocalDateTime periodEnd) {
        CarAnalytics analytics = carAnalyticsRepository
                .findByCarIdAndPeriodStartAndPeriodEnd(carId, periodStart, periodEnd)
                .orElse(new CarAnalytics());
        return buildAdvertisingROI(analytics);
    }

    @Override
    @Transactional
    public void calculateCarAnalytics(Long carId, LocalDateTime periodStart, LocalDateTime periodEnd) {
        Car car = carRepository.findById(Objects.requireNonNull(carId))
                .orElseThrow(() -> new RuntimeException("Car not found"));
        
        // Get or create analytics record
        CarAnalytics analytics = carAnalyticsRepository
                .findByCarIdAndPeriodStartAndPeriodEnd(carId, periodStart, periodEnd)
                .orElse(new CarAnalytics());
        
        analytics.setCar(car);
        analytics.setPeriodStart(periodStart);
        analytics.setPeriodEnd(periodEnd);
        
        // Calculate views
        List<CarView> views = carViewRepository.findByCarIdAndCreatedAtBetween(carId, periodStart, periodEnd);
        analytics.setTotalViews((long) views.size());
        analytics.setUniqueViews(carViewRepository.countUniqueViewsByCarAndPeriod(carId, periodStart, periodEnd));
        
        // Calculate average view duration
        double avgDuration = views.stream()
                .filter(v -> v.getViewDurationSeconds() != null)
                .mapToInt(CarView::getViewDurationSeconds)
                .average()
                .orElse(0.0);
        analytics.setAvgViewDurationSeconds((int) avgDuration);
        
        // Calculate traffic source breakdown
        analytics.setViewsFromSearch(carViewRepository.countViewsByCarAndSource(carId, CarView.TrafficSource.SEARCH, periodStart, periodEnd));
        analytics.setViewsFromOrganic(carViewRepository.countViewsByCarAndSource(carId, CarView.TrafficSource.ORGANIC, periodStart, periodEnd));
        analytics.setViewsFromRecommendation(carViewRepository.countViewsByCarAndSource(carId, CarView.TrafficSource.RECOMMENDATION, periodStart, periodEnd));
        analytics.setViewsFromAdvertising(carViewRepository.countViewsByCarAndSource(carId, CarView.TrafficSource.ADVERTISING, periodStart, periodEnd));
        
        // Calculate deposits and bookings
        List<Booking> bookings = bookingRepository.findByCarId(carId);
        long depositsInPeriod = bookings.stream()
                .filter(b -> b.getCreatedAt().isAfter(periodStart) && b.getCreatedAt().isBefore(periodEnd))
                .count();
        analytics.setDepositsCreated(depositsInPeriod);
        analytics.setBookingsCreated(depositsInPeriod);
        
        // Calculate purchases (completed orders)
        // Note: This would need to be calculated from Order entities
        long purchasesInPeriod = 0L; // Placeholder - would query Order repository
        analytics.setPurchasesCompleted(purchasesInPeriod);
        
        // Calculate conversion rates
        if (analytics.getTotalViews() > 0) {
            analytics.setViewToDepositRate(calculatePercentage(analytics.getDepositsCreated(), analytics.getTotalViews()));
            analytics.setViewToPurchaseRate(calculatePercentage(analytics.getPurchasesCompleted(), analytics.getTotalViews()));
        }
        if (analytics.getDepositsCreated() > 0) {
            analytics.setDepositToPurchaseRate(calculatePercentage(analytics.getPurchasesCompleted(), analytics.getDepositsCreated()));
        }
        
        // Calculate revenue
        BigDecimal revenue = bookings.stream()
                .filter(b -> b.getStatus() == Booking.BookingStatus.COMPLETED)
                .filter(b -> b.getCreatedAt().isAfter(periodStart) && b.getCreatedAt().isBefore(periodEnd))
                .map(Booking::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        analytics.setTotalRevenue(revenue);
        analytics.setTotalUnitsSold((long) bookings.stream()
                .filter(b -> b.getStatus() == Booking.BookingStatus.COMPLETED)
                .filter(b -> b.getCreatedAt().isAfter(periodStart) && b.getCreatedAt().isBefore(periodEnd))
                .count());
        
        carAnalyticsRepository.save(analytics);
    }

    private BusinessInsightsDTO.SalesPerformance buildSalesPerformance(CarAnalytics analytics, Long carId, 
                                                                      LocalDateTime periodStart, LocalDateTime periodEnd) {
        // Get previous period for comparison
        long periodDays = java.time.Duration.between(periodStart, periodEnd).toDays();
        LocalDateTime prevPeriodStart = periodStart.minusDays(periodDays);
        LocalDateTime prevPeriodEnd = periodStart;
        
        CarAnalytics prevAnalytics = carAnalyticsRepository
                .findByCarIdAndPeriodStartAndPeriodEnd(carId, prevPeriodStart, prevPeriodEnd)
                .orElse(new CarAnalytics());
        
        BigDecimal revenueGrowth = BigDecimal.ZERO;
        if (prevAnalytics.getTotalRevenue() != null && prevAnalytics.getTotalRevenue().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal revenueDiff = analytics.getTotalRevenue() != null ? 
                    analytics.getTotalRevenue().subtract(prevAnalytics.getTotalRevenue()) : BigDecimal.ZERO;
            revenueGrowth = revenueDiff.divide(prevAnalytics.getTotalRevenue(), 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100"));
        }
        
        BigDecimal avgOrderValue = BigDecimal.ZERO;
        if (analytics.getTotalUnitsSold() > 0 && analytics.getTotalRevenue() != null) {
            avgOrderValue = analytics.getTotalRevenue().divide(
                    new BigDecimal(analytics.getTotalUnitsSold()), 2, RoundingMode.HALF_UP);
        }
        
        return BusinessInsightsDTO.SalesPerformance.builder()
                .totalUnitsSold(analytics.getTotalUnitsSold())
                .totalRevenue(analytics.getTotalRevenue())
                .averageOrderValue(avgOrderValue)
                .revenueGrowth(revenueGrowth)
                .build();
    }

    private BusinessInsightsDTO.ConversionMetrics buildConversionMetrics(CarAnalytics analytics) {
        return BusinessInsightsDTO.ConversionMetrics.builder()
                .totalViews(analytics.getTotalViews())
                .uniqueViews(analytics.getUniqueViews())
                .depositsCreated(analytics.getDepositsCreated())
                .bookingsCreated(analytics.getBookingsCreated())
                .purchasesCompleted(analytics.getPurchasesCompleted())
                .viewToDepositRate(analytics.getViewToDepositRate())
                .depositToPurchaseRate(analytics.getDepositToPurchaseRate())
                .viewToPurchaseRate(analytics.getViewToPurchaseRate())
                .build();
    }

    private BusinessInsightsDTO.AdvertisingROI buildAdvertisingROI(CarAnalytics analytics) {
        BigDecimal adROI = BigDecimal.ZERO;
        if (analytics.getAdSpend() != null && analytics.getAdSpend().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal profit = analytics.getAdRevenue() != null ? 
                    analytics.getAdRevenue().subtract(analytics.getAdSpend()) : BigDecimal.ZERO;
            adROI = profit.divide(analytics.getAdSpend(), 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100"));
        }
        
        BigDecimal costPerClick = BigDecimal.ZERO;
        if (analytics.getViewsFromAdvertising() > 0 && analytics.getAdSpend() != null) {
            costPerClick = analytics.getAdSpend().divide(
                    new BigDecimal(analytics.getViewsFromAdvertising()), 2, RoundingMode.HALF_UP);
        }
        
        return BusinessInsightsDTO.AdvertisingROI.builder()
                .adSpend(analytics.getAdSpend())
                .adRevenue(analytics.getAdRevenue())
                .adROI(adROI)
                .adViews(analytics.getViewsFromAdvertising())
                .adConversions(analytics.getPurchasesCompleted()) // Simplified
                .costPerClick(costPerClick)
                .costPerConversion(analytics.getAdSpend()) // Simplified
                .build();
    }

    private BusinessInsightsDTO.TrafficSourceBreakdown buildTrafficSourceBreakdown(CarAnalytics analytics) {
        return BusinessInsightsDTO.TrafficSourceBreakdown.builder()
                .viewsFromSearch(analytics.getViewsFromSearch())
                .viewsFromOrganic(analytics.getViewsFromOrganic())
                .viewsFromRecommendation(analytics.getViewsFromRecommendation())
                .viewsFromAdvertising(analytics.getViewsFromAdvertising())
                .viewsFromSocialMedia(0L) // Would need to track this
                .searchConversionRate(calculateConversionRate(analytics.getViewsFromSearch(), analytics.getTotalViews()))
                .organicConversionRate(calculateConversionRate(analytics.getViewsFromOrganic(), analytics.getTotalViews()))
                .recommendationConversionRate(calculateConversionRate(analytics.getViewsFromRecommendation(), analytics.getTotalViews()))
                .advertisingConversionRate(calculateConversionRate(analytics.getViewsFromAdvertising(), analytics.getTotalViews()))
                .build();
    }

    private BigDecimal calculatePercentage(long numerator, long denominator) {
        if (denominator == 0) return BigDecimal.ZERO;
        return new BigDecimal(numerator)
                .divide(new BigDecimal(denominator), 4, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"))
                .setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal calculateConversionRate(long sourceViews, long totalViews) {
        if (totalViews == 0) return BigDecimal.ZERO;
        return calculatePercentage(sourceViews, totalViews);
    }
}

