package com.selfcar.repository.common;

import com.selfcar.model.common.AutomatedReply;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AutomatedReplyRepository extends JpaRepository<AutomatedReply, Long> {

    List<AutomatedReply> findByShopIdAndActiveTrue(Long shopId);

    @Query("SELECT a FROM AutomatedReply a WHERE a.active = true " +
           "AND (a.shop IS NULL OR a.shop.id = :shopId) " +
           "ORDER BY a.priority DESC")
    List<AutomatedReply> findActiveRepliesForShop(@Param("shopId") Long shopId);

    // Kept for backward compatibility if needed later, but avoid non-portable REGEXP in JPQL.
    // Prefer filtering in service layer for portability across DBs (H2/MySQL).
}
