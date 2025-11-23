package com.selfcar.inventory.reconciliation;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.stereotype.Component;

@Component
public class ReconciliationMetrics {
    private final MeterRegistry meterRegistry;

    public ReconciliationMetrics(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
    }

    public void recordSuccess(String source) {
        Counter.builder("inventory_reconciliation_total")
                .tag("result", "success")
                .tag("source", source)
                .register(meterRegistry)
                .increment();
    }

    public void recordFailure(String source) {
        Counter.builder("inventory_reconciliation_total")
                .tag("result", "failure")
                .tag("source", source)
                .register(meterRegistry)
                .increment();
    }
}


