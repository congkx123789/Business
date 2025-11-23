package com.selfcar.service.translation;

import com.selfcar.config.TranslationConfig;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Stub configuration for GoogleTranslationProvider when Google Translation is not enabled
 */
@Configuration
@Profile("dev")
@Slf4j
public class TranslationProviderStubConfig {
    
    @Bean
    @ConditionalOnMissingBean(GoogleTranslationProvider.class)
    public GoogleTranslationProvider googleTranslationProvider(TranslationConfig config) {
        log.info("Creating stub GoogleTranslationProvider for dev profile (Google Translation not enabled)");
        return new GoogleTranslationProviderStub(config);
    }
    
    @Bean
    @ConditionalOnMissingBean(LibreTranslateProvider.class)
    public LibreTranslateProvider libreTranslateProvider(TranslationConfig config) {
        log.info("Creating stub LibreTranslateProvider for dev profile (LibreTranslate not enabled)");
        return new LibreTranslateProviderStub(config);
    }
    
    /**
     * Stub implementation that returns original text (no translation)
     */
    private static class GoogleTranslationProviderStub extends GoogleTranslationProvider {
        public GoogleTranslationProviderStub(TranslationConfig config) {
            super(config);
        }
        
        @Override
        public String translate(String text, String sourceLanguage, String targetLanguage) {
            log.debug("Translation stub: returning original text (no translation)");
            return text;
        }
        
        @Override
        public Map<String, String> translateBatch(List<String> texts, String sourceLanguage, String targetLanguage) {
            Map<String, String> result = new HashMap<>();
            for (String text : texts) {
                result.put(text, text);
            }
            return result;
        }
        
        @Override
        public String detectLanguage(String text) {
            return "en"; // Default to English
        }
        
        @Override
        public boolean isAvailable() {
            return false;
        }
        
        @Override
        public List<String> getSupportedLanguages() {
            return List.of("en", "th"); // Default languages
        }
    }
    
    /**
     * Stub implementation for LibreTranslateProvider that returns original text (no translation)
     */
    private static class LibreTranslateProviderStub extends LibreTranslateProvider {
        public LibreTranslateProviderStub(TranslationConfig config) {
            super(config);
        }
        
        @Override
        public String translate(String text, String sourceLanguage, String targetLanguage) {
            log.debug("LibreTranslate stub: returning original text (no translation)");
            return text;
        }
        
        @Override
        public Map<String, String> translateBatch(List<String> texts, String sourceLanguage, String targetLanguage) {
            Map<String, String> result = new HashMap<>();
            for (String text : texts) {
                result.put(text, text);
            }
            return result;
        }
        
        @Override
        public String detectLanguage(String text) {
            return "en"; // Default to English
        }
        
        @Override
        public boolean isAvailable() {
            return false;
        }
        
        @Override
        public List<String> getSupportedLanguages() {
            return List.of("en", "th"); // Default languages
        }
    }
}
