package com.selfcar.service.common;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.selfcar.model.common.OutboxEvent;
import com.selfcar.repository.common.CommonOutboxEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Slf4j
@Service("commonOutboxService")
public class OutboxService {
    private final ObjectMapper objectMapper = new ObjectMapper();
    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private CommonOutboxEventRepository repository;

    @Transactional
    public OutboxEvent enqueue(String aggregateType, Long aggregateId, String eventType, Map<String, Object> payload, Long version) {
        try {
            String json = objectMapper.writeValueAsString(payload);
            OutboxEvent event = OutboxEvent.builder()
                    .aggregateType(aggregateType)
                    .aggregateId(aggregateId)
                    .eventType(eventType)
                    .payloadJson(json)
                    .version(version)
                    .build();
            if (repository == null) {
                return event; // no-op in h2 profile
            }
            return repository.save(event);
        } catch (Exception e) {
            log.error("Failed to serialize outbox payload", e);
            throw new RuntimeException("Outbox enqueue failed", e);
        }
    }

    public List<OutboxEvent> getPendingBatch(int limit) {
        if (repository == null) {
            return java.util.List.of();
        }
        return repository.findPendingBatch(limit);
    }

    @Transactional
    public void markPublished(OutboxEvent event) {
        event.setStatus("PUBLISHED");
        event.setPublishedAt(LocalDateTime.now());
        if (repository != null) {
            repository.save(event);
        }
    }

    @Transactional
    public void markFailed(OutboxEvent event) {
        event.setStatus("FAILED");
        if (repository != null) {
            repository.save(event);
        }
    }
}


