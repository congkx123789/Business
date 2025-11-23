package com.selfcar.controller.auth;

import com.selfcar.dto.common.ApiResponse;
import com.selfcar.dto.auth.AuthResponse;
import com.selfcar.dto.auth.LoginRequest;
import com.selfcar.dto.auth.RegisterRequest;
import com.selfcar.security.UserPrincipal;
import com.selfcar.service.auth.AuthService;
import com.selfcar.service.car.ChatService;
import com.selfcar.service.common.RealtimeMessageService;
import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.http.ResponseCookie;
import org.springframework.http.HttpHeaders;
import java.time.Duration;
import java.util.Objects;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final ChatService chatService;
    private final RealtimeMessageService realtimeMessageService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request,
                                      jakarta.servlet.http.HttpServletResponse httpResponse) {
        try {
            AuthResponse response = authService.register(request);
            // Issue HTTP-only, Secure cookies for tokens
            ResponseCookie accessCookie = ResponseCookie.from("access_token", Objects.requireNonNull(response.getToken()))
                    .httpOnly(true)
                    .secure(true)
                    .path("/")
                    .maxAge(Objects.requireNonNull(Duration.ofMinutes(15)))
                    .sameSite("Strict")
                    .build();
            httpResponse.addHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());

            if (response.getRefreshToken() != null) {
                ResponseCookie refreshCookie = ResponseCookie.from("refresh_token", Objects.requireNonNull(response.getRefreshToken()))
                        .httpOnly(true)
                        .secure(true)
                        .path("/")
                        .maxAge(Objects.requireNonNull(Duration.ofDays(7)))
                        .sameSite("Strict")
                        .build();
                httpResponse.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @Valid @RequestBody LoginRequest request,
            jakarta.servlet.http.HttpServletRequest httpRequest,
            jakarta.servlet.http.HttpServletResponse httpResponse) {
        try {
            AuthResponse response = authService.login(request, httpRequest);
            // Set HTTP-only, Secure cookies with SameSite for tokens
            ResponseCookie accessCookie = ResponseCookie.from("access_token", Objects.requireNonNull(response.getToken()))
                    .httpOnly(true)
                    .secure(true)
                    .path("/")
                    .maxAge(Objects.requireNonNull(Duration.ofMinutes(15)))
                    .sameSite("Strict")
                    .build();
            httpResponse.addHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());
            if (response.getRefreshToken() != null) {
                ResponseCookie refreshCookie = ResponseCookie.from("refresh_token", Objects.requireNonNull(response.getRefreshToken()))
                        .httpOnly(true)
                        .secure(true)
                        .path("/")
                        .maxAge(Objects.requireNonNull(Duration.ofDays(7)))
                        .sameSite("Strict")
                        .build();
                httpResponse.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody RefreshTokenRequest request,
                                          jakarta.servlet.http.HttpServletResponse httpResponse) {
        try {
            AuthResponse response = authService.refreshAccessToken(request.getRefreshToken());
            // Rotate cookies
            ResponseCookie accessCookie = ResponseCookie.from("access_token", Objects.requireNonNull(response.getToken()))
                    .httpOnly(true)
                    .secure(true)
                    .path("/")
                    .maxAge(Objects.requireNonNull(Duration.ofMinutes(15)))
                    .sameSite("Strict")
                    .build();
            httpResponse.addHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());
            if (response.getRefreshToken() != null) {
                ResponseCookie refreshCookie = ResponseCookie.from("refresh_token", Objects.requireNonNull(response.getRefreshToken()))
                        .httpOnly(true)
                        .secure(true)
                        .path("/")
                        .maxAge(Objects.requireNonNull(Duration.ofDays(7)))
                        .sameSite("Strict")
                        .build();
                httpResponse.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(401)
                    .body(new ApiResponse(false, "Invalid refresh token"));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            @RequestBody RefreshTokenRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            // Update conversation timestamps for user's conversations
            if (userPrincipal != null && userPrincipal.getUser() != null) {
                Long userId = userPrincipal.getUser().getId();
                
                // Update all conversation timestamps for user's conversations
                chatService.getUserConversations(userId).forEach(conversation -> {
                    chatService.updateConversationTimestamp(conversation.getId());
                });
                
                // Close all SSE connections for the user
                realtimeMessageService.closeUserConnections(userId);
            }
            
            if (request.getRefreshToken() != null) {
                authService.revokeRefreshToken(request.getRefreshToken());
            }
            return ResponseEntity.ok(new ApiResponse(true, "Logged out successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @Data
    static class RefreshTokenRequest {
        private String refreshToken;
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            if (userPrincipal == null) {
                return ResponseEntity.status(401)
                        .body(new ApiResponse(false, "Not authenticated"));
            }
            return ResponseEntity.ok(userPrincipal.getUser());
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, "User not found"));
        }
    }
}

