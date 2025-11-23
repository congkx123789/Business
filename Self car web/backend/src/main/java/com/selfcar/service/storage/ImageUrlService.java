package com.selfcar.service.storage;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Image URL Service
 * Normalizes and converts image URLs to CDN URLs
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ImageUrlService {

    private final S3ImageService s3ImageService;

    /**
     * Normalize image URL to CDN URL
     * Converts S3 URLs to CDN URLs if CDN is enabled
     * 
     * @param imageUrl Original image URL (could be S3, CDN, or other)
     * @return Normalized CDN URL
     */
    public String normalizeToCdnUrl(String imageUrl) {
        if (imageUrl == null || imageUrl.isEmpty()) {
            return null;
        }

        // If already a CDN URL, return as-is
        if (imageUrl.contains("cloudfront") || imageUrl.contains("cdn")) {
            return imageUrl;
        }

        // If it's an S3 URL, convert to CDN URL
        if (imageUrl.contains("amazonaws.com") || imageUrl.contains("s3.")) {
            return s3ImageService.getCdnUrl(imageUrl);
        }

        // If it's a relative path or S3 key, convert to CDN URL
        if (!imageUrl.startsWith("http://") && !imageUrl.startsWith("https://")) {
            return s3ImageService.getCdnUrl(imageUrl);
        }

        // For other URLs (external), return as-is
        return imageUrl;
    }

    /**
     * Extract S3 key from various URL formats
     * 
     * @param url Image URL
     * @return S3 key if extractable, null otherwise
     */
    public String extractS3Key(String url) {
        if (url == null || url.isEmpty()) {
            return null;
        }

        // CDN URL: https://cdn.domain.com/cars/123/image.jpg
        if (url.contains("cloudfront") || url.contains("cdn")) {
            int domainEnd = url.indexOf(".com/");
            if (domainEnd > 0) {
                String key = url.substring(domainEnd + 5);
                // Remove query parameters
                int queryIndex = key.indexOf('?');
                if (queryIndex > 0) {
                    key = key.substring(0, queryIndex);
                }
                return key;
            }
        }

        // S3 URL: https://bucket.s3.region.amazonaws.com/cars/123/image.jpg
        if (url.contains(".amazonaws.com/")) {
            int s3Index = url.indexOf(".amazonaws.com/");
            if (s3Index > 0) {
                String key = url.substring(s3Index + 15);
                int queryIndex = key.indexOf('?');
                if (queryIndex > 0) {
                    key = key.substring(0, queryIndex);
                }
                return key;
            }
        }

        // Assume it's already a key if no protocol
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            return url;
        }

        return null;
    }
}

