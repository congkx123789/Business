# Performance SLOs (Service Level Objectives)

## Overview
This document defines the performance targets and Service Level Objectives (SLOs) for the SelfCar web application.

## Web Vitals Targets

### Core Web Vitals

#### Largest Contentful Paint (LCP)
- **Target**: < 2.5 seconds
- **Acceptable**: 2.5 - 4.0 seconds
- **Poor**: > 4.0 seconds
- **Measurement**: Time to render the largest content element visible in the viewport
- **Priority**: High - Critical for user experience

#### First Input Delay (FID)
- **Target**: < 100 milliseconds
- **Acceptable**: 100 - 300 milliseconds
- **Poor**: > 300 milliseconds
- **Measurement**: Time from first user interaction to browser response
- **Priority**: High - Critical for interactivity

#### Cumulative Layout Shift (CLS)
- **Target**: < 0.1
- **Acceptable**: 0.1 - 0.25
- **Poor**: > 0.25
- **Measurement**: Sum of layout shift scores for unexpected layout shifts
- **Priority**: High - Critical for visual stability

### Additional Metrics

#### Time to Interactive (TTI)
- **Target**: < 3.5 seconds
- **Acceptable**: 3.5 - 7.3 seconds
- **Poor**: > 7.3 seconds
- **Measurement**: Time until page is fully interactive
- **Priority**: Medium - Important for user engagement

#### First Contentful Paint (FCP)
- **Target**: < 1.8 seconds
- **Acceptable**: 1.8 - 3.0 seconds
- **Poor**: > 3.0 seconds
- **Measurement**: Time to first rendered content
- **Priority**: Medium

#### Total Blocking Time (TBT)
- **Target**: < 200 milliseconds
- **Acceptable**: 200 - 600 milliseconds
- **Poor**: > 600 milliseconds
- **Measurement**: Total time page is blocked from responding to user input
- **Priority**: Medium

## Page-Specific Targets

### Cars Listing Page (`/cars`)
- **LCP**: < 2.0 seconds
- **TTI**: < 3.0 seconds
- **Query Latency**: < 500ms
- **Image Load Time**: < 1.5 seconds per image (lazy loaded)

### Car Detail Page (`/cars/:id`)
- **LCP**: < 2.5 seconds
- **TTI**: < 3.5 seconds
- **Query Latency**: < 400ms
- **Image Load Time**: < 2.0 seconds

### Home Page (`/`)
- **LCP**: < 1.8 seconds
- **TTI**: < 2.5 seconds
- **Query Latency**: < 300ms

### Dashboard (`/admin/dashboard`)
- **LCP**: < 2.5 seconds
- **TTI**: < 4.0 seconds
- **Query Latency**: < 600ms (multiple queries)

## API Query Latency Targets

### Query Response Times

#### Cars Queries
- **GET /api/cars**: < 500ms (p95)
- **GET /api/cars/:id**: < 400ms (p95)
- **GET /api/cars/available**: < 600ms (p95)

#### Booking Queries
- **GET /api/bookings/user**: < 400ms (p95)
- **POST /api/bookings**: < 800ms (p95)
- **PATCH /api/bookings/:id/status**: < 500ms (p95)

#### User Queries
- **GET /api/auth/me**: < 300ms (p95)
- **PUT /api/users/profile**: < 600ms (p95)

#### Dashboard Queries
- **GET /api/dashboard/stats**: < 600ms (p95)
- **GET /api/dashboard/revenue**: < 800ms (p95)

### Error Rates
- **Target**: < 1% error rate (4xx/5xx)
- **Acceptable**: 1% - 5% error rate
- **Poor**: > 5% error rate

## Performance Budgets

### Bundle Sizes
- **Initial Bundle (JS)**: < 200KB (gzipped)
- **Total Bundle (JS)**: < 500KB (gzipped)
- **CSS**: < 50KB (gzipped)
- **Images**: < 500KB per page (optimized)

### Network Requests
- **Initial Load**: < 20 requests
- **Total Requests**: < 50 requests per page
- **API Calls**: < 10 calls per page load

## Caching Strategy

### React Query Cache Times
- **Cars List**: 10 minutes (stale), 30 minutes (garbage collection)
- **Car Details**: 5 minutes (stale), 15 minutes (garbage collection)
- **Bookings**: 2 minutes (stale), 10 minutes (garbage collection)
- **User Profile**: 5 minutes (stale), 15 minutes (garbage collection)
- **Dashboard Stats**: 1 minute (stale), 5 minutes (garbage collection)

### Browser Cache
- **Static Assets**: 1 year (with versioning)
- **API Responses**: Controlled by React Query

## Performance Monitoring

### Tools
- **Lighthouse CI**: Automated performance testing
- **Web Vitals**: Real User Monitoring (RUM)
- **React Query DevTools**: Query performance monitoring
- **Browser DevTools**: Manual performance analysis

### Metrics Collection
- Performance metrics are logged to console in development
- In production, metrics should be sent to analytics service
- Monitor p50, p75, p95, and p99 percentiles

## Optimization Strategies

### Code Splitting
- ✅ Routes are code-split (lazy loaded)
- ✅ Heavy components are lazy loaded
- ✅ Vendor chunks are separated

### Image Optimization
- ✅ Images are lazy loaded
- ✅ Intersection Observer for viewport detection
- ✅ Placeholder/skeleton states during loading

### React Optimizations
- ✅ Memoization for expensive list renders
- ✅ Optimized React Query cache times
- ✅ Minimal re-renders with proper dependencies

### Bundle Optimization
- ✅ Tree shaking enabled
- ✅ Minification in production
- ✅ Gzip/Brotli compression

## Monitoring & Alerts

### Alerts
- **Critical**: LCP > 4s, FID > 300ms, CLS > 0.25
- **Warning**: LCP > 2.5s, FID > 100ms, CLS > 0.1
- **Info**: Query latency > 1s (p95)

### Review Cadence
- **Weekly**: Review performance metrics
- **Monthly**: Performance budget review
- **Quarterly**: SLO target review and adjustment

## Testing

### Lighthouse CI
- Run on every PR
- Target: 90+ Performance score
- Monitor: Core Web Vitals thresholds

### Performance Testing
- Test on multiple devices (mobile, tablet, desktop)
- Test on various network conditions (3G, 4G, WiFi)
- Test with throttled CPU

## Performance Targets Summary

| Metric | Target | Acceptable | Poor |
|--------|--------|------------|------|
| LCP | < 2.5s | 2.5-4.0s | > 4.0s |
| FID | < 100ms | 100-300ms | > 300ms |
| CLS | < 0.1 | 0.1-0.25 | > 0.25 |
| TTI | < 3.5s | 3.5-7.3s | > 7.3s |
| API Query (p95) | < 500ms | 500-1000ms | > 1000ms |
| Error Rate | < 1% | 1-5% | > 5% |

---

**Last Updated**: 2024
**Next Review**: Quarterly

