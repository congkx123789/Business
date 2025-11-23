package com.selfcar.controller.common;

import com.selfcar.security.UserPrincipal;
import com.selfcar.service.common.RealtimeMessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class RealtimeMessageController {

    private final RealtimeMessageService realtimeMessageService;

    @GetMapping(value = "/stream/{conversationId}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SseEmitter> streamMessages(
            @PathVariable Long conversationId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        if (userPrincipal == null || userPrincipal.getUser() == null) {
            return ResponseEntity.status(401).build();
        }

        Long userId = userPrincipal.getUser().getId();
        SseEmitter emitter = realtimeMessageService.subscribe(conversationId, userId);
        
        if (emitter == null) {
            return ResponseEntity.status(500).build();
        }

        return ResponseEntity.ok(emitter);
    }
}

