package com.selfcar.repository.shop;

import com.selfcar.model.shop.SellerVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SellerVerificationRepository extends JpaRepository<SellerVerification, Long> {
    List<SellerVerification> findByUserId(Long userId);
    List<SellerVerification> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<SellerVerification> findByUserIdAndStatus(Long userId, SellerVerification.VerificationStatus status);
    List<SellerVerification> findByStatus(SellerVerification.VerificationStatus status);
}
