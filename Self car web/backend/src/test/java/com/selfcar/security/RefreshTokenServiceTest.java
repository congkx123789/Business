package com.selfcar.security;

import com.selfcar.model.auth.RefreshToken;
import com.selfcar.repository.auth.RefreshTokenRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RefreshTokenServiceTest {

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private JwtTokenProvider jwtTokenProvider; // not used directly here but required by service

    @InjectMocks
    private RefreshTokenService service;

    @BeforeEach
    void setup() {
        // Make expiration small to simplify timing arithmetic
        ReflectionTestUtils.setField(service, "refreshTokenExpiration", 60_000L); // 1 minute
    }

    @Test
    @DisplayName("createRefreshToken revokes old tokens and saves new one")
    void createRefreshToken_revokesOldAndSavesNew() {
        when(refreshTokenRepository.findAllByUserIdAndRevokedFalse(1L))
                .thenReturn(List.of(new RefreshToken()));

        when(refreshTokenRepository.save(any(RefreshToken.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        RefreshToken created = service.createRefreshToken(1L);

        assertThat(created.getUserId()).isEqualTo(1L);
        assertThat(created.getToken()).isNotBlank();
        assertThat(created.getExpiryDate()).isAfter(LocalDateTime.now());

        verify(refreshTokenRepository, atLeastOnce()).save(any(RefreshToken.class));
    }

    @Test
    @DisplayName("validateAndRotateToken returns null for missing/expired/revoked")
    void validateAndRotate_invalidCases() {
        // missing
        when(refreshTokenRepository.findByToken("missing")).thenReturn(Optional.empty());
        assertThat(service.validateAndRotateToken("missing")).isNull();

        // expired
        RefreshToken expired = new RefreshToken();
        expired.setUserId(2L);
        expired.setToken("expired");
        expired.setExpiryDate(LocalDateTime.now().minusMinutes(1));
        when(refreshTokenRepository.findByToken("expired")).thenReturn(Optional.of(expired));
        assertThat(service.validateAndRotateToken("expired")).isNull();

        // revoked
        RefreshToken revoked = new RefreshToken();
        revoked.setUserId(3L);
        revoked.setToken("revoked");
        revoked.setExpiryDate(LocalDateTime.now().plusMinutes(1));
        revoked.setRevoked(true);
        when(refreshTokenRepository.findByToken("revoked")).thenReturn(Optional.of(revoked));
        assertThat(service.validateAndRotateToken("revoked")).isNull();
    }

    @Test
    @DisplayName("validateAndRotateToken revokes old and returns user id on success")
    void validateAndRotate_success() {
        RefreshToken existing = new RefreshToken();
        existing.setUserId(10L);
        existing.setToken("ok");
        existing.setExpiryDate(LocalDateTime.now().plusMinutes(5));
        existing.setRevoked(false);
        when(refreshTokenRepository.findByToken("ok")).thenReturn(Optional.of(existing));
        when(refreshTokenRepository.save(any(RefreshToken.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        // createRefreshToken called inside: mock save and revoke
        when(refreshTokenRepository.findAllByUserIdAndRevokedFalse(10L)).thenReturn(List.of());

        Long userId = service.validateAndRotateToken("ok");

        assertThat(userId).isEqualTo(10L);
        verify(refreshTokenRepository).save(argThat(rt -> rt.isRevoked()));
        verify(refreshTokenRepository, atLeast(2)).save(any(RefreshToken.class));
    }

    @Test
    @DisplayName("revokeToken marks token as revoked when present")
    void revokeToken_marksRevoked() {
        RefreshToken token = new RefreshToken();
        token.setUserId(5L);
        token.setToken("t");
        token.setExpiryDate(LocalDateTime.now().plusMinutes(5));
        when(refreshTokenRepository.findByToken("t")).thenReturn(Optional.of(token));

        service.revokeToken("t");
        verify(refreshTokenRepository).save(argThat(rt -> rt.isRevoked()));
    }

    @Test
    @DisplayName("cleanupExpiredTokens deletes by cutoff time")
    void cleanupExpiredTokens_deletes() {
        when(refreshTokenRepository.deleteByExpiryDateBefore(any(LocalDateTime.class))).thenReturn(2L);
        service.cleanupExpiredTokens();
        verify(refreshTokenRepository).deleteByExpiryDateBefore(any(LocalDateTime.class));
    }
}


