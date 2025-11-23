package com.selfcar.service.outbox;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.selfcar.model.outbox.OutboxEvent;
import com.selfcar.repository.outbox.OutboxEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;

@Slf4j
@Service("eventOutboxService")
@RequiredArgsConstructor
public class OutboxService {

    private final OutboxEventRepository outboxEventRepository;
    private final ListingSearchProjector listingSearchProjector;
    private final com.selfcar.service.search.SearchIndexerService searchIndexerService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public void recordEvent(String aggregate, Long aggregateId, String eventType, Map<String, Object> payload, Map<String, Object> headers) {
        try {
            OutboxEvent event = OutboxEvent.builder()
                    .aggregateType(aggregate)
                    .aggregateId(aggregateId)
                    .eventType(eventType)
                    .payload(objectMapper.writeValueAsString(payload != null ? payload : Map.of()))
                    .headers(headers != null ? objectMapper.writeValueAsString(headers) : null)
                    .status(OutboxEvent.Status.PENDING)
                    .createdAt(LocalDateTime.now())
                    .build();
            outboxEventRepository.save(event);
        } catch (Exception e) {
            throw new RuntimeException("Failed to persist outbox event", e);
        }
    }

    // Simple publisher; in prod a Kafka publisher or Debezium is recommended
    @Transactional
    public int publishPendingBatch(int pageSize) {
        var page = outboxEventRepository.findByStatusOrderByCreatedAtAsc(OutboxEvent.Status.PENDING, PageRequest.of(0, pageSize));
        int published = 0;
        for (OutboxEvent event : page.getContent()) {
            try {
                // Simulate publishing (replace with Kafka/HTTP/etc.)
                log.info("OUTBOX_PUBLISH: type={} agg={} id={}", event.getEventType(), event.getAggregateType(), event.getAggregateId());
                // Project to read model
                try {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> payload = objectMapper.readValue(event.getPayload(), Map.class);
                    listingSearchProjector.upsertFromEvent(event.getEventType(), payload);
                    // Also update external search index (if configured)
                    searchIndexerService.indexOrDeleteFromPayload(event.getEventType(), payload);
                } catch (Exception ex) {
                    log.warn("Projection failed for event {}: {}", event.getId(), ex.getMessage());
                }
                event.setStatus(OutboxEvent.Status.PUBLISHED);
                event.setProcessedAt(LocalDateTime.now());
                outboxEventRepository.save(event);
                published++;
            } catch (Exception e) {
                log.error("Failed to publish outbox event {}", event.getId(), e);
                event.setStatus(OutboxEvent.Status.FAILED);
                outboxEventRepository.save(event);
            }
        }
        return published;
    }
}


