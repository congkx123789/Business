package com.selfcar.repository.integration;

import com.selfcar.model.integration.MarketplaceIntegration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MarketplaceIntegrationRepository extends JpaRepository<MarketplaceIntegration, Long> {
    Optional<MarketplaceIntegration> findByMarketplaceName(String marketplaceName);
    List<MarketplaceIntegration> findByStatus(MarketplaceIntegration.IntegrationStatus status);
    List<MarketplaceIntegration> findByAutoListingEnabledTrue();
}

