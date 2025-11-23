package com.selfcar.controller.i18n;

import com.selfcar.model.i18n.SupportedCurrency;
import com.selfcar.model.i18n.SupportedLanguage;
import com.selfcar.service.i18n.I18nService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/i18n")
@RequiredArgsConstructor
public class I18nController {

    private final I18nService i18nService;
    
    // Supported locale codes (BCP-47)
    private static final List<String> SUPPORTED_LOCALES = Arrays.asList("en", "en-US", "th", "th-TH");
    private static final String DEFAULT_LOCALE = "en";

    @GetMapping("/languages")
    public ResponseEntity<List<SupportedLanguage>> getActiveLanguages() {
        return ResponseEntity.ok(i18nService.getActiveLanguages());
    }

    @GetMapping("/languages/default")
    public ResponseEntity<SupportedLanguage> getDefaultLanguage() {
        return ResponseEntity.ok(i18nService.getDefaultLanguage());
    }

    @GetMapping("/currencies")
    public ResponseEntity<List<SupportedCurrency>> getActiveCurrencies() {
        return ResponseEntity.ok(i18nService.getActiveCurrencies());
    }

    @GetMapping("/currencies/default")
    public ResponseEntity<SupportedCurrency> getDefaultCurrency() {
        return ResponseEntity.ok(i18nService.getDefaultCurrency());
    }

    @GetMapping("/convert-currency")
    public ResponseEntity<?> convertCurrency(
            @RequestParam BigDecimal amount,
            @RequestParam String fromCurrency,
            @RequestParam String toCurrency) {
        try {
            BigDecimal converted = i18nService.convertCurrency(amount, fromCurrency, toCurrency);
            return ResponseEntity.ok(Map.of(
                    "amount", amount,
                    "fromCurrency", fromCurrency,
                    "toCurrency", toCurrency,
                    "convertedAmount", converted
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/translations/{languageCode}")
    public ResponseEntity<Map<String, String>> getTranslations(@PathVariable String languageCode) {
        return ResponseEntity.ok(i18nService.getAllTranslations(languageCode));
    }

    @GetMapping("/translations/{languageCode}/category/{category}")
    public ResponseEntity<Map<String, String>> getTranslationsByCategory(
            @PathVariable String languageCode,
            @PathVariable String category) {
        return ResponseEntity.ok(i18nService.getTranslationsByCategory(category, languageCode));
    }

    @GetMapping("/translate")
    public ResponseEntity<?> translate(
            @RequestParam String key,
            @RequestParam String languageCode) {
        String translation = i18nService.translate(key, languageCode);
        return ResponseEntity.ok(Map.of("key", key, "translation", translation));
    }

    /**
     * Detect locale from Accept-Language header for SSR
     * Supports quality values (q) and fallback to default locale
     * 
     * Priority:
     * 1. Exact match with supported locale
     * 2. Language code match (e.g., "th" for "th-TH")
     * 3. Default locale (en)
     */
    @GetMapping("/detect-locale")
    public ResponseEntity<Map<String, String>> detectLocale(HttpServletRequest request) {
        String acceptLanguage = request.getHeader("Accept-Language");
        String detectedLocale = detectLocaleFromHeader(acceptLanguage);
        
        return ResponseEntity.ok(Map.of(
            "locale", detectedLocale,
            "language", detectedLocale.split("-")[0]
        ));
    }

    /**
     * Parse Accept-Language header and return best matching locale
     */
    private String detectLocaleFromHeader(String acceptLanguage) {
        if (acceptLanguage == null || acceptLanguage.trim().isEmpty()) {
            return DEFAULT_LOCALE;
        }

        // Parse Accept-Language header (e.g., "en-US,en;q=0.9,th;q=0.8")
        List<LocaleQuality> localeQualities = parseAcceptLanguage(acceptLanguage);

        // First, try exact match
        for (LocaleQuality lq : localeQualities) {
            String normalized = normalizeLocale(lq.locale);
            if (SUPPORTED_LOCALES.contains(normalized)) {
                return normalized;
            }
        }

        // Then, try language code match (e.g., "th" matches "th-TH")
        for (LocaleQuality lq : localeQualities) {
            String languageCode = lq.locale.split("-")[0].toLowerCase();
            for (String supported : SUPPORTED_LOCALES) {
                if (supported.toLowerCase().startsWith(languageCode)) {
                    return supported;
                }
            }
        }

        return DEFAULT_LOCALE;
    }

    /**
     * Parse Accept-Language header into list of LocaleQuality objects
     */
    private List<LocaleQuality> parseAcceptLanguage(String acceptLanguage) {
        return Arrays.stream(acceptLanguage.split(","))
            .map(String::trim)
            .map(part -> {
                String[] parts = part.split(";");
                String locale = parts[0].trim();
                double quality = 1.0;
                
                if (parts.length > 1) {
                    String qPart = parts[1].trim();
                    if (qPart.startsWith("q=")) {
                        try {
                            quality = Double.parseDouble(qPart.substring(2));
                        } catch (NumberFormatException e) {
                            quality = 1.0;
                        }
                    }
                }
                
                return new LocaleQuality(locale, quality);
            })
            .sorted((a, b) -> Double.compare(b.quality, a.quality)) // Sort by quality descending
            .collect(Collectors.toList());
    }

    /**
     * Normalize locale code (e.g., "en_US" -> "en-US")
     */
    private String normalizeLocale(String locale) {
        return locale.replace("_", "-");
    }

    /**
     * Helper class for locale with quality value
     */
    private static class LocaleQuality {
        final String locale;
        final double quality;

        LocaleQuality(String locale, double quality) {
            this.locale = locale;
            this.quality = quality;
        }
    }
}

