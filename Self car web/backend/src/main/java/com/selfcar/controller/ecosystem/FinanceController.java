package com.selfcar.controller.ecosystem;

import com.selfcar.dto.common.ApiResponse;
import com.selfcar.model.ecosystem.FinanceApplication;
import com.selfcar.model.ecosystem.FinancePartner;
import com.selfcar.model.ecosystem.FinanceProduct;
import com.selfcar.service.ecosystem.FinanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/finance")
@RequiredArgsConstructor
public class FinanceController {

    private final FinanceService financeService;

    @GetMapping("/partners")
    public ResponseEntity<List<FinancePartner>> getAllPartners() {
        return ResponseEntity.ok(financeService.getAllPartners());
    }

    @GetMapping("/partners/{type}")
    public ResponseEntity<List<FinancePartner>> getPartnersByType(@PathVariable FinancePartner.PartnerType type) {
        return ResponseEntity.ok(financeService.getActivePartners(type));
    }

    @GetMapping("/products/partner/{partnerId}")
    public ResponseEntity<List<FinanceProduct>> getProductsByPartner(@PathVariable Long partnerId) {
        return ResponseEntity.ok(financeService.getProductsByPartner(partnerId));
    }

    @GetMapping("/products/type/{productType}")
    public ResponseEntity<List<FinanceProduct>> getProductsByType(@PathVariable FinanceProduct.ProductType productType) {
        return ResponseEntity.ok(financeService.getProductsByType(productType));
    }

    @GetMapping("/applications/user/{userId}")
    public ResponseEntity<List<FinanceApplication>> getApplicationsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(financeService.getApplicationsByUser(userId));
    }

    @PostMapping("/applications")
    public ResponseEntity<?> createApplication(
            @RequestParam Long userId,
            @RequestParam Long carId,
            @RequestParam Long productId,
            @RequestParam BigDecimal requestedAmount) {
        try {
            return ResponseEntity.ok(financeService.createApplication(userId, carId, productId, requestedAmount));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/applications/{applicationId}/approve")
    public ResponseEntity<?> approveApplication(
            @PathVariable Long applicationId,
            @RequestParam BigDecimal approvalAmount,
            @RequestParam BigDecimal interestRate,
            @RequestParam Integer tenureMonths) {
        try {
            return ResponseEntity.ok(financeService.approveApplication(applicationId, approvalAmount, interestRate, tenureMonths));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/applications/{applicationId}/reject")
    public ResponseEntity<?> rejectApplication(
            @PathVariable Long applicationId,
            @RequestParam String rejectionReason) {
        try {
            return ResponseEntity.ok(financeService.rejectApplication(applicationId, rejectionReason));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
}

