package com.selfcar.config;

import com.selfcar.service.outbox.OutboxService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.context.annotation.Profile;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@Profile("!h2")
@EnableScheduling
@RequiredArgsConstructor
public class OutboxPublisherConfig {

    private final OutboxService outboxService;

    // Publish small batches every 5 seconds
    @Scheduled(fixedDelay = 5000)
    public void publish() {
        outboxService.publishPendingBatch(50);
    }
}


