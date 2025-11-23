package com.selfcar.service.integration;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnalyticsConsumer {

    private final ObjectMapper mapper = new ObjectMapper();
    private final DataLakeSinkService dataLakeSinkService;

    @KafkaListener(topics = "${kafka.topic.listings:listing-events}")
    public void onListingEvent(ConsumerRecord<String, String> record) {
        String eventType = header(record, "eventType");
        String payload = record.value();
        try {
            JsonNode node = mapper.readTree(payload);
            String listingId = node.path("listingId").asText(record.key());
            if ("Price_Updated".equals(eventType)) {
                var price = node.path("pricePerDay").asText();
                log.info("ANALYTICS: Price_Updated listingId={} pricePerDay={}", listingId, price);
                dataLakeSinkService.append("price_updates", record.value());
            } else if ("VIN_Sold".equals(eventType)) {
                log.info("ANALYTICS: VIN_Sold listingId={}", listingId);
                dataLakeSinkService.append("sales", record.value());
            }
        } catch (Exception e) {
            log.error("AnalyticsConsumer parse error", e);
        }
    }

    private static String header(ConsumerRecord<String, String> record, String name) {
        var h = record.headers().lastHeader(name);
        return h == null ? null : new String(h.value());
    }
}


