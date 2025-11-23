package com.selfcar.dto.user;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Preferences Response DTO
 * 
 * Returns current user preferences.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PreferencesResponse {
    private String locale;
    private String theme;
    private String currency;
    private String units;
    private Boolean reducedMotion;
    private Boolean highContrast;
    private String updatedAt;
}

