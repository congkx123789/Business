Cache busting strategy

What is cached
- Redis caches for `carById` and the list of `availableCars`.

When to bust
- Price changes (`updateCar`) → evict `carById`, `availableCars`.
- Availability toggle (`toggleAvailability`) → evict both caches.
- Delete (`deleteCar`) → evict both caches.

Implementation
- Spring Cache annotations on service methods with `@CacheEvict(allEntries = true)` for write paths.
- Keep TTL modest (e.g., 10 minutes) for resilience; critical paths rely on explicit evictions.

Future
- Add cache keys for dealer dashboards; consider request coalescing for popular listings.


