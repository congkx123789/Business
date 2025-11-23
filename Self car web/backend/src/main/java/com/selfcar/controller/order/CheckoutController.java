package com.selfcar.controller.order;

import com.selfcar.dto.common.ApiResponse;
import com.selfcar.security.UserPrincipal;
import com.selfcar.saga.SagaCoordinator;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class CheckoutController {

    private final SagaCoordinator sagaCoordinator;

    @PostMapping("/checkout")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<?> checkout(@RequestBody CheckoutRequest request,
                                      @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            if (userPrincipal == null || userPrincipal.getUser() == null) {
                return ResponseEntity.status(401).body(new ApiResponse(false, "Authentication required"));
            }
            Long userId = userPrincipal.getUser().getId();
            String sagaId = sagaCoordinator.startSaga(request.getListingId(), userId, request.getTransactionId(), request.getAmountMinor());
            return ResponseEntity.ok(new ApiResponse(true, sagaId));
        } catch (Exception e) {
            log.error("Checkout failed", e);
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @Data
    public static class CheckoutRequest {
        private Long listingId;
        private String transactionId;
        private long amountMinor;
    }
}


