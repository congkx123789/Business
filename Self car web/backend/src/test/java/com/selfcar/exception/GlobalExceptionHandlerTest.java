package com.selfcar.exception;

import com.selfcar.dto.common.ApiResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.web.bind.MethodArgumentNotValidException;

import static org.assertj.core.api.Assertions.assertThat;

class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler handler;

    @BeforeEach
    void setUp() {
        handler = new GlobalExceptionHandler();
        ReflectionTestUtils.setField(handler, "includeMessage", "always");
        ReflectionTestUtils.setField(handler, "includeException", true);
    }

    @Test
    @DisplayName("handleBadCredentials returns 401 and message")
    void testHandleBadCredentials() {
        ResponseEntity<ApiResponse> resp = handler.handleBadCredentials(new org.springframework.security.authentication.BadCredentialsException("bad"));
        assertThat(resp.getStatusCode().value()).isEqualTo(401);
        assertThat(resp.getBody()).isNotNull();
        assertThat(resp.getBody().getSuccess()).isFalse();
        assertThat(resp.getBody().getMessage()).contains("Invalid email or password");
    }

    @Test
    @DisplayName("handleAccessDenied returns 403 and message")
    void testHandleAccessDenied() {
        ResponseEntity<ApiResponse> resp = handler.handleAccessDenied(new org.springframework.security.access.AccessDeniedException("nope"));
        assertThat(resp.getStatusCode().value()).isEqualTo(403);
        assertThat(resp.getBody()).isNotNull();
        assertThat(resp.getBody().getSuccess()).isFalse();
        assertThat(resp.getBody().getMessage()).contains("Access denied");
    }

    @Test
    @DisplayName("handleRuntimeException returns 400 with exception message when included")
    void testHandleRuntimeException_includesMessage() {
        ResponseEntity<ApiResponse> resp = handler.handleRuntimeException(new RuntimeException("boom"));
        assertThat(resp.getStatusCode().value()).isEqualTo(400);
        assertThat(resp.getBody()).isNotNull();
        assertThat(resp.getBody().getMessage()).isEqualTo("boom");
    }

    @Test
    @DisplayName("handleGenericException respects include flags")
    void testHandleGenericException_flags() {
        // with includeMessage=always, includeException=true
        ResponseEntity<ApiResponse> resp = handler.handleGenericException(new Exception("oops"));
        assertThat(resp.getStatusCode().value()).isEqualTo(500);
        assertThat(resp.getBody()).isNotNull();
        assertThat(resp.getBody().getMessage()).contains("oops");

        // change includeException=false
        ReflectionTestUtils.setField(handler, "includeException", false);
        ResponseEntity<ApiResponse> resp2 = handler.handleGenericException(new Exception("again"));
        assertThat(resp2.getStatusCode().value()).isEqualTo(500);
        assertThat(resp2.getBody()).isNotNull();
        assertThat(resp2.getBody().getMessage()).isEqualTo("An error occurred");
    }

    @Test
    @DisplayName("handleValidationExceptions maps field errors")
    void testHandleValidationExceptions() throws Exception {
        class Dummy { 
            private String field;
            public String getField() { return field; }
            public void setField(String field) { this.field = field; }
        }
        Dummy target = new Dummy();
        BeanPropertyBindingResult binding = new BeanPropertyBindingResult(target, "dummy");
        binding.rejectValue("field", "NotBlank", "must not be blank");
        MethodArgumentNotValidException ex = new MethodArgumentNotValidException(null, binding);

        ResponseEntity<java.util.Map<String, String>> resp = handler.handleValidationExceptions(ex);
        assertThat(resp.getStatusCode().value()).isEqualTo(400);
        assertThat(resp.getBody()).isNotNull();
        assertThat(resp.getBody()).containsEntry("field", "must not be blank");
    }
}


