package com.selfcar.controller.b2b;

import com.selfcar.dto.common.ApiResponse;
import com.selfcar.model.b2b.EnterprisePartner;
import com.selfcar.model.b2b.EnterpriseUser;
import com.selfcar.model.b2b.MarketingCampaign;
import com.selfcar.service.b2b.EnterpriseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/b2b/enterprises")
@RequiredArgsConstructor
public class EnterpriseController {

    private final EnterpriseService enterpriseService;

    @GetMapping
    public ResponseEntity<List<EnterprisePartner>> getAllPartners() {
        return ResponseEntity.ok(enterpriseService.getAllPartners());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EnterprisePartner> getPartnerById(@PathVariable Long id) {
        return ResponseEntity.ok(enterpriseService.getPartnerById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<EnterprisePartner> getPartnerByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(enterpriseService.getPartnerByUserId(userId));
    }

    @PostMapping
    public ResponseEntity<?> createPartner(@RequestBody EnterprisePartner partner) {
        try {
            return ResponseEntity.ok(enterpriseService.createPartner(partner));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PatchMapping("/{partnerId}/subscription")
    public ResponseEntity<?> updateSubscription(
            @PathVariable Long partnerId,
            @RequestParam EnterprisePartner.SubscriptionTier tier,
            @RequestParam LocalDate endDate) {
        try {
            return ResponseEntity.ok(enterpriseService.updateSubscription(partnerId, tier, endDate));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/{enterpriseId}/users")
    public ResponseEntity<List<EnterpriseUser>> getUsersByEnterprise(@PathVariable Long enterpriseId) {
        return ResponseEntity.ok(enterpriseService.getUsersByEnterprise(enterpriseId));
    }

    @PostMapping("/{enterpriseId}/users")
    public ResponseEntity<?> addUserToEnterprise(
            @PathVariable Long enterpriseId,
            @RequestParam Long userId,
            @RequestParam EnterpriseUser.UserRole role) {
        try {
            return ResponseEntity.ok(enterpriseService.addUserToEnterprise(enterpriseId, userId, role));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/{enterpriseId}/campaigns")
    public ResponseEntity<List<MarketingCampaign>> getCampaignsByEnterprise(@PathVariable Long enterpriseId) {
        return ResponseEntity.ok(enterpriseService.getCampaignsByEnterprise(enterpriseId));
    }

    @PostMapping("/{enterpriseId}/campaigns")
    public ResponseEntity<?> createCampaign(
            @PathVariable Long enterpriseId,
            @RequestBody MarketingCampaign campaign) {
        try {
            campaign.setEnterpriseId(enterpriseId);
            return ResponseEntity.ok(enterpriseService.createCampaign(campaign));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PatchMapping("/campaigns/{campaignId}/status")
    public ResponseEntity<?> updateCampaignStatus(
            @PathVariable Long campaignId,
            @RequestParam MarketingCampaign.CampaignStatus status) {
        try {
            return ResponseEntity.ok(enterpriseService.updateCampaignStatus(campaignId, status));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
}

