package com.selfcar.service.payment;

import com.selfcar.model.payment.PaymentTransaction;

public interface PaymentOrchestratorService {
    PaymentGatewayService getGateway(PaymentTransaction.PaymentGateway gateway);
}


