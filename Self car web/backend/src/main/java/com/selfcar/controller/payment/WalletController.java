package com.selfcar.controller.payment;

import com.selfcar.dto.common.ApiResponse;
import com.selfcar.model.payment.PaymentTransaction;
import com.selfcar.model.auth.User;
import com.selfcar.service.payment.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/wallet")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;

    @PostMapping("/escrow/hold")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<?> holdEscrow(@RequestParam Long buyerId,
                                        @RequestParam BigDecimal amount,
                                        @RequestParam(required = false) String description) {
        try {
            if (buyerId == null || amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "Invalid parameters"));
            }
            User buyer = new User();
            buyer.setId(buyerId);
            PaymentTransaction tx = walletService.holdEscrow(buyer, amount, description);
            return ResponseEntity.ok(tx);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/escrow/release")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SELLER')")
    public ResponseEntity<?> releaseEscrow(@RequestParam String transactionId,
                                           @RequestParam Long sellerId,
                                           @RequestParam(required = false) String reason) {
        try {
            if (transactionId == null || transactionId.isBlank() || sellerId == null) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "Invalid parameters"));
            }
            User seller = new User();
            seller.setId(sellerId);
            PaymentTransaction tx = walletService.releaseEscrowToSeller(transactionId, seller, reason);
            return ResponseEntity.ok(tx);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/escrow/refund")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> refundEscrow(@RequestParam String transactionId,
                                          @RequestParam(required = false) String reason) {
        try {
            if (transactionId == null || transactionId.isBlank()) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "Transaction ID is required"));
            }
            PaymentTransaction tx = walletService.refundEscrowToBuyer(transactionId, reason);
            return ResponseEntity.ok(tx);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }
}


