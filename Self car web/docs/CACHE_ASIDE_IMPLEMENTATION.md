# Cache-Aside Pattern Implementation

## Overview

This document describes the cache-aside pattern implementation for read-heavy workloads, designed to protect the relational database and achieve ≥80% cache hit rate on VDP object fetches.

## Architecture

### Cache-Aside Pattern

```
┌─────────┐
│ Client  │
└────┬────┘
     │
     ▼
┌─────────────────────────────────────┐
│  Application Layer                  │
│  ┌───────────────────────────────┐  │
│  │  Cache-Aside Service          │  │
│  │  1. Check cache               │  │
│  │  2. If miss, load from DB     │  │
│  │  3. Store in cache            │  │
│  └───────────────────────────────┘  │
└────┬──────────────────────────────┬─┘
     │                              │
     ▼                              ▼
┌──────────┐                  ┌──────────┐
│  Redis   │                  │    DB    │
│  Cache   │                  │          │
└──────────┘                  └──────────┘
```

## Key Features

### 1. Namespace Keys with Versioning

**Format**: `{namespace}:{key}:v{version}`

**Examples**:
- `vdp:12345:v1` - Vehicle detail page for vehicle ID 12345, version 1
- `search:hash123:v1` - Search results for query hash, version 1
- `session:abc123:v1` - User session, version 1

**Benefits**:
- Easy cache invalidation by version bump
- Namespace isolation
- Clear key structure

### 2. Compression for Large Values

**Threshold**: 1KB (configurable)

**Implementation**:
- Values > 1KB are automatically compressed using GZIP
- Transparent compression/decompression
- Reduces memory usage and network transfer

### 3. TTLs by Content Type

| Content Type | TTL | Namespace |
|-------------|-----|-----------|
| VDP (Vehicle Details) | 15 minutes | `vdp` |
| Search Results | 5 minutes | `search` |
| Sessions | 30 minutes | `session` |
| Static Data | 60 minutes | `static` |

### 4. Cache Hit Rate Tracking

**Metrics Tracked**:
- Cache hits per namespace
- Cache misses per namespace
- Cache errors
- DB read QPS reduction
- Overall cache hit rate

**Target**: ≥80% cache hit rate for VDP namespace

## Implementation

### Core Services

#### CacheAsideService
- Generic cache-aside implementation
- Handles serialization/deserialization
- Compression support
- Namespace key management

#### VehicleDetailCacheService
- Optimized for VDP (Vehicle Detail Pages)
- 15-minute TTL
- Target: ≥80% hit rate

#### SearchResultsCacheService
- Caches search query results
- 5-minute TTL
- Query-based cache keys

#### SessionCacheService
- User session caching
- 30-minute TTL
- Matches session timeout

### Cache Metrics

#### CacheMetricsService
- Tracks cache performance
- Calculates hit rates
- Measures DB read reduction
- Exposes metrics via Micrometer

#### Metrics Endpoints
- `GET /api/admin/cache/metrics/overall` - Overall statistics
- `GET /api/admin/cache/metrics/namespace/{namespace}` - Per-namespace stats
- `GET /api/admin/cache/metrics/vdp` - VDP-specific metrics
- `GET /api/admin/cache/metrics/db-reduction` - DB read reduction

### DB Read Tracking

#### DbReadTrackingAspect
- AOP aspect to track database reads
- Intercepts JpaRepository methods
- Records DB read operations
- Used to calculate QPS reduction

## Usage Examples

### VDP (Vehicle Detail Page)

```java
// In CarService
Optional<Car> car = vehicleDetailCacheService.getVehicleDetails(vehicleId);
```

### Search Results

```java
// In SearchService
List<Car> results = searchResultsCacheService.getSearchResults(
    query,
    filters,
    () -> carRepository.findByQuery(query, filters)
);
```

### Sessions

```java
// In SessionService
Optional<Session> session = sessionCacheService.getSession(
    sessionId,
    () -> sessionRepository.findById(sessionId)
);
```

## Cache Key Structure

### Vehicle Details
```
vdp:{vehicleId}:v{version}
Example: vdp:12345:v1
```

### Search Results
```
search:{queryHash}:v{version}
Example: search:-1234567890:v1
```

