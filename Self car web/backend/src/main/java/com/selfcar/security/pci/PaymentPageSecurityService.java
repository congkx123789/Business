package com.selfcar.security.pci;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Pattern;

/**
 * Payment Page Security Service
 * 
 * Implements PCI DSS requirements 6.4.3 and 11.6.1:
 * - Content Security Policy (CSP) allowlists
 * - Script inventory
 * - Change/tamper detection for payment pages
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentPageSecurityService {

    private final PciControlMappingService pciControlMappingService;

    @Value("${pci.payment-page.csp.strict-mode:true}")
    private boolean strictCspMode;

    @Value("${pci.payment-page.tamper-detection.enabled:true}")
    private boolean tamperDetectionEnabled;

    // Script inventory for payment pages
    private final Map<String, ScriptInventory> scriptInventory = new ConcurrentHashMap<>();

    // File integrity monitoring (hash-based)
    private final Map<String, FileIntegrityRecord> fileIntegrityRecords = new ConcurrentHashMap<>();

    /**
     * Generate CSP header for payment pages
     * 
     * @param allowedScripts List of allowed script sources
     * @param allowedStyles List of allowed style sources
     * @param allowedImages List of allowed image sources
     * @param allowedFonts List of allowed font sources
     * @return CSP header value
     */
    public String generateCspHeader(
            List<String> allowedScripts,
            List<String> allowedStyles,
            List<String> allowedImages,
            List<String> allowedFonts) {
        
        StringBuilder csp = new StringBuilder();
        
        // Default source (deny all)
        csp.append("default-src 'none'; ");
        
        // Script sources (strict - only allowlisted)
        if (allowedScripts != null && !allowedScripts.isEmpty()) {
            csp.append("script-src ");
            csp.append(String.join(" ", allowedScripts));
            csp.append("; ");
        } else {
            csp.append("script-src 'none'; ");
        }
        
        // Style sources
        if (allowedStyles != null && !allowedStyles.isEmpty()) {
            csp.append("style-src ");
            csp.append(String.join(" ", allowedStyles));
            csp.append("; ");
        } else {
            csp.append("style-src 'self'; ");
        }
        
        // Image sources
        if (allowedImages != null && !allowedImages.isEmpty()) {
            csp.append("img-src ");
            csp.append(String.join(" ", allowedImages));
            csp.append("; ");
        } else {
            csp.append("img-src 'self' data:; ");
        }
        
        // Font sources
        if (allowedFonts != null && !allowedFonts.isEmpty()) {
            csp.append("font-src ");
            csp.append(String.join(" ", allowedFonts));
            csp.append("; ");
        } else {
            csp.append("font-src 'self'; ");
        }
        
        // Form action (only allow payment gateway URLs)
        csp.append("form-action ");
        csp.append(getAllowedPaymentGateways());
        csp.append("; ");
        
        // Frame ancestors (none for payment pages)
        csp.append("frame-ancestors 'none'; ");
        
        // Base URI
        csp.append("base-uri 'self'; ");
        
        // Object source (none)
        csp.append("object-src 'none'; ");
        
        // Upgrade insecure requests
        csp.append("upgrade-insecure-requests; ");
        
        // Report URI (for CSP violations)
        csp.append("report-uri /api/security/csp-report; ");
        
        return csp.toString();
    }

    /**
     * Register a script in the inventory
     * 
     * @param pageId Payment page identifier
     * @param scriptUrl Script URL
     * @param scriptHash SHA-256 hash of script content
     * @param purpose Purpose of the script
     * @return ScriptInventory record
     */
    public ScriptInventory registerScript(String pageId, String scriptUrl, String scriptHash, String purpose) {
        ScriptInventory script = ScriptInventory.builder()
            .pageId(pageId)
            .scriptUrl(scriptUrl)
            .scriptHash(scriptHash)
            .purpose(purpose)
            .registeredAt(LocalDateTime.now())
            .build();
        
        String key = pageId + ":" + scriptUrl;
        scriptInventory.put(key, script);
        
        log.info("Script registered for payment page {}: {} ({})", pageId, scriptUrl, purpose);
        
        return script;
    }

    /**
     * Get script inventory for a payment page
     * 
     * @param pageId Payment page identifier
     * @return List of scripts for that page
     */
    public List<ScriptInventory> getScriptInventory(String pageId) {
        return scriptInventory.values().stream()
            .filter(script -> script.getPageId().equals(pageId))
            .toList();
    }

    /**
     * Record file integrity baseline
     * 
     * @param filePath File path
     * @param fileHash SHA-256 hash of file content
     * @param fileSize File size in bytes
     * @return FileIntegrityRecord
     */
    public FileIntegrityRecord recordFileBaseline(String filePath, String fileHash, long fileSize) {
        FileIntegrityRecord record = FileIntegrityRecord.builder()
            .filePath(filePath)
            .fileHash(fileHash)
            .fileSize(fileSize)
            .baselineRecordedAt(LocalDateTime.now())
            .lastVerifiedAt(LocalDateTime.now())
            .status(FileStatus.VERIFIED)
            .build();
        
        fileIntegrityRecords.put(filePath, record);
        
        log.info("File integrity baseline recorded: {} (hash: {})", filePath, fileHash);
        
        return record;
    }

    /**
     * Verify file integrity
     * 
     * @param filePath File path
     * @param currentHash Current file hash
     * @param currentSize Current file size
     * @return FileIntegrityResult
     */
    public FileIntegrityResult verifyFileIntegrity(String filePath, String currentHash, long currentSize) {
        FileIntegrityRecord baseline = fileIntegrityRecords.get(filePath);
        
        if (baseline == null) {
            return FileIntegrityResult.builder()
                .filePath(filePath)
                .status(FileStatus.NO_BASELINE)
                .message("No baseline recorded for file")
                .build();
        }
        
        boolean hashMatches = baseline.getFileHash().equals(currentHash);
        boolean sizeMatches = baseline.getFileSize() == currentSize;
        
        FileStatus status;
        String message;
        
        if (hashMatches && sizeMatches) {
            status = FileStatus.VERIFIED;
            message = "File integrity verified";
            baseline.setLastVerifiedAt(LocalDateTime.now());
            baseline.setStatus(status);
        } else {
            status = FileStatus.TAMPERED;
            message = String.format("File integrity violation: hash match=%s, size match=%s", 
                hashMatches, sizeMatches);
            baseline.setStatus(status);
            baseline.setLastViolationAt(LocalDateTime.now());
            
            log.error("FILE INTEGRITY VIOLATION: {} - {}", filePath, message);
        }
        
        return FileIntegrityResult.builder()
            .filePath(filePath)
            .status(status)
            .message(message)
            .baselineHash(baseline.getFileHash())
            .currentHash(currentHash)
            .baselineSize(baseline.getFileSize())
            .currentSize(currentSize)
            .build();
    }

    /**
     * Get allowed payment gateway URLs for CSP
     * 
     * @return Space-separated list of payment gateway URLs
     */
    private String getAllowedPaymentGateways() {
        // Add your payment gateway URLs here
        return "'self' https://test-payment.momo.vn https://payment.momo.vn " +
               "https://sandbox.zalopay.vn https://zalopay.vn " +
               "https://checkout.stripe.com https://js.stripe.com";
    }

    /**
     * Script Inventory record
     */
    @lombok.Builder
    @lombok.Data
    public static class ScriptInventory {
        private String pageId;
        private String scriptUrl;
        private String scriptHash;
        private String purpose;
        private LocalDateTime registeredAt;
    }

    /**
     * File Integrity Record
     */
    @lombok.Builder
    @lombok.Data
    public static class FileIntegrityRecord {
        private String filePath;
        private String fileHash;
        private long fileSize;
        private LocalDateTime baselineRecordedAt;
        private LocalDateTime lastVerifiedAt;
        private LocalDateTime lastViolationAt;
        private FileStatus status;
    }

    /**
     * File Integrity Result
     */
    @lombok.Builder
    @lombok.Data
    public static class FileIntegrityResult {
        private String filePath;
        private FileStatus status;
        private String message;
        private String baselineHash;
        private String currentHash;
        private long baselineSize;
        private long currentSize;
    }

    /**
     * File Status
     */
    public enum FileStatus {
        VERIFIED("Verified - No changes detected"),
        TAMPERED("Tampered - Changes detected"),
        NO_BASELINE("No Baseline - File not previously recorded");

        private final String description;

        FileStatus(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }
}

