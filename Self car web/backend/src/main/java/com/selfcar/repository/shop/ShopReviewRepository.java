package com.selfcar.repository.shop;

import com.selfcar.model.shop.ShopReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShopReviewRepository extends JpaRepository<ShopReview, Long> {
    List<ShopReview> findByShopIdOrderByCreatedAtDesc(Long shopId);
    List<ShopReview> findByUserId(Long userId);
    
    @Query("SELECT AVG(sr.rating) FROM ShopReview sr WHERE sr.shop.id = :shopId")
    Double calculateAverageRating(@Param("shopId") Long shopId);
    
    Long countByShopId(Long shopId);
}
