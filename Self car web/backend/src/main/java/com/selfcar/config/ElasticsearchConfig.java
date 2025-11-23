package com.selfcar.config;

import org.apache.http.HttpHost;
import org.elasticsearch.client.RestClient;
import org.elasticsearch.client.RestHighLevelClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ElasticsearchConfig {

    @Bean
    public RestHighLevelClient restHighLevelClient(
            @Value("${elasticsearch.hosts:localhost:9200}") String hostsCsv) {
        String[] parts = hostsCsv.split(",");
        HttpHost[] hosts = new HttpHost[parts.length];
        for (int i = 0; i < parts.length; i++) {
            String[] hp = parts[i].trim().split(":");
            String host = hp[0];
            int port = hp.length > 1 ? Integer.parseInt(hp[1]) : 9200;
            hosts[i] = new HttpHost(host, port, "http");
        }
        return new RestHighLevelClient(RestClient.builder(hosts));
    }
}


