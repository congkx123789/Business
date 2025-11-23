package com.selfcar.service.translation;

import com.selfcar.config.TranslationConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import jakarta.annotation.PostConstruct;
import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * LibreTranslate Provider (Self-hosted fallback)
 * 
 * Free, open-source translation API that can be self-hosted.
 * Used as fallback when Google Cloud Translation is unavailable or quota exceeded.
 */
@Slf4j
@Component
@ConditionalOnProperty(name = "translation.libretranslate.enabled", havingValue = "true")
@RequiredArgsConstructor
public class LibreTranslateProvider {
    
    private final TranslationConfig config;
    private WebClient webClient;
    private boolean available = false;
    
    @PostConstruct
    public void init() {
        try {
            webClient = WebClient.builder()
                .baseUrl(config.getLibreTranslateBaseUrl())
                .defaultHeader("Content-Type", "application/json")
                .build();
            
            // Test connection
            testConnection();
            log.info("LibreTranslate provider initialized at {}", config.getLibreTranslateBaseUrl());
        } catch (Exception e) {
            log.warn("LibreTranslate provider not available: {}", e.getMessage());
            available = false;
        }
    }
    
    @SuppressWarnings("unchecked")
    private void testConnection() {
        try {
            Map<String, Object> response = webClient.get()
                .uri("/languages")
                .retrieve()
                .bodyToMono(Map.class)
                .timeout(Duration.ofSeconds(5))
                .block();
            
            if (response != null) {
                available = true;
            }
        } catch (Exception e) {
            log.debug("LibreTranslate connection test failed: {}", e.getMessage());
            available = false;
        }
    }
    
    public boolean isAvailable() {
        return available && webClient != null;
    }
    
    /**
     * Translate text using LibreTranslate API
     */
    @SuppressWarnings("unchecked")
    public String translate(String text, String sourceLanguage, String targetLanguage) {
        if (!isAvailable()) {
            throw new IllegalStateException("LibreTranslate not available");
        }
        
        try {
            Map<String, Object> request = new HashMap<>();
            request.put("q", text);
            request.put("source", sourceLanguage != null ? sourceLanguage : "auto");
            request.put("target", targetLanguage);
            if (config.getLibreTranslateApiKey() != null && !config.getLibreTranslateApiKey().isEmpty()) {
                request.put("api_key", config.getLibreTranslateApiKey());
            }
            
            Map<String, Object> response = (Map<String, Object>) webClient.post()
                .uri("/translate")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(Map.class)
                .timeout(Duration.ofSeconds(10))
                .block();
            
            if (response != null && response.containsKey("translatedText")) {
                return (String) response.get("translatedText");
            }
            
            throw new RuntimeException("Invalid response from LibreTranslate");
            
        } catch (Exception e) {
            log.error("LibreTranslate translation failed: {}", e.getMessage(), e);
            throw new RuntimeException("Translation failed", e);
        }
    }
    
    /**
     * Batch translate (LibreTranslate doesn't have native batch, so we use individual calls)
     */
    public Map<String, String> translateBatch(List<String> texts, String sourceLanguage, String targetLanguage) {
        Map<String, String> result = new HashMap<>();
        for (String text : texts) {
            result.put(text, translate(text, sourceLanguage, targetLanguage));
        }
        return result;
    }
    
    /**
     * Detect language
     */
    @SuppressWarnings("unchecked")
    public String detectLanguage(String text) {
        if (!isAvailable()) {
            throw new IllegalStateException("LibreTranslate not available");
        }
        
        try {
            Map<String, Object> request = new HashMap<>();
            request.put("q", text);
            if (config.getLibreTranslateApiKey() != null && !config.getLibreTranslateApiKey().isEmpty()) {
                request.put("api_key", config.getLibreTranslateApiKey());
            }
            
            Map<String, Object> response = (Map<String, Object>) webClient.post()
                .uri("/detect")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(Map.class)
                .timeout(Duration.ofSeconds(10))
                .block();
            
            if (response != null && response.containsKey("language")) {
                return (String) response.get("language");
            }
            
            return "en"; // Default fallback
            
        } catch (Exception e) {
            log.error("LibreTranslate language detection failed: {}", e.getMessage(), e);
            return "en";
        }
    }
    
    /**
     * Get supported languages
     */
    @SuppressWarnings("unchecked")
    public List<String> getSupportedLanguages() {
        if (!isAvailable()) {
            return List.of("en", "th"); // Default
        }
        
        try {
            List<Map<String, Object>> languages = webClient.get()
                .uri("/languages")
                .retrieve()
                .bodyToFlux(Map.class)
                .cast(Map.class)
                .map(m -> (Map<String, Object>) m)
                .collectList()
                .timeout(Duration.ofSeconds(5))
                .block();
            
            if (languages != null) {
                return languages.stream()
                    .map(lang -> (String) lang.get("code"))
                    .toList();
            }
            
            return List.of("en", "th");
            
        } catch (Exception e) {
            log.error("Failed to get supported languages: {}", e.getMessage(), e);
            return List.of("en", "th");
        }
    }
}

