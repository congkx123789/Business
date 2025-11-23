# Spring Boot IDOR Enforcement

How to use
- Ensure controller path variables use `java.util.UUID` for IDs. Spring will 400 on invalid UUIDs.
- Implement `OwnershipService` to check ownership from your database.
- Annotate controller methods with `@OwnerOnly(resource = "order", idParam = "orderId")`.

Example
```java
// in your controller
@OwnerOnly(resource = "order", idParam = "orderId")
@GetMapping("/api/orders/{orderId}")
public OrderDto getOrder(@PathVariable UUID orderId) { ... }
```

Wire OwnershipService (example skeleton)
```java
@Component
class OrderOwnershipService implements OwnershipService {
    private final OrderRepository repo;
    OrderOwnershipService(OrderRepository repo) { this.repo = repo; }
    public boolean isOwner(String resource, UUID resourceId, String subjectId) throws ResourceNotFoundException {
        var order = repo.findById(resourceId)
            .orElseThrow(() -> new ResourceNotFoundException("order not found"));
        return order.getUserId().toString().equals(subjectId);
    }
}
```

