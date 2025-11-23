package com.selfcar.service.integration;

import com.selfcar.model.integration.ExternalDealership;
import com.selfcar.model.integration.ExternalCarListing;
import com.selfcar.model.integration.InventorySyncLog;
import com.selfcar.model.car.Car;
import com.selfcar.repository.integration.ExternalDealershipRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class InventorySyncService {

    private final ExternalDealershipRepository dealershipRepository;

    public List<ExternalDealership> getAllDealerships() {
        return dealershipRepository.findAll();
    }

    public Optional<ExternalDealership> getDealershipByApiKey(String apiKey) {
        return dealershipRepository.findByApiKey(apiKey);
    }

    public ExternalDealership getDealershipById(Long id) {
        return dealershipRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("External dealership not found"));
    }

    @Transactional
    public ExternalDealership createDealership(ExternalDealership dealership) {
        // Generate API key and secret
        String apiKey = generateApiKey();
        String apiSecret = generateApiSecret();
        dealership.setApiKey(apiKey);
        dealership.setApiSecret(apiSecret);
        return dealershipRepository.save(dealership);
    }

    @Transactional
    public void syncInventory(Long dealershipId, List<Car> cars) {
        ExternalDealership dealership = getDealershipById(dealershipId);
        
        InventorySyncLog syncLog = new InventorySyncLog();
        syncLog.setDealershipId(dealershipId);
        syncLog.setSyncType(InventorySyncLog.SyncType.FULL);
        syncLog.setStatus(InventorySyncLog.SyncStatus.IN_PROGRESS);
        syncLog.setStartedAt(LocalDateTime.now());

        int itemsAdded = 0;
        int itemsUpdated = 0;

        try {
            for (Car car : cars) {
                // Check if car already exists
                Optional<ExternalCarListing> existingListing = findExistingListing(dealershipId, car);
                
                if (existingListing.isPresent()) {
                    // Update existing
                    updateCarListing(existingListing.get(), car);
                    itemsUpdated++;
                } else {
                    // Create new
                    createCarListing(dealership, car);
                    itemsAdded++;
                }
            }

            syncLog.setStatus(InventorySyncLog.SyncStatus.COMPLETED);
            syncLog.setItemsAdded(itemsAdded);
            syncLog.setItemsUpdated(itemsUpdated);
            syncLog.setCompletedAt(LocalDateTime.now());

            dealership.setLastSyncAt(LocalDateTime.now());
            dealershipRepository.save(dealership);

        } catch (Exception e) {
            syncLog.setStatus(InventorySyncLog.SyncStatus.FAILED);
            syncLog.setErrors(e.getMessage());
            syncLog.setCompletedAt(LocalDateTime.now());
            log.error("Inventory sync failed for dealership {}: {}", dealershipId, e.getMessage());
        }
    }

    private void createCarListing(ExternalDealership dealership, Car car) {
        ExternalCarListing listing = new ExternalCarListing();
        listing.setDealershipId(dealership.getId());
        listing.setExternalId(car.getId().toString());
        listing.setCarId(car.getId());
        listing.setSyncStatus(ExternalCarListing.SyncStatus.SYNCED);
        listing.setLastSyncedAt(LocalDateTime.now());
        // Save listing (repository would be needed)
    }

    private void updateCarListing(ExternalCarListing listing, Car car) {
        listing.setLastSyncedAt(LocalDateTime.now());
        listing.setSyncStatus(ExternalCarListing.SyncStatus.SYNCED);
        // Update listing (repository would be needed)
    }

    private Optional<ExternalCarListing> findExistingListing(Long dealershipId, Car car) {
        // Implementation would query ExternalCarListingRepository
        return Optional.empty();
    }

    private String generateApiKey() {
        return "API-" + java.util.UUID.randomUUID().toString().replace("-", "").substring(0, 32).toUpperCase();
    }

    private String generateApiSecret() {
        return java.util.UUID.randomUUID().toString().replace("-", "");
    }
}

