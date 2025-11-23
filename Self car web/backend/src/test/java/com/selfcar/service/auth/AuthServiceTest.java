package com.selfcar.service.auth;

import com.selfcar.dto.auth.AuthResponse;
import com.selfcar.dto.auth.LoginRequest;
import com.selfcar.dto.auth.RegisterRequest;
import com.selfcar.model.auth.RefreshToken;
import com.selfcar.model.auth.User;
import com.selfcar.repository.auth.UserRepository;
import com.selfcar.security.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private JwtTokenProvider tokenProvider;
    @Mock private RefreshTokenService refreshTokenService;
    @Mock private LoginThrottleService loginThrottleService;
    @Mock private BreachedPasswordService breachedPasswordService;
    @Mock private SecurityEventLogger securityEventLogger;
    @Mock private RiskScoringService riskScoringService;
    @Mock private RateLimitingService rateLimitingService;
    @Mock private AuditLogger auditLogger;

    @InjectMocks private AuthService authService;

    private User user;

    @BeforeEach
    void setup() {
        user = new User();
        user.setId(1L);
        user.setEmail("john@example.com");
        // set in specific tests only
    }

    @Test
    @DisplayName("register creates user, authenticates, returns tokens")
    void register_success() {
        RegisterRequest req = new RegisterRequest();
        req.setFirstName("John");
        req.setLastName("Doe");
        req.setEmail("john@example.com");
        req.setPhone("+1");
        req.setPassword("Passw0rd!");

        when(userRepository.existsByEmail("john@example.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(passwordEncoder.encode(anyString())).thenReturn("hashed");
        Authentication auth = new UsernamePasswordAuthenticationToken("john@example.com", null, java.util.List.of());
        when(authenticationManager.authenticate(any())).thenReturn(auth);
        when(tokenProvider.generateToken(any(Authentication.class))).thenReturn("access");
        RefreshToken rt = new RefreshToken(); rt.setToken("refresh");
        when(refreshTokenService.createRefreshToken(1L)).thenReturn(rt);
        when(breachedPasswordService.isPasswordBreached(anyString())).thenReturn(false);

        AuthResponse res = authService.register(req);
        assertThat(res.getToken()).isEqualTo("access");
        assertThat(res.getRefreshToken()).isEqualTo("refresh");
    }

    @Test
    @DisplayName("login issues tokens and clears throttle on success")
    void login_success() {
        LoginRequest req = new LoginRequest();
        req.setEmail("john@example.com");
        req.setPassword("x");

        Authentication auth = new UsernamePasswordAuthenticationToken("john@example.com", null, java.util.List.of());
        when(authenticationManager.authenticate(any())).thenReturn(auth);
        when(tokenProvider.generateToken(any(Authentication.class))).thenReturn("access");
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(user));
        RefreshToken rt = new RefreshToken(); rt.setToken("refresh");
        when(refreshTokenService.createRefreshToken(1L)).thenReturn(rt);
        when(loginThrottleService.isLoginAllowed(anyString())).thenReturn(true);
        when(rateLimitingService.isLoginAllowed(anyString())).thenReturn(true);
        when(riskScoringService.evaluateLogin(any(), any(), any(), anyInt(), anyBoolean()))
                .thenReturn(RiskScoringService.Decision.builder().score(0).action("allow").reasons(new String[]{"test"}).build());

        AuthResponse res = authService.login(req, null);
        assertThat(res.getToken()).isEqualTo("access");
        assertThat(res.getRefreshToken()).isEqualTo("refresh");
        verify(loginThrottleService).recordSuccessfulLogin("john@example.com");
    }

    @Test
    @DisplayName("refreshAccessToken validates and rotates refresh token")
    void refresh_token_success() {
        when(refreshTokenService.validateAndRotateToken("r")).thenReturn(1L);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(tokenProvider.generateToken(any())).thenReturn("new-access");
        RefreshToken rt = new RefreshToken(); rt.setToken("new-refresh");
        when(refreshTokenService.createRefreshToken(1L)).thenReturn(rt);

        AuthResponse res = authService.refreshAccessToken("r");
        assertThat(res.getToken()).isEqualTo("new-access");
        assertThat(res.getRefreshToken()).isEqualTo("new-refresh");
    }

    @Test
    @DisplayName("login enforces throttle and rate-limits")
    void login_rateLimited_or_throttled() {
        // Simulate rate-limit block
        when(rateLimitingService.isLoginAllowed(anyString())).thenReturn(false);
        LoginRequest req = new LoginRequest();
        req.setEmail("john@example.com");
        req.setPassword("x");
        assertThrows(RuntimeException.class, () -> authService.login(req, null));
    }
}


