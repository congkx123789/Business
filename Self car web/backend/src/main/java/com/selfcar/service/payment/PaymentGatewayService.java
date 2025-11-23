package com.selfcar.service.payment;

import com.selfcar.model.payment.PaymentTransaction;

import java.math.BigDecimal;
import java.util.Map;

public interface PaymentGatewayService {
    
    /**
     * Initiate a payment through the gateway
     */
    PaymentResponse initiatePayment(PaymentRequest request);
    
    /**
     * Verify a payment callback/webhook from the gateway
     */
    PaymentVerificationResult verifyPayment(String transactionId, Map<String, String> callbackData);
    
    /**
     * Process a refund
     */
    RefundResponse processRefund(String gatewayTransactionId, BigDecimal amount, String reason);
    
    /**
     * Check payment status
     */
    PaymentStatus checkPaymentStatus(String gatewayTransactionId);
    
    class PaymentRequest {
        private String transactionId;
        private BigDecimal amount;
        private String currency;
        private String description;
        private String returnUrl;
        private String cancelUrl;
        private String customerEmail;
        private String customerPhone;
        private Map<String, String> metadata;
        
        // Getters and setters
        public String getTransactionId() { return transactionId; }
        public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }
        public String getCurrency() { return currency; }
        public void setCurrency(String currency) { this.currency = currency; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getReturnUrl() { return returnUrl; }
        public void setReturnUrl(String returnUrl) { this.returnUrl = returnUrl; }
        public String getCancelUrl() { return cancelUrl; }
        public void setCancelUrl(String cancelUrl) { this.cancelUrl = cancelUrl; }
        public String getCustomerEmail() { return customerEmail; }
        public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }
        public String getCustomerPhone() { return customerPhone; }
        public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }
        public Map<String, String> getMetadata() { return metadata; }
        public void setMetadata(Map<String, String> metadata) { this.metadata = metadata; }
    }
    
    class PaymentResponse {
        private boolean success;
        private String gatewayTransactionId;
        private String paymentUrl;
        private String qrCode;
        private String errorMessage;
        
        // Getters and setters
        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        public String getGatewayTransactionId() { return gatewayTransactionId; }
        public void setGatewayTransactionId(String gatewayTransactionId) { this.gatewayTransactionId = gatewayTransactionId; }
        public String getPaymentUrl() { return paymentUrl; }
        public void setPaymentUrl(String paymentUrl) { this.paymentUrl = paymentUrl; }
        public String getQrCode() { return qrCode; }
        public void setQrCode(String qrCode) { this.qrCode = qrCode; }
        public String getErrorMessage() { return errorMessage; }
        public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
    }
    
    class PaymentVerificationResult {
        private boolean verified;
        private PaymentTransaction.TransactionStatus status;
        private BigDecimal amount;
        private String gatewayTransactionId;
        private String errorMessage;
        
        // Getters and setters
        public boolean isVerified() { return verified; }
        public void setVerified(boolean verified) { this.verified = verified; }
        public PaymentTransaction.TransactionStatus getStatus() { return status; }
        public void setStatus(PaymentTransaction.TransactionStatus status) { this.status = status; }
        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }
        public String getGatewayTransactionId() { return gatewayTransactionId; }
        public void setGatewayTransactionId(String gatewayTransactionId) { this.gatewayTransactionId = gatewayTransactionId; }
        public String getErrorMessage() { return errorMessage; }
        public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
    }
    
    class RefundResponse {
        private boolean success;
        private String refundTransactionId;
        private BigDecimal refundAmount;
        private String errorMessage;
        
        // Getters and setters
        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        public String getRefundTransactionId() { return refundTransactionId; }
        public void setRefundTransactionId(String refundTransactionId) { this.refundTransactionId = refundTransactionId; }
        public BigDecimal getRefundAmount() { return refundAmount; }
        public void setRefundAmount(BigDecimal refundAmount) { this.refundAmount = refundAmount; }
        public String getErrorMessage() { return errorMessage; }
        public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
    }
    
    class PaymentStatus {
        private PaymentTransaction.TransactionStatus status;
        private BigDecimal amount;
        private String gatewayTransactionId;
        
        // Getters and setters
        public PaymentTransaction.TransactionStatus getStatus() { return status; }
        public void setStatus(PaymentTransaction.TransactionStatus status) { this.status = status; }
        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }
        public String getGatewayTransactionId() { return gatewayTransactionId; }
        public void setGatewayTransactionId(String gatewayTransactionId) { this.gatewayTransactionId = gatewayTransactionId; }
    }
}
