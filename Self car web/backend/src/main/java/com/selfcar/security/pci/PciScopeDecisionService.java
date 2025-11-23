package com.selfcar.security.pci;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * PCI DSS Scope Decision Service
 * 
 * Tracks payment flow scope decisions (Redirect vs Hosted Fields) and SAQ targets.
 * 
 * Scope Decision:
 * - Redirect (Hosted Checkout) = SAQ A (lower scope)
 * - Hosted Fields (iframes) = SAQ A-EP (higher scope)
 * 
 * Requirements:
 * - Record SAQ target per flow
 * - Document scope decisions
 * - Track payment entry points
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PciScopeDecisionService {

    // Store scope decisions per payment flow
    private final Map<String, PaymentFlowScope> flowScopes = new ConcurrentHashMap<>();

    /**
     * Register a payment flow with its scope decision
     * 
     * @param flowId Unique flow identifier (e.g., "web-checkout", "mobile-app", "recurring-billing")
     * @param flowName Human-readable flow name
     * @param entryPoint Payment entry point (WEB, MOBILE_APP, API)
     * @param paymentMethod Payment method implementation (REDIRECT, HOSTED_FIELDS)
     * @param saqTarget SAQ target (SAQ_A, SAQ_A_EP, SAQ_D)
     * @param gateway Payment gateway used
     * @param description Flow description
     * @return PaymentFlowScope record
     */
    public PaymentFlowScope registerFlow(
            String flowId,
            String flowName,
            PaymentEntryPoint entryPoint,
            PaymentMethod paymentMethod,
            SaqTarget saqTarget,
            String gateway,
            String description) {
        
        PaymentFlowScope scope = PaymentFlowScope.builder()
            .flowId(flowId)
            .flowName(flowName)
            .entryPoint(entryPoint)
            .paymentMethod(paymentMethod)
            .saqTarget(saqTarget)
            .gateway(gateway)
            .description(description)
            .registeredAt(LocalDateTime.now())
            .build();
        
        flowScopes.put(flowId, scope);
        
        log.info("PCI DSS Flow registered: {} - {} -> {} ({})", 
            flowId, flowName, paymentMethod, saqTarget);
        
        return scope;
    }

    /**
     * Get scope decision for a payment flow
     * 
     * @param flowId Flow identifier
     * @return PaymentFlowScope or null if not found
     */
    public PaymentFlowScope getFlowScope(String flowId) {
        return flowScopes.get(flowId);
    }

    /**
     * Get all registered flows
     * 
     * @return List of all payment flow scopes
     */
    public List<PaymentFlowScope> getAllFlows() {
        return new ArrayList<>(flowScopes.values());
    }

    /**
     * Get flows by SAQ target
     * 
     * @param saqTarget SAQ target
     * @return List of flows with that SAQ target
     */
    public List<PaymentFlowScope> getFlowsBySaqTarget(SaqTarget saqTarget) {
        return flowScopes.values().stream()
            .filter(flow -> flow.getSaqTarget() == saqTarget)
            .toList();
    }

    /**
     * Get flows by payment method
     * 
     * @param paymentMethod Payment method
     * @return List of flows using that payment method
     */
    public List<PaymentFlowScope> getFlowsByPaymentMethod(PaymentMethod paymentMethod) {
        return flowScopes.values().stream()
            .filter(flow -> flow.getPaymentMethod() == paymentMethod)
            .toList();
    }

    /**
     * Determine recommended SAQ target based on payment method
     * 
     * @param paymentMethod Payment method
     * @return Recommended SAQ target
     */
    public static SaqTarget determineSaqTarget(PaymentMethod paymentMethod) {
        return switch (paymentMethod) {
            case REDIRECT -> SaqTarget.SAQ_A; // Redirect typically targets SAQ A
            case HOSTED_FIELDS -> SaqTarget.SAQ_A_EP; // Hosted Fields often lands in SAQ A-EP
            case DIRECT_POST -> SaqTarget.SAQ_D; // Direct post requires SAQ D
            case API_DIRECT -> SaqTarget.SAQ_D; // API direct requires SAQ D
        };
    }

    /**
     * Payment Flow Scope record
     */
    @lombok.Builder
    @lombok.Data
    public static class PaymentFlowScope {
        private String flowId;
        private String flowName;
        private PaymentEntryPoint entryPoint;
        private PaymentMethod paymentMethod;
        private SaqTarget saqTarget;
        private String gateway;
        private String description;
        private LocalDateTime registeredAt;
    }

    /**
     * Payment Entry Point
     */
    public enum PaymentEntryPoint {
        WEB("Web Browser"),
        MOBILE_APP("Mobile Application"),
        API("API"),
        PHONE("Phone Order"),
        MAIL("Mail Order");

        private final String description;

        PaymentEntryPoint(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    /**
     * Payment Method Implementation
     */
    public enum PaymentMethod {
        REDIRECT("Hosted Checkout - Redirect to gateway"),
        HOSTED_FIELDS("Hosted Fields - iframes"),
        DIRECT_POST("Direct Post"),
        API_DIRECT("API Direct");

        private final String description;

        PaymentMethod(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    /**
     * SAQ Target
     */
    public enum SaqTarget {
        SAQ_A("SAQ A - Outsourced e-commerce"),
        SAQ_A_EP("SAQ A-EP - Partially outsourced e-commerce"),
        SAQ_D("SAQ D - All other cases");

        private final String description;

        SaqTarget(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }
}

