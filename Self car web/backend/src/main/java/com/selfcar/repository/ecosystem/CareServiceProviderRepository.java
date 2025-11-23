package com.selfcar.repository.ecosystem;

import com.selfcar.model.ecosystem.CareServiceProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CareServiceProviderRepository extends JpaRepository<CareServiceProvider, Long> {
    List<CareServiceProvider> findByTypeAndStatus(CareServiceProvider.ProviderType type, CareServiceProvider.ProviderStatus status);
    List<CareServiceProvider> findByStatus(CareServiceProvider.ProviderStatus status);
}

