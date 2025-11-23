package com.selfcar.service.integration;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.time.Instant;

@Slf4j
@Service
@RequiredArgsConstructor
public class DataLakeSinkService {

    @Value("${datalake.enabled:false}")
    private boolean enabled;

    @Value("${datalake.path:./datalake}")
    private String basePath;

    public void append(String dataset, String jsonLine) {
        if (!enabled) { return; }
        try {
            Path dir = Path.of(basePath, dataset);
            Files.createDirectories(dir);
            String fileName = "events-" + Instant.now().toString().substring(0, 10) + ".ndjson";
            Path file = dir.resolve(fileName);
            String line = jsonLine.endsWith("\n") ? jsonLine : jsonLine + "\n";
            Files.writeString(file, line, StandardOpenOption.CREATE, StandardOpenOption.APPEND);
        } catch (IOException e) {
            log.error("DataLake append failed for dataset {}", dataset, e);
        }
    }
}


