package com.selfcar.security;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Arrays;

/**
 * Breached Password Service
 * 
 * Checks if passwords have been compromised using the Have I Been Pwned API.
 * Uses k-anonymity approach (only sends first 5 chars of SHA-1 hash) for privacy.
 * 
 * Implements PCI DSS and OWASP best practices for password security.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BreachedPasswordService {

    @Value("${auth.breached-password.enabled:true}")
    private boolean enabled;

    @Value("${auth.breached-password.min-count:1}")
    private int minBreachCount;

    private static final String HIBP_API_URL = "https://api.pwnedpasswords.com/range/";

    /**
     * Checks if a password has been breached
     * 
     * @param password The password to check
     * @return true if password is breached, false otherwise
     */
    public boolean isPasswordBreached(String password) {
        if (!enabled) {
            return false;
        }

        if (password == null || password.isEmpty()) {
            return false;
        }

        try {
            // Generate SHA-1 hash of password
            String sha1Hash = sha1(password);
            
            // Get first 5 characters (prefix) for k-anonymity
            String prefix = sha1Hash.substring(0, 5).toUpperCase();
            String suffix = sha1Hash.substring(5).toUpperCase();

            // Query Have I Been Pwned API
            String response = queryHibpApi(prefix);
            
            if (response == null || response.isEmpty()) {
                log.debug("HIBP API returned empty response for prefix: {}", prefix);
                return false;
            }

            // Check if our suffix appears in the response
            boolean breached = checkSuffixInResponse(suffix, response, minBreachCount);
            
            if (breached) {
                log.warn("Password detected in breached password database");
            }
            
            return breached;

        } catch (Exception e) {
            log.error("Error checking breached password", e);
            // Fail open - don't block registration/login if API is down
            // In production, consider failing closed for security
            return false;
        }
    }

    /**
     * Generates SHA-1 hash of password
     */
    private String sha1(String password) throws NoSuchAlgorithmException {
        MessageDigest digest = MessageDigest.getInstance("SHA-1");
        byte[] hash = digest.digest(password.getBytes(StandardCharsets.UTF_8));
        
        StringBuilder hexString = new StringBuilder();
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        return hexString.toString().toUpperCase();
    }

    /**
     * Queries Have I Been Pwned API using k-anonymity
     * 
     * @param prefix First 5 characters of SHA-1 hash
     * @return Response containing all suffixes with that prefix
     */
    private String queryHibpApi(String prefix) {
        try {
            java.net.URL url = new java.net.URL(HIBP_API_URL + prefix);
            java.net.HttpURLConnection connection = (java.net.HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.setRequestProperty("User-Agent", "SelfCar-Security/1.0");
            connection.setConnectTimeout(5000);
            connection.setReadTimeout(5000);

            int responseCode = connection.getResponseCode();
            if (responseCode != 200) {
                log.warn("HIBP API returned status code: {}", responseCode);
                return null;
            }

            try (java.io.BufferedReader reader = new java.io.BufferedReader(
                    new java.io.InputStreamReader(connection.getInputStream(), StandardCharsets.UTF_8))) {
                StringBuilder response = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    response.append(line).append("\n");
                }
                return response.toString();
            }

        } catch (Exception e) {
            log.error("Error querying HIBP API", e);
            return null;
        }
    }

    /**
     * Checks if suffix appears in API response
     * 
     * @param suffix The suffix to check (last 35 chars of SHA-1)
     * @param response The API response containing all suffixes
     * @param minCount Minimum breach count threshold
     * @return true if suffix found with count >= minCount
     */
    private boolean checkSuffixInResponse(String suffix, String response, int minCount) {
        String[] lines = response.split("\n");
        
        for (String line : lines) {
            String[] parts = line.split(":");
            if (parts.length == 2 && parts[0].equals(suffix)) {
                try {
                    int count = Integer.parseInt(parts[1].trim());
                    return count >= minCount;
                } catch (NumberFormatException e) {
                    log.warn("Invalid breach count format: {}", parts[1]);
                }
            }
        }
        
        return false;
    }
}

