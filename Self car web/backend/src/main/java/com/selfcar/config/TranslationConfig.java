package com.selfcar.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Translation Service Configuration
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "translation")
public class TranslationConfig {
    
    private Google google = new Google();
    private LibreTranslate libretranslate = new LibreTranslate();
    private Cache cache = new Cache();
    private Glossary glossary = new Glossary();
    private boolean autoDetectSource = true;
    private int maxTextLength = 5000;
    private int batchSize = 100;
    
    @Data
    public static class Google {
        private boolean enabled = false;
        private String projectId;
        private String credentialsPath;
        private String apiKey;
        private int freeTierLimit = 500000;
        private int quotaAlertThreshold = 450000;
        private String model = "base"; // Use Basic model (free tier)
    }
    
    @Data
    public static class LibreTranslate {
        private boolean enabled = false;
        private String baseUrl = "http://localhost:5000";
        private String apiKey;
    }
    
    @Data
    public static class Cache {
        private boolean enabled = true;
        private long ttl = 86400000L; // 24 hours in milliseconds
        private int maxSize = 10000;
    }
    
    @Data
    public static class Glossary {
        private boolean enabled = true;
        private String path = "classpath:glossary.json";
    }
    
    public boolean isGoogleEnabled() {
        return google != null && google.isEnabled();
    }
    
    public boolean isLibreTranslateEnabled() {
        return libretranslate != null && libretranslate.isEnabled();
    }
    
    public String getGoogleApiKey() {
        return google != null ? google.getApiKey() : null;
    }
    
    public String getGoogleCredentialsPath() {
        return google != null ? google.getCredentialsPath() : null;
    }
    
    public String getLibreTranslateBaseUrl() {
        return libretranslate != null ? libretranslate.getBaseUrl() : "http://localhost:5000";
    }
    
    public String getLibreTranslateApiKey() {
        return libretranslate != null ? libretranslate.getApiKey() : null;
    }
}

