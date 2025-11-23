package com.selfcar.inventory.reconciliation;

import com.selfcar.model.integration.ExternalCarListing;
import com.selfcar.repository.integration.ExternalCarListingRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class VinProvider {
    private final ExternalCarListingRepository externalListingRepo;

    public VinProvider(ExternalCarListingRepository externalListingRepo) {
        this.externalListingRepo = externalListingRepo;
    }

    public List<String> listActiveVins() {
        // Derive VINs from external listings (using externalId as VIN surrogate when applicable)
        List<ExternalCarListing> all = externalListingRepo.findAll();
        Set<String> vins = all.stream()
                .map(ExternalCarListing::getExternalId)
                .filter(id -> id != null && id.length() >= 5)
                .collect(Collectors.toSet());
        return List.copyOf(vins);
    }
}


