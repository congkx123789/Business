package com.selfcar.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.core.env.Environment;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

class ConfigValidatorTest {

    @Test
    @DisplayName("validateConfiguration in dev logs warnings but does not throw")
    void validate_dev_ok() {
        Environment env = mock(Environment.class);
        when(env.getProperty("jwt.secret")).thenReturn("short");
        when(env.getProperty("spring.datasource.password")).thenReturn("password");

        ConfigValidator validator = new ConfigValidator(env, "dev");
        assertThatCode(validator::validateConfiguration).doesNotThrowAnyException();
    }

    @Test
    @DisplayName("validateConfiguration in prod throws when critical configs invalid")
    void validate_prod_throwsOnErrors() {
        Environment env = mock(Environment.class);
        when(env.getProperty("spring.datasource.url")).thenReturn("jdbc:mysql://localhost:3306/db");
        when(env.getProperty("spring.datasource.username")).thenReturn("root");
        when(env.getProperty("spring.datasource.password")).thenReturn("short");
        when(env.getProperty("app.frontend.url")).thenReturn("http://localhost:3000");
        when(env.getProperty("spring.web.cors.allowed-origins")).thenReturn("http://localhost:3000");
        when(env.getProperty("jwt.secret")).thenReturn("weak");
        when(env.getProperty("logging.level.com.selfcar", "INFO")).thenReturn("DEBUG");

        ConfigValidator validator = new ConfigValidator(env, "prod");
        assertThatThrownBy(validator::validateConfiguration)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Configuration validation failed");
    }
}


