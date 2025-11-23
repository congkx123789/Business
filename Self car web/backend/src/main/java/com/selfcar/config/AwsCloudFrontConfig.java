package com.selfcar.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.cloudfront.CloudFrontClient;

@Configuration
public class AwsCloudFrontConfig {

    @Bean
    public CloudFrontClient cloudFrontClient() {
        // CloudFront is global; region selection not required for API calls
        return CloudFrontClient.builder()
                .region(Region.AWS_GLOBAL)
                .build();
    }
}
