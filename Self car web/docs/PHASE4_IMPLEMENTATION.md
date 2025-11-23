# Phase 4: Intelligence, Automation & Data Insights Implementation

## Overview

Phase 4 focuses on using AI and data analytics to drive decisions and optimize performance. This implementation mirrors Shopee's Business Insights model and provides:

1. **Business Insights Engine** - Track sales performance, conversion rates, and advertising ROI
2. **AI Recommendation Engine** - Suggest similar vehicles, seller optimizations, and predict demand
3. **Automated Seller Scoring** - Algorithm-based reputation scores with "Top Verified Dealers" highlighting

## Database Schema

### New Tables

#### 1. `car_views` - Track car views for analytics
```sql
CREATE TABLE car_views (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    car_id BIGINT NOT NULL,
    user_id BIGINT,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    referrer VARCHAR(500),
    traffic_source ENUM('SEARCH', 'ORGANIC', 'RECOMMENDATION', 'ADVERTISING', 'SOCIAL_MEDIA', 'OTHER'),
    view_duration_seconds INT,
    created_at TIMESTAMP NOT NULL,
    INDEX idx_car_view_car (car_id),
    INDEX idx_car_view_user (user_id),
    INDEX idx_car_view_created (created_at),
    FOREIGN KEY (car_id) REFERENCES cars(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### 2. `car_analytics` - Aggregated analytics data (mirrors Shopee Business Insights)
```sql
CREATE TABLE car_analytics (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    car_id BIGINT NOT NULL,
    period_start TIMESTAMP NOT NULL,
    period_end TIMESTAMP NOT NULL,
    total_views BIGINT DEFAULT 0,
    unique_views BIGINT DEFAULT 0,
    avg_view_duration_seconds INT,
    deposits_created BIGINT DEFAULT 0,
    bookings_created BIGINT DEFAULT 0,
    purchases_completed BIGINT DEFAULT 0,
    view_to_deposit_rate DECIMAL(5,2),
    deposit_to_purchase_rate DECIMAL(5,2),
    view_to_purchase_rate DECIMAL(5,2),
    total_revenue DECIMAL(15,2),
    total_units_sold BIGINT DEFAULT 0,
    views_from_search BIGINT DEFAULT 0,
    views_from_organic BIGINT DEFAULT 0,
    views_from_recommendation BIGINT DEFAULT 0,
    views_from_advertising BIGINT DEFAULT 0,
    ad_spend DECIMAL(15,2),
    ad_revenue DECIMAL(15,2),
    ad_roi DECIMAL(5,2),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    INDEX idx_car_analytics_car (car_id),
    INDEX idx_car_analytics_period (period_start, period_end),
    FOREIGN KEY (car_id) REFERENCES cars(id)
);
```

#### 3. `seller_scores` - Automated seller scoring
```sql
CREATE TABLE seller_scores (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    seller_id BIGINT NOT NULL,
    shop_id BIGINT,
    total_score DECIMAL(5,2) DEFAULT 0,
    response_time_score DECIMAL(5,2),
    completion_rate_score DECIMAL(5,2),
    rating_score DECIMAL(5,2),
    on_time_delivery_score DECIMAL(5,2),
    customer_satisfaction_score DECIMAL(5,2),
    avg_response_time_hours DECIMAL(5,2),
    total_orders BIGINT DEFAULT 0,
    completed_orders BIGINT DEFAULT 0,
    cancelled_orders BIGINT DEFAULT 0,
    avg_rating DECIMAL(3,2),
    total_reviews BIGINT DEFAULT 0,
    on_time_deliveries BIGINT DEFAULT 0,
    total_deliveries BIGINT DEFAULT 0,
    is_top_verified BOOLEAN DEFAULT FALSE,
    is_verified_dealer BOOLEAN DEFAULT FALSE,
    badge_level ENUM('BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND') DEFAULT 'BRONZE',
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    last_calculated_at TIMESTAMP,
    INDEX idx_seller_score_user (seller_id),
    INDEX idx_seller_score_shop (shop_id),
    INDEX idx_seller_score_total (total_score),
    FOREIGN KEY (seller_id) REFERENCES users(id),
    FOREIGN KEY (shop_id) REFERENCES shops(id)
);
```

#### 4. `car_recommendations` - AI-generated recommendations
```sql
CREATE TABLE car_recommendations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    source_car_id BIGINT,
    target_car_id BIGINT NOT NULL,
    user_id BIGINT,
    similarity_score DECIMAL(5,4),
    recommendation_type ENUM('SIMILAR_CARS', 'PERSONALIZED', 'POPULAR', 'PRICE_RANGE', 'BRAND_CATEGORY', 'DEMAND_PREDICTION'),
    reason VARCHAR(500),
    clicked BOOLEAN DEFAULT FALSE,
    converted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL,
    clicked_at TIMESTAMP,
    INDEX idx_car_rec_source (source_car_id),
    INDEX idx_car_rec_target (target_car_id),
    INDEX idx_car_rec_user (user_id),
    INDEX idx_car_rec_score (similarity_score),
    FOREIGN KEY (source_car_id) REFERENCES cars(id),
    FOREIGN KEY (target_car_id) REFERENCES cars(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## Backend Implementation

### Models Created

1. **CarView.java** - Tracks individual car views with traffic source
2. **CarAnalytics.java** - Aggregated analytics (daily/weekly/monthly)
3. **SellerScore.java** - Seller reputation scores with badge levels
4. **CarRecommendation.java** - AI recommendation results

### Services

#### 1. BusinessInsightsService
- `getCarInsights()` - Get comprehensive insights for a car
- `getSalesPerformanceByModel()` - Sales performance by car model
- `getConversionMetrics()` - Views → deposits → purchases conversion
- `getAdvertisingROI()` - ROI by channel (search, organic, recommendation, advertising)
- `trackCarView()` - Track when a user views a car
- `calculateCarAnalytics()` - Calculate aggregated analytics (scheduled job)

#### 2. RecommendationService
- `getSimilarCars()` - "You may also like" recommendations
- `getPersonalizedRecommendations()` - User-based recommendations
- `getSellerOptimizations()` - "High views, low conversion — update photos or price"
- `predictDemandByRegion()` - Predict demand and suggest restocking/promotions
- `recordRecommendationClick()` - Track recommendation clicks
- `recordRecommendationConversion()` - Track conversions from recommendations

#### 3. SellerScoringService
- `getSellerScore()` - Get seller score
- `getTopVerifiedDealers()` - Get top verified dealers (highlighted)
- `calculateSellerScore()` - Calculate seller score algorithm
- `recalculateAllSellerScores()` - Batch recalculation
- `getSellerRankings()` - Get seller rankings

### Controllers

1. **BusinessInsightsController** - `/api/business-insights`
2. **RecommendationController** - `/api/recommendations`
3. **SellerScoringController** - `/api/seller-scores`

### DTOs

1. **BusinessInsightsDTO** - Comprehensive business insights
2. **CarRecommendationDTO** - Car recommendation data
3. **SellerScoreDTO** - Seller score details
4. **SellerOptimizationDTO** - Seller optimization recommendations
5. **DemandPredictionDTO** - Demand prediction by region

## Key Features

### 1. Business Insights Engine (Shopee Model)

**Sales Performance Tracking:**
- Total units sold by car model
- Total revenue and average order value
- Revenue growth compared to previous period

**Conversion Rate Tracking:**
- Views → Deposits conversion rate
- Deposits → Purchases conversion rate
- Overall views → purchases funnel

**Advertising ROI:**
- ROI by channel (search, organic, recommendation, advertising)
- Cost per click (CPC)
- Cost per conversion
- Revenue generated from each channel

**Traffic Source Breakdown:**
- Views from search
- Views from organic navigation
- Views from AI recommendations
- Views from paid advertising
- Conversion rates by source

### 2. AI Recommendation Engine

**Similar Cars ("You may also like"):**
- Based on car attributes (type, brand, price range)
- Similarity scoring algorithm
- Cached recommendations for performance

**Personalized Recommendations:**
- Based on user browsing history
- Based on past bookings/purchases
- Machine learning-based suggestions

**Seller Optimizations:**
- "High views, low conversion — update photos or price"
- "Low visibility — improve description"
- "Add more images"
- "Response time is slow"
- Priority-based recommendations (HIGH, MEDIUM, LOW)

**Demand Prediction:**
- Predict demand per region
- Suggest restocking for high-demand items
- Suggest promotions for low-demand items
- Car model demand scoring

### 3. Automated Seller Scoring

**Scoring Algorithm:**
- Response Time Score (20% weight)
  - < 1 hour: 100 points
  - < 6 hours: 80 points
  - < 24 hours: 60 points
  - > 24 hours: 40 points

- Completion Rate Score (25% weight)
  - Orders completed / Total orders
  - Percentage-based scoring

- Rating Score (25% weight)
  - Average customer rating (1-5 scale)
  - Normalized to 0-100 scale

- On-Time Delivery Score (15% weight)
  - On-time deliveries / Total deliveries
  - Percentage-based scoring

- Customer Satisfaction Score (15% weight)
  - Based on reviews and complaints
  - Feedback analysis

**Badge Levels:**
- BRONZE: 0-40 score
- SILVER: 41-60 score
- GOLD: 61-80 score
- PLATINUM: 81-95 score
- DIAMOND: 96-100 score

**Top Verified Dealers:**
- Top 10% of sellers by score
- Highlighted in search results
- Special badge display

## API Endpoints

### Business Insights

```
GET /api/business-insights/cars/{carId}
  Query params: periodStart, periodEnd
  Returns: BusinessInsightsDTO

GET /api/business-insights/sales-performance
  Query params: periodStart, periodEnd
  Returns: List<SalesPerformance>

GET /api/business-insights/cars/{carId}/conversion
  Query params: periodStart, periodEnd
  Returns: ConversionMetrics

GET /api/business-insights/cars/{carId}/advertising-roi
  Query params: periodStart, periodEnd
  Returns: AdvertisingROI

POST /api/business-insights/cars/{carId}/track-view
  Body: userId, ipAddress, userAgent, referrer, trafficSource
  Returns: 200 OK
```

### Recommendations

```
GET /api/recommendations/cars/{carId}/similar
  Query params: limit (default: 10)
  Returns: List<CarRecommendationDTO>

GET /api/recommendations/users/{userId}/personalized
  Query params: limit (default: 10)
  Returns: List<CarRecommendationDTO>

GET /api/recommendations/sellers/{sellerId}/optimizations
  Returns: SellerOptimizationDTO

GET /api/recommendations/demand-prediction
  Query params: region
  Returns: List<DemandPredictionDTO>

POST /api/recommendations/{recommendationId}/click
  Returns: 200 OK

POST /api/recommendations/{recommendationId}/conversion
  Query params: orderId
  Returns: 200 OK
```

### Seller Scoring

```
GET /api/seller-scores/sellers/{sellerId}
  Returns: SellerScoreDTO

GET /api/seller-scores/top-verified
  Query params: limit (default: 10)
  Returns: List<SellerScoreDTO>

GET /api/seller-scores/rankings
  Query params: limit (default: 50)
  Returns: List<SellerScoreDTO>

POST /api/seller-scores/sellers/{sellerId}/calculate
  Returns: 200 OK

POST /api/seller-scores/recalculate-all
  Returns: 200 OK
```

## Scheduled Jobs

### 1. Calculate Car Analytics (Daily)
- Run daily at 2 AM
- Calculate analytics for previous day
- Update `car_analytics` table

### 2. Calculate Seller Scores (Daily)
- Run daily at 3 AM
- Recalculate all seller scores
- Update badge levels
- Identify top verified dealers

### 3. Generate Recommendations (Hourly)
- Generate new recommendations
- Update similarity scores
- Cache popular recommendations

## Frontend Integration

### Track Car Views
When a user views a car detail page, call:
```javascript
POST /api/business-insights/cars/{carId}/track-view
{
  userId: 123,
  ipAddress: "192.168.1.1",
  userAgent: "Mozilla/5.0...",
  referrer: "https://google.com",
  trafficSource: "SEARCH"
}
```

### Display Similar Cars
```javascript
GET /api/recommendations/cars/{carId}/similar?limit=10
```

### Display Seller Score Badge
```javascript
GET /api/seller-scores/sellers/{sellerId}
// Display badge based on badgeLevel
```

## Testing

### Unit Tests
- Test scoring algorithm calculations
- Test recommendation similarity scoring
- Test analytics aggregation

### Integration Tests
- Test end-to-end analytics flow
- Test recommendation generation
- Test seller score calculation

## Performance Considerations

1. **Caching**: Cache recommendations and analytics
2. **Batch Processing**: Use scheduled jobs for heavy calculations
3. **Indexing**: Database indexes on frequently queried fields
4. **Pagination**: Large result sets should be paginated

## Future Enhancements

1. **Machine Learning**: Implement ML models for better recommendations
2. **Real-time Analytics**: WebSocket updates for real-time dashboards
3. **Advanced Predictions**: Time series forecasting for demand
4. **A/B Testing**: Test different recommendation algorithms
5. **Custom Dashboards**: Allow sellers to customize their analytics view

## Summary

Phase 4 provides comprehensive intelligence and automation features:

✅ **Business Insights Engine** - Complete analytics mirroring Shopee model
✅ **AI Recommendation Engine** - Similar cars, personalized recommendations, seller optimizations
✅ **Automated Seller Scoring** - Algorithm-based reputation with badge levels
✅ **Demand Prediction** - Regional demand forecasting with restocking suggestions
✅ **Top Verified Dealers** - Highlighted sellers based on performance

All components are integrated and ready for frontend implementation.

