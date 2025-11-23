package com.selfcar.repository.integration;

import com.selfcar.model.integration.ExternalCarListing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExternalCarListingRepository extends JpaRepository<ExternalCarListing, Long> {
    List<ExternalCarListing> findByDealershipId(Long dealershipId);
    List<ExternalCarListing> findByCarId(Long carId);
    Optional<ExternalCarListing> findByDealershipIdAndExternalId(Long dealershipId, String externalId);
}

