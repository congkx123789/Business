package com.selfcar.security;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Virtual Patching Service
 * 
 * Implements two-stage patching model:
 * 1. Virtual patch via WAF rules (immediate mitigation)
 * 2. Real patch after staging verification (within 1-2 weeks)
 * 
 * SLO:
 * - High-severity CVEs: mitigated in <24h (WAF), fully patched in ≤14d
 * - Medium-severity CVEs: mitigated in <48h (WAF), fully patched in ≤30d
 * 
 * Owner: SecOps + Platform
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class VirtualPatchingService {

    private final SecurityEventLogger securityEventLogger;

    @Value("${security.patching.virtual-patch.enabled:true}")
    private boolean virtualPatchingEnabled;

    @Value("${security.patching.slo.high-severity-mitigation-hours:24}")
    private int highSeverityMitigationHours;

    @Value("${security.patching.slo.high-severity-patch-days:14}")
    private int highSeverityPatchDays;

    @Value("${security.patching.slo.medium-severity-mitigation-hours:48}")
    private int mediumSeverityMitigationHours;

    @Value("${security.patching.slo.medium-severity-patch-days:30}")
    private int mediumSeverityPatchDays;

    // Track CVE mitigations and patches
    private final Map<String, CveMitigation> cveMitigations = new ConcurrentHashMap<>();

    /**
     * Register a new CVE that requires mitigation
     * 
     * @param cveId CVE identifier (e.g., CVE-2024-1234)
     * @param severity Severity level (HIGH, MEDIUM, LOW)
     * @param description CVE description
     * @param affectedComponents List of affected components
     * @return CVE mitigation record
     */
    public CveMitigation registerCve(String cveId, String severity, 
                                      String description, List<String> affectedComponents) {
        CveMitigation mitigation = CveMitigation.builder()
            .cveId(cveId)
            .severity(severity.toUpperCase())
            .description(description)
            .affectedComponents(affectedComponents)
            .registeredAt(LocalDateTime.now())
            .status(CveStatus.PENDING_MITIGATION)
            .build();

        cveMitigations.put(cveId, mitigation);
        
        log.warn("CVE registered requiring mitigation: {} (severity: {})", cveId, severity);
        securityEventLogger.logCveRegistration(cveId, severity, description);

        // Auto-trigger virtual patch for high severity
        if ("HIGH".equals(severity)) {
            scheduleVirtualPatch(cveId);
        }

        return mitigation;
    }

    /**
     * Apply virtual patch (WAF rule) for a CVE
     * 
     * @param cveId CVE identifier
     * @param wafRule WAF rule description
     * @return true if patch applied successfully
     */
    public boolean applyVirtualPatch(String cveId, String wafRule) {
        CveMitigation mitigation = cveMitigations.get(cveId);
        if (mitigation == null) {
            log.error("CVE not found: {}", cveId);
            return false;
        }

        mitigation.setVirtualPatchApplied(true);
        mitigation.setVirtualPatchRule(wafRule);
        mitigation.setVirtualPatchAppliedAt(LocalDateTime.now());
        mitigation.setStatus(CveStatus.VIRTUAL_PATCH_APPLIED);

        log.info("Virtual patch applied for CVE: {} (rule: {})", cveId, wafRule);
        securityEventLogger.logVirtualPatchApplied(cveId, wafRule);

        // Check SLO compliance
        checkSloCompliance(mitigation);

        return true;
    }

    /**
     * Mark real patch as applied
     * 
     * @param cveId CVE identifier
     * @param patchVersion Version of the patch applied
     * @return true if marked successfully
     */
    public boolean markRealPatchApplied(String cveId, String patchVersion) {
        CveMitigation mitigation = cveMitigations.get(cveId);
        if (mitigation == null) {
            log.error("CVE not found: {}", cveId);
            return false;
        }

        mitigation.setRealPatchApplied(true);
        mitigation.setRealPatchVersion(patchVersion);
        mitigation.setRealPatchAppliedAt(LocalDateTime.now());
        mitigation.setStatus(CveStatus.FULLY_PATCHED);

        log.info("Real patch applied for CVE: {} (version: {})", cveId, patchVersion);
        securityEventLogger.logRealPatchApplied(cveId, patchVersion);

        // Check SLO compliance
        checkSloCompliance(mitigation);

        return true;
    }

    /**
     * Schedule virtual patch for a CVE
     * 
     * @param cveId CVE identifier
     */
    private void scheduleVirtualPatch(String cveId) {
        CveMitigation mitigation = cveMitigations.get(cveId);
        if (mitigation == null) {
            return;
        }

        // Generate WAF rule based on CVE
        String wafRule = generateWafRule(mitigation);
        
        // In production, this would integrate with WAF API
        // For now, we log it
        log.info("Scheduling virtual patch for CVE: {} (WAF rule: {})", cveId, wafRule);
        
        // Apply virtual patch
        applyVirtualPatch(cveId, wafRule);
    }

    /**
     * Generate WAF rule for CVE mitigation
     * 
     * @param mitigation CVE mitigation record
     * @return WAF rule description
     */
    private String generateWafRule(CveMitigation mitigation) {
        // This is a simplified example - real WAF rules would be more specific
        return String.format("BLOCK_%s_%s", mitigation.getCveId(), 
            String.join("_", mitigation.getAffectedComponents()));
    }

    /**
     * Check SLO compliance for a mitigation
     * 
     * @param mitigation CVE mitigation record
     */
    private void checkSloCompliance(CveMitigation mitigation) {
        int expectedMitigationHours = "HIGH".equals(mitigation.getSeverity()) 
            ? highSeverityMitigationHours 
            : mediumSeverityMitigationHours;
        
        int expectedPatchDays = "HIGH".equals(mitigation.getSeverity()) 
            ? highSeverityPatchDays 
            : mediumSeverityPatchDays;

        // Check virtual patch SLO
        if (mitigation.getVirtualPatchAppliedAt() != null) {
            long hoursToMitigation = java.time.Duration.between(
                mitigation.getRegisteredAt(), 
                mitigation.getVirtualPatchAppliedAt()
            ).toHours();
            
            if (hoursToMitigation > expectedMitigationHours) {
                log.error("SLO VIOLATION: CVE {} virtual patch took {} hours, expected <{} hours",
                    mitigation.getCveId(), hoursToMitigation, expectedMitigationHours);
                securityEventLogger.logSloViolation(mitigation.getCveId(), 
                    "VIRTUAL_PATCH", hoursToMitigation, expectedMitigationHours);
            }
        }

        // Check real patch SLO
        if (mitigation.getRealPatchAppliedAt() != null) {
            long daysToPatch = java.time.Duration.between(
                mitigation.getRegisteredAt(), 
                mitigation.getRealPatchAppliedAt()
            ).toDays();
            
            if (daysToPatch > expectedPatchDays) {
                log.error("SLO VIOLATION: CVE {} real patch took {} days, expected <{} days",
                    mitigation.getCveId(), daysToPatch, expectedPatchDays);
                securityEventLogger.logSloViolation(mitigation.getCveId(), 
                    "REAL_PATCH", daysToPatch, expectedPatchDays);
            }
        }
    }

    /**
     * Get all pending mitigations
     * 
     * @return List of pending CVE mitigations
     */
    public List<CveMitigation> getPendingMitigations() {
        return cveMitigations.values().stream()
            .filter(m -> m.getStatus() == CveStatus.PENDING_MITIGATION)
            .sorted(Comparator.comparing(CveMitigation::getRegisteredAt))
            .toList();
    }

    /**
     * Get all CVE mitigations
     * 
     * @return List of all CVE mitigations
     */
    public List<CveMitigation> getAllMitigations() {
        return new ArrayList<>(cveMitigations.values());
    }

    /**
     * CVE Mitigation record
     */
    @lombok.Builder
    @lombok.Data
    public static class CveMitigation {
        private String cveId;
        private String severity;
        private String description;
        private List<String> affectedComponents;
        private LocalDateTime registeredAt;
        private CveStatus status;
        
        private boolean virtualPatchApplied;
        private String virtualPatchRule;
        private LocalDateTime virtualPatchAppliedAt;
        
        private boolean realPatchApplied;
        private String realPatchVersion;
        private LocalDateTime realPatchAppliedAt;
    }

    /**
     * CVE Status enum
     */
    public enum CveStatus {
        PENDING_MITIGATION,
        VIRTUAL_PATCH_APPLIED,
        FULLY_PATCHED
    }
}

