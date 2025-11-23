package com.selfcar.controller.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.selfcar.dto.auth.AuthResponse;
import com.selfcar.dto.auth.LoginRequest;
import com.selfcar.dto.auth.RegisterRequest;
import com.selfcar.model.auth.User;
import com.selfcar.service.auth.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthController authController;

    @BeforeEach
    void setup() {
        mockMvc = MockMvcBuilders.standaloneSetup(authController).build();
    }

    private AuthResponse buildAuthResponse() {
        User user = new User();
        user.setId(1L);
        user.setFirstName("John");
        user.setLastName("Doe");
        user.setEmail("john@example.com");
        user.setPhone("+10000000000");
        AuthResponse.UserDTO userDTO = new AuthResponse.UserDTO(user);
        return new AuthResponse("access-token", "refresh-token", userDTO);
    }

    @Test
    @DisplayName("POST /api/auth/register returns AuthResponse and sets cookies")
    void register_success() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setFirstName("John");
        request.setLastName("Doe");
        request.setEmail("john@example.com");
        request.setPhone("+10000000000");
        request.setPassword("Passw0rd!");

        Mockito.when(authService.register(any(RegisterRequest.class))).thenReturn(buildAuthResponse());

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.email", is("john@example.com")))
                .andExpect(header().string("Set-Cookie", containsString("access_token")));
    }

    @Test
    @DisplayName("POST /api/auth/login returns AuthResponse and sets cookies")
    void login_success() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("john@example.com");
        request.setPassword("Passw0rd!");

        Mockito.when(authService.login(any(LoginRequest.class), any())).thenReturn(buildAuthResponse());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.id", is(1)))
                .andExpect(header().string("Set-Cookie", containsString("access_token")));
    }

    @Test
    @DisplayName("POST /api/auth/refresh rotates tokens and cookies")
    void refresh_success() throws Exception {
        AuthController.RefreshTokenRequest req = new AuthController.RefreshTokenRequest();
        req.setRefreshToken("refresh-token");

        AuthResponse refreshed = new AuthResponse("new-access", "new-refresh", buildAuthResponse().getUser());
        Mockito.when(authService.refreshAccessToken("refresh-token")).thenReturn(refreshed);

        mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", is("new-access")))
                .andExpect(header().string("Set-Cookie", containsString("access_token")));
    }

    @Test
    @DisplayName("POST /api/auth/logout revokes refresh token when provided")
    void logout_success() throws Exception {
        AuthController.RefreshTokenRequest req = new AuthController.RefreshTokenRequest();
        req.setRefreshToken("refresh-token");

        mockMvc.perform(post("/api/auth/logout")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));

        Mockito.verify(authService).revokeRefreshToken("refresh-token");
    }
}


