package com.selfcar.dto.payment;

import com.selfcar.model.payment.PaymentTransaction;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponseDTO {
    
    private Long id;
    private String transactionId;
    private Long bookingId;
    private PaymentTransaction.TransactionType type;
    private PaymentTransaction.TransactionStatus status;
    private PaymentTransaction.PaymentGateway gateway;
    private BigDecimal amount;
    private BigDecimal feeAmount;
    private BigDecimal netAmount;
    private String currency;
    private String gatewayTransactionId;
    private String paymentUrl;
    private String qrCode;
    private String description;
    private String failureReason;
    private LocalDateTime createdAt;
    private LocalDateTime processedAt;
}
