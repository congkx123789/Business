package com.selfcar.service.translation;

import com.google.cloud.translate.Translate;
import com.google.cloud.translate.TranslateOptions;
import com.google.cloud.translate.Translation;
import com.google.cloud.translate.Detection;
import com.selfcar.config.TranslationConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Google Cloud Translation API Provider
 * 
 * Uses Basic model (not LLM models) to stay within free tier.
 * Free tier: 500,000 characters/month
 */
@Slf4j
@Component
@ConditionalOnProperty(name = "translation.google.enabled", havingValue = "true")
@RequiredArgsConstructor
public class GoogleTranslationProvider {
    
    private final TranslationConfig config;
    private Translate translate;
    private boolean available = false;
    
    @PostConstruct
    public void init() {
        try {
            // Initialize Google Cloud Translation client
            if (config.getGoogleApiKey() != null && !config.getGoogleApiKey().isEmpty()) {
                // Use API key authentication (simpler setup)
                // Note: setApiKey is deprecated, but still works. For production, use service account.
                System.setProperty("GOOGLE_API_KEY", config.getGoogleApiKey());
                translate = TranslateOptions.getDefaultInstance().getService();
                available = true;
                log.info("Google Cloud Translation API initialized with API key");
            } else if (config.getGoogleCredentialsPath() != null && !config.getGoogleCredentialsPath().isEmpty()) {
                // Use service account credentials
                System.setProperty("GOOGLE_APPLICATION_CREDENTIALS", config.getGoogleCredentialsPath());
                translate = TranslateOptions.getDefaultInstance().getService();
                available = true;
                log.info("Google Cloud Translation API initialized with service account");
            } else {
                log.warn("Google Cloud Translation API not configured - missing API key or credentials");
            }
        } catch (Exception e) {
            log.error("Failed to initialize Google Cloud Translation API: {}", e.getMessage(), e);
            available = false;
        }
    }
    
    public boolean isAvailable() {
        return available && translate != null;
    }
    
    /**
     * Translate text using Google Cloud Translation API
     * Uses Basic model (not LLM) to stay within free tier
     */
    public String translate(String text, String sourceLanguage, String targetLanguage) {
        if (!isAvailable()) {
            throw new IllegalStateException("Google Cloud Translation API not available");
        }
        
        try {
            Translate.TranslateOption[] options = {
                Translate.TranslateOption.targetLanguage(targetLanguage),
                Translate.TranslateOption.model("base") // Use Basic model (free tier)
            };
            
            if (sourceLanguage != null && !sourceLanguage.isEmpty() && !sourceLanguage.equals("auto")) {
                options = new Translate.TranslateOption[]{
                    Translate.TranslateOption.sourceLanguage(sourceLanguage),
                    Translate.TranslateOption.targetLanguage(targetLanguage),
                    Translate.TranslateOption.model("base")
                };
            }
            
            Translation translation = translate.translate(text, options);
            return translation.getTranslatedText();
            
        } catch (Exception e) {
            log.error("Google Cloud Translation failed: {}", e.getMessage(), e);
            throw new RuntimeException("Translation failed", e);
        }
    }
    
    /**
     * Batch translate multiple texts (more efficient)
     */
    public Map<String, String> translateBatch(List<String> texts, String sourceLanguage, String targetLanguage) {
        if (!isAvailable()) {
            throw new IllegalStateException("Google Cloud Translation API not available");
        }
        
        try {
            List<Translation> translations = translate.translate(
                texts,
                Translate.TranslateOption.sourceLanguage(sourceLanguage != null ? sourceLanguage : "auto"),
                Translate.TranslateOption.targetLanguage(targetLanguage),
                Translate.TranslateOption.model("base")
            );
            
            Map<String, String> result = new HashMap<>();
            for (int i = 0; i < texts.size(); i++) {
                result.put(texts.get(i), translations.get(i).getTranslatedText());
            }
            return result;
            
        } catch (Exception e) {
            log.error("Google Cloud batch translation failed: {}", e.getMessage(), e);
            throw new RuntimeException("Batch translation failed", e);
        }
    }
    
    /**
     * Detect language of text
     */
    public String detectLanguage(String text) {
        if (!isAvailable()) {
            throw new IllegalStateException("Google Cloud Translation API not available");
        }
        
        try {
            List<Detection> detections = translate.detect(List.of(text));
            return detections.get(0).getLanguage();
        } catch (Exception e) {
            log.error("Language detection failed: {}", e.getMessage(), e);
            throw new RuntimeException("Language detection failed", e);
        }
    }
    
    /**
     * Get supported languages
     */
    public List<String> getSupportedLanguages() {
        if (!isAvailable()) {
            return List.of();
        }
        
        try {
            return translate.listSupportedLanguages().stream()
                .map(lang -> lang.getCode())
                .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Failed to get supported languages: {}", e.getMessage(), e);
            return List.of("en", "th"); // Default fallback
        }
    }
}

