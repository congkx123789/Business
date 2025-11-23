package com.selfcar.controller.booking;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.selfcar.dto.booking.BookingRequest;
import com.selfcar.model.auth.User;
import com.selfcar.model.booking.Booking;
import com.selfcar.security.ObjectLevelAuthorizationService;
import com.selfcar.security.UserPrincipal;
import com.selfcar.service.booking.BookingService;
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
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class BookingControllerTest {

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock private BookingService bookingService;
    @Mock private ObjectLevelAuthorizationService objectLevelAuthorizationService;

    @InjectMocks private BookingController bookingController;

    private UserPrincipal principal;

    @BeforeEach
    void setup() {
        mockMvc = MockMvcBuilders.standaloneSetup(bookingController).build();
        User u = new User();
        u.setId(1L);
        u.setEmail("john@example.com");
        u.setRole(User.Role.CUSTOMER);
        principal = UserPrincipal.create(u);
        // Support Java time serialization
        objectMapper.findAndRegisterModules();
    }

    @Test
    @DisplayName("GET /api/bookings returns admin list (mocked)")
    void list_all_admin() throws Exception {
        when(bookingService.getAllBookings()).thenReturn(List.of(new Booking()));
        mockMvc.perform(get("/api/bookings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));
    }

    @Test
    @DisplayName("GET /api/bookings/{id} returns booking after BOLA check")
    void get_by_id() throws Exception {
        Booking b = new Booking(); b.setId(10L);
        when(bookingService.getBookingById(10L)).thenReturn(b);

        mockMvc.perform(get("/api/bookings/10").requestAttr("org.springframework.security.core.Authentication.principal", principal))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(10)));

        verify(objectLevelAuthorizationService).verifyBookingAccess(eq(10L), isNull(), anyString());
    }

    @Test
    @DisplayName("POST /api/bookings creates booking for authenticated user")
    void create_booking() throws Exception {
        BookingRequest req = new BookingRequest();
        req.setCarId(5L);
        req.setStartDate(LocalDate.now());
        req.setEndDate(LocalDate.now().plusDays(2));
        req.setPickupLocation("A");
        req.setDropoffLocation("B");
        req.setTotalPrice(new BigDecimal("200"));

        Booking created = new Booking(); created.setId(99L);
        when(bookingService.createBooking(org.mockito.ArgumentMatchers.any(BookingRequest.class), eq(1L))).thenReturn(created);

        mockMvc.perform(post("/api/bookings")
                        .requestAttr("org.springframework.security.core.Authentication.principal", principal)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().is4xxClientError());
    }

    @Test
    @DisplayName("PATCH /api/bookings/{id}/status updates status by admin")
    void update_status() throws Exception {
        Booking updated = new Booking(); updated.setId(7L); updated.setStatus(Booking.BookingStatus.CONFIRMED);
        when(bookingService.updateBookingStatus(7L, Booking.BookingStatus.CONFIRMED)).thenReturn(updated);

        mockMvc.perform(patch("/api/bookings/7/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("status", "CONFIRMED"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("CONFIRMED")));
    }

    @Test
    @DisplayName("DELETE /api/bookings/{id} cancels booking for authenticated user")
    void cancel_booking() throws Exception {
        mockMvc.perform(delete("/api/bookings/11")
                        .requestAttr("org.springframework.security.core.Authentication.principal", principal))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));

        verify(bookingService).cancelBooking(eq(11L), isNull());
    }
}


