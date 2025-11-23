package com.selfcar.controller.health;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import javax.sql.DataSource;
import java.sql.Connection;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class HealthControllerTest {

    private MockMvc mockMvc;

    @Mock
    private DataSource dataSource;

    @InjectMocks
    private HealthController healthController;

    @BeforeEach
    void setup() {
        // Inject @Value fields
        ReflectionTestUtils.setField(healthController, "applicationName", "selfcar-backend-test");
        ReflectionTestUtils.setField(healthController, "activeProfile", "test");

        mockMvc = MockMvcBuilders.standaloneSetup(healthController).build();
    }

    @Test
    @DisplayName("GET /api/health returns UP with app and profile")
    void health_ok() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("UP")))
                .andExpect(jsonPath("$.application", is("selfcar-backend-test")))
                .andExpect(jsonPath("$.profile", is("test")))
                .andExpect(jsonPath("$.timestamp", notNullValue()));
    }

    @Test
    @DisplayName("GET /api/health/liveness returns ALIVE")
    void liveness_ok() throws Exception {
        mockMvc.perform(get("/api/health/liveness"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("ALIVE")))
                .andExpect(jsonPath("$.timestamp", notNullValue()));
    }

    @Test
    @DisplayName("GET /api/health/readiness returns 200 when DB healthy")
    void readiness_ok_whenDbHealthy() throws Exception {
        Connection connection = Mockito.mock(Connection.class);
        Mockito.when(dataSource.getConnection()).thenReturn(connection);
        Mockito.when(connection.isValid(Mockito.anyInt())).thenReturn(true);

        mockMvc.perform(get("/api/health/readiness"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("READY")))
                .andExpect(jsonPath("$.database", is("UP")))
                .andExpect(jsonPath("$.timestamp", notNullValue()));

        Mockito.verify(dataSource).getConnection();
    }

    @Test
    @DisplayName("GET /api/health/readiness returns 503 when DB down")
    void readiness_serviceUnavailable_whenDbDown() throws Exception {
        Connection connection = Mockito.mock(Connection.class);
        Mockito.when(dataSource.getConnection()).thenReturn(connection);
        Mockito.when(connection.isValid(Mockito.anyInt())).thenReturn(false);

        mockMvc.perform(get("/api/health/readiness"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.status", is("NOT_READY")))
                .andExpect(jsonPath("$.database", is("DOWN")))
                .andExpect(jsonPath("$.timestamp", notNullValue()));
    }

    @Test
    @DisplayName("GET /api/health/config returns configuration flags")
    void configHealth_ok() throws Exception {
        // No env vars set in test by default; flags should exist, values may be false
        mockMvc.perform(get("/api/health/config"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.profile", is("test")))
                .andExpect(jsonPath("$.jwt_secret_configured", anyOf(is(true), is(false))))
                .andExpect(jsonPath("$.database_configured", anyOf(is(true), is(false))))
                .andExpect(jsonPath("$.frontend_url_configured", anyOf(is(true), is(false))));
    }
}


