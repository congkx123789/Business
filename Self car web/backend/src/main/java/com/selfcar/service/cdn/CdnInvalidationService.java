package com.selfcar.service.cdn;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.cloudfront.CloudFrontClient;
import software.amazon.awssdk.services.cloudfront.model.CreateInvalidationRequest;
import software.amazon.awssdk.services.cloudfront.model.InvalidationBatch;
import software.amazon.awssdk.services.cloudfront.model.Paths;

import java.time.Instant;
import java.util.Arrays;

@Slf4j
@Service
@RequiredArgsConstructor
public class CdnInvalidationService {

    private final CloudFrontClient cloudFrontClient;

    @Value("${cloudfront.enabled:false}")
    private boolean enabled;

    @Value("${cloudfront.distribution-id:}")
    private String distributionId;

    /**
     * Invalidate CDN paths related to a vehicle
     */
    public void invalidateVehicle(Long vehicleId) {
        if (!enabled || distributionId == null || distributionId.isBlank()) {
            return;
        }
        try {
            String callerRef = "vdp-" + vehicleId + "-" + Instant.now().toEpochMilli();
            // Paths you want to purge (adjust to your routing)
            Paths paths = Paths.builder()
                    .items(
                            "/cars/" + vehicleId,
                            "/api/cars/" + vehicleId,
                            "/images/cars/" + vehicleId + "/*"
                    )
                    .quantity(3)
                    .build();

            InvalidationBatch batch = InvalidationBatch.builder()
                    .paths(paths)
                    .callerReference(callerRef)
                    .build();

            cloudFrontClient.createInvalidation(CreateInvalidationRequest.builder()
                    .distributionId(distributionId)
                    .invalidationBatch(batch)
                    .build());
            log.info("CloudFront invalidation requested for car {}", vehicleId);
        } catch (Exception e) {
            log.warn("Failed to request CloudFront invalidation for car {}", vehicleId, e);
        }
    }
}
