package com.selfcar.repository.integration;

import com.selfcar.model.integration.ExternalDealership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExternalDealershipRepository extends JpaRepository<ExternalDealership, Long> {
    Optional<ExternalDealership> findByApiKey(String apiKey);
    List<ExternalDealership> findByStatus(ExternalDealership.DealershipStatus status);
    List<ExternalDealership> findByInventorySyncEnabledTrue();
}

