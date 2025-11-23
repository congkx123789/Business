package com.selfcar.controller.payment;

import com.selfcar.model.payment.PaymentTransaction;
import com.selfcar.service.payment.PaymentGatewayService;
import com.selfcar.service.payment.PaymentOrchestratorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/payments/gateway")
@RequiredArgsConstructor
public class PaymentsController {

    private final PaymentOrchestratorService orchestrator;

    @PostMapping("/initiate")
    public ResponseEntity<PaymentGatewayService.PaymentResponse> initiate(@RequestParam PaymentTransaction.PaymentGateway gateway,
                                                                          @RequestParam String transactionId,
                                                                          @RequestParam BigDecimal amount,
                                                                          @RequestParam(defaultValue = "VND") String currency,
                                                                          @RequestParam(required = false) String description) {
        PaymentGatewayService.PaymentRequest req = new PaymentGatewayService.PaymentRequest();
        req.setTransactionId(transactionId);
        req.setAmount(amount);
        req.setCurrency(currency);
        req.setDescription(description);
        PaymentGatewayService.PaymentResponse res = orchestrator.getGateway(gateway).initiatePayment(req);
        return ResponseEntity.ok(res);
    }

    @PostMapping("/callback/{gateway}")
    public ResponseEntity<PaymentGatewayService.PaymentVerificationResult> callback(@PathVariable("gateway") String gatewayName,
                                                                                    @RequestParam String transactionId,
                                                                                    @RequestBody Map<String, String> payload) {
        PaymentTransaction.PaymentGateway gateway = PaymentTransaction.PaymentGateway.valueOf(gatewayName.toUpperCase());
        PaymentGatewayService.PaymentVerificationResult res = orchestrator.getGateway(gateway)
                .verifyPayment(transactionId, payload);
        return ResponseEntity.ok(res);
    }
}


