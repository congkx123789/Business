package com.selfcar.controller.user;

import com.selfcar.dto.common.ApiResponse;
import com.selfcar.dto.user.PreferencesRequest;
import com.selfcar.dto.user.PreferencesResponse;
import com.selfcar.security.UserPrincipal;
import com.selfcar.service.user.UserPreferencesService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * User Preferences Controller
 * 
 * Handles user preference updates (locale, theme, currency, units, etc.)
 * PATCH /api/users/me/preferences
 */
@RestController
@RequestMapping("/api/users/me")
@RequiredArgsConstructor
public class UserPreferencesController {

    private final UserPreferencesService preferencesService;

    /**
     * Get current user preferences
     */
    @GetMapping("/preferences")
    public ResponseEntity<ApiResponse> getPreferences(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            PreferencesResponse preferences = preferencesService.getPreferences(userPrincipal.getId());
            return ResponseEntity.ok(new ApiResponse(true, "Preferences retrieved successfully", preferences));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, "Failed to retrieve preferences: " + e.getMessage()));
        }
    }

    /**
     * Update user preferences
     * PATCH /api/users/me/preferences
     * 
     * Accepts partial updates: { locale, theme, currency, units, reducedMotion, highContrast }
     */
    @PatchMapping("/preferences")
    public ResponseEntity<ApiResponse> updatePreferences(
            @Valid @RequestBody PreferencesRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            PreferencesResponse updated = preferencesService.updatePreferences(
                    userPrincipal.getId(), request);
            return ResponseEntity.ok(new ApiResponse(true, "Preferences updated successfully", updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, "Failed to update preferences: " + e.getMessage()));
        }
    }
}

