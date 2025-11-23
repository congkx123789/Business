package com.selfcar.controller.translation;

import com.selfcar.service.translation.TranslationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.context.annotation.Profile;

import java.util.List;
import java.util.Map;

/**
 * Translation Controller
 * 
 * Provides API endpoints for machine translation.
 * Never exposes API keys to the browser - all translation happens server-side.
 */
@Slf4j
@RestController
@Profile("!h2")
@RequestMapping("/api/translation")
@RequiredArgsConstructor
public class TranslationController {
    
    private final TranslationService translationService;
    
    /**
     * Translate text
     * 
     * @param request Translation request with text, source, and target language
     * @return Translated text
     */
    @PostMapping("/translate")
    public ResponseEntity<Map<String, String>> translate(@RequestBody TranslationRequest request) {
        try {
            String sourceLang = request.getSourceLanguage();
            
            // Auto-detect source language if not provided
            if (sourceLang == null || sourceLang.isEmpty() || "auto".equals(sourceLang)) {
                sourceLang = translationService.detectLanguage(request.getText());
            }
            
            String translated = translationService.translate(
                request.getText(),
                sourceLang,
                request.getTargetLanguage()
            );
            
            return ResponseEntity.ok(Map.of(
                "translatedText", translated,
                "sourceLanguage", sourceLang,
                "targetLanguage", request.getTargetLanguage()
            ));
            
        } catch (Exception e) {
            log.error("Translation failed: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Translation failed: " + e.getMessage()));
        }
    }
    
    /**
     * Batch translate multiple texts
     * More efficient than individual calls
     */
    @PostMapping("/translate/batch")
    public ResponseEntity<Map<String, Object>> translateBatch(@RequestBody BatchTranslationRequest request) {
        try {
            Map<String, String> translations = translationService.translateBatch(
                request.getTexts(),
                request.getSourceLanguage(),
                request.getTargetLanguage()
            );
            
            return ResponseEntity.ok(Map.of(
                "translations", translations,
                "sourceLanguage", request.getSourceLanguage() != null ? request.getSourceLanguage() : "auto",
                "targetLanguage", request.getTargetLanguage()
            ));
            
        } catch (Exception e) {
            log.error("Batch translation failed: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Batch translation failed: " + e.getMessage()));
        }
    }
    
    /**
     * Detect language of text
     */
    @PostMapping("/detect")
    public ResponseEntity<Map<String, String>> detectLanguage(@RequestBody Map<String, String> request) {
        try {
            String text = request.get("text");
            if (text == null || text.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Text is required"));
            }
            
            String detected = translationService.detectLanguage(text);
            
            return ResponseEntity.ok(Map.of(
                "language", detected,
                "confidence", "medium" // Google provides confidence, but we'll keep it simple
            ));
            
        } catch (Exception e) {
            log.error("Language detection failed: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Language detection failed: " + e.getMessage()));
        }
    }
    
    /**
     * Get supported languages
     */
    @GetMapping("/languages")
    public ResponseEntity<Map<String, Object>> getSupportedLanguages() {
        try {
            List<String> languages = translationService.getSupportedLanguages();
            
            return ResponseEntity.ok(Map.of(
                "languages", languages,
                "count", languages.size()
            ));
            
        } catch (Exception e) {
            log.error("Failed to get supported languages: {}", e.getMessage(), e);
            return ResponseEntity.ok(Map.of(
                "languages", List.of("en", "th"),
                "count", 2
            ));
        }
    }
    
    /**
     * Translation request DTO
     */
    public static class TranslationRequest {
        private String text;
        private String sourceLanguage; // null or "auto" for auto-detect
        private String targetLanguage;
        
        // Getters and setters
        public String getText() { return text; }
        public void setText(String text) { this.text = text; }
        
        public String getSourceLanguage() { return sourceLanguage; }
        public void setSourceLanguage(String sourceLanguage) { this.sourceLanguage = sourceLanguage; }
        
        public String getTargetLanguage() { return targetLanguage; }
        public void setTargetLanguage(String targetLanguage) { this.targetLanguage = targetLanguage; }
    }
    
    /**
     * Batch translation request DTO
     */
    public static class BatchTranslationRequest {
        private List<String> texts;
        private String sourceLanguage;
        private String targetLanguage;
        
        // Getters and setters
        public List<String> getTexts() { return texts; }
        public void setTexts(List<String> texts) { this.texts = texts; }
        
        public String getSourceLanguage() { return sourceLanguage; }
        public void setSourceLanguage(String sourceLanguage) { this.sourceLanguage = sourceLanguage; }
        
        public String getTargetLanguage() { return targetLanguage; }
        public void setTargetLanguage(String targetLanguage) { this.targetLanguage = targetLanguage; }
    }
}

