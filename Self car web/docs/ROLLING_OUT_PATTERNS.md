# Rolling Out Image/CDN + Redis Patterns

## Scope
Extend proven patterns to:
- **SERP** (search listings)
- **Dealer pages**
- **Compare pages**
- **VDP** (already done)

## Image Delivery
- Use `imageCDN.js` helpers for all image components
- Provide `srcset` and `sizes` for responsive behavior
- Enable format auto-detection (AVIF/WebP) and adaptive quality

## API Caching
- Apply `CacheControlConfig` rules per path (already extended)
- Ensure query variance minimized (avoid user-specific headers)
- Use short-TTL + event-driven version bump for dynamic content

## Application Cache (Redis)
- Introduce namespaces per page type:
  - `serp:{key}:v{n}` — search results (5m TTL)
  - `dealer:{id}:v{n}` — dealer profile (30m TTL)
  - `compare:{ids}:v{n}` — compare results (15m TTL)
- Use `CacheAsideService.getOrLoad(namespace, key, loader, ttl)`
- Bump versions on updates via events (similar to `CarChangedEvent`)

## CDN Caching
- Map behaviors with short TTLs for dynamic pages (`/api/*`, `/search/*`)
- Use minimal origin request policy to maximize collapsing
- Prefer versioned paths for precomputed aggregates (e.g., inventories)

## Validation Checklist
- [ ] Images render via CDN with transforms
- [ ] App cache hit ratio ≥ targets per page type
- [ ] CDN cache hit ratio meets targets
- [ ] Origin QPS within headroom under load tests
- [ ] Purge/version bump behaves instantly with no stale leaks

## Rollout Plan
1. **Pilot** on SERP endpoints with 5m TTL
2. **Measure** hit ratio and latencies for 1 week
3. **Extend** to dealer and compare pages
4. **Automate** version bumps via events for all entities
5. **Handoff** dashboards and alerts to on-call rotation
