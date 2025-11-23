package com.selfcar.config;

import com.selfcar.security.pci.PaymentPageSecurityService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Arrays;
import java.util.List;

/**
 * Payment Page Security Configuration
 * 
 * Applies Content Security Policy (CSP) headers to payment pages.
 * Implements PCI DSS requirement 6.4.3.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentPageSecurityConfig implements HandlerInterceptor {

    private final PaymentPageSecurityService paymentPageSecurityService;

    // Payment page paths
    private static final List<String> PAYMENT_PATHS = Arrays.asList(
        "/payment",
        "/checkout",
        "/api/payments/initiate",
        "/pay"
    );

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, 
                            Object handler) throws Exception {
        String path = request.getRequestURI();
        
        // Check if this is a payment page
        if (isPaymentPage(path)) {
            // Generate and apply CSP header
            String cspHeader = generateCspForPaymentPage();
            response.setHeader("Content-Security-Policy", cspHeader);
            
            // Additional security headers for payment pages
            response.setHeader("X-Frame-Options", "DENY");
            response.setHeader("X-Content-Type-Options", "nosniff");
            response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
            // Strict permissions policy for payment surfaces
            response.setHeader("Permissions-Policy",
                "geolocation=(), microphone=(), camera=(), usb=(), payment=(self)");
            // Enforce iframe sandbox if a payment widget is rendered client-side
            response.setHeader("X-Sandbox", "allow-scripts allow-forms allow-same-origin");
            
            log.debug("Payment page security headers applied to: {}", path);
        }
        
        return true;
    }

    /**
     * Check if path is a payment page
     */
    private boolean isPaymentPage(String path) {
        return PAYMENT_PATHS.stream().anyMatch(path::contains);
    }

    /**
     * Generate CSP header for payment pages
     */
    private String generateCspForPaymentPage() {
        // Allowed script sources (strict allowlist)
        List<String> allowedScripts = Arrays.asList(
            "'self'",
            "'sha256-...'", // Add your script hashes here
            "https://js.stripe.com", // Stripe
            "https://checkout.stripe.com" // Stripe Checkout
            // Add other payment gateway scripts as needed
        );
        
        // Allowed style sources
        List<String> allowedStyles = Arrays.asList(
            "'self'"
        );
        
        // Allowed image sources
        List<String> allowedImages = Arrays.asList(
            "'self'",
            "data:",
            "https://*.stripe.com" // Stripe images
        );
        
        // Allowed font sources
        List<String> allowedFonts = Arrays.asList(
            "'self'",
            "data:"
        );
        
        return paymentPageSecurityService.generateCspHeader(
            allowedScripts,
            allowedStyles,
            allowedImages,
            allowedFonts
        );
    }
}

