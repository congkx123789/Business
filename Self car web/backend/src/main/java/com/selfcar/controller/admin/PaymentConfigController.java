package com.selfcar.controller.admin;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/admin/payments")
@RequiredArgsConstructor
public class PaymentConfigController {

    @Value("${payment.momo.environment:sandbox}")
    private String momoEnvironment;

    @Value("${payment.zalopay.environment:sandbox}")
    private String zaloEnvironment;

    @Value("${payment.stripe.environment:sandbox}")
    private String stripeEnvironment;

    @Value("${payment.momo.partner-code:}")
    private String momoPartnerCode;

    @Value("${payment.momo.access-key:}")
    private String momoAccessKey;

    @Value("${payment.momo.secret-key:}")
    private String momoSecretKey;

    @Value("${payment.zalopay.app-id:}")
    private String zaloAppId;

    @Value("${payment.zalopay.key1:}")
    private String zaloKey1;

    @Value("${payment.zalopay.key2:}")
    private String zaloKey2;

    @Value("${payment.stripe.publishable-key:}")
    private String stripePublishableKey;

    @Value("${payment.stripe.secret-key:}")
    private String stripeSecretKey;

    @Value("${payment.stripe.connect-client-id:}")
    private String stripeConnectClientId;

    @GetMapping("/config")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getPaymentsConfig() {
        Map<String, Object> result = new HashMap<>();

        Map<String, Object> momo = new HashMap<>();
        momo.put("environment", momoEnvironment);
        momo.put("configured", isSet(momoPartnerCode) && isSet(momoAccessKey) && isSet(momoSecretKey));

        Map<String, Object> zalo = new HashMap<>();
        zalo.put("environment", zaloEnvironment);
        zalo.put("configured", isSet(zaloAppId) && isSet(zaloKey1) && isSet(zaloKey2));

        Map<String, Object> stripe = new HashMap<>();
        stripe.put("environment", stripeEnvironment);
        stripe.put("configured", isSet(stripePublishableKey) && isSet(stripeSecretKey) && isSet(stripeConnectClientId));

        // All gateways should be sandbox in non-prod
        Map<String, Object> checks = new HashMap<>();
        checks.put("allSandbox", isSandbox(momoEnvironment) && isSandbox(zaloEnvironment) && isSandbox(stripeEnvironment));

        result.put("momo", momo);
        result.put("zalopay", zalo);
        result.put("stripe", stripe);
        result.put("checks", checks);

        return ResponseEntity.ok(result);
    }

    private static boolean isSet(String v) {
        return v != null && !v.isBlank();
    }

    private static boolean isSandbox(String v) {
        String s = v == null ? "" : v.toLowerCase();
        return s.contains("sandbox") || s.contains("test");
    }
}


