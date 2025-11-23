package com.selfcar.repository.b2b;

import com.selfcar.model.b2b.EnterprisePartner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnterprisePartnerRepository extends JpaRepository<EnterprisePartner, Long> {
    Optional<EnterprisePartner> findByUserId(Long userId);
    List<EnterprisePartner> findByStatus(EnterprisePartner.PartnerStatus status);
    List<EnterprisePartner> findBySubscriptionStatus(EnterprisePartner.SubscriptionStatus subscriptionStatus);
}

