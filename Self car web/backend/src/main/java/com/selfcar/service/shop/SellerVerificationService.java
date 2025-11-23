package com.selfcar.service.shop;

import com.selfcar.model.shop.SellerVerification;
import com.selfcar.model.auth.User;
import com.selfcar.repository.shop.SellerVerificationRepository;
import com.selfcar.repository.auth.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
public class SellerVerificationService {

    private final SellerVerificationRepository sellerVerificationRepository;
    private final UserRepository userRepository;

    public List<SellerVerification> getMySubmissions(Long userId) {
        Objects.requireNonNull(userId, "User ID cannot be null");
        return sellerVerificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public SellerVerification submit(Long userId,
                                     SellerVerification.VerificationType type,
                                     String documentNumber,
                                     String frontUrl,
                                     String backUrl) {
        Objects.requireNonNull(userId, "User ID cannot be null");
        Objects.requireNonNull(type, "Verification type cannot be null");
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.warn("User not found with ID: {}", userId);
                    return new RuntimeException("User not found");
                });
        
        log.info("Submitting seller verification for user ID: {} with type: {}", userId, type);

        SellerVerification sv = new SellerVerification();
        sv.setUser(user);
        sv.setVerificationType(type);
        sv.setDocumentNumber(documentNumber);
        sv.setDocumentFrontUrl(frontUrl);
        sv.setDocumentBackUrl(backUrl);
        sv.setStatus(SellerVerification.VerificationStatus.PENDING);
        SellerVerification saved = sellerVerificationRepository.save(sv);
        log.info("Seller verification submitted successfully with ID: {}", saved.getId());
        return saved;
    }

    @Transactional
    public SellerVerification approve(Long id, Long adminId) {
        Objects.requireNonNull(id, "Verification ID cannot be null");
        Objects.requireNonNull(adminId, "Admin ID cannot be null");
        
        SellerVerification sv = sellerVerificationRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Seller verification not found with ID: {}", id);
                    return new RuntimeException("Submission not found");
                });
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> {
                    log.warn("Admin user not found with ID: {}", adminId);
                    return new RuntimeException("Admin not found");
                });
        
        log.info("Approving seller verification ID: {} by admin ID: {}", id, adminId);
        sv.setStatus(SellerVerification.VerificationStatus.APPROVED);
        sv.setReviewedBy(admin);
        sv.setReviewedAt(LocalDateTime.now());
        // Optionally: upgrade user role to SELLER
        User user = sv.getUser();
        user.setRole(User.Role.SELLER);
        userRepository.save(user);
        SellerVerification saved = sellerVerificationRepository.save(sv);
        log.info("Seller verification approved successfully. User ID: {} upgraded to SELLER role", user.getId());
        return saved;
    }

    @Transactional
    public SellerVerification reject(Long id, Long adminId, String reason) {
        Objects.requireNonNull(id, "Verification ID cannot be null");
        Objects.requireNonNull(adminId, "Admin ID cannot be null");
        
        SellerVerification sv = sellerVerificationRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Seller verification not found with ID: {}", id);
                    return new RuntimeException("Submission not found");
                });
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> {
                    log.warn("Admin user not found with ID: {}", adminId);
                    return new RuntimeException("Admin not found");
                });
        
        log.info("Rejecting seller verification ID: {} by admin ID: {} with reason: {}", id, adminId, reason);
        sv.setStatus(SellerVerification.VerificationStatus.REJECTED);
        sv.setReviewedBy(admin);
        sv.setReviewedAt(LocalDateTime.now());
        sv.setRejectionReason(reason);
        SellerVerification saved = sellerVerificationRepository.save(sv);
        log.info("Seller verification rejected successfully with ID: {}", id);
        return saved;
    }
}


