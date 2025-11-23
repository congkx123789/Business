package com.selfcar.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Cache Configuration for Translation Memory
 */
@Configuration
@EnableCaching
public class CacheConfig {
    
    /**
     * Translation Memory Cache
     * Key: text + sourceLanguage + targetLanguage
     * Value: translated text
     */
    @Bean("translations")
    public CacheManager translationCacheManager() {
        return new ConcurrentMapCacheManager("translations");
    }
}
