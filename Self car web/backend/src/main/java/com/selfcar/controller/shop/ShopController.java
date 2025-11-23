package com.selfcar.controller.shop;

import com.selfcar.dto.common.ApiResponse;
import com.selfcar.model.auth.User;
import com.selfcar.model.shop.Shop;
import com.selfcar.repository.shop.ShopRepository;
import com.selfcar.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/shops")
@RequiredArgsConstructor
public class ShopController {

    private final ShopRepository shopRepository;

    @PostMapping
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<?> createShop(@AuthenticationPrincipal UserPrincipal principal,
                                        @RequestBody Shop shop) {
        try {
            if (principal == null || principal.getUser() == null) {
                return ResponseEntity.status(401).body(new ApiResponse(false, "Authentication required"));
            }
            shop.setOwner(principal.getUser());
            Shop saved = shopRepository.save(shop);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<?> updateShop(@PathVariable Long id,
                                        @RequestBody Shop updates,
                                        @AuthenticationPrincipal UserPrincipal principal) {
        try {
            if (id == null) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "Shop ID is required"));
            }
            if (principal == null || principal.getUser() == null) {
                return ResponseEntity.status(401).body(new ApiResponse(false, "Authentication required"));
            }
            Shop shop = shopRepository.findById(id).orElseThrow(() -> new RuntimeException("Shop not found"));
            if (!principal.getUser().getRole().equals(User.Role.ADMIN) &&
                !shop.getOwner().getId().equals(principal.getUser().getId())) {
                return ResponseEntity.status(403).body(new ApiResponse(false, "Forbidden"));
            }
            if (updates.getName() != null) shop.setName(updates.getName());
            if (updates.getDescription() != null) shop.setDescription(updates.getDescription());
            if (updates.getLogoUrl() != null) shop.setLogoUrl(updates.getLogoUrl());
            if (updates.getBannerUrl() != null) shop.setBannerUrl(updates.getBannerUrl());
            if (updates.getAddress() != null) shop.setAddress(updates.getAddress());
            if (updates.getPickupPoints() != null) shop.setPickupPoints(updates.getPickupPoints());
            if (updates.getIntroVideoUrl() != null) shop.setIntroVideoUrl(updates.getIntroVideoUrl());
            @SuppressWarnings("null")
            Shop saved = shopRepository.save(shop);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }
}


