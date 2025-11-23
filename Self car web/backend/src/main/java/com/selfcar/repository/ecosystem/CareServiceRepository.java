package com.selfcar.repository.ecosystem;

import com.selfcar.model.ecosystem.CareService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CareServiceRepository extends JpaRepository<CareService, Long> {
    List<CareService> findByProviderIdAndAvailableTrue(Long providerId);
    List<CareService> findByServiceTypeAndAvailableTrue(CareService.ServiceType serviceType);
}

