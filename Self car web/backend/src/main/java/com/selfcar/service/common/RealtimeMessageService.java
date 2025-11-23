package com.selfcar.service.common;

import com.selfcar.model.common.ChatMessage;
import com.selfcar.model.common.MessageConversation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.List;

@Slf4j
@Service
public class RealtimeMessageService {

    // Map of conversationId -> List of SseEmitters (users connected to that conversation)
    private final Map<Long, List<SseEmitter>> conversationEmitters = new ConcurrentHashMap<>();
    
    // Map of userId -> List of conversationIds they're connected to
    private final Map<Long, List<Long>> userConversations = new ConcurrentHashMap<>();

    /**
     * Register a new SSE connection for a user in a conversation
     */
    public SseEmitter subscribe(Long conversationId, Long userId) {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE); // No timeout
        
        emitter.onCompletion(() -> {
            log.debug("SSE connection completed for user {} in conversation {}", userId, conversationId);
            removeEmitter(conversationId, userId, emitter);
        });
        
        emitter.onTimeout(() -> {
            log.debug("SSE connection timeout for user {} in conversation {}", userId, conversationId);
            removeEmitter(conversationId, userId, emitter);
        });
        
        emitter.onError((ex) -> {
            log.error("SSE connection error for user {} in conversation {}", userId, conversationId, ex);
            removeEmitter(conversationId, userId, emitter);
        });

        // Add emitter to conversation
        conversationEmitters.computeIfAbsent(conversationId, k -> new CopyOnWriteArrayList<>()).add(emitter);
        
        // Track user's conversations
        userConversations.computeIfAbsent(userId, k -> new CopyOnWriteArrayList<>()).add(conversationId);

        // Send initial connection event
        try {
            emitter.send(SseEmitter.event()
                    .name("connected")
                    .data("Connected to conversation " + conversationId));
        } catch (IOException e) {
            log.error("Error sending initial SSE event", e);
            removeEmitter(conversationId, userId, emitter);
            return null;
        }

        log.info("User {} subscribed to conversation {}", userId, conversationId);
        return emitter;
    }

    /**
     * Broadcast a new message to all subscribers of a conversation
     */
    public void broadcastMessage(Long conversationId, ChatMessage message) {
        List<SseEmitter> emitters = conversationEmitters.get(conversationId);
        if (emitters == null || emitters.isEmpty()) {
            log.debug("No subscribers for conversation {}", conversationId);
            return;
        }

        List<SseEmitter> deadEmitters = new CopyOnWriteArrayList<>();
        
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name("new_message")
                        .data(message));
            } catch (IOException e) {
                log.warn("Failed to send message to SSE emitter, removing it", e);
                deadEmitters.add(emitter);
            }
        }

        // Remove dead emitters
        emitters.removeAll(deadEmitters);
    }

    /**
     * Broadcast conversation update (e.g., when messages are marked as read)
     */
    public void broadcastConversationUpdate(Long conversationId, MessageConversation conversation) {
        List<SseEmitter> emitters = conversationEmitters.get(conversationId);
        if (emitters == null || emitters.isEmpty()) {
            return;
        }

        List<SseEmitter> deadEmitters = new CopyOnWriteArrayList<>();
        
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name("conversation_updated")
                        .data(conversation));
            } catch (IOException e) {
                log.warn("Failed to send conversation update to SSE emitter, removing it", e);
                deadEmitters.add(emitter);
            }
        }

        emitters.removeAll(deadEmitters);
    }

    /**
     * Close all connections for a user (e.g., on logout)
     */
    public void closeUserConnections(Long userId) {
        List<Long> conversationIds = userConversations.remove(userId);
        if (conversationIds == null) {
            return;
        }

        for (Long conversationId : conversationIds) {
            List<SseEmitter> emitters = conversationEmitters.get(conversationId);
            if (emitters != null) {
                emitters.removeIf(emitter -> {
                    try {
                        emitter.complete();
                        return true;
                    } catch (Exception e) {
                        log.warn("Error closing emitter for user {} in conversation {}", userId, conversationId, e);
                        return true;
                    }
                });
                
                // Remove conversation if no more emitters
                if (emitters.isEmpty()) {
                    conversationEmitters.remove(conversationId);
                }
            }
        }

        log.info("Closed all SSE connections for user {}", userId);
    }

    /**
     * Remove a specific emitter
     */
    private void removeEmitter(Long conversationId, Long userId, SseEmitter emitter) {
        List<SseEmitter> emitters = conversationEmitters.get(conversationId);
        if (emitters != null) {
            emitters.remove(emitter);
            if (emitters.isEmpty()) {
                conversationEmitters.remove(conversationId);
            }
        }

        List<Long> userConvs = userConversations.get(userId);
        if (userConvs != null) {
            userConvs.remove(conversationId);
            if (userConvs.isEmpty()) {
                userConversations.remove(userId);
            }
        }

        try {
            emitter.complete();
        } catch (Exception e) {
            log.warn("Error completing emitter", e);
        }
    }
}

