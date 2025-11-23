package com.selfcar.repository.integration;

import com.selfcar.model.integration.CrossListing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CrossListingRepository extends JpaRepository<CrossListing, Long> {
    List<CrossListing> findByCarId(Long carId);
    List<CrossListing> findByMarketplaceId(Long marketplaceId);
    List<CrossListing> findByStatus(CrossListing.ListingStatus status);
    List<CrossListing> findByMarketplaceIdAndStatus(Long marketplaceId, CrossListing.ListingStatus status);
    CrossListing findByCarIdAndMarketplaceId(Long carId, Long marketplaceId);
}

