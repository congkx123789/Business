package com.selfcar.repository.shop;

import com.selfcar.model.shop.SellerScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SellerScoreRepository extends JpaRepository<SellerScore, Long> {
    Optional<SellerScore> findBySellerId(Long sellerId);
    
    Optional<SellerScore> findByShopId(Long shopId);
    
    @Query("SELECT ss FROM SellerScore ss WHERE ss.isTopVerified = true ORDER BY ss.totalScore DESC")
    List<SellerScore> findTopVerifiedSellers();
    
    @Query("SELECT ss FROM SellerScore ss WHERE ss.isVerifiedDealer = true ORDER BY ss.totalScore DESC")
    List<SellerScore> findVerifiedDealers();
    
    @Query("SELECT ss FROM SellerScore ss ORDER BY ss.totalScore DESC")
    List<SellerScore> findAllOrderByScoreDesc();
    
    @Query("SELECT COUNT(ss) FROM SellerScore ss WHERE ss.totalScore >= :minScore")
    Long countByScoreAbove(@Param("minScore") java.math.BigDecimal minScore);
}

