package com.selfcar.inventory.reconciliation;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/reconciliation")
public class ReconciliationController {
    private final ReconciliationService service;
    private final ReconciliationJob job;

    public ReconciliationController(ReconciliationService service, ReconciliationJob job) {
        this.service = service;
        this.job = job;
    }

    @PostMapping("/run")
    public ResponseEntity<String> runOnce() {
        service.runOnce("manual");
        return ResponseEntity.ok("reconciliation started");
    }
}


