package com.selfcar.service.analytics;

import com.selfcar.dto.car.CarRecommendationDTO;
import com.selfcar.dto.analytics.DemandPredictionDTO;
import com.selfcar.dto.analytics.SellerOptimizationDTO;
import com.selfcar.model.car.Car;
import com.selfcar.model.car.CarAnalytics;
import com.selfcar.model.car.CarRecommendation;
import com.selfcar.model.car.CarView;
import com.selfcar.repository.car.CarAnalyticsRepository;
import com.selfcar.repository.car.CarRecommendationRepository;
import com.selfcar.repository.car.CarRepository;
import com.selfcar.repository.car.CarViewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendationServiceImpl implements RecommendationService {

    private final CarRepository carRepository;
    private final CarRecommendationRepository carRecommendationRepository;
    private final CarAnalyticsRepository carAnalyticsRepository;
    private final CarViewRepository carViewRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CarRecommendationDTO> getSimilarCars(Long carId, int limit) {
        Car sourceCar = carRepository.findById(Objects.requireNonNull(carId))
                .orElseThrow(() -> new RuntimeException("Car not found"));
        
        // Find similar cars based on attributes with scoring
        List<CarRecommendationDTO> recommendations = carRepository.findByAvailableTrue().stream()
                .filter(car -> !car.getId().equals(carId))
                .map(car -> {
                    BigDecimal similarityScore = calculateSimilarityScore(sourceCar, car);
                    return buildRecommendationDTO(car, CarRecommendationDTO.RecommendationType.SIMILAR_CARS,
                            "Similar " + car.getType() + " in the same price range", similarityScore);
                })
                .filter(dto -> dto.getSimilarityScore().compareTo(new BigDecimal("0.5")) >= 0)
                .sorted((a, b) -> b.getSimilarityScore().compareTo(a.getSimilarityScore()))
                .limit(limit)
                .collect(Collectors.toList());
        
        return recommendations;
    }
    
    private BigDecimal calculateSimilarityScore(Car car1, Car car2) {
        BigDecimal score = BigDecimal.ZERO;
        
        // Type match (40 points)
        if (car1.getType().equals(car2.getType())) {
            score = score.add(new BigDecimal("40"));
        }
        
        // Brand match (30 points)
        if (car1.getBrand().equals(car2.getBrand())) {
            score = score.add(new BigDecimal("30"));
        }
        
        // Price similarity (20 points)
        BigDecimal priceDiff = car1.getPricePerDay().subtract(car2.getPricePerDay()).abs();
        BigDecimal priceThreshold = car1.getPricePerDay().multiply(new BigDecimal("0.2"));
        if (priceDiff.compareTo(priceThreshold) <= 0) {
            score = score.add(new BigDecimal("20"));
        } else if (priceDiff.compareTo(car1.getPricePerDay().multiply(new BigDecimal("0.4"))) <= 0) {
            score = score.add(new BigDecimal("10"));
        }
        
        // Year similarity (10 points)
        int yearDiff = Math.abs(car1.getYear() - car2.getYear());
        if (yearDiff <= 1) {
            score = score.add(new BigDecimal("10"));
        } else if (yearDiff <= 3) {
            score = score.add(new BigDecimal("5"));
        }
        
        // Transmission and fuel type (10 points total)
        if (car1.getTransmission().equals(car2.getTransmission())) {
            score = score.add(new BigDecimal("5"));
        }
        if (car1.getFuelType().equals(car2.getFuelType())) {
            score = score.add(new BigDecimal("5"));
        }
        
        return score.setScale(2, java.math.RoundingMode.HALF_UP);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CarRecommendationDTO> getPersonalizedRecommendations(Long userId, int limit) {
        // Get user's recent views and bookings
        List<CarView> userViews = carViewRepository.findAll().stream()
                .filter(view -> view.getUser() != null && view.getUser().getId().equals(userId))
                .collect(Collectors.toList());
        
        // Extract user preferences from history
        List<Car.CarType> preferredTypes = userViews.stream()
                .map(view -> view.getCar().getType())
                .distinct()
                .collect(Collectors.toList());
        
        List<String> preferredBrands = userViews.stream()
                .map(view -> view.getCar().getBrand())
                .distinct()
                .collect(Collectors.toList());
        
        // Calculate average price preference
        BigDecimal avgPrice = userViews.stream()
                .map(view -> view.getCar().getPricePerDay())
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(new BigDecimal(userViews.size() > 0 ? userViews.size() : 1), 2, java.math.RoundingMode.HALF_UP);
        
        // Generate personalized recommendations
        List<CarRecommendationDTO> recommendations = carRepository.findByAvailableTrue().stream()
                .filter(car -> userViews.isEmpty() || userViews.stream().noneMatch(view -> 
                        view.getCar() != null && view.getCar().getId().equals(car.getId())))
                .map(car -> {
                    BigDecimal personalizationScore = calculatePersonalizationScore(car, preferredTypes, preferredBrands, avgPrice);
                    return buildRecommendationDTO(car, CarRecommendationDTO.RecommendationType.PERSONALIZED,
                            "Based on your browsing history", personalizationScore);
                })
                .filter(dto -> dto.getSimilarityScore().compareTo(new BigDecimal("0.4")) >= 0)
                .sorted((a, b) -> b.getSimilarityScore().compareTo(a.getSimilarityScore()))
                .limit(limit)
                .collect(Collectors.toList());
        
        // If not enough recommendations, add popular cars
        if (recommendations.size() < limit) {
            int remaining = limit - recommendations.size();
            List<CarRecommendationDTO> popularCars = carRepository.findByAvailableTrue().stream()
                    .filter(car -> recommendations.stream().noneMatch(r -> r.getCarId().equals(car.getId())))
                    .limit(remaining)
                    .map(car -> buildRecommendationDTO(car, CarRecommendationDTO.RecommendationType.PERSONALIZED,
                            "Popular choice", new BigDecimal("0.5")))
                    .collect(Collectors.toList());
            recommendations.addAll(popularCars);
        }
        
        return recommendations;
    }
    
    private BigDecimal calculatePersonalizationScore(Car car, List<Car.CarType> preferredTypes, 
                                                     List<String> preferredBrands, BigDecimal avgPrice) {
        BigDecimal score = BigDecimal.ZERO;
        
        // Type preference match (40 points)
        if (preferredTypes.contains(car.getType())) {
            score = score.add(new BigDecimal("40"));
        }
        
        // Brand preference match (30 points)
        if (preferredBrands.contains(car.getBrand())) {
            score = score.add(new BigDecimal("30"));
        }
        
        // Price similarity (30 points) - within 30% of average preferred price
        if (avgPrice.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal priceDiff = car.getPricePerDay().subtract(avgPrice).abs();
            BigDecimal priceThreshold = avgPrice.multiply(new BigDecimal("0.3"));
            if (priceDiff.compareTo(priceThreshold) <= 0) {
                score = score.add(new BigDecimal("30"));
            } else if (priceDiff.compareTo(avgPrice.multiply(new BigDecimal("0.5"))) <= 0) {
                score = score.add(new BigDecimal("15"));
            }
        }
        
        // Normalize to 0-1 range
        return score.divide(new BigDecimal("100"), 2, java.math.RoundingMode.HALF_UP);
    }

    @Override
    @Transactional(readOnly = true)
    public SellerOptimizationDTO getSellerOptimizations(Long sellerId) {
        // Analyze seller's cars performance
        // Find cars with high views but low conversion
        List<Car> sellerCars = carRepository.findAll(); // Would filter by seller
        
        List<SellerOptimizationDTO.OptimizationRecommendation> recommendations = sellerCars.stream()
                .flatMap(car -> {
                    // Get analytics for this car
                    CarAnalytics analytics = carAnalyticsRepository.findByCarIdAndPeriodStartAndPeriodEnd(
                            car.getId(), 
                            java.time.LocalDateTime.now().minusDays(30),
                            java.time.LocalDateTime.now())
                            .orElse(new CarAnalytics());
                    
                    return analyzeCarOptimizations(car, analytics).stream();
                })
                .collect(Collectors.toList());
        
        return SellerOptimizationDTO.builder()
                .sellerId(sellerId)
                .recommendations(recommendations)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DemandPredictionDTO> predictDemandByRegion(String region) {
        // Enhanced demand prediction based on recent bookings, views, and trends
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime periodStart = now.minusDays(30);
        LocalDateTime periodEnd = now;
        
        // Get analytics for all cars in the region (filtered by region if available)
        List<DemandPredictionDTO.CarModelDemand> predictedDemand = carRepository.findByAvailableTrue().stream()
                .map(car -> {
                    CarAnalytics analytics = carAnalyticsRepository.findByCarIdAndPeriodStartAndPeriodEnd(
                            car.getId(), periodStart, periodEnd)
                            .orElse(new CarAnalytics());
                    
                    // Get previous period for trend analysis
                    LocalDateTime prevPeriodStart = periodStart.minusDays(30);
                    LocalDateTime prevPeriodEnd = periodStart;
                    CarAnalytics prevAnalytics = carAnalyticsRepository.findByCarIdAndPeriodStartAndPeriodEnd(
                            car.getId(), prevPeriodStart, prevPeriodEnd)
                            .orElse(new CarAnalytics());
                    
                    BigDecimal demandScore = calculateDemandScore(analytics, prevAnalytics);
                    String demandLevel = determineDemandLevel(demandScore);
                    String recommendation = determineRecommendation(demandLevel, analytics, prevAnalytics);
                    
                    return DemandPredictionDTO.CarModelDemand.builder()
                            .carType(car.getType().toString())
                            .brand(car.getBrand())
                            .predictedDemandScore(demandScore)
                            .demandLevel(demandLevel)
                            .recommendation(recommendation)
                            .build();
                })
                .sorted((a, b) -> b.getPredictedDemandScore().compareTo(a.getPredictedDemandScore()))
                .collect(Collectors.toList());
        
        // Generate recommendations based on demand patterns
        List<DemandPredictionDTO.Recommendation> recommendations = generateDemandRecommendations(predictedDemand);
        
        return List.of(DemandPredictionDTO.builder()
                .region(region)
                .regionCode(region.toUpperCase().replace(" ", "_"))
                .predictedDemand(predictedDemand)
                .recommendations(recommendations)
                .build());
    }
    
    private List<DemandPredictionDTO.Recommendation> generateDemandRecommendations(List<DemandPredictionDTO.CarModelDemand> predictedDemand) {
        List<DemandPredictionDTO.Recommendation> recommendations = new java.util.ArrayList<>();
        
        long highDemandCount = predictedDemand.stream()
                .filter(d -> "HIGH".equals(d.getDemandLevel()))
                .count();
        
        long lowDemandCount = predictedDemand.stream()
                .filter(d -> "LOW".equals(d.getDemandLevel()))
                .count();
        
        if (highDemandCount > 5) {
            recommendations.add(DemandPredictionDTO.Recommendation.builder()
                    .type("RESTOCK")
                    .description("High demand detected: Consider restocking popular models")
                    .suggestedDiscount(BigDecimal.ZERO)
                    .build());
        }
        
        if (lowDemandCount > 10) {
            recommendations.add(DemandPredictionDTO.Recommendation.builder()
                    .type("PROMOTE")
                    .description("Multiple models showing low demand: Consider promotional campaigns")
                    .suggestedDiscount(BigDecimal.valueOf(10))
                    .build());
        }
        
        // Get top 3 high demand models
        List<DemandPredictionDTO.CarModelDemand> topDemandModels = predictedDemand.stream()
                .filter(d -> "HIGH".equals(d.getDemandLevel()))
                .limit(3)
                .collect(Collectors.toList());
        
        for (DemandPredictionDTO.CarModelDemand model : topDemandModels) {
            recommendations.add(DemandPredictionDTO.Recommendation.builder()
                    .type("RESTOCK")
                    .description("High demand model: " + model.getBrand() + " " + model.getCarType())
                    .carType(model.getCarType())
                    .brand(model.getBrand())
                    .suggestedDiscount(BigDecimal.ZERO)
                    .build());
        }
        
        return recommendations;
    }

    @Override
    @Transactional
    public void recordRecommendationClick(Long recommendationId) {
        Objects.requireNonNull(recommendationId, "Recommendation ID cannot be null");
        CarRecommendation recommendation = carRecommendationRepository.findById(recommendationId)
                .orElseThrow(() -> new RuntimeException("Recommendation not found"));
        recommendation.setClicked(true);
        recommendation.setClickedAt(java.time.LocalDateTime.now());
        carRecommendationRepository.save(recommendation);
    }

    @Override
    @Transactional
    public void recordRecommendationConversion(Long recommendationId, Long orderId) {
        CarRecommendation recommendation = carRecommendationRepository.findById(Objects.requireNonNull(recommendationId))
                .orElseThrow(() -> new RuntimeException("Recommendation not found"));
        recommendation.setConverted(true);
        carRecommendationRepository.save(recommendation);
    }

    private CarRecommendationDTO buildRecommendationDTO(Car car, CarRecommendationDTO.RecommendationType type, String reason, BigDecimal similarityScore) {
        String imageUrl = car.getImages() != null && !car.getImages().isEmpty() ?
                car.getImages().get(0).getImageUrl() : car.getImageUrl();
        
        // Normalize similarity score to 0-1 range
        BigDecimal normalizedScore = similarityScore.divide(new BigDecimal("100"), 2, java.math.RoundingMode.HALF_UP);
        if (normalizedScore.compareTo(BigDecimal.ONE) > 0) {
            normalizedScore = BigDecimal.ONE;
        }
        
        return CarRecommendationDTO.builder()
                .carId(car.getId())
                .carName(car.getName())
                .carBrand(car.getBrand())
                .carType(car.getType().toString())
                .year(car.getYear())
                .price(car.getPricePerDay())
                .imageUrl(imageUrl)
                .similarityScore(normalizedScore)
                .recommendationReason(reason)
                .recommendationType(type)
                .build();
    }

    private List<SellerOptimizationDTO.OptimizationRecommendation> analyzeCarOptimizations(Car car, CarAnalytics analytics) {
        List<SellerOptimizationDTO.OptimizationRecommendation> recommendations = new java.util.ArrayList<>();
        
        // High views, low conversion
        if (analytics.getTotalViews() > 100 && analytics.getViewToPurchaseRate() != null &&
                analytics.getViewToPurchaseRate().compareTo(new BigDecimal("2")) < 0) {
            recommendations.add(SellerOptimizationDTO.OptimizationRecommendation.builder()
                    .type("UPDATE_PHOTOS")
                    .title("High views, low conversion")
                    .description("Your car has " + analytics.getTotalViews() + " views but low conversion rate")
                    .priority("HIGH")
                    .suggestedAction("Update photos or adjust price")
                    .expectedImpact("Expected 20-30% increase in conversion")
                    .build());
        }
        
        // Low views
        if (analytics.getTotalViews() < 50) {
            recommendations.add(SellerOptimizationDTO.OptimizationRecommendation.builder()
                    .type("IMPROVE_DESCRIPTION")
                    .title("Low visibility")
                    .description("Your car has limited views")
                    .priority("MEDIUM")
                    .suggestedAction("Improve description and add more images")
                    .expectedImpact("Expected 40-50% increase in views")
                    .build());
        }
        
        return recommendations;
    }

    private BigDecimal calculateDemandScore(CarAnalytics analytics, CarAnalytics prevAnalytics) {
        // Enhanced scoring based on views, bookings, conversion rates, and trends
        long views = analytics.getTotalViews();
        long bookings = analytics.getBookingsCreated();
        long purchases = analytics.getPurchasesCompleted();
        
        // Calculate view score (0-40 points)
        BigDecimal viewScore = BigDecimal.ZERO;
        if (views > 0) {
            viewScore = new BigDecimal(Math.min(views, 500))
                    .divide(new BigDecimal("500"), 4, java.math.RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("40"));
        }
        
        // Calculate booking score (0-30 points)
        BigDecimal bookingScore = BigDecimal.ZERO;
        if (bookings > 0) {
            bookingScore = new BigDecimal(Math.min(bookings, 50))
                    .divide(new BigDecimal("50"), 4, java.math.RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("30"));
        }
        
        // Calculate purchase score (0-20 points)
        BigDecimal purchaseScore = BigDecimal.ZERO;
        if (purchases > 0) {
            purchaseScore = new BigDecimal(Math.min(purchases, 30))
                    .divide(new BigDecimal("30"), 4, java.math.RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("20"));
        }
        
        // Calculate conversion rate score (0-10 points)
        BigDecimal conversionScore = BigDecimal.ZERO;
        if (analytics.getViewToPurchaseRate() != null && analytics.getViewToPurchaseRate().compareTo(BigDecimal.ZERO) > 0) {
            conversionScore = analytics.getViewToPurchaseRate()
                    .min(new BigDecimal("10"))
                    .divide(new BigDecimal("10"), 4, java.math.RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("10"));
        }
        
        // Calculate trend score (0-10 points) - positive trend adds points
        BigDecimal trendScore = BigDecimal.ZERO;
        if (prevAnalytics.getTotalViews() > 0) {
            long viewGrowth = views - prevAnalytics.getTotalViews();
            if (viewGrowth > 0) {
                double growthRate = (double) viewGrowth / prevAnalytics.getTotalViews();
                trendScore = new BigDecimal(Math.min(growthRate * 100, 10));
            }
        }
        
        BigDecimal totalScore = viewScore
                .add(bookingScore)
                .add(purchaseScore)
                .add(conversionScore)
                .add(trendScore)
                .setScale(2, java.math.RoundingMode.HALF_UP);
        
        return totalScore.min(new BigDecimal("100")).max(BigDecimal.ZERO);
    }

    private String determineDemandLevel(BigDecimal score) {
        if (score.compareTo(new BigDecimal("70")) >= 0) return "HIGH";
        if (score.compareTo(new BigDecimal("40")) >= 0) return "MEDIUM";
        return "LOW";
    }

    private String determineRecommendation(String demandLevel, CarAnalytics analytics, CarAnalytics prevAnalytics) {
        if ("HIGH".equals(demandLevel)) {
            // Check if stock is low
            if (analytics.getTotalUnitsSold() > 0 && analytics.getTotalUnitsSold() < 5) {
                return "RESTOCK - High demand with low inventory";
            }
            return "RESTOCK - High demand detected";
        } else if ("MEDIUM".equals(demandLevel)) {
            // Check if conversion rate is low
            if (analytics.getViewToPurchaseRate() != null && 
                analytics.getViewToPurchaseRate().compareTo(new BigDecimal("2")) < 0) {
                return "PROMOTE - Improve conversion rate";
            }
            return "PROMOTE - Moderate demand";
        } else {
            // Check if demand is declining
            if (prevAnalytics.getTotalViews() > 0 && analytics.getTotalViews() < prevAnalytics.getTotalViews()) {
                return "REVIEW - Demand declining, consider price adjustment";
            }
            return "MAINTAIN - Low demand, monitor closely";
        }
    }
}

