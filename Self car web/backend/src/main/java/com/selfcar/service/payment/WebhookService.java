package com.selfcar.service.payment;

import com.selfcar.model.payment.WebhookEvent;
import com.selfcar.repository.payment.WebhookEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class WebhookService {

    private final WebhookEventRepository webhookEventRepository;

    @Transactional
    public WebhookEvent recordIfNew(String source, String eventId, String rawPayload) {
        String payloadHash = sha256(rawPayload);

        Optional<WebhookEvent> existing = (eventId != null && !eventId.isBlank())
                ? webhookEventRepository.findBySourceAndEventId(source, eventId)
                : webhookEventRepository.findByPayloadHash(payloadHash);

        if (existing.isPresent()) {
            return existing.get();
        }

        WebhookEvent event = new WebhookEvent();
        event.setSource(source);
        event.setEventId(eventId);
        event.setPayloadHash(payloadHash);
        event.setPayload(rawPayload);
        event.setStatus(WebhookEvent.ProcessingStatus.RECEIVED);
        return webhookEventRepository.save(event);
    }

    @Transactional
    public void markProcessed(Long id) {
        webhookEventRepository.findById(Objects.requireNonNull(id)).ifPresent(e -> {
            e.setStatus(WebhookEvent.ProcessingStatus.PROCESSED);
            e.setProcessedAt(LocalDateTime.now());
            webhookEventRepository.save(e);
        });
    }

    @Transactional
    public void markFailed(Long id, String errorMessage) {
        webhookEventRepository.findById(Objects.requireNonNull(id)).ifPresent(e -> {
            e.setStatus(WebhookEvent.ProcessingStatus.FAILED);
            e.setErrorMessage(errorMessage);
            e.setProcessedAt(LocalDateTime.now());
            webhookEventRepository.save(e);
        });
    }

    private String sha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedHash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder(2 * encodedHash.length);
            for (byte b : encodedHash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}


