package com.selfcar.service.user;

import com.selfcar.dto.user.PreferencesRequest;
import com.selfcar.dto.user.PreferencesResponse;
import com.selfcar.model.auth.User;
import com.selfcar.repository.auth.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * User Preferences Service
 * 
 * Handles user preference storage and retrieval.
 * Preferences are stored as JSON in a preferences column or as separate fields.
 */
@Service
@RequiredArgsConstructor
public class UserPreferencesService {

    private final UserRepository userRepository;

    /**
     * Get user preferences
     */
    public PreferencesResponse getPreferences(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // For now, return defaults if preferences not stored
        // In production, you might store preferences in a separate table or JSON column
        PreferencesResponse response = new PreferencesResponse();
        response.setLocale(getUserPreference(user, "locale", "en"));
        response.setTheme(getUserPreference(user, "theme", "system"));
        response.setCurrency(getUserPreference(user, "currency", "USD"));
        response.setUnits(getUserPreference(user, "units", "metric"));
        response.setReducedMotion(getUserPreferenceBoolean(user, "reducedMotion", false));
        response.setHighContrast(getUserPreferenceBoolean(user, "highContrast", false));
        response.setUpdatedAt(user.getUpdatedAt() != null 
                ? user.getUpdatedAt().format(DateTimeFormatter.ISO_DATE_TIME)
                : LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));

        return response;
    }

    /**
     * Update user preferences (partial update)
     */
    @Transactional
    public PreferencesResponse updatePreferences(Long userId, PreferencesRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Update preferences (store in a JSON column or separate table in production)
        // For now, we'll use a simple approach - in production, create a UserPreferences entity
        
        // Update user's updatedAt timestamp
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        // Return updated preferences
        PreferencesResponse response = new PreferencesResponse();
        response.setLocale(request.getLocale() != null ? request.getLocale() : getUserPreference(user, "locale", "en"));
        response.setTheme(request.getTheme() != null ? request.getTheme() : getUserPreference(user, "theme", "system"));
        response.setCurrency(request.getCurrency() != null ? request.getCurrency() : getUserPreference(user, "currency", "USD"));
        response.setUnits(request.getUnits() != null ? request.getUnits() : getUserPreference(user, "units", "metric"));
        response.setReducedMotion(request.getReducedMotion() != null 
                ? request.getReducedMotion() 
                : getUserPreferenceBoolean(user, "reducedMotion", false));
        response.setHighContrast(request.getHighContrast() != null 
                ? request.getHighContrast() 
                : getUserPreferenceBoolean(user, "highContrast", false));
        response.setUpdatedAt(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));

        // TODO: In production, persist preferences to a UserPreferences entity or JSON column
        // For now, preferences are stored in localStorage on the frontend
        
        return response;
    }

    /**
     * Helper to get user preference (placeholder - in production, use UserPreferences entity)
     */
    private String getUserPreference(User user, String key, String defaultValue) {
        // In production, fetch from UserPreferences entity or JSON column
        // For now, return default
        return defaultValue;
    }

    /**
     * Helper to get boolean user preference
     */
    private Boolean getUserPreferenceBoolean(User user, String key, Boolean defaultValue) {
        // In production, fetch from UserPreferences entity or JSON column
        // For now, return default
        return defaultValue;
    }
}

