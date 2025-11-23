package com.selfcar.dto.user;

import jakarta.validation.constraints.Pattern;
import lombok.Data;

/**
 * Preferences Request DTO
 * 
 * Accepts user preferences updates: locale, theme, currency, units, reducedMotion, highContrast.
 */
@Data
public class PreferencesRequest {
    
    @Pattern(regexp = "^(en|en-US|th|th-TH)$", message = "Invalid locale. Supported: en, en-US, th, th-TH")
    private String locale;
    
    @Pattern(regexp = "^(light|dark|system)$", message = "Invalid theme. Supported: light, dark, system")
    private String theme;
    
    @Pattern(regexp = "^(USD|THB)$", message = "Invalid currency. Supported: USD, THB")
    private String currency;
    
    @Pattern(regexp = "^(metric|imperial)$", message = "Invalid units. Supported: metric, imperial")
    private String units;
    
    private Boolean reducedMotion;
    
    private Boolean highContrast;
}

