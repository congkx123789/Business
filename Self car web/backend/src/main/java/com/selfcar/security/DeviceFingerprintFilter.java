package com.selfcar.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * Sets a privacy-preserving device cookie if missing.
 * - Name: scid
 * - HttpOnly, Secure, SameSite=Lax, Max-Age ~90d
 */
@Component
@Slf4j
public class DeviceFingerprintFilter extends OncePerRequestFilter {

    private static final String COOKIE_NAME = "scid";
    private static final SecureRandom RNG = new SecureRandom();

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain)
            throws ServletException, IOException {
        boolean hasCookie = false;
        if (request.getCookies() != null) {
            for (Cookie c : request.getCookies()) {
                if (COOKIE_NAME.equals(c.getName())) { hasCookie = true; break; }
            }
        }

        if (!hasCookie) {
            byte[] bytes = new byte[16];
            RNG.nextBytes(bytes);
            String id = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
            Cookie cookie = new Cookie(COOKIE_NAME, id);
            cookie.setHttpOnly(true);
            cookie.setSecure(true);
            cookie.setPath("/");
            cookie.setMaxAge(90 * 24 * 60 * 60);
            try {
                cookie.setAttribute("SameSite", "Lax");
            } catch (Throwable t) { 
                log.debug("Failed setting SameSite attribute on device cookie", t);
            }
            response.addCookie(cookie);
        }

        filterChain.doFilter(request, response);
    }
}


