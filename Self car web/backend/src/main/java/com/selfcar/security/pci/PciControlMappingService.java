package com.selfcar.security.pci;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * PCI DSS Control Mapping Service
 * 
 * Maps PCI DSS v4.x requirements to controls, evidence owners, and collection methods.
 * 
 * Based on PCI DSS v4.x Quick Reference Guide (12 requirements).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PciControlMappingService {

    // Store control mappings
    private final Map<String, PciControl> controls = new ConcurrentHashMap<>();

    /**
     * Initialize PCI DSS v4.x control mappings
     */
    public void initializePciControls() {
        // Requirement 1: Install and maintain network security controls
        registerControl("1.1", "Network Security Controls", 
            "Install and maintain network security controls", 
            "Network Security", "DevOps", "Network diagrams, firewall rules, access logs");

        // Requirement 2: Apply secure configurations to all system components
        registerControl("2.1", "Secure Configurations", 
            "Apply secure configurations to all system components", 
            "System Configuration", "DevOps", "Configuration files, hardening checklists, change logs");

        // Requirement 3: Protect stored account data
        registerControl("3.1", "Protect Stored Account Data", 
            "Protect stored account data", 
            "Data Protection", "Security", "Data encryption documentation, key management procedures");

        // Requirement 4: Protect cardholder data with strong cryptography during transmission over open, public networks
        registerControl("4.1", "Protect Cardholder Data Transmission", 
            "Protect cardholder data with strong cryptography during transmission", 
            "Data Transmission", "Security", "TLS configuration, certificate management, encryption logs");

        // Requirement 5: Protect all systems and networks from malicious software
        registerControl("5.1", "Malicious Software Protection", 
            "Protect all systems and networks from malicious software", 
            "Malware Protection", "DevOps", "Antivirus logs, malware scans, patch management records");

        // Requirement 6: Develop and maintain secure systems and software
        registerControl("6.1", "Secure Systems and Software", 
            "Develop and maintain secure systems and software", 
            "Secure Development", "Engineering", "Code reviews, vulnerability scans, patch logs");

        // Requirement 6.4.3: Payment page security
        registerControl("6.4.3", "Payment Page Security", 
            "Payment page security - CSP, script inventory, change detection", 
            "Payment Page Security", "Security", "CSP headers, script inventory, tamper detection logs");

        // Requirement 7: Restrict access to system components and cardholder data by business need to know
        registerControl("7.1", "Access Control", 
            "Restrict access to system components and cardholder data by business need to know", 
            "Access Control", "Security", "Access control lists, user permissions, access logs");

        // Requirement 8: Identify users and authenticate access to system components
        registerControl("8.1", "User Identification and Authentication", 
            "Identify users and authenticate access to system components", 
            "Authentication", "Security", "Authentication logs, MFA records, password policies");

        // Requirement 9: Restrict physical access to cardholder data
        registerControl("9.1", "Physical Access Control", 
            "Restrict physical access to cardholder data", 
            "Physical Security", "Operations", "Access logs, visitor logs, security camera footage");

        // Requirement 10: Log and monitor all access to system components and cardholder data
        registerControl("10.1", "Logging and Monitoring", 
            "Log and monitor all access to system components and cardholder data", 
            "Logging", "Security", "Access logs, audit trails, security event logs");

        // Requirement 11: Test security of systems and networks regularly
        registerControl("11.1", "Security Testing", 
            "Test security of systems and networks regularly", 
            "Security Testing", "Security", "Penetration test reports, vulnerability scans, security assessments");

        // Requirement 11.6.1: Change and tamper detection
        registerControl("11.6.1", "Change and Tamper Detection", 
            "Change and tamper detection for payment pages", 
            "Change Detection", "Security", "File integrity monitoring, change detection logs, tamper alerts");

        // Requirement 12: Support information security with organizational policies and programs
        registerControl("12.1", "Information Security Policy", 
            "Support information security with organizational policies and programs", 
            "Security Policy", "Management", "Security policies, training records, incident response plans");

        log.info("PCI DSS v4.x control mappings initialized: {} controls", controls.size());
    }

    /**
     * Register a PCI control
     * 
     * @param requirementId Requirement ID (e.g., "6.4.3")
     * @param controlName Control name
     * @param description Control description
     * @param controlCategory Control category
     * @param evidenceOwner Evidence owner (department/team)
     * @param collectionMethod Evidence collection method
     * @return PciControl record
     */
    public PciControl registerControl(
            String requirementId,
            String controlName,
            String description,
            String controlCategory,
            String evidenceOwner,
            String collectionMethod) {
        
        PciControl control = PciControl.builder()
            .requirementId(requirementId)
            .controlName(controlName)
            .description(description)
            .controlCategory(controlCategory)
            .evidenceOwner(evidenceOwner)
            .collectionMethod(collectionMethod)
            .registeredAt(LocalDateTime.now())
            .status(ControlStatus.IMPLEMENTED)
            .build();
        
        controls.put(requirementId, control);
        
        return control;
    }

    /**
     * Get control by requirement ID
     * 
     * @param requirementId Requirement ID
     * @return PciControl or null if not found
     */
    public PciControl getControl(String requirementId) {
        return controls.get(requirementId);
    }

    /**
     * Get all controls
     * 
     * @return List of all controls
     */
    public List<PciControl> getAllControls() {
        return new ArrayList<>(controls.values());
    }

    /**
     * Get controls by category
     * 
     * @param category Control category
     * @return List of controls in that category
     */
    public List<PciControl> getControlsByCategory(String category) {
        return controls.values().stream()
            .filter(control -> control.getControlCategory().equals(category))
            .toList();
    }

    /**
     * Update control status
     * 
     * @param requirementId Requirement ID
     * @param status New status
     * @param evidence Evidence provided
     * @return Updated control
     */
    public PciControl updateControlStatus(String requirementId, ControlStatus status, String evidence) {
        PciControl control = controls.get(requirementId);
        if (control == null) {
            throw new IllegalArgumentException("Control not found: " + requirementId);
        }
        
        control.setStatus(status);
        control.setEvidence(evidence);
        control.setEvidenceCollectedAt(LocalDateTime.now());
        
        log.info("Control {} status updated to {} with evidence: {}", requirementId, status, evidence);
        
        return control;
    }

    /**
     * PCI Control record
     */
    @lombok.Builder
    @lombok.Data
    public static class PciControl {
        private String requirementId;
        private String controlName;
        private String description;
        private String controlCategory;
        private String evidenceOwner;
        private String collectionMethod;
        private ControlStatus status;
        private String evidence;
        private LocalDateTime registeredAt;
        private LocalDateTime evidenceCollectedAt;
    }

    /**
     * Control Status
     */
    public enum ControlStatus {
        NOT_STARTED("Not Started"),
        IN_PROGRESS("In Progress"),
        IMPLEMENTED("Implemented"),
        VERIFIED("Verified"),
        COMPLIANT("Compliant");

        private final String description;

        ControlStatus(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }
}

