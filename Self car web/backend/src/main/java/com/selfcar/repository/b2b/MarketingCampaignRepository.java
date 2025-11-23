package com.selfcar.repository.b2b;

import com.selfcar.model.b2b.MarketingCampaign;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MarketingCampaignRepository extends JpaRepository<MarketingCampaign, Long> {
    List<MarketingCampaign> findByEnterpriseId(Long enterpriseId);
    List<MarketingCampaign> findByStatus(MarketingCampaign.CampaignStatus status);
    List<MarketingCampaign> findByEnterpriseIdAndStatus(Long enterpriseId, MarketingCampaign.CampaignStatus status);
    List<MarketingCampaign> findByStartDateLessThanEqualAndEndDateGreaterThanEqual(LocalDateTime startDate, LocalDateTime endDate);
}

