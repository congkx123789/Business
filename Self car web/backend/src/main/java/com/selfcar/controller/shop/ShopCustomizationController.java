package com.selfcar.controller.shop;

import com.selfcar.dto.common.ApiResponse;
import com.selfcar.model.shop.Shop;
import com.selfcar.repository.shop.ShopRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/shops")
@RequiredArgsConstructor
public class ShopCustomizationController {

    private final ShopRepository shopRepository;

    @GetMapping("/{id}/customization")
    public ResponseEntity<Shop> getShopCustomization(@PathVariable Long id) {
        if (id == null) {
            return ResponseEntity.badRequest().build();
        }
        Shop shop = shopRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shop not found"));
        return ResponseEntity.ok(shop);
    }

    @PutMapping("/{id}/customization")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<?> updateShopCustomization(@PathVariable Long id, @RequestBody Map<String, String> customization) {
        try {
            if (id == null) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "Shop ID is required"));
            }
            Shop shop = shopRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Shop not found"));

            if (customization.containsKey("primaryColor")) {
                shop.setPrimaryColor(customization.get("primaryColor"));
            }
            if (customization.containsKey("secondaryColor")) {
                shop.setSecondaryColor(customization.get("secondaryColor"));
            }
            if (customization.containsKey("introVideoUrl")) {
                shop.setIntroVideoUrl(customization.get("introVideoUrl"));
            }
            if (customization.containsKey("featuredListings")) {
                shop.setFeaturedListings(customization.get("featuredListings"));
            }
            if (customization.containsKey("customBannerUrl")) {
                shop.setCustomBannerUrl(customization.get("customBannerUrl"));
            }
            if (customization.containsKey("bannerUrl")) {
                shop.setBannerUrl(customization.get("bannerUrl"));
            }
            if (customization.containsKey("logoUrl")) {
                shop.setLogoUrl(customization.get("logoUrl"));
            }

            @SuppressWarnings("null")
            Shop updated = shopRepository.save(shop);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
}
