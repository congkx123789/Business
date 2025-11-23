package com.selfcar.repository.ecosystem;

import com.selfcar.model.ecosystem.FinanceApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FinanceApplicationRepository extends JpaRepository<FinanceApplication, Long> {
    List<FinanceApplication> findByUserId(Long userId);
    List<FinanceApplication> findByPartnerId(Long partnerId);
    List<FinanceApplication> findByStatus(FinanceApplication.ApplicationStatus status);
    FinanceApplication findByApplicationNumber(String applicationNumber);
}

