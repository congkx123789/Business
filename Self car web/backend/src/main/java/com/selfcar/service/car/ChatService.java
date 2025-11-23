package com.selfcar.service.car;

import com.selfcar.model.auth.User;
import com.selfcar.model.common.ChatMessage;
import com.selfcar.model.common.MessageConversation;
import com.selfcar.model.common.ConversationParticipant;
import com.selfcar.model.common.Notification;
import com.selfcar.model.common.AutomatedReply;
import com.selfcar.repository.common.ChatMessageRepository;
import com.selfcar.repository.common.MessageConversationRepository;
import com.selfcar.repository.common.AutomatedReplyRepository;
import com.selfcar.repository.auth.UserRepository;
import com.selfcar.service.common.NotificationService;
import com.selfcar.service.common.RealtimeMessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final MessageConversationRepository conversationRepository;
    private final AutomatedReplyRepository automatedReplyRepository;
    private final NotificationService notificationService;
    private final UserRepository userRepository;
    private final RealtimeMessageService realtimeMessageService;

    @Transactional
    public ChatMessage sendMessage(@NonNull Long conversationId, @NonNull Long senderId, String content, Long shopId) {
        Objects.requireNonNull(conversationId, "Conversation ID is required");
        Objects.requireNonNull(senderId, "Sender ID is required");
        Objects.requireNonNull(content, "Message content is required");

        MessageConversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> {
                    log.warn("Conversation not found with ID: {}", conversationId);
                    return new RuntimeException("Conversation not found");
                });
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> {
                    log.warn("Sender not found with ID: {}", senderId);
                    return new RuntimeException("Sender not found");
                });
        
        log.debug("Sending message in conversation ID: {} from sender ID: {}", conversationId, senderId);

        ChatMessage message = new ChatMessage();
        message.setConversation(conversation);
        message.setSender(sender);
        message.setContent(content);
        message.setRead(false);

        ChatMessage savedMessage = chatMessageRepository.save(message);

        // Explicitly save conversation to trigger @LastModifiedDate update
        conversationRepository.save(conversation);

        // Broadcast real-time update
        realtimeMessageService.broadcastMessage(conversationId, savedMessage);
        realtimeMessageService.broadcastConversationUpdate(conversationId, conversation);

        // Check for automated replies
        checkAndSendAutomatedReply(conversation, content, shopId);

        // Create notification for recipients
        notifyConversationParticipants(conversation, savedMessage);

        return savedMessage;
    }

    private void checkAndSendAutomatedReply(MessageConversation conversation, String messageContent, Long shopId) {
        // Find candidate automated replies for the shop and filter in-memory for portability (regex/like)
        List<AutomatedReply> candidates = automatedReplyRepository.findActiveRepliesForShop(shopId);
        String normalized = messageContent == null ? "" : messageContent.toLowerCase();
        List<AutomatedReply> matchingReplies = candidates.stream()
                .filter(a -> {
                    boolean keywordMatch = a.getTriggerKeyword() != null && !a.getTriggerKeyword().isBlank()
                            && normalized.contains(a.getTriggerKeyword().toLowerCase());
                    boolean regexMatch = false;
                    if (a.getTriggerPattern() != null && !a.getTriggerPattern().isBlank()) {
                        try {
                            regexMatch = java.util.regex.Pattern.compile(a.getTriggerPattern(), java.util.regex.Pattern.CASE_INSENSITIVE)
                                    .matcher(messageContent == null ? "" : messageContent)
                                    .find();
                        } catch (Exception e) {
                            log.warn("Invalid trigger pattern '{}': {}", a.getTriggerPattern(), e.getMessage());
                        }
                    }
                    return keywordMatch || regexMatch;
                })
                .toList();

        if (!matchingReplies.isEmpty()) {
            AutomatedReply reply = matchingReplies.get(0); // Get highest priority reply

            // Process template placeholders if needed
            String replyMessage = processReplyTemplate(reply, conversation);

            // Create automated reply message
            // Find shop owner or system user for automated replies
            User automatedUser = findAutomatedUser(shopId);
            if (automatedUser != null) {
                ChatMessage autoReply = new ChatMessage();
                autoReply.setConversation(conversation);
                autoReply.setSender(automatedUser);
                autoReply.setContent(replyMessage);
                autoReply.setRead(false);
                chatMessageRepository.save(autoReply);

                // Explicitly save conversation to trigger @LastModifiedDate update
                conversationRepository.save(conversation);

                // Broadcast real-time update for automated reply
                realtimeMessageService.broadcastMessage(conversation.getId(), autoReply);
                realtimeMessageService.broadcastConversationUpdate(conversation.getId(), conversation);

                // Increment usage count
                reply.setUsageCount(reply.getUsageCount() + 1);
                automatedReplyRepository.save(reply);
            }
        }
    }

    private String processReplyTemplate(AutomatedReply reply, MessageConversation conversation) {
        String message = reply.getReplyMessage();

        if (reply.getReplyType() == AutomatedReply.ReplyType.TEMPLATE) {
            // Replace placeholders like {car_name}, {price}, etc.
            // This is a simplified version - you can enhance it based on your needs
            // For now, return as-is or implement placeholder replacement logic
        }

        return message;
    }

    private User findAutomatedUser(Long shopId) {
        // Return shop owner or a system user for automated replies
        // This is a placeholder - implement based on your business logic
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.Role.ADMIN)
                .findFirst()
                .orElse(null);
    }

    private void notifyConversationParticipants(MessageConversation conversation, ChatMessage message) {
        // Get all participants except the sender
        List<ConversationParticipant> participants = conversation.getParticipants();
        
        if (participants == null || message.getSender() == null) {
            return;
        }
        
        for (ConversationParticipant participant : participants) {
            if (participant != null && participant.getUser() != null && 
                !participant.getUser().getId().equals(message.getSender().getId())) {
                notificationService.createNotification(
                    participant.getUser().getId(),
                    "New Message",
                    "You have a new message in your conversation",
                    Notification.NotificationType.CHAT_MESSAGE,
                    "conversation",
                    conversation.getId()
                );
            }
        }
    }

    public List<ChatMessage> getConversationMessages(@NonNull Long conversationId) {
        Objects.requireNonNull(conversationId, "Conversation ID cannot be null");
        MessageConversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> {
                    log.warn("Conversation not found with ID: {}", conversationId);
                    return new RuntimeException("Conversation not found");
                });
        return conversation.getMessages();
    }

    @Transactional
    public void markMessageAsRead(@NonNull Long messageId) {
        Objects.requireNonNull(messageId, "Message ID cannot be null");
        ChatMessage message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> {
                    log.warn("Message not found with ID: {}", messageId);
                    return new RuntimeException("Message not found");
                });
        message.setRead(true);
        chatMessageRepository.save(message);
        
        // Update conversation timestamp when message is marked as read
        MessageConversation conversation = message.getConversation();
        if (conversation != null) {
            conversationRepository.save(conversation);
            // Broadcast conversation update
            realtimeMessageService.broadcastConversationUpdate(conversation.getId(), conversation);
        }
    }

    /**
     * Get all conversations for a user
     */
    public List<MessageConversation> getUserConversations(@NonNull Long userId) {
        Objects.requireNonNull(userId, "User ID cannot be null");
        return conversationRepository.findByParticipantUserId(userId);
    }

    /**
     * Mark all messages in a conversation as read for a specific user
     */
    @Transactional
    public void markAllMessagesAsRead(@NonNull Long conversationId, @NonNull Long userId) {
        Objects.requireNonNull(conversationId, "Conversation ID cannot be null");
        Objects.requireNonNull(userId, "User ID cannot be null");
        
        MessageConversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> {
                    log.warn("Conversation not found with ID: {}", conversationId);
                    return new RuntimeException("Conversation not found");
                });
        
        // Mark all unread messages as read (excluding messages sent by the user)
        List<ChatMessage> unreadMessages = chatMessageRepository.findByConversationIdAndReadFalse(conversationId);
        for (ChatMessage message : unreadMessages) {
            if (message.getSender() != null && !message.getSender().getId().equals(userId)) {
                message.setRead(true);
                chatMessageRepository.save(message);
            }
        }
        
        // Update conversation timestamp
        conversationRepository.save(conversation);
        
        // Broadcast conversation update
        realtimeMessageService.broadcastConversationUpdate(conversationId, conversation);
    }

    /**
     * Update conversation timestamp explicitly
     */
    @Transactional
    public void updateConversationTimestamp(@NonNull Long conversationId) {
        Objects.requireNonNull(conversationId, "Conversation ID cannot be null");
        MessageConversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> {
                    log.warn("Conversation not found with ID: {}", conversationId);
                    return new RuntimeException("Conversation not found");
                });
        conversationRepository.save(conversation);
    }
}
