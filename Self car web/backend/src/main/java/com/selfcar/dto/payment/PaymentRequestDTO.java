package com.selfcar.dto.payment;

import com.selfcar.model.payment.PaymentTransaction;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PaymentRequestDTO {
    
    @NotNull(message = "Booking ID is required")
    private Long bookingId;
    
    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private BigDecimal amount;
    
    @NotNull(message = "Payment gateway is required")
    private PaymentTransaction.PaymentGateway gateway;
    
    private String returnUrl;
    
    private String cancelUrl;
}
