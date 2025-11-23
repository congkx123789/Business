package com.selfcar.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@Configuration
@EnableJpaAuditing
public class JpaAuditingConfig {
    // Separate configuration for JPA Auditing
    // Enabled for all contexts
    // Excluded from WebMvcTest via excludeFilters annotation
}

