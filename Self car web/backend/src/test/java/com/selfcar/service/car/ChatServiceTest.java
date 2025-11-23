package com.selfcar.service.car;

import com.selfcar.model.auth.User;
import com.selfcar.model.common.ChatMessage;
import com.selfcar.model.common.MessageConversation;
import com.selfcar.repository.auth.UserRepository;
import com.selfcar.repository.common.AutomatedReplyRepository;
import com.selfcar.repository.common.ChatMessageRepository;
import com.selfcar.repository.common.MessageConversationRepository;
import com.selfcar.service.common.NotificationService;
import com.selfcar.service.common.RealtimeMessageService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChatServiceTest {

    @Mock ChatMessageRepository chatMessageRepository;
    @Mock MessageConversationRepository conversationRepository;
    @Mock AutomatedReplyRepository automatedReplyRepository;
    @Mock NotificationService notificationService;
    @Mock UserRepository userRepository;
    @Mock RealtimeMessageService realtimeMessageService;

    @InjectMocks ChatService chatService;

    @Test
    void sendMessage_happyPath_persistsAndNotifies() {
        MessageConversation conv = new MessageConversation();
        conv.setId(10L);
        User sender = new User();
        sender.setId(5L);

        when(conversationRepository.findById(10L)).thenReturn(Optional.of(conv));
        when(userRepository.findById(5L)).thenReturn(Optional.of(sender));
        when(chatMessageRepository.save(any(ChatMessage.class))).thenAnswer(inv -> {
            ChatMessage m = inv.getArgument(0);
            m.setId(99L);
            return m;
        });
        // Stub unused mock to avoid warnings
        lenient().when(automatedReplyRepository.findActiveRepliesForShop(anyLong())).thenReturn(java.util.List.of());

        ChatMessage saved = chatService.sendMessage(10L, 5L, "hello", 1L);
        assertNotNull(saved.getId());
        verify(chatMessageRepository).save(any(ChatMessage.class));
        verify(conversationRepository).save(any(MessageConversation.class));
        verify(realtimeMessageService).broadcastMessage(eq(10L), any(ChatMessage.class));
        verify(realtimeMessageService).broadcastConversationUpdate(eq(10L), any(MessageConversation.class));
        verify(notificationService, atLeast(0)).createNotification(any(), any(), any(), any(), any(), any());
    }

    @Test
    void sendMessage_missingConversation_throws() {
        when(conversationRepository.findById(10L)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> chatService.sendMessage(10L, 5L, "hello", 1L));
    }

    @Test
    void sendMessage_missingSender_throws() {
        when(conversationRepository.findById(10L)).thenReturn(Optional.of(new MessageConversation()));
        when(userRepository.findById(5L)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> chatService.sendMessage(10L, 5L, "hello", 1L));
    }

    @Test
    void markMessageAsRead_updatesMessageAndConversation() {
        ChatMessage message = new ChatMessage();
        message.setId(1L);
        message.setRead(false);
        MessageConversation conversation = new MessageConversation();
        conversation.setId(10L);
        message.setConversation(conversation);

        when(chatMessageRepository.findById(1L)).thenReturn(Optional.of(message));
        when(chatMessageRepository.save(any(ChatMessage.class))).thenReturn(message);
        when(conversationRepository.save(any(MessageConversation.class))).thenReturn(conversation);

        chatService.markMessageAsRead(1L);

        assertTrue(message.getRead());
        verify(chatMessageRepository).save(message);
        verify(conversationRepository).save(conversation);
        verify(realtimeMessageService).broadcastConversationUpdate(eq(10L), any(MessageConversation.class));
    }

    @Test
    void getUserConversations_returnsUserConversations() {
        User user = new User();
        user.setId(5L);
        MessageConversation conv1 = new MessageConversation();
        conv1.setId(1L);
        MessageConversation conv2 = new MessageConversation();
        conv2.setId(2L);

        when(conversationRepository.findByParticipantUserId(5L))
                .thenReturn(java.util.List.of(conv1, conv2));

        var conversations = chatService.getUserConversations(5L);

        assertEquals(2, conversations.size());
        verify(conversationRepository).findByParticipantUserId(5L);
    }

    @Test
    void markAllMessagesAsRead_updatesAllUnreadMessages() {
        MessageConversation conversation = new MessageConversation();
        conversation.setId(10L);
        ChatMessage msg1 = new ChatMessage();
        msg1.setId(1L);
        msg1.setRead(false);
        msg1.setConversation(conversation);
        User sender1 = new User();
        sender1.setId(99L);
        msg1.setSender(sender1);
        ChatMessage msg2 = new ChatMessage();
        msg2.setId(2L);
        msg2.setRead(false);
        msg2.setConversation(conversation);
        User sender2 = new User();
        sender2.setId(99L);
        msg2.setSender(sender2);

        when(conversationRepository.findById(10L)).thenReturn(Optional.of(conversation));
        when(chatMessageRepository.findByConversationIdAndReadFalse(10L))
                .thenReturn(java.util.List.of(msg1, msg2));
        when(chatMessageRepository.save(any(ChatMessage.class))).thenAnswer(inv -> inv.getArgument(0));
        when(conversationRepository.save(any(MessageConversation.class))).thenReturn(conversation);

        chatService.markAllMessagesAsRead(10L, 5L);

        verify(chatMessageRepository, times(2)).save(any(ChatMessage.class));
        verify(conversationRepository).save(conversation);
        verify(realtimeMessageService).broadcastConversationUpdate(eq(10L), any(MessageConversation.class));
    }

    @Test
    void updateConversationTimestamp_savesConversation() {
        MessageConversation conversation = new MessageConversation();
        conversation.setId(10L);

        when(conversationRepository.findById(10L)).thenReturn(Optional.of(conversation));
        when(conversationRepository.save(conversation)).thenReturn(conversation);

        chatService.updateConversationTimestamp(10L);

        verify(conversationRepository).save(conversation);
    }
}


