package com.selfcar.controller.payment;

import com.selfcar.dto.common.ApiResponse;
import com.selfcar.dto.payment.PaymentRequestDTO;
import com.selfcar.dto.payment.PaymentResponseDTO;
import com.selfcar.model.payment.PaymentTransaction;
import com.selfcar.model.payment.WebhookEvent;
import com.selfcar.security.UserPrincipal;
import com.selfcar.security.ObjectLevelAuthorizationService;
import com.selfcar.security.WebhookSecurityService;
import com.selfcar.service.payment.PaymentService;
import com.selfcar.service.payment.WebhookService;
import lombok.extern.slf4j.Slf4j;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final WebhookService webhookService;
    private final ObjectLevelAuthorizationService objectLevelAuthorizationService;
    private final WebhookSecurityService webhookSecurityService;
    private final com.selfcar.security.AuditLogger auditLogger;

    @PostMapping("/initiate")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<?> initiatePayment(
            @Valid @RequestBody PaymentRequestDTO request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            if (userPrincipal == null || userPrincipal.getUser() == null) {
                return ResponseEntity.status(401).body(new ApiResponse(false, "Authentication required"));
            }
            PaymentTransaction transaction = paymentService.createDeposit(
                    request.getBookingId(),
                    request.getAmount(),
                    request.getGateway(),
                    userPrincipal.getUser().getId(),
                    request.getReturnUrl()
            );

            PaymentResponseDTO response = mapToPaymentResponseDTO(transaction);
            // Audit payment initiation (no PAN logged)
            java.util.Map<String, Object> extras = new java.util.HashMap<>();
            extras.put("booking_id", request.getBookingId());
            extras.put("amount_minor", request.getAmount());
            extras.put("gateway", request.getGateway());
            auditLogger.logPaymentEvent(
                    "PAYMENT_INIT",
                    transaction.getTransactionId(),
                    userPrincipal.getUser().getId(),
                    String.valueOf(request.getGateway()),
                    extras);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/transaction/{transactionId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getTransaction(
            @PathVariable String transactionId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            if (userPrincipal == null || userPrincipal.getUser() == null) {
                return ResponseEntity.status(401).body(new ApiResponse(false, "Authentication required"));
            }
            // BOLA Protection: Verify user owns the transaction
            objectLevelAuthorizationService.verifyTransactionAccess(transactionId, userPrincipal.getUser().getId());
            
            PaymentTransaction transaction = paymentService.getTransactionByTransactionId(transactionId);
            PaymentResponseDTO response = mapToPaymentResponseDTO(transaction);
            return ResponseEntity.ok(response);
        } catch (org.springframework.security.access.AccessDeniedException e) {
            return ResponseEntity.status(403).body(new ApiResponse(false, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/my-transactions")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getMyTransactions(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            if (userPrincipal == null || userPrincipal.getUser() == null) {
                return ResponseEntity.status(401).body(new ApiResponse(false, "Authentication required"));
            }
            List<PaymentTransaction> transactions = paymentService.getUserTransactions(userPrincipal.getUser().getId());
            List<PaymentResponseDTO> responses = transactions.stream()
                    .map(this::mapToPaymentResponseDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(responses);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/booking/{bookingId}/transactions")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getBookingTransactions(
            @PathVariable Long bookingId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            if (userPrincipal == null || userPrincipal.getUser() == null) {
                return ResponseEntity.status(401).body(new ApiResponse(false, "Authentication required"));
            }
            // BOLA Protection: Verify user has access to the booking
            objectLevelAuthorizationService.verifyBookingTransactionsAccess(
                    bookingId, 
                    userPrincipal.getUser().getId()
            );
            
            List<PaymentTransaction> transactions = paymentService.getBookingTransactions(bookingId);
            List<PaymentResponseDTO> responses = transactions.stream()
                    .map(this::mapToPaymentResponseDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(responses);
        } catch (org.springframework.security.access.AccessDeniedException e) {
            return ResponseEntity.status(403).body(new ApiResponse(false, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/refund")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> processRefund(
            @RequestParam Long transactionId,
            @RequestParam(required = false) String reason,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            PaymentTransaction refund = paymentService.processRefund(
                    transactionId,
                    null, // Amount - should be retrieved from original transaction
                    reason != null ? reason : "Refund requested by customer"
            );

            PaymentResponseDTO response = mapToPaymentResponseDTO(refund);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    // Wallet balance and bank detail endpoints are provided via WalletController

    // Payment gateway callbacks
    @PostMapping("/momo/callback")
    public ResponseEntity<?> momoCallback(
            @RequestBody Map<String, String> callbackData,
            jakarta.servlet.http.HttpServletRequest request) {
        try {
            // Webhook security: Rate limiting, replay protection, idempotency
            String idempotencyKey = callbackData.get("requestId");
            String timestamp = callbackData.get("responseTime");
            String identifier = request.getRemoteAddr(); // IP address for rate limiting
            
            if (!webhookSecurityService.validateWebhookSecurity("MOMO", idempotencyKey, timestamp, identifier)) {
                log.warn("Momo webhook security validation failed from IP: {}", identifier);
                return ResponseEntity.status(429).body(new ApiResponse(false, "Webhook security validation failed"));
            }

            // Verify HMAC signature (handled in MomoGatewayService.verifyPayment)
            String rawPayload = callbackData.toString();
            var event = webhookService.recordIfNew("MOMO", idempotencyKey, rawPayload);
            
            if (event.getStatus() == WebhookEvent.ProcessingStatus.PROCESSED) {
                return ResponseEntity.ok(new ApiResponse(true, "Callback already processed"));
            }
            
            String orderId = callbackData.get("orderId");
            paymentService.handlePaymentCallback(PaymentTransaction.PaymentGateway.MOMO, orderId, callbackData);
            webhookService.markProcessed(event.getId());
            return ResponseEntity.ok(new ApiResponse(true, "Callback processed"));
        } catch (Exception e) {
            log.error("Error processing Momo webhook", e);
            // Best effort: store failure
            try { webhookService.recordIfNew("MOMO", callbackData.get("requestId"), callbackData.toString()); } catch (Exception ex) { log.warn("Failed to record MOMO webhook after error", ex); }
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    /**
     * Redirect return handler for provider-hosted checkout flows
     * - Verifies signature via gateway-specific verification
     * - Updates transaction state
     */
    @GetMapping("/return/{gateway}")
    public ResponseEntity<?> handleReturn(
            @PathVariable("gateway") String gatewayName,
            @RequestParam Map<String, String> queryParams) {
        try {
            PaymentTransaction.PaymentGateway gateway;
            try {
                gateway = PaymentTransaction.PaymentGateway.valueOf(gatewayName.toUpperCase());
            } catch (Exception e) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "Unsupported gateway"));
            }

            // Determine transaction id param by gateway
            String transactionIdParam;
            switch (gateway) {
                case MOMO -> transactionIdParam = "orderId";
                case ZALOPAY -> transactionIdParam = "app_trans_id";
                case STRIPE_CONNECT -> transactionIdParam = queryParams.getOrDefault("transactionId", "");
                default -> transactionIdParam = queryParams.getOrDefault("transactionId", "");
            }

            String transactionId = queryParams.get(transactionIdParam);
            if (transactionId == null || transactionId.isBlank()) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "Missing transaction identifier"));
            }

            // Delegate to unified callback handling with HMAC/signature verification at gateway layer
            paymentService.handlePaymentCallback(gateway, transactionId, new HashMap<>(queryParams));
            // Audit return
            java.util.Map<String, Object> extras = new java.util.HashMap<>();
            extras.put("gateway", gateway.name());
            extras.put("query_keys", queryParams.keySet());
            auditLogger.logPaymentEvent("PAYMENT_RETURN", transactionId, null, gateway.name(), extras);
            return ResponseEntity.ok(new ApiResponse(true, "Return processed"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/zalopay/callback")
    public ResponseEntity<?> zaloPayCallback(
            @RequestBody Map<String, String> callbackData,
            jakarta.servlet.http.HttpServletRequest request) {
        try {
            // Webhook security: Rate limiting, replay protection, idempotency
            String idempotencyKey = callbackData.get("app_trans_id");
            String timestamp = callbackData.get("timestamp");
            String identifier = request.getRemoteAddr();
            
            if (!webhookSecurityService.validateWebhookSecurity("ZALOPAY", idempotencyKey, timestamp, identifier)) {
                log.warn("ZaloPay webhook security validation failed from IP: {}", identifier);
                return ResponseEntity.status(429).body(new ApiResponse(false, "Webhook security validation failed"));
            }

            String rawPayload = callbackData.toString();
            var event = webhookService.recordIfNew("ZALOPAY", idempotencyKey, rawPayload);
            if (event.getStatus() == WebhookEvent.ProcessingStatus.PROCESSED) {
                return ResponseEntity.ok(new ApiResponse(true, "Callback already processed"));
            }
            String appTransId = callbackData.get("app_trans_id");
            paymentService.handlePaymentCallback(PaymentTransaction.PaymentGateway.ZALOPAY, appTransId, callbackData);
            webhookService.markProcessed(event.getId());
            return ResponseEntity.ok(new ApiResponse(true, "Callback processed"));
        } catch (Exception e) {
            log.error("Error processing ZaloPay webhook", e);
            try { webhookService.recordIfNew("ZALOPAY", callbackData.get("app_trans_id"), callbackData.toString()); } catch (Exception ex) { log.warn("Failed to record ZaloPay webhook after error", ex); }
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/stripe/webhook")
    public ResponseEntity<?> stripeWebhook(
            @RequestBody Map<String, Object> webhookData,
            jakarta.servlet.http.HttpServletRequest request) {
        try {
            // Webhook security: Rate limiting, replay protection, idempotency
            String webhookId = (String) webhookData.get("id");
            String timestamp = String.valueOf(webhookData.get("created")); // Stripe timestamp
            String identifier = request.getRemoteAddr();
            
            if (!webhookSecurityService.validateWebhookSecurity("STRIPE_CONNECT", webhookId, timestamp, identifier)) {
                log.warn("Stripe webhook security validation failed from IP: {}", identifier);
                return ResponseEntity.status(429).body(new ApiResponse(false, "Webhook security validation failed"));
            }

            // Extract transaction ID from Stripe webhook
            Object dataObj = webhookData.get("data");
            if (dataObj == null || !(dataObj instanceof Map)) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "Invalid webhook data structure"));
            }
            @SuppressWarnings("unchecked")
            Map<String, Object> data = (Map<String, Object>) dataObj;
            
            Object objectObj = data.get("object");
            if (objectObj == null || !(objectObj instanceof Map)) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "Invalid webhook object structure"));
            }
            @SuppressWarnings("unchecked")
            Map<String, Object> object = (Map<String, Object>) objectObj;
            
            String paymentIntentId = (String) object.get("id");
            if (paymentIntentId == null) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "Payment intent ID not found"));
            }
            
            String rawPayload = webhookData.toString();
            var event = webhookService.recordIfNew("STRIPE_CONNECT", webhookId, rawPayload);
            if (event.getStatus() == WebhookEvent.ProcessingStatus.PROCESSED) {
                return ResponseEntity.ok(new ApiResponse(true, "Webhook already processed"));
            }

            Map<String, String> callbackData = new HashMap<>();
            callbackData.put("type", (String) webhookData.get("type"));
            callbackData.put("data.object.id", paymentIntentId);
            callbackData.put("data.object.status", (String) object.get("status"));
            callbackData.put("data.object.amount", String.valueOf(object.get("amount")));

            paymentService.handlePaymentCallback(PaymentTransaction.PaymentGateway.STRIPE_CONNECT, 
                    paymentIntentId, callbackData);
            webhookService.markProcessed(event.getId());
            return ResponseEntity.ok(new ApiResponse(true, "Webhook processed"));
        } catch (Exception e) {
            log.error("Error processing Stripe webhook", e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    private PaymentResponseDTO mapToPaymentResponseDTO(PaymentTransaction transaction) {
        PaymentResponseDTO.PaymentResponseDTOBuilder builder = PaymentResponseDTO.builder()
                .id(transaction.getId())
                .transactionId(transaction.getTransactionId())
                .bookingId(transaction.getBooking() != null ? transaction.getBooking().getId() : null)
                .type(transaction.getType())
                .status(transaction.getStatus())
                .gateway(transaction.getGateway())
                .amount(transaction.getAmount())
                .feeAmount(transaction.getFeeAmount())
                .netAmount(transaction.getNetAmount())
                .currency(transaction.getCurrency())
                .gatewayTransactionId(transaction.getGatewayTransactionId())
                .description(transaction.getDescription())
                .failureReason(transaction.getFailureReason())
                .createdAt(transaction.getCreatedAt())
                .processedAt(transaction.getProcessedAt());

        // Get payment URL if status is pending/processing
        if (transaction.getStatus() == PaymentTransaction.TransactionStatus.PENDING ||
            transaction.getStatus() == PaymentTransaction.TransactionStatus.PROCESSING) {
            try {
                var paymentResponse = paymentService.getPaymentUrl(transaction.getTransactionId());
                builder.paymentUrl(paymentResponse.getPaymentUrl());
                builder.qrCode(paymentResponse.getQrCode());
            } catch (Exception e) {
                log.debug("Payment URL retrieval failed for {}", transaction.getTransactionId(), e);
            }
        }

        return builder.build();
    }
}
