package com.selfcar.service.integration;

import com.selfcar.model.common.OutboxEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service("searchIndexerServiceKafka")
@RequiredArgsConstructor
public class SearchIndexerService {

    private final KafkaTemplate<String, String> kafkaTemplate;

    @Value("${kafka.topic.listings:listing-events}")
    private String topic;

    public void publish(OutboxEvent event) {
        String key = String.valueOf(event.getAggregateId());
        ProducerRecord<String, String> record = new ProducerRecord<>(topic, key, event.getPayloadJson());
        // add headers for idempotency and versioning
        if (event.getVersion() != null) {
            record.headers().add("version", String.valueOf(event.getVersion()).getBytes());
        }
        if (event.getEventId() != null) {
            record.headers().add("eventId", event.getEventId().getBytes());
        }
        record.headers().add("eventType", event.getEventType().getBytes());
        kafkaTemplate.send(record).whenComplete((result, ex) -> {
            if (ex != null) {
                log.error("Failed to send to Kafka topic {} key {}", topic, key, ex);
            } else {
                var m = result.getRecordMetadata();
                log.debug("Sent to {} partition {} offset {}", m.topic(), m.partition(), m.offset());
            }
        });
    }
}


