package com.selfcar.controller.security;

import com.selfcar.dto.common.ApiResponse;
import com.selfcar.security.SecurityEventLogger;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Security Report Controller
 *
 * Receives security event reports from frontend (e.g., script integrity violations).
 */
@Slf4j
@RestController
@RequestMapping("/api/security")
@RequiredArgsConstructor
public class SecurityReportController {

    private final SecurityEventLogger securityEventLogger;

    @PostMapping("/report-script")
    public ResponseEntity<ApiResponse> reportSuspiciousScript(
            @Valid @RequestBody ScriptReportRequest request,
            HttpServletRequest httpRequest) {

        String ipAddress = httpRequest.getRemoteAddr();
        String details = String.format(
                "Script: %s, Page: %s, UserAgent: %s",
                request.getScriptSrc(),
                request.getPageUrl(),
                request.getUserAgent()
        );

        securityEventLogger.logSuspiciousActivity(
                "SUSPICIOUS_SCRIPT_DETECTED",
                details,
                ipAddress
        );

        log.warn("Suspicious script detected: script={}, page={}, ip={}",
                request.getScriptSrc(), request.getPageUrl(), ipAddress);

        return ResponseEntity.ok(new ApiResponse(true, "Report received"));
    }

    @Data
    static class ScriptReportRequest {
        private String scriptSrc;
        private String pageUrl;
        private String timestamp;
        private String userAgent;
    }

    /**
     * CSP violation report endpoint (report-uri)
     * Accepts standard CSP report body
     */
    @PostMapping("/csp-report")
    public ResponseEntity<ApiResponse> cspReport(@RequestBody(required = false) Map<String, Object> report,
                                                 HttpServletRequest httpRequest) {
        String ipAddress = httpRequest.getRemoteAddr();
        try {
            String ua = httpRequest.getHeader("User-Agent");
            securityEventLogger.logSuspiciousActivity(
                    "CSP_VIOLATION",
                    String.valueOf(report),
                    ipAddress
            );
            log.warn("CSP violation reported from {} UA={}: {}", ipAddress, ua, report);
        } catch (Exception e) {
            log.error("Error handling CSP report", e);
        }
        return ResponseEntity.ok(new ApiResponse(true, "CSP report received"));
    }
}

