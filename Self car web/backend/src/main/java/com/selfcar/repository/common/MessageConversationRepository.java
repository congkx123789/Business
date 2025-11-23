package com.selfcar.repository.common;

import com.selfcar.model.common.MessageConversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MessageConversationRepository extends JpaRepository<MessageConversation, Long> {
    
    @Query("SELECT DISTINCT c FROM MessageConversation c " +
           "JOIN c.participants p WHERE p.user.id = :userId " +
           "ORDER BY c.updatedAt DESC")
    List<MessageConversation> findByParticipantUserId(@Param("userId") Long userId);
    
    @Query("SELECT DISTINCT c FROM MessageConversation c " +
           "JOIN c.participants p WHERE p.user.id = :userId " +
           "AND c.updatedAt > :updatedAfter " +
           "ORDER BY c.updatedAt DESC")
    List<MessageConversation> findByParticipantUserIdAndUpdatedAtAfter(
            @Param("userId") Long userId,
            @Param("updatedAfter") LocalDateTime updatedAfter);
}


