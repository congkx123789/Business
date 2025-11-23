package com.selfcar.cli;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.selfcar.service.translation.TranslationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

/**
 * CLI Tool for Batch Translation
 * 
 * Pre-translates i18n JSON files offline.
 * Usage: java -jar app.jar --spring.main.web-application-type=none --translation.cli.enabled=true --translation.cli.source-locale=en --translation.cli.target-locale=th
 */
@Slf4j
@Component
@ConditionalOnProperty(name = "translation.cli.enabled", havingValue = "true")
@RequiredArgsConstructor
public class TranslationCLI implements CommandLineRunner {
    
    private final TranslationService translationService;
    private final ResourceLoader resourceLoader;
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @Override
    public void run(String... args) throws Exception {
        log.info("Starting batch translation CLI...");
        
        // Get source and target locales from args or properties
        String sourceLocale = getProperty("translation.cli.source-locale", "en");
        String targetLocale = getProperty("translation.cli.target-locale", "th");
        String inputPath = getProperty("translation.cli.input-path", "frontend/src/i18n/locales");
        String outputPath = getProperty("translation.cli.output-path", "frontend/src/i18n/locales");
        
        log.info("Translating from {} to {}", sourceLocale, targetLocale);
        log.info("Input path: {}", inputPath);
        log.info("Output path: {}", outputPath);
        
        // Translate all JSON files in the source locale directory
        Path sourceDir = Paths.get(inputPath, sourceLocale);
        Path targetDir = Paths.get(outputPath, targetLocale);
        
        if (!Files.exists(sourceDir)) {
            log.error("Source directory does not exist: {}", sourceDir);
            return;
        }
        
        // Create target directory if it doesn't exist
        Files.createDirectories(targetDir);
        
        // Process each JSON file
        Files.list(sourceDir)
            .filter(path -> path.toString().endsWith(".json"))
            .forEach(path -> {
                try {
                    translateFile(path, targetDir, sourceLocale, targetLocale);
                } catch (Exception e) {
                    log.error("Failed to translate file {}: {}", path, e.getMessage(), e);
                }
            });
        
        log.info("Batch translation completed!");
    }
    
    private void translateFile(Path sourceFile, Path targetDir, String sourceLocale, String targetLocale) throws IOException {
        String fileName = sourceFile.getFileName().toString();
        log.info("Translating file: {}", fileName);
        
        // Read source JSON
        Map<String, Object> sourceData = objectMapper.readValue(sourceFile.toFile(), Map.class);
        
        // Translate all string values recursively
        Map<String, Object> translatedData = translateMap(sourceData, sourceLocale, targetLocale);
        
        // Write translated JSON
        Path targetFile = targetDir.resolve(fileName);
        objectMapper.writerWithDefaultPrettyPrinter().writeValue(targetFile.toFile(), translatedData);
        
        log.info("Translated file saved: {}", targetFile);
    }
    
    @SuppressWarnings("unchecked")
    private Map<String, Object> translateMap(Map<String, Object> map, String sourceLocale, String targetLocale) {
        Map<String, Object> translated = new HashMap<>();
        
        for (Map.Entry<String, Object> entry : map.entrySet()) {
            Object value = entry.getValue();
            
            if (value instanceof String) {
                // Translate string value
                String translatedText = translationService.translate(
                    (String) value,
                    sourceLocale,
                    targetLocale
                );
                translated.put(entry.getKey(), translatedText);
                
            } else if (value instanceof Map) {
                // Recursively translate nested maps
                translated.put(entry.getKey(), translateMap((Map<String, Object>) value, sourceLocale, targetLocale));
                
            } else {
                // Keep non-string values as-is
                translated.put(entry.getKey(), value);
            }
        }
        
        return translated;
    }
    
    private String getProperty(String key, String defaultValue) {
        String value = System.getProperty(key);
        if (value == null || value.isEmpty()) {
            value = System.getenv(key.replace(".", "_").toUpperCase());
        }
        return value != null ? value : defaultValue;
    }
}

