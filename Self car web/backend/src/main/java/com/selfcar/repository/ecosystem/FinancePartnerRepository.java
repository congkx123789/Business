package com.selfcar.repository.ecosystem;

import com.selfcar.model.ecosystem.FinancePartner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FinancePartnerRepository extends JpaRepository<FinancePartner, Long> {
    List<FinancePartner> findByPartnerTypeAndStatus(FinancePartner.PartnerType type, FinancePartner.PartnerStatus status);
    List<FinancePartner> findByStatus(FinancePartner.PartnerStatus status);
}

