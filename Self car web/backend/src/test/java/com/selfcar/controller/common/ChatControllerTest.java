package com.selfcar.controller.common;

import com.selfcar.model.auth.User;
import com.selfcar.model.common.ChatMessage;
import com.selfcar.model.common.MessageConversation;
import com.selfcar.security.UserPrincipal;
import com.selfcar.service.car.ChatService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChatControllerTest {

    @Mock
    private ChatService chatService;

    @Mock
    private UserPrincipal userPrincipal;

    @InjectMocks
    private ChatController chatController;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("test@example.com");
        
        when(userPrincipal.getUser()).thenReturn(testUser);
    }

    @Test
    void sendMessage_success() {
        ChatMessage message = new ChatMessage();
        message.setId(1L);
        message.setContent("Hello");
        
        when(chatService.sendMessage(eq(1L), eq(1L), eq("Hello"), anyLong()))
                .thenReturn(message);

        ChatController.SendMessageRequest request = new ChatController.SendMessageRequest();
        request.setConversationId(1L);
        request.setContent("Hello");
        request.setShopId(1L);

        ResponseEntity<?> response = chatController.sendMessage(request, userPrincipal);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        verify(chatService).sendMessage(1L, 1L, "Hello", 1L);
    }

    @Test
    void sendMessage_error() {
        when(chatService.sendMessage(anyLong(), anyLong(), anyString(), anyLong()))
                .thenThrow(new RuntimeException("Error"));

        ChatController.SendMessageRequest request = new ChatController.SendMessageRequest();
        request.setConversationId(1L);
        request.setContent("Hello");

        ResponseEntity<?> response = chatController.sendMessage(request, userPrincipal);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void getUserConversations_success() {
        MessageConversation conv1 = new MessageConversation();
        conv1.setId(1L);
        MessageConversation conv2 = new MessageConversation();
        conv2.setId(2L);

        when(chatService.getUserConversations(1L))
                .thenReturn(List.of(conv1, conv2));

        ResponseEntity<List<MessageConversation>> response = 
                chatController.getUserConversations(userPrincipal);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().size());
        verify(chatService).getUserConversations(1L);
    }

    @Test
    void getConversationMessages_success() {
        ChatMessage msg1 = new ChatMessage();
        msg1.setId(1L);
        ChatMessage msg2 = new ChatMessage();
        msg2.setId(2L);

        when(chatService.getConversationMessages(1L))
                .thenReturn(List.of(msg1, msg2));

        ResponseEntity<?> response = chatController.getConversationMessages(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    @Test
    void markMessageAsRead_success() {
        doNothing().when(chatService).markMessageAsRead(1L);

        ResponseEntity<?> response = chatController.markMessageAsRead(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(chatService).markMessageAsRead(1L);
    }

    @Test
    void markAllMessagesAsRead_success() {
        doNothing().when(chatService).markAllMessagesAsRead(eq(1L), eq(1L));

        ResponseEntity<?> response = chatController.markAllMessagesAsRead(1L, userPrincipal);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(chatService).markAllMessagesAsRead(1L, 1L);
    }
}

