package com.selfcar.config;

import com.selfcar.model.common.OutboxEvent;
import com.selfcar.service.common.OutboxService;
import com.selfcar.service.integration.SearchIndexerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@Profile("!h2")
@RequiredArgsConstructor
public class ScheduledOutboxPublisher {

    private final OutboxService outboxService;
    private final SearchIndexerService searchIndexerService;

    @Scheduled(fixedDelayString = "${cqrs.outbox.publish-interval-ms:2000}")
    public void publishPending() {
        List<OutboxEvent> batch = outboxService.getPendingBatch(500);
        for (OutboxEvent e : batch) {
            try {
                searchIndexerService.publish(e);
                outboxService.markPublished(e);
            } catch (Exception ex) {
                log.error("Failed to publish outbox event {}", e.getId(), ex);
                outboxService.markFailed(e);
            }
        }
    }
}


