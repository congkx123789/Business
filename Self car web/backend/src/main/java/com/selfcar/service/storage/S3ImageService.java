package com.selfcar.service.storage;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.io.IOException;
import java.time.Duration;
import java.util.UUID;

/**
 * S3 Image Storage Service
 * Handles image uploads to S3 with private bucket configuration
 * All images are served through CloudFront CDN with Origin Access Control (OAC)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class S3ImageService {

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;

    @Value("${aws.s3.bucket-name:}")
    private String bucketName;

    @Value("${aws.s3.region:us-east-1}")
    private String region;

    @Value("${aws.s3.cdn-domain:}")
    private String cdnDomain;

    /**
     * Upload image to S3
     * @param file Multipart file to upload
     * @param carId Car ID for organizing images
     * @return S3 key (path) of uploaded image
     */
    public String uploadImage(MultipartFile file, Long carId) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("File must be an image");
        }

        // Generate unique key: cars/{carId}/{uuid}.{extension}
        String originalFilename = file.getOriginalFilename();
        String extension = getFileExtension(originalFilename);
        String key = String.format("cars/%d/%s.%s", carId, UUID.randomUUID(), extension);

        // Upload to S3
        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .contentType(contentType)
                .contentLength(file.getSize())
                .serverSideEncryption(ServerSideEncryption.AES256)
                .acl(ObjectCannedACL.PRIVATE) // Private bucket - all access through CDN
                .build();

        s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

        log.info("Image uploaded to S3: {}/{}", bucketName, key);
        return key;
    }

    /**
     * Generate presigned URL for direct upload from client
     * @param carId Car ID
     * @param contentType Image content type
     * @param fileSize File size in bytes
     * @return Presigned URL for upload
     */
    public String generatePresignedUploadUrl(Long carId, String contentType, long fileSize) {
        String extension = getExtensionFromContentType(contentType);
        String key = String.format("cars/%d/%s.%s", carId, UUID.randomUUID(), extension);

        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .contentType(contentType)
                .contentLength(fileSize)
                .serverSideEncryption(ServerSideEncryption.AES256)
                .acl(ObjectCannedACL.PRIVATE)
                .build();

        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(15))
                .putObjectRequest(putObjectRequest)
                .build();

        PresignedPutObjectRequest presignedRequest = s3Presigner.presignPutObject(presignRequest);
        return presignedRequest.url().toString();
    }

    /**
     * Get CDN URL for an image (all images must be accessed via CDN)
     * @param s3Key S3 key (path) of the image
     * @return CDN URL
     */
    public String getCdnUrl(String s3Key) {
        if (s3Key == null || s3Key.isEmpty()) {
            return null;
        }

        // If already a CDN URL, return as-is
        if (s3Key.startsWith("http://") || s3Key.startsWith("https://")) {
            return s3Key;
        }

        // Build CDN URL
        if (cdnDomain != null && !cdnDomain.isEmpty()) {
            return String.format("https://%s/%s", cdnDomain, s3Key);
        }

        // Fallback to S3 URL (should not be used in production)
        return String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, region, s3Key);
    }

    /**
     * Delete image from S3
     * @param s3Key S3 key (path) of the image
     */
    public void deleteImage(String s3Key) {
        if (s3Key == null || s3Key.isEmpty()) {
            return;
        }

        // Extract key from full URL if needed
        String key = extractKeyFromUrl(s3Key);

        try {
            DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();

            s3Client.deleteObject(deleteRequest);
            log.info("Image deleted from S3: {}", key);
        } catch (Exception e) {
            log.error("Error deleting image from S3: {}", key, e);
            throw new RuntimeException("Failed to delete image", e);
        }
    }

    /**
     * Extract S3 key from URL (CDN or S3 URL)
     */
    private String extractKeyFromUrl(String url) {
        if (url.startsWith("https://") || url.startsWith("http://")) {
            // Extract key from CDN URL: https://cdn.domain.com/cars/123/image.jpg
            if (url.contains("/")) {
                int lastSlash = url.lastIndexOf('/');
                String path = url.substring(0, lastSlash);
                int domainEnd = path.indexOf(".com/");
                if (domainEnd > 0) {
                    return url.substring(domainEnd + 5);
                }
                // Extract from S3 URL: https://bucket.s3.region.amazonaws.com/cars/123/image.jpg
                int s3Index = url.indexOf(".amazonaws.com/");
                if (s3Index > 0) {
                    return url.substring(s3Index + 15);
                }
            }
        }
        // Assume it's already a key
        return url;
    }

    private String getFileExtension(String filename) {
        if (filename == null) {
            return "jpg";
        }
        int lastDot = filename.lastIndexOf('.');
        if (lastDot > 0) {
            return filename.substring(lastDot + 1).toLowerCase();
        }
        return "jpg";
    }

    private String getExtensionFromContentType(String contentType) {
        if (contentType == null) {
            return "jpg";
        }
        switch (contentType.toLowerCase()) {
            case "image/jpeg":
            case "image/jpg":
                return "jpg";
            case "image/png":
                return "png";
            case "image/webp":
                return "webp";
            case "image/gif":
                return "gif";
            default:
                return "jpg";
        }
    }
}

