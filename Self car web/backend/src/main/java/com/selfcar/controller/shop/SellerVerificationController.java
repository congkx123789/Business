package com.selfcar.controller.shop;

import com.selfcar.dto.common.ApiResponse;
import com.selfcar.model.shop.SellerVerification;
import com.selfcar.security.UserPrincipal;
import com.selfcar.service.shop.SellerVerificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/seller-verification")
@RequiredArgsConstructor
public class SellerVerificationController {

    private final SellerVerificationService sellerVerificationService;

    @GetMapping("/me")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<List<SellerVerification>> mySubmissions(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(sellerVerificationService.getMySubmissions(principal.getUser().getId()));
    }

    @PostMapping("/submit")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('SELLER')")
    public ResponseEntity<?> submit(@AuthenticationPrincipal UserPrincipal principal,
                                    @RequestParam SellerVerification.VerificationType type,
                                    @RequestParam String documentNumber,
                                    @RequestParam String documentFrontUrl,
                                    @RequestParam(required = false) String documentBackUrl) {
        try {
            var sv = sellerVerificationService.submit(principal.getUser().getId(), type, documentNumber, documentFrontUrl, documentBackUrl);
            return ResponseEntity.ok(sv);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> approve(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal admin) {
        try {
            var sv = sellerVerificationService.approve(id, admin.getUser().getId());
            return ResponseEntity.ok(sv);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> reject(@PathVariable Long id, @RequestParam String reason, @AuthenticationPrincipal UserPrincipal admin) {
        try {
            var sv = sellerVerificationService.reject(id, admin.getUser().getId(), reason);
            return ResponseEntity.ok(sv);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }
}


