# Edge Protection & Geo-Personalization Runbook

## Goals
- **Origin protection** before big campaigns (resilience): Origin Shield + request collapsing
- **Edge compute pilots**: A/B routing and lightweight personalization at the edge
- **Near-me search at the edge**: Cache regional inventories; filter by distance per request

---

## CloudFront Origin Protection

### Origin Shield (Request Collapsing)
- Enabled in Terraform using `origin_shield { enabled = true; origin_shield_region = var.origin_shield_region }`
- Benefits:
  - Collapses simultaneous cache-miss requests at the shield layer
  - Reduces origin load during spikes
  - Improves cache efficiency

### Minimal Variance Policies
- Custom cache policy for images with whitelisted query params
- Minimal origin request policy (no cookies, minimal headers)
- Short-TTL policy for dynamic API/HTML

Terraform resources:
- `aws_cloudfront_cache_policy.images_cache_policy`
- `aws_cloudfront_origin_request_policy.minimal_origin_policy`
- `aws_cloudfront_cache_policy.short_ttl_api_policy`

---

## Edge Compute Pilots

### CloudFront Function: A/B Routing & Geo Headers
**File**: `infrastructure/cloudfront-function-ab.js`
- Assigns users to A/B groups without storing state (IP hash fallback)
- Adds `x-ab-group` header for downstream logic
- Passes `CloudFront-Viewer-Country` to `x-viewer-country`
- Example: route B group to `/index-b.html`

Attach as Viewer Request association on desired behaviors.

### Personalization Notes
- Keep compute small (no network calls in Functions)
- Use headers to signal variants to origin/app
- Cache keys should ignore A/B headers to avoid cache fragmentation; use per-URL variants if needed

---

## Near-Me Search (Edge Reference Design)

### Strategy
1. **Precompute regional inventories** (e.g., NA/EU/APAC or finer buckets by geohash prefix)
2. **Cache at the edge** as static JSON: `edge/inventory/{region}/{geohashPrefix}.json`
3. **Edge rewrite**: Viewer Request rewrites `/search/nearby?...` to regional inventory object
4. **Filter by distance** at client or origin (optionally at edge if using Lambda@Edge with small payloads)

### Lambda@Edge Sample
**File**: `infrastructure/edge/lambda-near-me.js`
- Maps request to region using `CloudFront-Viewer-Country` or `region` query
- Supports optional `geohash` prefix bucketing
- Rewrites to `edge/inventory/{region}/{bucket}.json`
- Preserves `lat`, `lon`, `radius` as query for downstream filtering

### Precomputation Pipeline (suggested)
- Batch job to build inventories per region/geohash prefix
- Store to S3 at `edge/inventory/{region}/{bucket}.json`
- Invalidate or version on updates

### Caching
- Apply `images_cache_policy` or a similar long-TTL policy to inventories (minutes-to-hours)
- Use versioned paths or ETags for updates

---

## Failure Modes & Safety Nets
- **Event bus down**: Key versioning + short TTL ensures stale objects age out
- **App bugs**: CDN short-TTL + manual invalidation
- **CDN purge missed**: Version bump moves traffic to new keys immediately

---

## Deployment Steps
1. Apply Terraform changes to enable Origin Shield and policies
2. Upload `cloudfront-function-ab.js` and attach to Viewer Request
3. Deploy `lambda-near-me.js` (us-east-1) and associate with `/search/nearby*` behavior
4. Start precomputing and publishing `edge/inventory/{region}/{bucket}.json`
5. Monitor cache hit rates and origin load

---

## KPIs & Monitoring
- **Origin offload**: origin requests/minute during traffic spikes
- **Edge cache hit ratio**: per distribution and path
- **TTFB**: dynamic pages (API + HTML)
- **A/B traffic split**: verify even distribution

CloudFront: CloudWatch metrics
- CacheHitRate, OriginShieldBytesDownloaded, 4xx/5xxErrorRate

App/Prometheus:
- `performance_http_server_requests_seconds_bucket` (TTFB)
- `cache_hits_total`, `cache_misses_total`

---

## Tips
- Avoid cache fragmentation: keep cache keys small; don’t vary on user-specific headers
- Prefer pre-bucketing (regions/geohash) over per-user computation at the edge
- Tune TTLs per volatility; invalidate or version on content changes
