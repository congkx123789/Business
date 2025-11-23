package com.selfcar.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

/**
 * OAuth2 Failure Handler
 * Handles OAuth2 authentication failures and redirects to frontend with error message
 */
@Slf4j
@Component
public class OAuth2FailureHandler extends SimpleUrlAuthenticationFailureHandler {

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public void onAuthenticationFailure(HttpServletRequest request,
                                        HttpServletResponse response,
                                        AuthenticationException exception) throws IOException {
        log.error("OAuth2 authentication failed: {}", exception.getMessage());

        String errorMessage = exception.getMessage() != null 
            ? exception.getMessage() 
            : "OAuth2 authentication failed";

        // Redirect to frontend with error message
        String redirectUrl = String.format(
            "%s/auth/oauth2/callback?error=%s",
            frontendUrl,
            URLEncoder.encode(errorMessage, StandardCharsets.UTF_8)
        );

        response.sendRedirect(redirectUrl);
    }
}

