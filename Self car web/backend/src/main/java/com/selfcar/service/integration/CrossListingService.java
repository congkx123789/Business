package com.selfcar.service.integration;

import com.selfcar.model.integration.CrossListing;
import com.selfcar.model.integration.MarketplaceIntegration;
import com.selfcar.model.car.Car;
import com.selfcar.repository.integration.CrossListingRepository;
import com.selfcar.repository.integration.MarketplaceIntegrationRepository;
import com.selfcar.repository.car.CarRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
public class CrossListingService {

    private final MarketplaceIntegrationRepository marketplaceRepository;
    private final CrossListingRepository crossListingRepository;
    private final CarRepository carRepository;

    public List<MarketplaceIntegration> getAllMarketplaces() {
        return marketplaceRepository.findAll();
    }

    public MarketplaceIntegration getMarketplaceById(Long id) {
        return marketplaceRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("Marketplace integration not found"));
    }

    @Transactional
    public CrossListing createCrossListing(Long carId, Long marketplaceId) {
        Car car = carRepository.findById(Objects.requireNonNull(carId))
                .orElseThrow(() -> new RuntimeException("Car not found"));
        MarketplaceIntegration marketplace = getMarketplaceById(marketplaceId);

        CrossListing listing = new CrossListing();
        listing.setCar(car);
        listing.setCarId(carId);
        listing.setMarketplace(marketplace);
        listing.setMarketplaceId(marketplaceId);
        listing.setStatus(CrossListing.ListingStatus.PENDING);

        // Here you would call the external marketplace API to create the listing
        // For now, we'll just save it as pending
        listing = crossListingRepository.save(listing);

        // Simulate API call
        if (marketplace.getAutoListingEnabled()) {
            try {
                createListingOnMarketplace(car, marketplace);
                listing.setStatus(CrossListing.ListingStatus.LISTED);
                listing.setLastSyncedAt(LocalDateTime.now());
            } catch (Exception e) {
                listing.setStatus(CrossListing.ListingStatus.FAILED);
                log.error("Failed to create listing on marketplace {}: {}", marketplaceId, e.getMessage());
            }
        }

        return crossListingRepository.save(listing);
    }

    public List<CrossListing> getCrossListingsByCar(Long carId) {
        return crossListingRepository.findByCarId(carId);
    }

    @Transactional
    public void syncAllAutoListings() {
        List<MarketplaceIntegration> marketplaces = marketplaceRepository.findByAutoListingEnabledTrue();
        
        for (MarketplaceIntegration marketplace : marketplaces) {
            List<CrossListing> pendingListings = crossListingRepository.findByMarketplaceIdAndStatus(
                    marketplace.getId(), CrossListing.ListingStatus.PENDING);
            
            for (CrossListing listing : pendingListings) {
                try {
                    Car car = listing.getCar();
                    createListingOnMarketplace(car, marketplace);
                    listing.setStatus(CrossListing.ListingStatus.LISTED);
                    listing.setLastSyncedAt(LocalDateTime.now());
                    crossListingRepository.save(listing);
                } catch (Exception e) {
                    log.error("Failed to sync listing {}: {}", listing.getId(), e.getMessage());
                }
            }
        }
    }

    private void createListingOnMarketplace(Car car, MarketplaceIntegration marketplace) {
        // This would integrate with external marketplace APIs
        // Examples: Chotot Auto API, Carmudi API, etc.
        log.info("Creating listing for car {} on marketplace {}", car.getId(), marketplace.getMarketplaceName());
        
        // In production, this would:
        // 1. Format car data according to marketplace template
        // 2. Call marketplace API endpoint
        // 3. Store external listing ID and URL
        // 4. Handle errors and retries
    }
}

