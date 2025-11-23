package com.selfcar.service.b2b;

import com.selfcar.model.b2b.EnterprisePartner;
import com.selfcar.model.b2b.EnterpriseUser;
import com.selfcar.model.b2b.MarketingCampaign;
import com.selfcar.model.auth.User;
import com.selfcar.repository.b2b.EnterprisePartnerRepository;
import com.selfcar.repository.b2b.EnterpriseUserRepository;
import com.selfcar.repository.b2b.MarketingCampaignRepository;
import com.selfcar.repository.auth.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
public class EnterpriseService {

    private final EnterprisePartnerRepository partnerRepository;
    private final EnterpriseUserRepository userRepository;
    private final MarketingCampaignRepository campaignRepository;
    private final UserRepository authUserRepository;

    // Enterprise Partner Management
    public List<EnterprisePartner> getAllPartners() {
        return partnerRepository.findAll();
    }

    public EnterprisePartner getPartnerById(Long id) {
        return partnerRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("Enterprise partner not found"));
    }

    public EnterprisePartner getPartnerByUserId(Long userId) {
        return partnerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Enterprise partner not found"));
    }

    @Transactional
    public EnterprisePartner createPartner(EnterprisePartner partner) {
        return partnerRepository.save(Objects.requireNonNull(partner));
    }

    @Transactional
    public EnterprisePartner updateSubscription(Long partnerId, EnterprisePartner.SubscriptionTier tier, LocalDate endDate) {
        EnterprisePartner partner = getPartnerById(partnerId);
        partner.setSubscriptionTier(tier);
        partner.setSubscriptionEndDate(endDate);
        partner.setSubscriptionStatus(EnterprisePartner.SubscriptionStatus.ACTIVE);
        return partnerRepository.save(partner);
    }

    // Enterprise User Management
    public List<EnterpriseUser> getUsersByEnterprise(Long enterpriseId) {
        return userRepository.findByEnterpriseId(enterpriseId);
    }

    @Transactional
    public EnterpriseUser addUserToEnterprise(Long enterpriseId, Long userId, EnterpriseUser.UserRole role) {
        EnterprisePartner enterprise = getPartnerById(Objects.requireNonNull(enterpriseId));
        User user = authUserRepository.findById(Objects.requireNonNull(userId))
                .orElseThrow(() -> new RuntimeException("User not found"));

        EnterpriseUser enterpriseUser = new EnterpriseUser();
        enterpriseUser.setEnterprise(enterprise);
        enterpriseUser.setEnterpriseId(enterpriseId);
        enterpriseUser.setUser(user);
        enterpriseUser.setUserId(userId);
        enterpriseUser.setRole(role);
        enterpriseUser.setStatus(EnterpriseUser.UserStatus.ACTIVE);

        return userRepository.save(enterpriseUser);
    }

    // Campaign Management
    public List<MarketingCampaign> getCampaignsByEnterprise(Long enterpriseId) {
        return campaignRepository.findByEnterpriseId(enterpriseId);
    }

    public MarketingCampaign getCampaignById(Long id) {
        return campaignRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("Marketing campaign not found"));
    }

    @Transactional
    public MarketingCampaign createCampaign(MarketingCampaign campaign) {
        return campaignRepository.save(Objects.requireNonNull(campaign));
    }

    @Transactional
    public MarketingCampaign updateCampaignStatus(Long campaignId, MarketingCampaign.CampaignStatus status) {
        MarketingCampaign campaign = getCampaignById(campaignId);
        campaign.setStatus(status);
        return campaignRepository.save(campaign);
    }
}

