package com.selfcar.controller.monetization;

import com.selfcar.dto.common.ApiResponse;
import com.selfcar.model.monetization.DealerSubscription;
import com.selfcar.model.monetization.SubscriptionPlan;
import com.selfcar.service.monetization.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    @GetMapping("/plans")
    public ResponseEntity<List<SubscriptionPlan>> getAllPlans() {
        return ResponseEntity.ok(subscriptionService.getAllPlans());
    }

    @GetMapping("/plans/{id}")
    public ResponseEntity<SubscriptionPlan> getPlanById(@PathVariable Long id) {
        return ResponseEntity.ok(subscriptionService.getPlanById(id));
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<List<DealerSubscription>> getSubscriptionsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(subscriptionService.getSubscriptionsByUser(userId));
    }

    @GetMapping("/users/{userId}/active")
    public ResponseEntity<?> getActiveSubscription(@PathVariable Long userId) {
        DealerSubscription subscription = subscriptionService.getActiveSubscription(userId);
        if (subscription == null) {
            return ResponseEntity.ok(new ApiResponse(false, "No active subscription found"));
        }
        return ResponseEntity.ok(subscription);
    }

    @PostMapping("/subscribe")
    public ResponseEntity<?> createSubscription(
            @RequestParam Long userId,
            @RequestParam Long planId,
            @RequestParam DealerSubscription.BillingCycle billingCycle) {
        try {
            return ResponseEntity.ok(subscriptionService.createSubscription(userId, planId, billingCycle));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/{subscriptionId}/cancel")
    public ResponseEntity<?> cancelSubscription(
            @PathVariable Long subscriptionId,
            @RequestParam(required = false) String reason) {
        try {
            return ResponseEntity.ok(subscriptionService.cancelSubscription(subscriptionId, reason));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
}

