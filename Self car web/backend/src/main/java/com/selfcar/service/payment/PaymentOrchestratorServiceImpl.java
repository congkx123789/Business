package com.selfcar.service.payment;

import com.selfcar.model.payment.PaymentTransaction;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;

import java.util.EnumMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentOrchestratorServiceImpl implements PaymentOrchestratorService {

    private final ApplicationContext applicationContext;
    private Map<PaymentTransaction.PaymentGateway, PaymentGatewayService> cache;

    @Override
    public PaymentGatewayService getGateway(PaymentTransaction.PaymentGateway gateway) {
        if (cache == null) {
            cache = new EnumMap<>(PaymentTransaction.PaymentGateway.class);
            // Beans discovered by type
            PaymentGatewayService stripe = applicationContext.getBean("stripeConnectGatewayService", PaymentGatewayService.class);
            PaymentGatewayService zalo = applicationContext.getBean("zaloPayGatewayService", PaymentGatewayService.class);
            // Momo may be added later; guard missing bean
            PaymentGatewayService momo = null;
            try {
                momo = applicationContext.getBean("momoGatewayService", PaymentGatewayService.class);
            } catch (Exception e) {
                // Momo gateway bean not available, optional dependency
                log.debug("Momo gateway service not available: {}", e.getMessage());
            }

            cache.put(PaymentTransaction.PaymentGateway.STRIPE_CONNECT, stripe);
            cache.put(PaymentTransaction.PaymentGateway.ZALOPAY, zalo);
            if (momo != null) {
                cache.put(PaymentTransaction.PaymentGateway.MOMO, momo);
            }
        }
        PaymentGatewayService svc = cache.get(gateway);
        if (svc == null) {
            throw new IllegalArgumentException("Unsupported gateway: " + gateway);
        }
        return svc;
    }
}


