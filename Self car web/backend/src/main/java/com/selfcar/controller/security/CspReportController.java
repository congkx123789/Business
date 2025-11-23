package com.selfcar.controller.security;

import com.selfcar.dto.common.ApiResponse;
import com.selfcar.security.SecurityEventLogger;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * CSP Violation Report collector (Report-Only and Enforce modes)
 * Accepts standard CSP report payloads and logs to SECURITY_EVENT for monitoring.
 */
@Slf4j
@RestController
@RequestMapping("/api/security")
@RequiredArgsConstructor
public class CspReportController {

    private final SecurityEventLogger securityEventLogger;

    /**
     * Accept CSP reports as JSON (modern browsers). Some send under application/csp-report.
     */
    @PostMapping(value = "/csp-report", consumes = { MediaType.APPLICATION_JSON_VALUE, "application/csp-report" })
    public ResponseEntity<?> collect(@RequestBody Map<String, Object> body) {
        try {
            // Normalize payload shape: {"csp-report": {...}} or flat JSON
            Object report = body.getOrDefault("csp-report", body);
            Map<String, Object> event = new java.util.HashMap<>();
            event.put("event_type", "CSP_VIOLATION");
            event.put("report", report);
            event.put("source", "frontend");
            securityEventLogger.logSuspiciousActivity("CSP_VIOLATION", String.valueOf(report), null);
            return ResponseEntity.ok(new ApiResponse(true, "received"));
        } catch (Exception e) {
            log.error("Error handling CSP report", e);
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }
}


