package com.selfcar.inventory.reconciliation;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service("inventoryReconciliationService")
public class ReconciliationService {
    private static final Logger log = LoggerFactory.getLogger(ReconciliationService.class);

    private final VinProvider vinProvider;
    private final SourceOfTruthClient sourceOfTruthClient;
    private final ReconciliationMetrics metrics;

    public ReconciliationService(VinProvider vinProvider, SourceOfTruthClient sourceOfTruthClient, ReconciliationMetrics metrics) {
        this.vinProvider = vinProvider;
        this.sourceOfTruthClient = sourceOfTruthClient;
        this.metrics = metrics;
    }

    public void runOnce(String source) {
        List<String> vins = vinProvider.listActiveVins();
        if (vins.isEmpty()) {
            log.debug("recon.no_vins");
            return;
        }
        Map<String, Boolean> current = new HashMap<>();
        for (String vin : vins) {
            // true => present/consistent in serving index; replace with real check
            current.put(vin, Boolean.TRUE);
        }
        Map<String, Boolean> parity = sourceOfTruthClient.fetchVinParity(current);
        for (Map.Entry<String, Boolean> e : parity.entrySet()) {
            if (Boolean.TRUE.equals(e.getValue())) {
                metrics.recordSuccess(source);
            } else {
                metrics.recordFailure(source);
                log.warn("recon.mismatch vin={} source={}", e.getKey(), source);
            }
        }
    }
}


