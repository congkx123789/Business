package com.selfcar.service.pricing;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class PricingTrainingConsumer {

    private final ObjectMapper mapper = new ObjectMapper();

    @KafkaListener(topics = "${kafka.topic.listings:listing-events}")
    public void onEvent(ConsumerRecord<String, String> record) {
        String eventType = header(record, "eventType");
        try {
            JsonNode node = mapper.readTree(record.value());
            String listingId = node.path("listingId").asText(record.key());
            if ("Price_Updated".equals(eventType) || "VIN_Sold".equals(eventType)) {
                log.info("PRICING_TRAINING_ENQUEUE: {} listingId={} payloadSize={}B", eventType, listingId, record.value().length());
                // TODO: forward to training pipeline or write to feature store queue
            }
        } catch (Exception e) {
            log.error("PricingTrainingConsumer error", e);
        }
    }

    private static String header(ConsumerRecord<String, String> record, String name) {
        var h = record.headers().lastHeader(name);
        return h == null ? null : new String(h.value());
    }
}


