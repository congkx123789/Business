package com.selfcar.service.translation;

import com.selfcar.config.TranslationConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.context.annotation.Profile;

import java.util.List;
import java.util.Map;

/**
 * Translation Service
 * 
 * Provides machine translation using Google Cloud Translation API (free tier)
 * with fallback to LibreTranslate (self-hosted option).
 * 
 * Features:
 * - Translation Memory (TM) caching to stay within free tier
 * - Glossary support for brand/auto terms
 * - Auto-detect source language
 * - Batch translation support
 * 
 * Free Tier: 500,000 characters/month (Google Cloud Translation)
 */
@Slf4j
@Service
@Profile("!h2")
@RequiredArgsConstructor
public class TranslationService {
    
    private final GoogleTranslationProvider googleProvider;
    private final LibreTranslateProvider libreTranslateProvider;
    private final TranslationConfig config;
    private final GlossaryService glossaryService;
    
    /**
     * Translate text from source language to target language
     * Uses Translation Memory cache to avoid duplicate API calls
     * 
     * @param text Text to translate
     * @param sourceLanguage Source language code (null for auto-detect)
     * @param targetLanguage Target language code (e.g., "en", "th")
     * @return Translated text
     */
    @Cacheable(value = "translations", key = "#text + '_' + (#sourceLanguage != null ? #sourceLanguage : 'auto') + '_' + #targetLanguage")
    public String translate(String text, String sourceLanguage, String targetLanguage) {
        if (text == null || text.trim().isEmpty()) {
            return text;
        }
        
        // Check if already in target language
        if (sourceLanguage != null && sourceLanguage.equals(targetLanguage)) {
            return text;
        }
        
        // Validate text length
        if (text.length() > config.getMaxTextLength()) {
            throw new IllegalArgumentException(
                String.format("Text exceeds maximum length of %d characters", config.getMaxTextLength())
            );
        }
        
        // Apply glossary terms first
        String processedText = glossaryService.applyGlossary(text, sourceLanguage, targetLanguage);
        
        try {
            // Try Google Cloud Translation first (if enabled)
            if (config.isGoogleEnabled() && googleProvider.isAvailable()) {
                try {
                    String translated = googleProvider.translate(processedText, sourceLanguage, targetLanguage);
                    log.debug("Translated via Google Cloud: {} -> {}", sourceLanguage, targetLanguage);
                    return translated;
                } catch (Exception e) {
                    log.warn("Google Cloud Translation failed, trying fallback: {}", e.getMessage());
                }
            }
            
            // Fallback to LibreTranslate
            if (config.isLibreTranslateEnabled() && libreTranslateProvider.isAvailable()) {
                String translated = libreTranslateProvider.translate(processedText, sourceLanguage, targetLanguage);
                log.debug("Translated via LibreTranslate: {} -> {}", sourceLanguage, targetLanguage);
                return translated;
            }
            
            // If both fail, return original text
            log.warn("No translation provider available, returning original text");
            return text;
            
        } catch (Exception e) {
            log.error("Translation failed: {}", e.getMessage(), e);
            return text; // Return original on error
        }
    }
    
    /**
     * Batch translate multiple texts
     * More efficient than individual calls
     * 
     * @param texts List of texts to translate
     * @param sourceLanguage Source language code
     * @param targetLanguage Target language code
     * @return Map of original text to translated text
     */
    public Map<String, String> translateBatch(List<String> texts, String sourceLanguage, String targetLanguage) {
        if (texts == null || texts.isEmpty()) {
            return Map.of();
        }
        
        // Use batch API if available
        if (config.isGoogleEnabled() && googleProvider.isAvailable()) {
            try {
                return googleProvider.translateBatch(texts, sourceLanguage, targetLanguage);
            } catch (Exception e) {
                log.warn("Google batch translation failed: {}", e.getMessage());
            }
        }
        
        // Fallback to individual translations
        return texts.stream()
            .collect(java.util.stream.Collectors.toMap(
                text -> text,
                text -> translate(text, sourceLanguage, targetLanguage)
            ));
    }
    
    /**
     * Auto-detect source language
     * 
     * @param text Text to detect language for
     * @return Detected language code
     */
    public String detectLanguage(String text) {
        if (text == null || text.trim().isEmpty()) {
            return "en"; // Default
        }
        
        if (config.isGoogleEnabled() && googleProvider.isAvailable()) {
            try {
                return googleProvider.detectLanguage(text);
            } catch (Exception e) {
                log.warn("Language detection failed: {}", e.getMessage());
            }
        }
        
        // Fallback: simple heuristic
        return detectLanguageHeuristic(text);
    }
    
    /**
     * Simple heuristic language detection
     * (fallback when API unavailable)
     */
    private String detectLanguageHeuristic(String text) {
        // Check for Thai characters
        if (text.matches(".*[\\u0E00-\\u0E7F].*")) {
            return "th";
        }
        // Default to English
        return "en";
    }
    
    /**
     * Get supported languages from active provider
     */
    public List<String> getSupportedLanguages() {
        if (config.isGoogleEnabled() && googleProvider.isAvailable()) {
            return googleProvider.getSupportedLanguages();
        }
        if (config.isLibreTranslateEnabled() && libreTranslateProvider.isAvailable()) {
            return libreTranslateProvider.getSupportedLanguages();
        }
        return List.of("en", "th"); // Default supported languages
    }
}

