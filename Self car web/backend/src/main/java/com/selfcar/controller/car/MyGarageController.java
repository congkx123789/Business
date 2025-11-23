package com.selfcar.controller.car;

import com.selfcar.dto.common.ApiResponse;
import com.selfcar.model.shop.Shop;
import com.selfcar.model.shop.ShopReview;
import com.selfcar.repository.shop.ShopRepository;
import com.selfcar.repository.shop.ShopReviewRepository;
import com.selfcar.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/my-garage")
@RequiredArgsConstructor
public class MyGarageController {

    private final ShopRepository shopRepository;
    private final ShopReviewRepository shopReviewRepository;

    @GetMapping("/profile")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<?> profile(@AuthenticationPrincipal UserPrincipal principal) {
        try {
            Shop shop = shopRepository.findByOwnerId(principal.getUser().getId()).stream().findFirst()
                    .orElseThrow(() -> new RuntimeException("Shop not found"));
            Map<String, Object> resp = new HashMap<>();
            resp.put("shop", shop);
            resp.put("bannerUrl", shop.getBannerUrl());
            resp.put("logoUrl", shop.getLogoUrl());
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            log.error("Error getting profile for user id: {}", principal.getUser().getId(), e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/reviews")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<?> reviews(@AuthenticationPrincipal UserPrincipal principal) {
        try {
            Shop shop = shopRepository.findByOwnerId(principal.getUser().getId()).stream().findFirst()
                    .orElseThrow(() -> new RuntimeException("Shop not found"));
            return ResponseEntity.ok(shopReviewRepository.findByShopIdOrderByCreatedAtDesc(shop.getId()));
        } catch (Exception e) {
            log.error("Error getting reviews for user id: {}", principal.getUser().getId(), e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
}