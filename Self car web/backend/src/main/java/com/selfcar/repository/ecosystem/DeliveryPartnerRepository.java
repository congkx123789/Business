package com.selfcar.repository.ecosystem;

import com.selfcar.model.ecosystem.DeliveryPartner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeliveryPartnerRepository extends JpaRepository<DeliveryPartner, Long> {
    List<DeliveryPartner> findByStatus(DeliveryPartner.PartnerStatus status);
}

