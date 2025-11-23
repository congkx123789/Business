package com.selfcar.repository.payment;

import com.selfcar.model.payment.WebhookEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WebhookEventRepository extends JpaRepository<WebhookEvent, Long> {
    Optional<WebhookEvent> findBySourceAndEventId(String source, String eventId);
    Optional<WebhookEvent> findByPayloadHash(String payloadHash);
}


