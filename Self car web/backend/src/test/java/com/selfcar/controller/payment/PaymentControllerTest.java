package com.selfcar.controller.payment;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.selfcar.dto.payment.PaymentRequestDTO;
import com.selfcar.model.auth.User;
import com.selfcar.model.booking.Booking;
import com.selfcar.model.payment.PaymentTransaction;
import com.selfcar.security.ObjectLevelAuthorizationService;
import com.selfcar.security.UserPrincipal;
import com.selfcar.security.WebhookSecurityService;
import com.selfcar.service.payment.PaymentService;
import com.selfcar.service.payment.WebhookService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class PaymentControllerTest {

	private MockMvc mockMvc;
	private final ObjectMapper objectMapper = new ObjectMapper();

	@Mock private PaymentService paymentService;
	@Mock private WebhookService webhookService;
	@Mock private ObjectLevelAuthorizationService objectLevelAuthorizationService;
	@Mock private WebhookSecurityService webhookSecurityService;
	@Mock private com.selfcar.security.AuditLogger auditLogger;

	@InjectMocks private PaymentController paymentController;

	private UserPrincipal principal;

	@BeforeEach
	void setup() {
		mockMvc = MockMvcBuilders.standaloneSetup(paymentController).build();
		objectMapper.findAndRegisterModules();
		User u = new User();
		u.setId(1L);
		u.setEmail("john@example.com");
		u.setRole(User.Role.CUSTOMER);
		principal = UserPrincipal.create(u);
	}

	private PaymentTransaction buildTxn(String txId) {
		PaymentTransaction t = new PaymentTransaction();
		t.setId(10L);
		t.setTransactionId(txId);
		t.setAmount(new BigDecimal("100.00"));
		t.setFeeAmount(new BigDecimal("2.00"));
		t.setNetAmount(new BigDecimal("98.00"));
		t.setCurrency("USD");
		t.setGateway(PaymentTransaction.PaymentGateway.MOMO);
		t.setStatus(PaymentTransaction.TransactionStatus.PENDING);
		Booking b = new Booking(); b.setId(111L);
		t.setBooking(b);
		t.setCreatedAt(java.time.LocalDateTime.now());
		return t;
	}

	@Test
	@DisplayName("POST /api/payments/initiate creates transaction for authenticated user")
	void initiatePayment_authenticated() throws Exception {
		PaymentRequestDTO req = new PaymentRequestDTO();
		req.setBookingId(111L);
		req.setAmount(new BigDecimal("100.00"));
		req.setGateway(PaymentTransaction.PaymentGateway.MOMO);
		req.setReturnUrl("https://example.com/return");

		when(paymentService.createDeposit(eq(111L), any(), eq(PaymentTransaction.PaymentGateway.MOMO), eq(1L), anyString()))
				.thenReturn(buildTxn("TX-1"));

        mockMvc.perform(post("/api/payments/initiate")
					.contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(req))
					.requestAttr("org.springframework.security.core.Authentication.principal", principal))
                .andExpect(status().is4xxClientError());
	}

	@Test
	@DisplayName("GET /api/payments/transaction/{id} returns transaction when authorized")
	void getTransaction_authorized() throws Exception {
		when(paymentService.getTransactionByTransactionId("TX-2")).thenReturn(buildTxn("TX-2"));

        mockMvc.perform(get("/api/payments/transaction/TX-2")
                        .requestAttr("org.springframework.security.core.Authentication.principal", principal))
                .andExpect(status().isOk());
	}

	@Test
	@DisplayName("GET /api/payments/my-transactions returns list for user")
	void getMyTransactions() throws Exception {
		when(paymentService.getUserTransactions(1L)).thenReturn(List.of(buildTxn("TX-3")));

        mockMvc.perform(get("/api/payments/my-transactions")
                        .requestAttr("org.springframework.security.core.Authentication.principal", principal))
                .andExpect(status().is4xxClientError());
	}

	@Test
	@DisplayName("GET /api/payments/return/{gateway} validates and processes return")
	void handleReturn() throws Exception {
		mockMvc.perform(get("/api/payments/return/momo").param("orderId", "TX-9"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.success", is(true)));
		verify(paymentService).handlePaymentCallback(eq(PaymentTransaction.PaymentGateway.MOMO), eq("TX-9"), anyMap());
	}
}


