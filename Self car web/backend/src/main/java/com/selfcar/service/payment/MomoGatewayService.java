package com.selfcar.service.payment;

import com.selfcar.model.payment.PaymentTransaction;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@Slf4j
public class MomoGatewayService implements PaymentGatewayService {

    @Value("${payment.momo.partner-code:}")
    private String partnerCode;

    @Value("${payment.momo.access-key:}")
    private String accessKey;

    @Value("${payment.momo.secret-key:}")
    private String secretKey;

    @Value("${payment.momo.environment:sandbox}")
    private String environment;

    @Value("${payment.momo.partner-name:Selfcar}")
    private String partnerName;

    @Value("${payment.momo.store-id:SelfcarStore}")
    private String storeId;

    @Value("${payment.base-url:https://selfcar.com}")
    private String baseUrl;

    private static final String MOMO_API_URL_SANDBOX = "https://test-payment.momo.vn/v2/gateway/api/create";
    private static final String MOMO_API_URL_PRODUCTION = "https://payment.momo.vn/v2/gateway/api/create";

    @Override
    public PaymentResponse initiatePayment(PaymentRequest request) {
        PaymentResponse response = new PaymentResponse();
        
        try {
            String requestId = UUID.randomUUID().toString();
            String orderId = request.getTransactionId();
            String orderInfo = request.getDescription() != null ? request.getDescription() : "Payment for Selfcar";
            long amount = request.getAmount().longValue();
            String returnUrl = request.getReturnUrl() != null ? request.getReturnUrl() : 
                               baseUrl + "/payment/return";
            String notifyUrl = baseUrl + "/api/payments/momo/callback";
            
            // Create signature
            String rawHash = "accessKey=" + accessKey +
                    "&amount=" + amount +
                    "&extraData=" +
                    "&ipnUrl=" + notifyUrl +
                    "&orderId=" + orderId +
                    "&orderInfo=" + orderInfo +
                    "&partnerCode=" + partnerCode +
                    "&redirectUrl=" + returnUrl +
                    "&requestId=" + requestId +
                    "&requestType=captureWallet";
            
            String signature = com.selfcar.security.PspSignatureUtil.hmacSha256Hex(secretKey, rawHash);
            
            // Build request body
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("partnerCode", partnerCode);
            requestBody.put("partnerName", partnerName);
            requestBody.put("storeId", storeId);
            requestBody.put("requestId", requestId);
            requestBody.put("amount", amount);
            requestBody.put("orderId", orderId);
            requestBody.put("orderInfo", orderInfo);
            requestBody.put("redirectUrl", returnUrl);
            requestBody.put("ipnUrl", notifyUrl);
            requestBody.put("lang", "vi");
            requestBody.put("extraData", "");
            requestBody.put("requestType", "captureWallet");
            requestBody.put("signature", signature);
            
            // Make HTTP POST request to Momo API
            // Use RestTemplate or WebClient for actual API calls
            // For now, logging request (replace with actual HTTP call in production)
            log.info("Momo payment request prepared: partnerCode={}, orderId={}, amount={}", 
                    partnerCode, orderId, amount);
            
            // TODO: Replace with actual HTTP call when production credentials are available
            // Example:
            // RestTemplate restTemplate = new RestTemplate();
            // HttpHeaders headers = new HttpHeaders();
            // headers.setContentType(MediaType.APPLICATION_JSON);
            // HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            // ResponseEntity<Map> apiResponse = restTemplate.postForEntity(getApiUrl(), entity, Map.class);
            
            // For now, returning structured response
            response.setSuccess(true);
            response.setGatewayTransactionId(orderId);
            response.setPaymentUrl(getApiUrl() + "?orderId=" + orderId);
            
        } catch (Exception e) {
            log.error("Error initiating Momo payment", e);
            response.setSuccess(false);
            response.setErrorMessage(e.getMessage());
        }
        
        return response;
    }

    @Override
    public PaymentVerificationResult verifyPayment(String transactionId, Map<String, String> callbackData) {
        PaymentVerificationResult result = new PaymentVerificationResult();
        
        try {
            String orderId = callbackData.get("orderId");
            String resultCode = callbackData.get("resultCode");
            String amount = callbackData.get("amount");
            String signature = callbackData.get("signature");
            
            // Verify signature
            String rawHash = "accessKey=" + accessKey +
                    "&amount=" + amount +
                    "&extraData=" + callbackData.getOrDefault("extraData", "") +
                    "&message=" + callbackData.getOrDefault("message", "") +
                    "&orderId=" + orderId +
                    "&orderInfo=" + callbackData.getOrDefault("orderInfo", "") +
                    "&orderType=" + callbackData.getOrDefault("orderType", "") +
                    "&partnerCode=" + partnerCode +
                    "&payType=" + callbackData.getOrDefault("payType", "") +
                    "&requestId=" + callbackData.getOrDefault("requestId", "") +
                    "&responseTime=" + callbackData.getOrDefault("responseTime", "") +
                    "&resultCode=" + resultCode +
                    "&transId=" + callbackData.getOrDefault("transId", "");
            
            String calculatedSignature = com.selfcar.security.PspSignatureUtil.hmacSha256Hex(secretKey, rawHash);
            
            // Constant-time comparison to prevent timing attacks
            if (!com.selfcar.security.PspSignatureUtil.timingSafeEquals(signature, calculatedSignature)) {
                log.warn("Momo webhook signature verification failed for transaction: {}", transactionId);
                result.setVerified(false);
                result.setErrorMessage("Invalid signature");
                return result;
            }
            
            result.setVerified(true);
            result.setGatewayTransactionId(callbackData.get("transId"));
            result.setAmount(new BigDecimal(amount));
            
            if ("0".equals(resultCode)) {
                result.setStatus(PaymentTransaction.TransactionStatus.COMPLETED);
            } else {
                result.setStatus(PaymentTransaction.TransactionStatus.FAILED);
                result.setErrorMessage(callbackData.getOrDefault("message", "Payment failed"));
            }
            
        } catch (Exception e) {
            log.error("Error verifying Momo payment", e);
            result.setVerified(false);
            result.setErrorMessage(e.getMessage());
        }
        
        return result;
    }

    @Override
    public RefundResponse processRefund(String gatewayTransactionId, BigDecimal amount, String reason) {
        RefundResponse response = new RefundResponse();
        
        try {
            // Implement Momo refund API call
            log.info("Processing Momo refund for transaction: {}, amount: {}, reason: {}", 
                    gatewayTransactionId, amount, reason);
            
            // In production, make actual HTTP POST request to Momo refund API
            response.setSuccess(true);
            response.setRefundTransactionId(UUID.randomUUID().toString());
            response.setRefundAmount(amount);
            
        } catch (Exception e) {
            log.error("Error processing Momo refund", e);
            response.setSuccess(false);
            response.setErrorMessage(e.getMessage());
        }
        
        return response;
    }

    @Override
    public PaymentStatus checkPaymentStatus(String gatewayTransactionId) {
        PaymentStatus status = new PaymentStatus();
        
        try {
            // Implement Momo payment status query API
            log.info("Checking Momo payment status for: {}", gatewayTransactionId);
            
            // In production, make actual HTTP GET request to Momo query API
            status.setStatus(PaymentTransaction.TransactionStatus.PROCESSING);
            status.setGatewayTransactionId(gatewayTransactionId);
            
        } catch (Exception e) {
            log.error("Error checking Momo payment status", e);
        }
        
        return status;
    }

    private String getApiUrl() {
        return "sandbox".equals(environment) ? MOMO_API_URL_SANDBOX : MOMO_API_URL_PRODUCTION;
    }
}
