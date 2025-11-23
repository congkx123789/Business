package com.selfcar.security;

import com.selfcar.model.booking.Booking;
import com.selfcar.model.order.Order;
import com.selfcar.model.payment.PaymentTransaction;
import com.selfcar.model.shop.Shop;
import com.selfcar.model.car.Car;
import com.selfcar.model.auth.User;
import com.selfcar.repository.booking.BookingRepository;
import com.selfcar.repository.order.OrderRepository;
import com.selfcar.repository.payment.PaymentTransactionRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ObjectLevelAuthorizationServiceTest {

    @Mock private BookingRepository bookingRepository;
    @Mock private PaymentTransactionRepository paymentTransactionRepository;
    @Mock private OrderRepository orderRepository;
    @Mock private SecurityEventLogger securityEventLogger;
    @Mock private AuditLogger auditLogger;

    @InjectMocks private ObjectLevelAuthorizationService service;

    private User user(long id) { User u = new User(); u.setId(id); u.setActive(true); return u; }

    @Test
    @DisplayName("verifyBookingOwnership allows owner and denies others")
    void verifyBookingOwnership_ownerVsOther() {
        Booking booking = new Booking();
        booking.setId(1L);
        booking.setUser(user(10L));
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

        assertThat(service.verifyBookingOwnership(1L, 10L)).isSameAs(booking);

        assertThatThrownBy(() -> service.verifyBookingOwnership(1L, 11L))
                .isInstanceOf(AccessDeniedException.class);
        verify(securityEventLogger).logUnauthorizedAccess(eq("BOOKING"), eq(1L), eq(11L), anyString());
    }

    @Test
    @DisplayName("verifyBookingAccess allows admin, owner, and seller of car's shop")
    void verifyBookingAccess_roles() {
        Booking booking = new Booking();
        booking.setId(2L);
        booking.setUser(user(20L));
        Car car = new Car();
        Shop shop = new Shop(); shop.setOwner(user(30L));
        car.setShop(shop);
        booking.setCar(car);
        when(bookingRepository.findById(2L)).thenReturn(Optional.of(booking));

        assertThat(service.verifyBookingAccess(2L, 999L, "ADMIN")).isSameAs(booking);
        assertThat(service.verifyBookingAccess(2L, 20L, "CUSTOMER")).isSameAs(booking);
        assertThat(service.verifyBookingAccess(2L, 30L, "SELLER")).isSameAs(booking);

        assertThatThrownBy(() -> service.verifyBookingAccess(2L, 40L, "CUSTOMER"))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    @DisplayName("verifyTransactionOwnership checks booking or wallet ownership")
    void verifyTransactionOwnership_ownerViaBooking() {
        PaymentTransaction tx = new PaymentTransaction();
        tx.setId(7L);
        Booking booking = new Booking(); booking.setUser(user(77L));
        tx.setBooking(booking);
        when(paymentTransactionRepository.findById(7L)).thenReturn(Optional.of(tx));

        assertThat(service.verifyTransactionOwnership(7L, 77L)).isSameAs(tx);
        assertThatThrownBy(() -> service.verifyTransactionOwnership(7L, 78L))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    @DisplayName("verifyOrderAccess allows admin, buyer, or seller")
    void verifyOrderAccess_roles() {
        Order order = new Order();
        order.setId(5L);
        order.setBuyer(user(55L));
        order.setSeller(user(66L));
        when(orderRepository.findById(5L)).thenReturn(Optional.of(order));

        assertThat(service.verifyOrderAccess(5L, 999L, "ADMIN")).isSameAs(order);
        assertThat(service.verifyOrderAccess(5L, 55L, "CUSTOMER")).isSameAs(order);
        assertThat(service.verifyOrderAccess(5L, 66L, "SELLER")).isSameAs(order);

        assertThatThrownBy(() -> service.verifyOrderAccess(5L, 77L, "CUSTOMER"))
                .isInstanceOf(AccessDeniedException.class);
    }
}


