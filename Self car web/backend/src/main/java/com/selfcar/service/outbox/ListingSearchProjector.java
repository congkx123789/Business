package com.selfcar.service.outbox;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ListingSearchProjector {

    private final JdbcTemplate jdbcTemplate;

    public void upsertFromEvent(String eventType, Map<String, Object> payload) {
        if (!"LISTING_STATUS_CHANGED".equals(eventType) && !"LISTING_CREATED".equals(eventType) && !"LISTING_UPDATED".equals(eventType)) {
            return;
        }
        Long listingId = toLong(payload.get("listingId"));
        Long vehicleId = toLong(payload.get("vehicleId"));
        String status = (String) payload.getOrDefault("status", "AVAILABLE");
        Number priceNum = (Number) payload.getOrDefault("price", 0);
        String currency = (String) payload.getOrDefault("currency", "USD");
        String make = (String) payload.getOrDefault("make", null);
        String model = (String) payload.getOrDefault("model", null);
        Integer year = payload.get("year") != null ? ((Number) payload.get("year")).intValue() : null;
        Long dealerId = toLong(payload.get("dealerId"));

        jdbcTemplate.update(
            "INSERT INTO listing_search (listing_id, vehicle_id, status, price, currency, make, model, year, dealer_id) " +
                "VALUES (?,?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE status=VALUES(status), price=VALUES(price), currency=VALUES(currency), " +
                "make=VALUES(make), model=VALUES(model), year=VALUES(year), dealer_id=VALUES(dealer_id)",
            listingId, vehicleId, status, priceNum, currency, make, model, year, dealerId
        );
    }

    private Long toLong(Object o) { return o == null ? null : ((Number) o).longValue(); }
}


