package com.selfcar.service.search;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;

@Slf4j
@Service("searchIndexerServiceInternal")
@RequiredArgsConstructor
public class SearchIndexerService {

    public void indexOrDeleteFromPayload(String eventType, Map<String, Object> payload) {
        Long listingId = toLong(payload.get("listingId"));
        String status = (String) payload.getOrDefault("status", "AVAILABLE");
        boolean remove = "SOLD".equalsIgnoreCase(status) || "EXPIRED_HOLD".equalsIgnoreCase(status);

        if (remove) {
            log.info("SEARCH_INDEX_DELETE listingId={}", listingId);
            return;
        }

        log.info("SEARCH_INDEX_UPSERT listingId={} payloadKeys={}", listingId, payload.keySet());
    }

    private Long toLong(Object o) { return o == null ? null : ((Number) o).longValue(); }
}


