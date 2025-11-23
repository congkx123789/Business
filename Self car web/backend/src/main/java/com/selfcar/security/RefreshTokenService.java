package com.selfcar.security;

import com.selfcar.model.auth.RefreshToken;
import com.selfcar.repository.auth.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Refresh Token Service
 * 
 * Manages refresh tokens for JWT authentication.
 * Refresh tokens are stored securely and rotated on each use.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtTokenProvider jwtTokenProvider;

    @Value("${jwt.refresh-expiration:604800000}") // 7 days default
    private long refreshTokenExpiration;

    /**
     * Creates a new refresh token for a user
     * 
     * @param userId The user ID
     * @return The refresh token
     */
    @Transactional
    public RefreshToken createRefreshToken(Long userId) {
        // Revoke any existing refresh tokens for this user
        revokeUserTokens(userId);

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUserId(userId);
        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setExpiryDate(LocalDateTime.now().plusSeconds(refreshTokenExpiration / 1000));
        refreshToken.setCreatedAt(LocalDateTime.now());

        return refreshTokenRepository.save(refreshToken);
    }

    /**
     * Validates and rotates a refresh token
     * 
     * @param token The refresh token string
     * @return The user ID if valid, null otherwise
     */
    @Transactional
    public Long validateAndRotateToken(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElse(null);

        if (refreshToken == null) {
            log.warn("Refresh token not found: {}", token);
            return null;
        }

        if (refreshToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            log.warn("Refresh token expired for user: {}", refreshToken.getUserId());
            refreshTokenRepository.delete(refreshToken);
            return null;
        }

        if (refreshToken.isRevoked()) {
            log.warn("Refresh token revoked for user: {}", refreshToken.getUserId());
            return null;
        }

        // Token rotation: revoke old token and create new one
        Long userId = refreshToken.getUserId();
        refreshToken.setRevoked(true);
        refreshToken.setRevokedAt(LocalDateTime.now());
        refreshTokenRepository.save(refreshToken);

        // Create new refresh token
        createRefreshToken(userId);

        return userId;
    }

    /**
     * Revokes all refresh tokens for a user
     * 
     * @param userId The user ID
     */
    @Transactional
    public void revokeUserTokens(Long userId) {
        refreshTokenRepository.findAllByUserIdAndRevokedFalse(userId)
                .forEach(token -> {
                    token.setRevoked(true);
                    token.setRevokedAt(LocalDateTime.now());
                    refreshTokenRepository.save(token);
                });
        log.info("Revoked all refresh tokens for user: {}", userId);
    }

    /**
     * Gets user ID from refresh token (for logging purposes)
     * 
     * @param token The refresh token string
     * @return User ID if token exists, null otherwise
     */
    public Long getUserIdFromToken(String token) {
        return refreshTokenRepository.findByToken(token)
                .map(RefreshToken::getUserId)
                .orElse(null);
    }

    /**
     * Revokes a specific refresh token
     * 
     * @param token The refresh token string
     */
    @Transactional
    public void revokeToken(String token) {
        refreshTokenRepository.findByToken(token)
                .ifPresent(refreshToken -> {
                    refreshToken.setRevoked(true);
                    refreshToken.setRevokedAt(LocalDateTime.now());
                    refreshTokenRepository.save(refreshToken);
                    log.info("Revoked refresh token for user: {}", refreshToken.getUserId());
                });
    }

    /**
     * Cleans up expired tokens
     */
    @Transactional
    public void cleanupExpiredTokens() {
        LocalDateTime now = LocalDateTime.now();
        long deleted = refreshTokenRepository.deleteByExpiryDateBefore(now);
        if (deleted > 0) {
            log.info("Cleaned up {} expired refresh tokens", deleted);
        }
    }
}

