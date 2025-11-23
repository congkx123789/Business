package com.selfcar.inventory.reconciliation;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@Component
public class SourceOfTruthClient {
    private static final Logger log = LoggerFactory.getLogger(SourceOfTruthClient.class);

    private final RestTemplate restTemplate = new RestTemplate();
    private final String baseUrl;

    public SourceOfTruthClient(@Value("${dealer.api.base-url:http://localhost:8081}") String baseUrl) {
        this.baseUrl = baseUrl;
    }

    public Map<String, Boolean> fetchVinParity(Map<String, Boolean> currentState) {
        try {
            Set<String> vins = currentState.keySet();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            Map<String, Object> body = new HashMap<>();
            body.put("vins", vins);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            @SuppressWarnings("unchecked")
            Map<String, Boolean> response = restTemplate.postForObject(
                    baseUrl + "/reconciliation/parity",
                    request,
                    Map.class
            );
            if (response != null && !response.isEmpty()) {
                return response;
            }
        } catch (Exception e) {
            log.warn("dealer.api.parity_call_failed baseUrl={} err={}", baseUrl, e.getMessage());
        }
        // Fallback to assuming parity if API not available
        return currentState;
    }
}


