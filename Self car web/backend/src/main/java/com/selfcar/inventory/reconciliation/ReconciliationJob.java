package com.selfcar.inventory.reconciliation;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class ReconciliationJob {
    private final ReconciliationService service;
    private final String sourceName;

    public ReconciliationJob(ReconciliationService service,
                             @Value("${reconciliation.source:dealer}") String sourceName) {
        this.service = service;
        this.sourceName = sourceName;
    }

    // Default: every 5 minutes; configurable via properties
    @Scheduled(cron = "${reconciliation.cron:0 */5 * * * *}")
    public void run() {
        service.runOnce(sourceName);
    }
}


