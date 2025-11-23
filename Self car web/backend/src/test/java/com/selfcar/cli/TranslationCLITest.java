package com.selfcar.cli;

import com.selfcar.service.translation.TranslationService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.ResourceLoader;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TranslationCLITest {

    @Mock private TranslationService translationService;
    @Mock private ResourceLoader resourceLoader;
    @InjectMocks private TranslationCLI cli;

    @Test
    @DisplayName("TranslationCLI processes JSON and writes translated output")
    void run_translatesFiles() throws Exception {
        Path tmpDir = Files.createTempDirectory("i18n-src");
        Path outDir = Files.createTempDirectory("i18n-out");
        Path srcLocale = tmpDir.resolve("en");
        Files.createDirectories(srcLocale);
        Path file = srcLocale.resolve("messages.json");
        Files.writeString(file, "{\"hello\":\"Hello\", \"nested\":{\"key\":\"World\"}}\n");

        System.setProperty("translation.cli.enabled", "true");
        System.setProperty("translation.cli.source-locale", "en");
        System.setProperty("translation.cli.target-locale", "th");
        System.setProperty("translation.cli.input-path", tmpDir.toString());
        System.setProperty("translation.cli.output-path", outDir.toString());

        when(translationService.translate(anyString(), anyString(), anyString())).thenAnswer(inv -> "tr-" + inv.getArgument(0));

        cli.run();

        Path translated = outDir.resolve("th/messages.json");
        assertThat(Files.exists(translated)).isTrue();
        String content = Files.readString(translated);
        var mapper = new com.fasterxml.jackson.databind.ObjectMapper();
        java.util.Map<?,?> json = mapper.readValue(content, java.util.Map.class);
        assertThat(((java.util.Map<?,?>)json).get("hello")).isEqualTo("tr-Hello");
        @SuppressWarnings("unchecked") var nested = (java.util.Map<String,Object>) json.get("nested");
        assertThat(nested.get("key")).isEqualTo("tr-World");
    }
}


