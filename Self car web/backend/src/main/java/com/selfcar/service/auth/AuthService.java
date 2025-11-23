package com.selfcar.service.auth;

import com.selfcar.dto.auth.AuthResponse;
import com.selfcar.dto.auth.LoginRequest;
import com.selfcar.dto.auth.RegisterRequest;
import com.selfcar.model.auth.RefreshToken;
import com.selfcar.model.auth.User;
import com.selfcar.repository.auth.UserRepository;
import com.selfcar.security.BreachedPasswordService;
import com.selfcar.security.JwtTokenProvider;
import com.selfcar.security.LoginThrottleService;
import com.selfcar.security.RefreshTokenService;
import com.selfcar.security.SecurityEventLogger;
import com.selfcar.security.RiskScoringService;
import com.selfcar.security.RateLimitingService;
import com.selfcar.security.AuditLogger;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final RefreshTokenService refreshTokenService;
    private final LoginThrottleService loginThrottleService;
    private final BreachedPasswordService breachedPasswordService;
    private final SecurityEventLogger securityEventLogger;
    private final RiskScoringService riskScoringService;
    private final RateLimitingService rateLimitingService;
    private final AuditLogger auditLogger;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        Objects.requireNonNull(request, "Register request cannot be null");
        Objects.requireNonNull(request.getEmail(), "Email cannot be null");
        
        if (userRepository.existsByEmail(request.getEmail())) {
            log.warn("Registration attempted with existing email: {}", request.getEmail());
            throw new RuntimeException("Email already exists");
        }

        log.info("Registering new user with email: {}", request.getEmail());
        
        // Check if password has been breached
        if (breachedPasswordService.isPasswordBreached(request.getPassword())) {
            securityEventLogger.logBreachedPassword(request.getEmail(), "registration");
            throw new RuntimeException("This password has been found in a data breach. Please choose a different password.");
        }
        
        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(User.Role.CUSTOMER);
        user.setOauthProvider("local"); // Mark as local registration

        User savedUser = userRepository.save(user);
        log.debug("User registered successfully with ID: {}", savedUser.getId());

        // Auto login after registration
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        String accessToken = tokenProvider.generateToken(authentication);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(savedUser.getId());
        
        return new AuthResponse(accessToken, refreshToken.getToken(), new AuthResponse.UserDTO(savedUser));
    }

    public AuthResponse login(LoginRequest request, jakarta.servlet.http.HttpServletRequest httpRequest) {
        Objects.requireNonNull(request, "Login request cannot be null");
        Objects.requireNonNull(request.getEmail(), "Email cannot be null");
        
        String identifier = request.getEmail();
        String clientIp = extractClientIp(httpRequest);
        String deviceId = extractDeviceId(httpRequest);

        // Telemetry: attempted
        auditLogger.logAuthEvent("login_attempted", null, clientIp, httpRequest != null ? httpRequest.getHeader("User-Agent") : null, java.util.Map.of("email_hash", Integer.toHexString(identifier.hashCode())));

        // Composite rate-limits (Week 6: observe → enforce gently)
        if (!rateLimitingService.isLoginAllowed("IP:" + clientIp) ||
            !rateLimitingService.isLoginAllowed("USER:" + identifier) ||
            (deviceId != null && !rateLimitingService.isLoginAllowed("DEVICE:" + deviceId)) ||
            !rateLimitingService.isLoginAllowed("PAIR:" + clientIp + ":" + identifier)) {
            securityEventLogger.logRateLimitExceeded("LOGIN_COMPOSITE:" + clientIp + ":" + identifier, 0, 0);
            throw new RuntimeException("Too many login attempts. Please try again later.");
        }

        // Risk scoring (v0 allows all)
        var decision = riskScoringService.evaluateLogin(clientIp, deviceId, identifier, 0, false);
        auditLogger.logAuthEvent("risk_evaluated", null, clientIp, httpRequest != null ? httpRequest.getHeader("User-Agent") : null, java.util.Map.of("score", decision.getScore(), "action", decision.getAction()));
        
        // Check login throttling
        if (!loginThrottleService.isLoginAllowed(identifier)) {
            long remainingMinutes = loginThrottleService.getRemainingLockoutMinutes(identifier);
            securityEventLogger.logAccountLockout(identifier, clientIp, remainingMinutes);
            throw new RuntimeException(
                String.format("Too many failed login attempts. Account locked for %d more minutes.", remainingMinutes)
            );
        }
        
        log.info("Login attempt for email: {} (IP: {})", request.getEmail(), clientIp);
        
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            String accessToken = tokenProvider.generateToken(authentication);
            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> {
                        log.warn("User not found after authentication for email: {}", request.getEmail());
                        return new RuntimeException("User not found");
                    });

            // Create refresh token
            RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());

            // Clear failed login attempts on success
            loginThrottleService.recordSuccessfulLogin(identifier);

            auditLogger.logAuthEvent("pwd_pass", user.getId(), clientIp, httpRequest != null ? httpRequest.getHeader("User-Agent") : null, java.util.Map.of());

            log.debug("User logged in successfully with ID: {}", user.getId());
            return new AuthResponse(accessToken, refreshToken.getToken(), new AuthResponse.UserDTO(user));
        } catch (Exception e) {
            // Record failed attempt
            loginThrottleService.recordFailedAttempt(identifier);
            securityEventLogger.logFailedLogin(identifier, clientIp, e.getMessage());
            auditLogger.logAuthEvent("blocked", null, clientIp, httpRequest != null ? httpRequest.getHeader("User-Agent") : null, java.util.Map.of("reason", e.getMessage()));
            throw e;
        }
    }

    private String extractClientIp(jakarta.servlet.http.HttpServletRequest request) {
        if (request == null) return "unknown";
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) return xff.split(",")[0].trim();
        String xri = request.getHeader("X-Real-IP");
        if (xri != null && !xri.isBlank()) return xri;
        return request.getRemoteAddr();
    }

    private String extractDeviceId(jakarta.servlet.http.HttpServletRequest request) {
        if (request == null || request.getCookies() == null) return null;
        for (jakarta.servlet.http.Cookie c : request.getCookies()) {
            if ("scid".equals(c.getName())) return c.getValue();
        }
        return null;
    }
    
    public AuthResponse refreshAccessToken(String refreshTokenString) {
        Long userId = refreshTokenService.validateAndRotateToken(refreshTokenString);
        
        if (userId == null) {
            throw new RuntimeException("Invalid or expired refresh token");
        }
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Create new authentication and access token
        Authentication authentication = new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                user.getEmail(), null, null
        );
        
        String accessToken = tokenProvider.generateToken(authentication);
        RefreshToken newRefreshToken = refreshTokenService.createRefreshToken(userId);
        
        return new AuthResponse(accessToken, newRefreshToken.getToken(), new AuthResponse.UserDTO(user));
    }
    
    public void revokeRefreshToken(String refreshTokenString) {
        // Get user ID from token before revoking (for logging)
        try {
            Long userId = refreshTokenService.getUserIdFromToken(refreshTokenString);
            refreshTokenService.revokeToken(refreshTokenString);
            if (userId != null) {
                securityEventLogger.logTokenRevocation(userId, "refresh", "user_logout");
            }
        } catch (Exception e) {
            log.warn("Could not get user ID from refresh token for logging: {}", e.getMessage());
            refreshTokenService.revokeToken(refreshTokenString);
        }
    }
}

