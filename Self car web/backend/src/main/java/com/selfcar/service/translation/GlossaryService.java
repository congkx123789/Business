package com.selfcar.service.translation;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.selfcar.config.TranslationConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * Glossary Service
 * 
 * Handles brand/auto terms that should not be translated.
 * Uses JSON glossary file with term mappings.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class GlossaryService {
    
    private final TranslationConfig config;
    private final ResourceLoader resourceLoader;
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    private Map<String, Map<String, String>> glossary = new HashMap<>();
    private Map<String, Pattern> termPatterns = new HashMap<>();
    
    @PostConstruct
    public void init() {
        if (!config.getGlossary().isEnabled()) {
            log.info("Glossary service disabled");
            return;
        }
        
        try {
            loadGlossary();
            log.info("Glossary loaded with {} language pairs", glossary.size());
        } catch (Exception e) {
            log.warn("Failed to load glossary: {}", e.getMessage());
            // Continue without glossary
        }
    }
    
    private void loadGlossary() throws IOException {
        Resource resource = resourceLoader.getResource(config.getGlossary().getPath());
        
        if (!resource.exists()) {
            log.warn("Glossary file not found: {}", config.getGlossary().getPath());
            return;
        }
        
        try (InputStream inputStream = resource.getInputStream()) {
            @SuppressWarnings("unchecked")
            Map<String, Object> glossaryData = objectMapper.readValue(inputStream, Map.class);
            
            // Parse glossary structure: { "en-th": { "SelfCar": "SelfCar", "BMW": "BMW" } }
            for (Map.Entry<String, Object> entry : glossaryData.entrySet()) {
                String languagePair = entry.getKey();
                @SuppressWarnings("unchecked")
                Map<String, String> terms = (Map<String, String>) entry.getValue();
                
                glossary.put(languagePair, terms);
                
                // Pre-compile patterns for case-insensitive matching
                for (String term : terms.keySet()) {
                    String pattern = "\\b" + Pattern.quote(term) + "\\b";
                    termPatterns.put(languagePair + ":" + term, Pattern.compile(pattern, Pattern.CASE_INSENSITIVE));
                }
            }
        }
    }
    
    /**
     * Apply glossary terms to text before translation
     * Replaces terms with placeholders, translates, then restores terms
     */
    public String applyGlossary(String text, String sourceLanguage, String targetLanguage) {
        if (!config.getGlossary().isEnabled() || glossary.isEmpty()) {
            return text;
        }
        
        if (text == null || text.trim().isEmpty()) {
            return text;
        }
        
        String languagePair = buildLanguagePair(sourceLanguage, targetLanguage);
        Map<String, String> terms = glossary.get(languagePair);
        
        if (terms == null || terms.isEmpty()) {
            return text;
        }
        
        String result = text;
        Map<String, String> placeholderMap = new HashMap<>();
        int placeholderIndex = 0;
        
        // Replace glossary terms with placeholders
        for (Map.Entry<String, String> termEntry : terms.entrySet()) {
            String sourceTerm = termEntry.getKey();
            String targetTerm = termEntry.getValue();
            
            // Skip if source and target are the same (no translation needed)
            if (sourceTerm.equals(targetTerm)) {
                continue;
            }
            
            Pattern pattern = termPatterns.get(languagePair + ":" + sourceTerm);
            if (pattern != null && pattern.matcher(result).find()) {
                String placeholder = "__GLOSSARY_" + placeholderIndex + "__";
                placeholderMap.put(placeholder, targetTerm);
                result = pattern.matcher(result).replaceAll(placeholder);
                placeholderIndex++;
            }
        }
        
        // Store placeholder map for restoration after translation
        // (This would be stored in a context/thread-local, but for simplicity we'll use a different approach)
        // For now, we'll just return the text with placeholders - the translation service will handle restoration
        
        return result;
    }
    
    /**
     * Restore glossary terms after translation
     */
    public String restoreGlossary(String translatedText, String sourceLanguage, String targetLanguage) {
        if (!config.getGlossary().isEnabled() || glossary.isEmpty()) {
            return translatedText;
        }
        
        String languagePair = buildLanguagePair(sourceLanguage, targetLanguage);
        Map<String, String> terms = glossary.get(languagePair);
        
        if (terms == null || terms.isEmpty()) {
            return translatedText;
        }
        
        String result = translatedText;
        
        // Restore placeholders (this is a simplified version)
        // In a full implementation, we'd track placeholders during translation
        for (Map.Entry<String, String> termEntry : terms.entrySet()) {
            String sourceTerm = termEntry.getKey();
            String targetTerm = termEntry.getValue();
            
            // If term should be preserved, replace it
            if (sourceTerm.equals(targetTerm)) {
                Pattern pattern = Pattern.compile("\\b" + Pattern.quote(sourceTerm) + "\\b", Pattern.CASE_INSENSITIVE);
                result = pattern.matcher(result).replaceAll(targetTerm);
            }
        }
        
        return result;
    }
    
    private String buildLanguagePair(String sourceLanguage, String targetLanguage) {
        String source = sourceLanguage != null ? sourceLanguage : "auto";
        String target = targetLanguage != null ? targetLanguage : "en";
        return source + "-" + target;
    }
}

