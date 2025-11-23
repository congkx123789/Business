package com.selfcar.security;

import com.selfcar.repository.payment.WebhookEventRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WebhookSecurityServiceTest {

    @Mock WebhookEventRepository webhookEventRepository;
    @Mock SecurityEventLogger securityEventLogger;
    @Mock AuditLogger auditLogger;

    @InjectMocks WebhookSecurityService webhookSecurityService;

    @Test
    void validateWebhookSecurity_blocksWhenIpNotAllowlisted() {
        // simulate allowlist set to 1.2.3.4 but caller is 5.6.7.8
        setField("ipAllowlistCsv", "1.2.3.4");
        boolean ok = webhookSecurityService.validateWebhookSecurity("MOMO", "idemp", String.valueOf(System.currentTimeMillis()), "5.6.7.8");
        assertFalse(ok);
        verify(securityEventLogger).logWebhookSecurityViolation(eq("MOMO"), eq("5.6.7.8"), eq("IP_NOT_ALLOWLISTED"));
    }

    @Test
    void validateWebhookSecurity_allowsWithinWindowAndNew() {
        setField("ipAllowlistCsv", ""); // no allowlist
        when(webhookEventRepository.findBySourceAndEventId(anyString(), anyString())).thenReturn(Optional.empty());
        boolean ok = webhookSecurityService.validateWebhookSecurity("MOMO", "idemp2", String.valueOf(System.currentTimeMillis()), "1.1.1.1");
        assertTrue(ok);
    }

    private void setField(String field, String value) {
        try {
            var f = WebhookSecurityService.class.getDeclaredField(field);
            f.setAccessible(true);
            f.set(webhookSecurityService, value);
        } catch (NoSuchFieldException | IllegalAccessException e) {
            throw new RuntimeException("Failed to set field: " + field, e);
        }
    }
}