### Sessions
```
session:{sessionId}:v{version}
Example: session:abc123def456:v1
```

## Configuration

### Application Properties

```properties
# Cache-Aside Pattern Configuration
cache.aside.enabled=true
cache.aside.compression-threshold=1024
cache.aside.namespace.prefix=selfcar
cache.aside.vdp.ttl=900  # 15 minutes
cache.aside.search.ttl=300  # 5 minutes
cache.aside.session.ttl=1800  # 30 minutes

# Cache Metrics
cache.metrics.enabled=true
cache.metrics.vdp.target-hit-rate=80.0
```

## Monitoring

### Key Metrics

1. **Cache Hit Rate**
   - Per namespace
   - Overall
   - Target: ≥80% for VDP

2. **DB Read QPS Reduction**
   - Percentage of requests served from cache
   - Target: Material reduction in DB reads

3. **Cache Errors**
   - Track cache failures
   - Alert on high error rates

### Metrics Endpoints

```bash
# Overall cache statistics
GET /api/admin/cache/metrics/overall

# VDP-specific metrics
GET /api/admin/cache/metrics/vdp

# DB read reduction
GET /api/admin/cache/metrics/db-reduction
```

### Prometheus Metrics

- `cache_hits_total{namespace="vdp"}` - Total cache hits
- `cache_misses_total{namespace="vdp"}` - Total cache misses
- `cache_errors_total{namespace="vdp"}` - Total cache errors
- `db_reads_total` - Total database reads

## Performance Targets

### VDP Cache Hit Rate
- **Target**: ≥80%
- **Measurement**: `GET /api/admin/cache/metrics/vdp`
- **Formula**: `hits / (hits + misses) * 100`

### DB Read QPS Reduction
- **Target**: Material reduction (measured as percentage)
- **Measurement**: `GET /api/admin/cache/metrics/db-reduction`
- **Formula**: `cache_served / total_requests * 100`

## Cache Invalidation

### Automatic Invalidation
- On entity update/delete
- Via `CacheInvalidationService`
- Version bump for namespace-wide invalidation

### Manual Invalidation
```java
// Invalidate specific vehicle
vehicleDetailCacheService.invalidateVehicle(vehicleId);

// Invalidate all search results
searchResultsCacheService.invalidateSearchCache();

// Invalidate session
sessionCacheService.deleteSession(sessionId);
```

## Best Practices

1. **Use Appropriate TTLs**
   - Match TTL to data freshness requirements
   - VDP: 15 minutes (dynamic but cacheable)
   - Search: 5 minutes (changes frequently)
   - Sessions: 30 minutes (matches session timeout)

2. **Monitor Cache Hit Rates**
   - Track per namespace
   - Alert if hit rate drops below target
   - Adjust TTLs based on metrics

3. **Handle Cache Failures Gracefully**
   - Fall back to database on cache errors
   - Log cache errors for monitoring
   - Don't block requests on cache failures

4. **Use Namespace Keys**
   - Clear key structure
   - Easy invalidation
   - Namespace isolation

5. **Compress Large Values**
   - Reduces memory usage
   - Faster network transfer
   - Transparent to application code

## Troubleshooting

### Low Cache Hit Rate

**Symptoms**:
- Hit rate < 80% for VDP
- High DB read QPS

**Solutions**:
- Increase TTL if data freshness allows
- Check cache invalidation frequency
- Verify cache keys are consistent
- Monitor cache eviction

### High Cache Errors

**Symptoms**:
- `cache_errors_total` increasing
- Cache failures in logs

**Solutions**:
- Check Redis connection
- Verify Redis memory limits
- Check network connectivity
- Review Redis configuration

### Stale Data

**Symptoms**:
- Users see outdated data
- Cache hit rate is high but data is stale

**Solutions**:
- Reduce TTL
- Improve cache invalidation
- Check version bumps
- Verify invalidation logic

## References

- [Cache-Aside Pattern](https://docs.microsoft.com/en-us/azure/architecture/patterns/cache-aside)
- [Redis Best Practices](https://redis.io/docs/manual/patterns/)
- [Spring Cache Abstraction](https://docs.spring.io/spring-framework/docs/current/reference/html/integration.html#cache)

