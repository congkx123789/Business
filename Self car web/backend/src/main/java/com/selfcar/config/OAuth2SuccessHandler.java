package com.selfcar.config;

import com.selfcar.security.JwtTokenProvider;
import com.selfcar.security.UserPrincipal;
import org.springframework.http.ResponseCookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

/**
 * OAuth2 Success Handler
 * Securely delivers JWT token to frontend using postMessage API
 * This prevents tokens from appearing in URL parameters, browser history, or server logs
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider jwtTokenProvider;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                       HttpServletResponse response,
                                       Authentication authentication) throws IOException {
        try {
            // Extract user principal
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            
            // Generate JWT token
            String token = jwtTokenProvider.generateToken(authentication);
            
            log.info("OAuth2 authentication successful for user: {}", userPrincipal.getUsername());

            // Set secure, HTTP-only cookie for the access token
            // Use SameSite=None to support cross-site frontend during development; requires Secure
            ResponseCookie accessCookie = ResponseCookie.from("access_token", token)
                    .httpOnly(true)
                    .secure(true)
                    .sameSite("None")
                    .path("/")
                    .maxAge(900) // 15 minutes
                    .build();
            response.addHeader("Set-Cookie", accessCookie.toString());

            // Use postMessage API to securely deliver token to frontend
            // This prevents token from appearing in URL, browser history, or referrer headers
            String html = generatePostMessageHtml(token, frontendUrl);
            
            response.setContentType("text/html;charset=UTF-8");
            response.getWriter().write(html);
            response.getWriter().flush();
            
        } catch (Exception e) {
            log.error("Error handling OAuth2 success", e);
            handleFailure(response, "Authentication succeeded but token generation failed");
        }
    }

    /**
     * Generates HTML page that uses postMessage to send token to frontend
     * Frontend must have a message listener on the OAuth2 callback page
     */
    private String generatePostMessageHtml(String token, String frontendOrigin) {
        String encodedToken = URLEncoder.encode(token, StandardCharsets.UTF_8);
        
        return String.format(
            "<!DOCTYPE html>" +
            "<html>" +
            "<head>" +
            "    <title>Completing Sign In...</title>" +
            "    <meta charset=\"UTF-8\">" +
            "    <style>" +
            "        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }" +
            "        .container { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 400px; margin: 0 auto; }" +
            "        .spinner { border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 20px auto; }" +
            "        @keyframes spin { 0%% { transform: rotate(0deg); } 100%% { transform: rotate(360deg); } }" +
            "    </style>" +
            "</head>" +
            "<body>" +
            "    <div class=\"container\">" +
            "        <h2>Completing Sign In</h2>" +
            "        <div class=\"spinner\"></div>" +
            "        <p>Please wait while we complete your authentication...</p>" +
            "    </div>" +
            "    <script>" +
            "        (function() {" +
            "            try {" +
            "                // Send token to parent window via postMessage" +
            "                if (window.opener) {" +
            "                    window.opener.postMessage({" +
            "                        type: 'OAUTH2_SUCCESS'," +
            "                        token: '%s'" +
            "                    }, '%s');" +
            "                    // Close popup after a short delay" +
            "                    setTimeout(function() { window.close(); }, 500);" +
            "                } else {" +
            "                    // Fallback: redirect to frontend with token in postMessage" +
            "                    // This handles cases where OAuth opened in same window" +
            "                    window.location.href = '%s/auth/oauth2/callback?success=true';" +
            "                }" +
            "            } catch (error) {" +
            "                console.error('Error sending OAuth2 token:', error);" +
            "                // Fallback: redirect to frontend" +
            "                window.location.href = '%s/auth/oauth2/callback?error=token_delivery_failed';" +
            "            }" +
            "        })();" +
            "    </script>" +
            "</body>" +
            "</html>",
            encodedToken,
            frontendOrigin,
            frontendUrl,
            frontendUrl
        );
    }

    /**
     * Handles authentication failure
     */
    private void handleFailure(HttpServletResponse response, String errorMessage) throws IOException {
        String html = String.format(
            "<!DOCTYPE html>" +
            "<html>" +
            "<head>" +
            "    <title>Authentication Failed</title>" +
            "    <meta charset=\"UTF-8\">" +
            "</head>" +
            "<body>" +
            "    <h2>Authentication Failed</h2>" +
            "    <p>%s</p>" +
            "    <script>" +
            "        setTimeout(function() {" +
            "            window.location.href = '%s/login?error=%s';" +
            "        }, 2000);" +
            "    </script>" +
            "</body>" +
            "</html>",
            errorMessage,
            frontendUrl,
            URLEncoder.encode(errorMessage, StandardCharsets.UTF_8)
        );
        
        response.setContentType("text/html;charset=UTF-8");
        response.getWriter().write(html);
        response.getWriter().flush();
    }
}

