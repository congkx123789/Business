# Multi-Layer Caching Strategy

## Overview

This document describes the 5-layer caching architecture implemented for the SelfCar platform, following a defense-in-depth approach where each layer shields the costlier layer below.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 1: Browser Cache                                      │
│ TTL: 7-30 days (static assets)                              │
│ Purpose: Cache immutable assets in user's browser           │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 2: CDN Cache (CloudFront)                             │
│ TTL: 1-7 days (assets), 5-15 min (API responses)            │
│ Purpose: Global edge caching for static and dynamic content │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 3: API Gateway Cache (if applicable)                  │
│ TTL: 5-15 minutes                                           │
│ Purpose: Cache API responses at gateway level               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 4: Application Cache (Redis)                          │
│ TTL: 15-60 minutes (varies by content volatility)           │
│ Purpose: Cache application-level data, shield database      │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 5: Database                                           │
│ TTL: No caching, always fresh                               │
│ Purpose: Source of truth, always up-to-date                 │
└─────────────────────────────────────────────────────────────┘
```

## Cache Layers Detail

### Layer 1: Browser Cache (7-30 days)

**Purpose**: Store immutable static assets in the user's browser.

**Configuration**:
- **Static Assets** (images, CSS, JS, fonts): `Cache-Control: public, max-age=2592000, immutable` (30 days)
- **Semi-Static Assets**: `Cache-Control: public, max-age=604800` (7 days)

**Implementation**:
- Set via `StaticResourceCacheConfig` for static resources
- Set via `CacheControlConfig` interceptor for API responses

**Benefits**:
- Reduces bandwidth usage
- Instant loading for returning users
- Offline capability for cached assets

### Layer 2: CDN Cache (CloudFront) - 1-7 days

**Purpose**: Cache content at edge locations globally.

**Configuration**:
- **Images**: 7 days TTL (604800 seconds)
- **Static Assets**: 7 days TTL
- **API Responses**: 5-15 minutes (via `s-maxage` header)

**Implementation**:
- CloudFront distribution configured in Terraform
- Cache-Control headers set via `CacheControlConfig`
- `s-maxage` header for CDN-specific caching

**Benefits**:
- Reduced latency for global users
- Lower origin server load
- Cost savings on bandwidth

### Layer 3: API Gateway Cache (5-15 minutes)

**Purpose**: Cache API responses at gateway level (if using API Gateway).

**Configuration**:
- Dynamic content: 5-15 minutes
- Set via `Cache-Control: s-maxage=900` header

**Implementation**:
- Handled by API Gateway configuration (AWS API Gateway, etc.)
- Backend sets appropriate `s-maxage` headers

**Benefits**:
- Reduces backend load
- Faster response times
- Scales independently

### Layer 4: Application Cache (Redis) - 15-60 minutes

**Purpose**: Cache application data in Redis, shield the database.

**TTL Strategy by Content Volatility**:

| Content Type | TTL | Examples |
|-------------|-----|----------|
| Static | 60 minutes | Car types, brands, configuration |
| Semi-Static | 30 minutes | Featured cars, user profiles |
| Dynamic | 15 minutes | Car listings, search results |
| Inventory | 10 minutes | Car availability, pricing |
| Real-time | 5 minutes | Bookings, analytics |

**Implementation**:
- Configured in `CacheConfig.java`
- Uses `@Cacheable`, `@CacheEvict` annotations
- Different cache names for different content types

**Cache Names**:
- `static`, `carTypes`, `brands` - 60 minutes
- `semiStatic`, `featuredCars`, `userProfile` - 30 minutes
- `dynamic`, `carById`, `availableCars`, `carList` - 15 minutes
- `inventory`, `carAvailability`, `pricing` - 10 minutes
- `realtime`, `bookings`, `analytics` - 5 minutes

**Benefits**:
- Reduces database queries
- Faster response times
- Better scalability

### Layer 5: Database

**Purpose**: Source of truth, always fresh data.

**Configuration**:
- No caching at database level
- Always returns latest data

## Cache-Control Headers

### Static Assets
```
Cache-Control: public, max-age=2592000, immutable
```
- 30 days browser cache
- Immutable (never needs revalidation)

### CDN-Cached Assets
```
Cache-Control: public, max-age=604800, s-maxage=604800
```
- 7 days browser cache
- 7 days CDN cache

### Dynamic API Responses
```
Cache-Control: public, max-age=900, s-maxage=900
```
- 15 minutes browser cache
- 15 minutes CDN/API Gateway cache

### Inventory Data
```
Cache-Control: public, max-age=600, s-maxage=600
```
- 10 minutes browser cache
- 10 minutes CDN cache

### Real-time Data
```
Cache-Control: public, max-age=300, s-maxage=300
```
- 5 minutes browser cache
- 5 minutes CDN cache

### Private Data
```
Cache-Control: private, max-age=0, must-revalidate
```
- No shared caching
- Must revalidate on each request

## Cache Invalidation

### Automatic Invalidation
- Updates/Deletes automatically invalidate related caches
- Uses `@CacheEvict` annotations
- `CacheInvalidationService` for complex scenarios

### Manual Invalidation
Admin endpoints for cache management:
- `POST /api/admin/cache/invalidate/all` - Invalidate all caches
- `POST /api/admin/cache/invalidate/{cacheName}` - Invalidate specific cache
- `POST /api/admin/cache/invalidate/car/{carId}` - Invalidate car-related caches

### Cache Invalidation Strategy
1. **On Update**: Invalidate related caches immediately
2. **On Delete**: Invalidate all related caches
3. **On Create**: May need to invalidate list caches
4. **Scheduled**: Periodic cleanup of stale caches (optional)

## Content Volatility Classification

### Static Content (60 min TTL)
- Rarely changes
- Examples: Car types, brands, configuration
- Cache: `static`, `carTypes`, `brands`

### Semi-Static Content (30 min TTL)
- Changes occasionally
- Examples: Featured cars, user profiles
- Cache: `semiStatic`, `featuredCars`, `userProfile`

### Dynamic Content (15 min TTL)
- Changes frequently
- Examples: Car listings, search results
- Cache: `dynamic`, `carById`, `availableCars`, `carList`

### Inventory Data (10 min TTL)
- Changes very frequently
- Examples: Car availability, pricing
- Cache: `inventory`, `carAvailability`, `pricing`

### Real-time Data (5 min TTL)
- Changes constantly
- Examples: Bookings, analytics
- Cache: `realtime`, `bookings`, `analytics`

## Best Practices

### 1. Set Appropriate TTLs
- Match TTL to content volatility
- Longer TTL for static content
- Shorter TTL for dynamic content

### 2. Use Cache-Control Headers
- Always set `Cache-Control` headers
- Use `s-maxage` for CDN caching
- Use `immutable` for truly static assets

### 3. Implement Cache Invalidation
- Invalidate on updates/deletes
- Use cache keys for granular invalidation
- Monitor cache hit rates

### 4. Monitor Cache Performance
- Track cache hit rates per layer
- Monitor cache eviction rates
- Alert on cache misses

### 5. Defense-in-Depth
- Each layer should work independently
- If one layer fails, others still work
- Design for graceful degradation

## Monitoring

### Metrics to Track
- **Cache Hit Rate**: % of requests served from cache
- **Cache Miss Rate**: % of requests that hit origin
- **Cache Eviction Rate**: Frequency of cache evictions
- **TTL Distribution**: Distribution of TTL values
- **Cache Size**: Memory usage per cache layer

### Tools
- Redis monitoring (RedisInsight, etc.)
- CloudFront metrics (AWS CloudWatch)
- Application metrics (Micrometer/Prometheus)
- Browser DevTools (cache inspection)

## Configuration

### Application Properties
```properties
# Redis Cache Configuration
spring.cache.type=redis
spring.cache.redis.time-to-live=900000 # 15 minutes default (ms)
spring.data.redis.host=localhost
spring.data.redis.port=6379

# Cache TTL Configuration (in minutes)
cache.ttl.static=60
cache.ttl.semi-static=30
cache.ttl.dynamic=15
cache.ttl.inventory=10
cache.ttl.realtime=5
```

### Terraform Configuration
```hcl
# CloudFront cache policy
default_ttl = 604800  # 7 days for images
min_ttl     = 86400   # 1 day minimum
max_ttl     = 604800  # 7 days maximum
```

## Troubleshooting

### Cache Not Working
1. Check Redis connection
2. Verify cache annotations are applied
3. Check Cache-Control headers
4. Verify CloudFront distribution status

### Stale Data
1. Check cache TTLs
2. Verify cache invalidation is working
3. Check for cache key collisions
4. Monitor cache eviction

### High Cache Miss Rate
1. Review TTL settings
2. Check cache size limits
3. Verify cache keys are consistent
4. Monitor Redis memory usage

## References

- [HTTP Caching (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching)
- [CloudFront Caching](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Caching.html)
- [Spring Cache Abstraction](https://docs.spring.io/spring-framework/docs/current/reference/html/integration.html#cache)
- [Redis Best Practices](https://redis.io/docs/manual/patterns/)

