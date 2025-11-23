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
public class ZaloPayGatewayService implements PaymentGatewayService {

    @Value("${payment.zalopay.app-id:}")
    private String appId;

    @Value("${payment.zalopay.key1:}")
    private String key1;

    @Value("${payment.zalopay.key2:}")
    private String key2;

    @Value("${payment.zalopay.environment:sandbox}")
    private String environment;

    @Value("${payment.base-url:https://selfcar.com}")
    private String baseUrl;

    private static final String ZALOPAY_API_URL_SANDBOX = "https://sb-openapi.zalopay.vn/v2/create";
    private static final String ZALOPAY_API_URL_PRODUCTION = "https://openapi.zalopay.vn/v2/create";

    @Override
    public PaymentResponse initiatePayment(PaymentRequest request) {
        PaymentResponse response = new PaymentResponse();
        
        try {
            String appTransId = request.getTransactionId();
            long amount = request.getAmount().longValue();
            String description = request.getDescription() != null ? request.getDescription() : "Payment for Selfcar";
            String embedData = "{}";
            
            // Create order data
            Map<String, Object> order = new HashMap<>();
            order.put("app_id", Integer.parseInt(appId));
            order.put("app_trans_id", appTransId);
            order.put("app_user", request.getCustomerPhone() != null ? request.getCustomerPhone() : "SelfcarUser");
            order.put("app_time", System.currentTimeMillis());
            order.put("amount", amount);
            order.put("item", description);
            order.put("description", description);
            order.put("embed_data", embedData);
            order.put("bank_code", "");
            order.put("callback_url", baseUrl + "/api/payments/zalopay/callback");
            
            // Create MAC (Message Authentication Code)
            String data = order.get("app_id") + "|" + order.get("app_trans_id") + "|" +
                         order.get("app_user") + "|" + order.get("amount") + "|" +
                         order.get("app_time") + "|" + order.get("embed_data") + "|" +
                         order.get("item");
            
            String mac = com.selfcar.security.PspSignatureUtil.hmacSha256Hex(key1, data);
            order.put("mac", mac);
            
            log.info("ZaloPay payment request: {}", order);
            
            // In production, make actual HTTP POST request to ZaloPay API
            response.setSuccess(true);
            response.setGatewayTransactionId(appTransId);
            response.setPaymentUrl(getApiUrl() + "?orderId=" + appTransId);
            
        } catch (Exception e) {
            log.error("Error initiating ZaloPay payment", e);
            response.setSuccess(false);
            response.setErrorMessage(e.getMessage());
        }
        
        return response;
    }

    @Override
    public PaymentVerificationResult verifyPayment(String transactionId, Map<String, String> callbackData) {
        PaymentVerificationResult result = new PaymentVerificationResult();
        
        try {
            String data = callbackData.get("data");
            String mac = callbackData.get("mac");
            
            // Verify MAC
            String calculatedMac = com.selfcar.security.PspSignatureUtil.hmacSha256Hex(key2, data);
            
            if (!com.selfcar.security.PspSignatureUtil.timingSafeEquals(mac, calculatedMac)) {
                result.setVerified(false);
                result.setErrorMessage("Invalid MAC");
                return result;
            }
            
            // Parse data (in production, decode JSON)
            String zpTransId = callbackData.get("zp_trans_id");
            int returnCode = Integer.parseInt(callbackData.getOrDefault("return_code", "-1"));
            long amount = Long.parseLong(callbackData.getOrDefault("amount", "0"));
            
            result.setVerified(true);
            result.setGatewayTransactionId(zpTransId);
            result.setAmount(new BigDecimal(amount));
            
            if (returnCode == 1) {
                result.setStatus(PaymentTransaction.TransactionStatus.COMPLETED);
            } else {
                result.setStatus(PaymentTransaction.TransactionStatus.FAILED);
                result.setErrorMessage("Payment failed with return code: " + returnCode);
            }
            
        } catch (Exception e) {
            log.error("Error verifying ZaloPay payment", e);
            result.setVerified(false);
            result.setErrorMessage(e.getMessage());
        }
        
        return result;
    }

    @Override
    public RefundResponse processRefund(String gatewayTransactionId, BigDecimal amount, String reason) {
        RefundResponse response = new RefundResponse();
        
        try {
            // Implement ZaloPay refund API call
            log.info("Processing ZaloPay refund for transaction: {}, amount: {}, reason: {}", 
                    gatewayTransactionId, amount, reason);
            
            // In production, make actual HTTP POST request to ZaloPay refund API
            response.setSuccess(true);
            response.setRefundTransactionId(UUID.randomUUID().toString());
            response.setRefundAmount(amount);
            
        } catch (Exception e) {
            log.error("Error processing ZaloPay refund", e);
            response.setSuccess(false);
            response.setErrorMessage(e.getMessage());
        }
        
        return response;
    }

    @Override
    public PaymentStatus checkPaymentStatus(String gatewayTransactionId) {
        PaymentStatus status = new PaymentStatus();
        
        try {
            // Implement ZaloPay payment status query API
            log.info("Checking ZaloPay payment status for: {}", gatewayTransactionId);
            
            // In production, make actual HTTP GET request to ZaloPay query API
            status.setStatus(PaymentTransaction.TransactionStatus.PROCESSING);
            status.setGatewayTransactionId(gatewayTransactionId);
            
        } catch (Exception e) {
            log.error("Error checking ZaloPay payment status", e);
        }
        
        return status;
    }

    private String getApiUrl() {
        return "sandbox".equals(environment) ? ZALOPAY_API_URL_SANDBOX : ZALOPAY_API_URL_PRODUCTION;
    }
}
