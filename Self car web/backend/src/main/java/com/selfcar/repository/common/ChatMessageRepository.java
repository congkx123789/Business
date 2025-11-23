package com.selfcar.repository.common;

import com.selfcar.model.common.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    
    List<ChatMessage> findByConversationIdAndReadFalse(Long conversationId);
    
    @Query("SELECT COUNT(m) FROM ChatMessage m " +
           "WHERE m.conversation.id = :conversationId " +
           "AND m.read = false " +
           "AND m.sender.id != :senderId")
    Long countByConversationIdAndReadFalseAndSenderIdNot(
            @Param("conversationId") Long conversationId,
            @Param("senderId") Long senderId);
}


