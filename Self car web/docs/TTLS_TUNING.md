# TTL Tuning Guide (Hit/Refresh Ratio)

## Objective
Push more reads to outer layers (browser/CDN/app cache) without compromising freshness.

## Key Ratios
- **Hit Ratio (per layer)** = hits / (hits + misses)
- **Refresh Ratio** = origin_requests / total_requests
- **Staleness Incidents** = user reports / monitoring alerts (quality signal)

## Signals to Monitor
- CloudFront: `CacheHitRate`, origin requests, 5xx/4xx
- Redis: hits, misses, evictions, memory usage
- App: LCP, TTFB, error rates; cache metrics (Micrometer)

## PromQL (examples)
```promql
# App cache hit ratio (overall)
sum(rate(cache_hits_total[5m])) / (sum(rate(cache_hits_total[5m])) + sum(rate(cache_misses_total[5m])))

# VDP namespace hit ratio
sum(rate(cache_hits_total{namespace="vdp"}[5m])) /
(sum(rate(cache_hits_total{namespace="vdp"}[5m])) + sum(rate(cache_misses_total{namespace="vdp"}[5m])))

# DB read reduction
sum(rate(db_reads_total[5m])) / (sum(rate(db_reads_total[5m])) + sum(rate(cache_hits_total[5m])))
```

## Tuning Levers
1. **Increase TTL** for stable content until hit ratio improves and staleness is acceptable
2. **Versioned keys** for safe freshness on updates (bump version instead of global purge)
3. **CDN short TTL** for dynamic HTML/API (1–10 minutes) with event-driven purge/version bump
4. **Cache scope**: expand namespaces to cover more hot paths (SERP, dealer, compare)

## Process
1. **Baselines**: record current hit ratios and latencies
2. **Change**: adjust one TTL (e.g., `cache.ttl.dynamic` from 15 → 20 min)
3. **Observe**: 24–48 hours; watch hit ratio, DB reads, staleness signals
4. **Iterate**: keep adjustments that increase hit ratio without user-visible staleness

## Guardrails
- Keep **inventory/pricing TTL** short (5–10 min) unless event-driven versioning is robust
- Always ensure **version bump** on data changes
- Use **ETags** for validation where possible

## Targets
- VDP app cache hit ratio ≥ 80%
- CloudFront CacheHitRate ≥ 85% on static/VDP assets
- DB read reduction ≥ 60% vs baseline
