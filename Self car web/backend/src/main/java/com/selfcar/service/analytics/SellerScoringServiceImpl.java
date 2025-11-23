package com.selfcar.service.analytics;

import com.selfcar.dto.analytics.SellerScoreDTO;
import com.selfcar.model.auth.User;
import com.selfcar.model.car.CarReview;
import com.selfcar.model.common.ChatMessage;
import com.selfcar.model.logistics.Logistics;
import com.selfcar.model.order.Order;
import com.selfcar.model.shop.SellerScore;
import com.selfcar.model.shop.Shop;
import com.selfcar.repository.auth.UserRepository;
import com.selfcar.repository.car.CarReviewRepository;
import com.selfcar.repository.common.ChatMessageRepository;
import com.selfcar.repository.logistics.LogisticsRepository;
import com.selfcar.repository.order.OrderRepository;
import com.selfcar.repository.shop.SellerScoreRepository;
import com.selfcar.repository.shop.ShopRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SellerScoringServiceImpl implements SellerScoringService {

    private final SellerScoreRepository sellerScoreRepository;
    private final UserRepository userRepository;
    private final ShopRepository shopRepository;
    private final OrderRepository orderRepository;
    private final CarReviewRepository carReviewRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final LogisticsRepository logisticsRepository;

    @Override
    @Transactional(readOnly = true)
    public SellerScoreDTO getSellerScore(Long sellerId) {
        SellerScore score = sellerScoreRepository.findBySellerId(sellerId)
                .orElseGet(() -> {
                    calculateSellerScore(sellerId);
                    return sellerScoreRepository.findBySellerId(sellerId)
                            .orElseThrow(() -> new RuntimeException("Seller score not found"));
                });
        
        return buildSellerScoreDTO(score);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SellerScoreDTO> getTopVerifiedDealers(int limit) {
        List<SellerScore> topSellers = sellerScoreRepository.findVerifiedDealers().stream()
                .limit(limit)
                .collect(Collectors.toList());
        
        return topSellers.stream()
                .map(this::buildSellerScoreDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void calculateSellerScore(Long sellerId) {
        User seller = userRepository.findById(Objects.requireNonNull(sellerId))
                .orElseThrow(() -> new RuntimeException("Seller not found"));
        
        Shop shop = shopRepository.findByOwnerId(sellerId).stream().findFirst().orElse(null);
        
        SellerScore score = sellerScoreRepository.findBySellerId(sellerId)
                .orElse(new SellerScore());
        
        score.setSeller(seller);
        score.setShop(shop);
        
        // Calculate and update order metrics
        List<Order> orders = orderRepository.findBySellerIdOrderByCreatedAtDesc(sellerId);
        score.setTotalOrders((long) orders.size());
        score.setCompletedOrders(orders.stream()
                .filter(o -> o.getStatus() == Order.OrderStatus.COMPLETED)
                .count());
        score.setCancelledOrders(orders.stream()
                .filter(o -> o.getStatus() == Order.OrderStatus.CANCELLED)
                .count());
        
        // Calculate and update rating metrics
        List<CarReview> reviews = carReviewRepository.findBySellerIdOrderByCreatedAtDesc(sellerId);
        score.setTotalReviews((long) reviews.size());
        if (!reviews.isEmpty()) {
            double avgRating = reviews.stream()
                    .mapToInt(CarReview::getRating)
                    .average()
                    .orElse(3.0);
            score.setAvgRating(new BigDecimal(avgRating).setScale(2, RoundingMode.HALF_UP));
        } else {
            score.setAvgRating(new BigDecimal("3.0"));
        }
        
        // Calculate response time score
        BigDecimal responseTimeScore = calculateResponseTimeScore(sellerId);
        score.setResponseTimeScore(responseTimeScore);
        
        // Calculate completion rate score
        BigDecimal completionRateScore = calculateCompletionRateScore(sellerId);
        score.setCompletionRateScore(completionRateScore);
        
        // Calculate rating score
        BigDecimal ratingScore = calculateRatingScore(sellerId);
        score.setRatingScore(ratingScore);
        
        // Calculate on-time delivery score
        BigDecimal onTimeDeliveryScore = calculateOnTimeDeliveryScore(sellerId);
        score.setOnTimeDeliveryScore(onTimeDeliveryScore);
        
        // Calculate customer satisfaction score
        BigDecimal customerSatisfactionScore = calculateCustomerSatisfactionScore(sellerId);
        score.setCustomerSatisfactionScore(customerSatisfactionScore);
        
        // Calculate total score (weighted average)
        BigDecimal totalScore = responseTimeScore
                .multiply(new BigDecimal("0.2"))
                .add(completionRateScore.multiply(new BigDecimal("0.25")))
                .add(ratingScore.multiply(new BigDecimal("0.25")))
                .add(onTimeDeliveryScore.multiply(new BigDecimal("0.15")))
                .add(customerSatisfactionScore.multiply(new BigDecimal("0.15")))
                .setScale(2, RoundingMode.HALF_UP);
        
        score.setTotalScore(totalScore);
        score.updateBadgeLevel();
        
        // Determine if top verified (top 10%)
        long totalSellers = sellerScoreRepository.count();
        long sellersAbove = sellerScoreRepository.countByScoreAbove(totalScore);
        double percentile = totalSellers > 0 ? (1.0 - (double) sellersAbove / totalSellers) * 100 : 0;
        score.setIsTopVerified(percentile >= 90);
        
        score.setLastCalculatedAt(LocalDateTime.now());
        sellerScoreRepository.save(score);
    }

    @Override
    @Transactional
    public void recalculateAllSellerScores() {
        List<User> sellers = userRepository.findAll().stream()
                .filter(user -> user.getRole() == User.Role.SELLER || user.getRole() == User.Role.ADMIN)
                .collect(Collectors.toList());
        
        sellers.forEach(seller -> calculateSellerScore(seller.getId()));
    }

    @Override
    @Transactional(readOnly = true)
    public List<SellerScoreDTO> getSellerRankings(int limit) {
        return sellerScoreRepository.findAllOrderByScoreDesc().stream()
                .limit(limit)
                .map(this::buildSellerScoreDTO)
                .collect(Collectors.toList());
    }

    private BigDecimal calculateResponseTimeScore(Long sellerId) {
        // Get all chat messages where seller is involved
        // Note: This assumes ChatMessage has a conversation with seller
        List<ChatMessage> sellerMessages = chatMessageRepository.findAll().stream()
                .filter(m -> m.getSender().getId().equals(sellerId))
                .collect(Collectors.toList());
        
        if (sellerMessages.isEmpty()) {
            return new BigDecimal("50"); // Default score for new sellers
        }
        
        // Calculate average response time (simplified - would need conversation thread analysis)
        // For now, calculate based on message frequency
        LocalDateTime now = LocalDateTime.now();
        double avgHours = sellerMessages.stream()
                .filter(m -> m.getCreatedAt() != null)
                .mapToDouble(m -> {
                    long hoursSinceLastMessage = Duration.between(m.getCreatedAt(), now).toHours();
                    return Math.min(hoursSinceLastMessage, 168.0); // Cap at 1 week
                })
                .average()
                .orElse(24.0);
        
        // Store average response time
        BigDecimal avgResponseTime = new BigDecimal(avgHours).setScale(2, RoundingMode.HALF_UP);
        
        // Score: < 1 hour = 100, < 6 hours = 80, < 24 hours = 60, < 48 hours = 40, > 48 hours = 20
        BigDecimal score;
        if (avgHours < 1) {
            score = new BigDecimal("100");
        } else if (avgHours < 6) {
            score = new BigDecimal("80");
        } else if (avgHours < 24) {
            score = new BigDecimal("60");
        } else if (avgHours < 48) {
            score = new BigDecimal("40");
        } else {
            score = new BigDecimal("20");
        }
        
        // Update seller score with average response time
        SellerScore sellerScore = sellerScoreRepository.findBySellerId(sellerId).orElse(null);
        if (sellerScore != null) {
            sellerScore.setAvgResponseTimeHours(avgResponseTime);
        }
        
        return score;
    }

    private BigDecimal calculateCompletionRateScore(Long sellerId) {
        // Get orders for this seller
        List<Order> orders = orderRepository.findBySellerIdOrderByCreatedAtDesc(sellerId);
        if (orders.isEmpty()) {
            return new BigDecimal("50"); // Default score
        }
        
        long completed = orders.stream()
                .filter(o -> o.getStatus() == Order.OrderStatus.COMPLETED)
                .count();
        
        long total = orders.size();
        
        BigDecimal completionRate = new BigDecimal(completed)
                .divide(new BigDecimal(total), 4, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"));
        
        return completionRate.setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal calculateRatingScore(Long sellerId) {
        // Get average rating from reviews
        List<CarReview> reviews = carReviewRepository.findAll(); // Would filter by seller's cars
        if (reviews.isEmpty()) {
            return new BigDecimal("50"); // Default score
        }
        
        double avgRating = reviews.stream()
                .mapToInt(CarReview::getRating)
                .average()
                .orElse(3.0);
        
        // Convert 1-5 scale to 0-100 scale
        BigDecimal ratingScore = new BigDecimal(avgRating)
                .subtract(new BigDecimal("1"))
                .divide(new BigDecimal("4"), 4, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"));
        
        return ratingScore.setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal calculateOnTimeDeliveryScore(Long sellerId) {
        // Get all orders for this seller
        List<Order> orders = orderRepository.findBySellerIdOrderByCreatedAtDesc(sellerId);
        
        if (orders.isEmpty()) {
            return new BigDecimal("50"); // Default score
        }
        
        // Get deliveries from logistics
        List<Logistics> deliveries = logisticsRepository.findAll().stream()
                .filter(l -> {
                    // Check if logistics is related to seller's orders
                    if (l.getBooking() != null && l.getBooking().getCar() != null) {
                        return l.getBooking().getCar().getShop() != null &&
                               l.getBooking().getCar().getShop().getOwner() != null &&
                               l.getBooking().getCar().getShop().getOwner().getId().equals(sellerId);
                    }
                    return false;
                })
                .filter(l -> l.getType() == Logistics.LogisticsType.DELIVERY)
                .collect(Collectors.toList());
        
        long onTimeDeliveries = 0;
        long totalDeliveries = 0;
        
        for (Order order : orders) {
            if (order.getDeliveryDate() != null && order.getStatus() == Order.OrderStatus.COMPLETED) {
                totalDeliveries++;
                
                // Find related logistics delivery
                Logistics delivery = deliveries.stream()
                        .filter(d -> d.getBooking() != null && 
                                   d.getBooking().getCar() != null &&
                                   d.getBooking().getCar().getId().equals(order.getCar().getId()))
                        .findFirst()
                        .orElse(null);
                
                if (delivery != null && delivery.getScheduledDateTime() != null && 
                    delivery.getActualDateTime() != null) {
                    // Check if delivery was on time (within 2 hours of scheduled time)
                    long hoursDiff = Math.abs(Duration.between(
                            delivery.getScheduledDateTime(), 
                            delivery.getActualDateTime()).toHours());
                    
                    if (hoursDiff <= 2) {
                        onTimeDeliveries++;
                    }
                } else if (order.getDeliveryDate() != null && order.getPickupDate() != null) {
                    // Fallback: Check if delivery was within reasonable time after pickup
                    long daysDiff = Duration.between(order.getPickupDate(), order.getDeliveryDate()).toDays();
                    if (daysDiff >= 0 && daysDiff <= 7) { // Delivery within 7 days of pickup is considered on-time
                        onTimeDeliveries++;
                    }
                }
            }
        }
        
        // Update seller score metrics
        SellerScore sellerScore = sellerScoreRepository.findBySellerId(sellerId).orElse(null);
        if (sellerScore != null) {
            sellerScore.setOnTimeDeliveries(onTimeDeliveries);
            sellerScore.setTotalDeliveries(totalDeliveries);
        }
        
        if (totalDeliveries == 0) {
            return new BigDecimal("50"); // Default score
        }
        
        // Calculate on-time delivery rate (0-100)
        BigDecimal onTimeRate = new BigDecimal(onTimeDeliveries)
                .divide(new BigDecimal(totalDeliveries), 4, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"))
                .setScale(2, RoundingMode.HALF_UP);
        
        return onTimeRate;
    }

    private BigDecimal calculateCustomerSatisfactionScore(Long sellerId) {
        // Get all reviews for seller's cars
        List<CarReview> reviews = carReviewRepository.findBySellerIdOrderByCreatedAtDesc(sellerId);
        
        if (reviews.isEmpty()) {
            return new BigDecimal("50"); // Default score
        }
        
        // Calculate average rating
        double avgRating = reviews.stream()
                .mapToInt(CarReview::getRating)
                .average()
                .orElse(3.0);
        
        // Count positive reviews (4-5 stars)
        long positiveReviews = reviews.stream()
                .filter(r -> r.getRating() >= 4)
                .count();
        
        // Count negative reviews (1-2 stars)
        long negativeReviews = reviews.stream()
                .filter(r -> r.getRating() <= 2)
                .count();
        
        long totalReviews = reviews.size();
        
        // Calculate satisfaction score:
        // - Base score from average rating (0-100 scale)
        // - Bonus for high positive review percentage
        // - Penalty for high negative review percentage
        BigDecimal baseScore = new BigDecimal(avgRating)
                .subtract(new BigDecimal("1"))
                .divide(new BigDecimal("4"), 4, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"));
        
        BigDecimal positiveRatio = new BigDecimal(positiveReviews)
                .divide(new BigDecimal(totalReviews), 4, RoundingMode.HALF_UP);
        
        BigDecimal negativeRatio = new BigDecimal(negativeReviews)
                .divide(new BigDecimal(totalReviews), 4, RoundingMode.HALF_UP);
        
        // Bonus: +10 points if >80% positive reviews
        BigDecimal bonus = BigDecimal.ZERO;
        if (positiveRatio.compareTo(new BigDecimal("0.8")) >= 0) {
            bonus = new BigDecimal("10");
        }
        
        // Penalty: -20 points if >20% negative reviews
        BigDecimal penalty = BigDecimal.ZERO;
        if (negativeRatio.compareTo(new BigDecimal("0.2")) >= 0) {
            penalty = new BigDecimal("20");
        }
        
        BigDecimal satisfactionScore = baseScore
                .add(bonus)
                .subtract(penalty)
                .max(BigDecimal.ZERO)
                .min(new BigDecimal("100"))
                .setScale(2, RoundingMode.HALF_UP);
        
        return satisfactionScore;
    }

    private SellerScoreDTO buildSellerScoreDTO(SellerScore score) {
        User seller = score.getSeller();
        Shop shop = score.getShop();
        
        if (seller == null) {
            throw new IllegalStateException("Seller score must have a seller");
        }
        
        BigDecimal completionRate = BigDecimal.ZERO;
        if (score.getTotalOrders() > 0) {
            completionRate = new BigDecimal(score.getCompletedOrders())
                    .divide(new BigDecimal(score.getTotalOrders()), 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100"));
        }
        
        BigDecimal onTimeRate = BigDecimal.ZERO;
        if (score.getTotalDeliveries() > 0) {
            onTimeRate = new BigDecimal(score.getOnTimeDeliveries())
                    .divide(new BigDecimal(score.getTotalDeliveries()), 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100"));
        }
        
        return SellerScoreDTO.builder()
                .sellerId(seller.getId())
                .sellerName(seller.getFirstName() + " " + seller.getLastName())
                .shopId(shop != null ? shop.getId() : null)
                .shopName(shop != null ? shop.getName() : null)
                .totalScore(score.getTotalScore())
                .badgeLevel(SellerScoreDTO.BadgeLevel.valueOf(score.getBadgeLevel().name()))
                .isTopVerified(score.getIsTopVerified())
                .isVerifiedDealer(score.getIsVerifiedDealer())
                .responseTimeScore(score.getResponseTimeScore())
                .completionRateScore(score.getCompletionRateScore())
                .ratingScore(score.getRatingScore())
                .onTimeDeliveryScore(score.getOnTimeDeliveryScore())
                .customerSatisfactionScore(score.getCustomerSatisfactionScore())
                .avgResponseTimeHours(score.getAvgResponseTimeHours())
                .totalOrders(score.getTotalOrders())
                .completedOrders(score.getCompletedOrders())
                .completionRate(completionRate)
                .avgRating(score.getAvgRating())
                .totalReviews(score.getTotalReviews())
                .onTimeDeliveryRate(onTimeRate)
                .build();
    }
}

