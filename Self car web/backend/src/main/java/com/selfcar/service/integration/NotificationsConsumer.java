package com.selfcar.service.integration;

import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class NotificationsConsumer {

    @KafkaListener(topics = "${kafka.topic.listings:listing-events}")
    public void onListingEvent(ConsumerRecord<String, String> record) {
        String eventType = header(record, "eventType");
        if ("VIN_Sold".equals(eventType)) {
            String listingId = record.key();
            log.info("NOTIFY: Cancel promos and inform subscribers for listing {}", listingId);
        }
    }

    private static String header(ConsumerRecord<String, String> record, String name) {
        var header = record.headers().lastHeader(name);
        return header == null ? null : new String(header.value());
    }
}


