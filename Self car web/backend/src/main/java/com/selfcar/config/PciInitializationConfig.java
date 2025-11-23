package com.selfcar.config;

import com.selfcar.security.pci.PciControlMappingService;
import com.selfcar.security.pci.PciScopeDecisionService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * PCI DSS Initialization Configuration
 * 
 * Initializes PCI DSS services with default flows and controls.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PciInitializationConfig {

    private final PciScopeDecisionService pciScopeDecisionService;
    private final PciControlMappingService pciControlMappingService;

    @PostConstruct
    public void initializePciServices() {
        log.info("Initializing PCI DSS services...");

        // Initialize PCI control mappings
        pciControlMappingService.initializePciControls();
        log.info("PCI DSS control mappings initialized");

        // Register default payment flows
        registerDefaultPaymentFlows();
        log.info("Default payment flows registered");

        log.info("PCI DSS services initialized successfully");
    }

    /**
     * Register default payment flows
     */
    private void registerDefaultPaymentFlows() {
        // Web checkout flow (Redirect - SAQ A)
        pciScopeDecisionService.registerFlow(
            "web-checkout",
            "Web Browser Checkout",
            PciScopeDecisionService.PaymentEntryPoint.WEB,
            PciScopeDecisionService.PaymentMethod.REDIRECT,
            PciScopeDecisionService.SaqTarget.SAQ_A,
            "Stripe/MoMo/ZaloPay",
            "Standard web checkout with redirect to payment gateway hosted checkout"
        );

        // Mobile app checkout flow (Redirect - SAQ A)
        pciScopeDecisionService.registerFlow(
            "mobile-app",
            "Mobile App Checkout",
            PciScopeDecisionService.PaymentEntryPoint.MOBILE_APP,
            PciScopeDecisionService.PaymentMethod.REDIRECT,
            PciScopeDecisionService.SaqTarget.SAQ_A,
            "Stripe/MoMo",
            "Mobile app checkout with redirect to payment gateway SDK"
        );

        // Recurring billing flow (Tokenized - SAQ D)
        pciScopeDecisionService.registerFlow(
            "recurring-billing",
            "Recurring Billing",
            PciScopeDecisionService.PaymentEntryPoint.API,
            PciScopeDecisionService.PaymentMethod.API_DIRECT,
            PciScopeDecisionService.SaqTarget.SAQ_D,
            "Stripe",
            "Recurring billing using tokenized payment methods via API"
        );
    }
}

