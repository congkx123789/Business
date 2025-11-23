package com.selfcar.controller.common;

import com.selfcar.dto.common.ApiResponse;
import com.selfcar.model.common.ChatMessage;
import com.selfcar.model.common.MessageConversation;
import com.selfcar.security.UserPrincipal;
import com.selfcar.service.car.ChatService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping("/messages")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> sendMessage(
            @RequestBody SendMessageRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            ChatMessage message = chatService.sendMessage(
                    request.getConversationId(),
                    userPrincipal.getUser().getId(),
                    request.getContent(),
                    request.getShopId()
            );
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/conversations")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<MessageConversation>> getUserConversations(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<MessageConversation> conversations = chatService.getUserConversations(
                userPrincipal.getUser().getId()
        );
        return ResponseEntity.ok(conversations);
    }

    @GetMapping("/conversations/{id}/messages")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getConversationMessages(@PathVariable Long id) {
        try {
            List<ChatMessage> messages = chatService.getConversationMessages(id);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PutMapping("/messages/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> markMessageAsRead(@PathVariable Long id) {
        try {
            chatService.markMessageAsRead(id);
            return ResponseEntity.ok(new ApiResponse(true, "Message marked as read"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PutMapping("/conversations/{id}/read-all")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> markAllMessagesAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            chatService.markAllMessagesAsRead(id, userPrincipal.getUser().getId());
            return ResponseEntity.ok(new ApiResponse(true, "All messages marked as read"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @Data
    static class SendMessageRequest {
        private Long conversationId;
        private String content;
        private Long shopId;
    }
}

