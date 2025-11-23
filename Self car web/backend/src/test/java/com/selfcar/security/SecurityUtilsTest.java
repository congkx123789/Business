package com.selfcar.security;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import static org.assertj.core.api.Assertions.assertThat;

class SecurityUtilsTest {

    @AfterEach
    void cleanup() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("constantTimeEquals for strings and bytes")
    void constantTimeEquals() {
        assertThat(SecurityUtils.constantTimeEquals("abc", "abc")).isTrue();
        assertThat(SecurityUtils.constantTimeEquals("abc", "abd")).isFalse();
        assertThat(SecurityUtils.constantTimeEquals((String) null, null)).isTrue();
        assertThat(SecurityUtils.constantTimeEquals("a", null)).isFalse();

        assertThat(SecurityUtils.constantTimeEquals("", "")).isTrue();

        byte[] x = new byte[] {1,2,3};
        byte[] y = new byte[] {1,2,3};
        byte[] z = new byte[] {1,2,4};
        assertThat(SecurityUtils.constantTimeEquals(x, y)).isTrue();
        assertThat(SecurityUtils.constantTimeEquals(x, z)).isFalse();
        assertThat(SecurityUtils.constantTimeEquals((byte[]) null, null)).isTrue();
        assertThat(SecurityUtils.constantTimeEquals(new byte[]{1}, null)).isFalse();
    }

    @Test
    @DisplayName("getCurrentUserId returns id for authenticated UserPrincipal")
    void getCurrentUserId_authenticated() {
        com.selfcar.model.auth.User user = new com.selfcar.model.auth.User();
        user.setId(42L);
        user.setEmail("user@example.com");
        user.setRole(com.selfcar.model.auth.User.Role.CUSTOMER);
        user.setActive(true);
        UserPrincipal principal = UserPrincipal.create(user);
        TestingAuthenticationToken auth = new TestingAuthenticationToken(principal, null);
        auth.setAuthenticated(true);
        SecurityContextHolder.getContext().setAuthentication(auth);

        Long id = SecurityUtils.getCurrentUserId();
        assertThat(id).isEqualTo(42L);
    }

    @Test
    @DisplayName("getCurrentUserId returns null when unauthenticated or wrong principal")
    void getCurrentUserId_unauthenticatedOrWrongPrincipal() {
        // unauthenticated
        SecurityContextHolder.clearContext();
        assertThat(SecurityUtils.getCurrentUserId()).isNull();

        // wrong principal type
        TestingAuthenticationToken auth = new TestingAuthenticationToken("user", null);
        auth.setAuthenticated(true);
        SecurityContextHolder.getContext().setAuthentication(auth);
        assertThat(SecurityUtils.getCurrentUserId()).isNull();
    }
}


