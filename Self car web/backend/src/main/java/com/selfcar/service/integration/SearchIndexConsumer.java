package com.selfcar.service.integration;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.elasticsearch.action.bulk.BulkRequest;
import org.elasticsearch.action.bulk.BulkResponse;
import org.elasticsearch.action.index.IndexRequest;
import org.elasticsearch.action.update.UpdateRequest;
import org.elasticsearch.action.delete.DeleteRequest;
import org.elasticsearch.client.RequestOptions;
import org.elasticsearch.client.RestHighLevelClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class SearchIndexConsumer {

    private final RestHighLevelClient esClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${search.index.listings:listings}")
    private String indexName;

    @KafkaListener(topics = "${kafka.topic.listings:listing-events}")
    public void handle(ConsumerRecord<String, String> record) {
        try {
            String key = record.key();
            String payload = record.value();
            String eventType = header(record, "eventType");
            long version = parseLong(header(record, "version"), 0L);

            JsonNode node = objectMapper.readTree(payload);
            String listingId = node.path("listingId").asText(key);

            java.util.Map<String, Object> doc = objectMapper.convertValue(node, java.util.Map.class);

            BulkRequest bulk = new BulkRequest();

            if ("VIN_Sold".equals(eventType)) {
                bulk.add(new DeleteRequest(indexName, listingId));
            } else if ("Price_Updated".equals(eventType)) {
                java.util.Map<String, Object> partial = new java.util.HashMap<>();
                if (doc.containsKey("pricePerDay")) partial.put("pricePerDay", doc.get("pricePerDay"));
                UpdateRequest update = new UpdateRequest(indexName, listingId)
                        .doc(partial)
                        .docAsUpsert(true)
                        .version(version)
                        .versionType(org.elasticsearch.index.VersionType.EXTERNAL);
                bulk.add(update);
            } else {
                // default upsert/index
                IndexRequest index = new IndexRequest(indexName)
                        .id(listingId)
                        .source(doc)
                        .version(version)
                        .versionType(org.elasticsearch.index.VersionType.EXTERNAL);
                bulk.add(index);
            }
            BulkResponse resp = esClient.bulk(bulk, RequestOptions.DEFAULT);
            if (resp.hasFailures()) {
                log.error("ES bulk failures: {}", resp.buildFailureMessage());
            } else {
                log.debug("ES bulk indexed {} items", resp.getItems().length);
            }
        } catch (Exception e) {
            log.error("Error handling listing event", e);
        }
    }

    private static String header(ConsumerRecord<String, String> record, String name) {
        var header = record.headers().lastHeader(name);
        return header == null ? null : new String(header.value());
    }

    private static long parseLong(String s, long def) {
        try { return s == null ? def : Long.parseLong(s); } catch (Exception e) { return def; }
    }
}


