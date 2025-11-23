package com.selfcar.controller.common;

import com.selfcar.dto.common.ApiResponse;
import com.selfcar.model.common.AutomatedReply;
import com.selfcar.service.common.AutomatedReplyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/automated-replies")
@RequiredArgsConstructor
public class AutomatedReplyController {

    private final AutomatedReplyService automatedReplyService;

    @GetMapping
    public ResponseEntity<List<AutomatedReply>> getAllReplies() {
        return ResponseEntity.ok(automatedReplyService.getAllReplies());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AutomatedReply> getReplyById(@PathVariable Long id) {
        return ResponseEntity.ok(automatedReplyService.getReplyById(id));
    }

    @GetMapping("/shop/{shopId}")
    public ResponseEntity<List<AutomatedReply>> getRepliesByShop(@PathVariable Long shopId) {
        return ResponseEntity.ok(automatedReplyService.getRepliesByShop(shopId));
    }

    @PostMapping
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<?> createReply(@Valid @RequestBody AutomatedReply reply) {
        try {
            return ResponseEntity.ok(automatedReplyService.createReply(reply));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<?> updateReply(@PathVariable Long id, @Valid @RequestBody AutomatedReply replyDetails) {
        try {
            return ResponseEntity.ok(automatedReplyService.updateReply(id, replyDetails));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteReply(@PathVariable Long id) {
        try {
            automatedReplyService.deleteReply(id);
            return ResponseEntity.ok(new ApiResponse(true, "Automated reply deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
}
