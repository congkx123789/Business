package com.selfcar.repository.booking;

import com.selfcar.model.auth.User;
import com.selfcar.model.booking.Booking;
import com.selfcar.model.car.Car;
import com.selfcar.repository.car.CarRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class BookingRepositoryTest {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private com.selfcar.repository.auth.UserRepository userRepository;

    @Autowired
    private CarRepository carRepository;

    private User createUser(String email) {
        User u = new User();
        u.setFirstName("John");
        u.setLastName("Doe");
        u.setEmail(email);
        u.setPhone("+1");
        u.setRole(User.Role.CUSTOMER);
        u.setActive(true);
        u.setCreatedAt(java.time.LocalDateTime.now());
        u.setUpdatedAt(java.time.LocalDateTime.now());
        return u;
    }

    private Car createCar(String name) {
        Car car = new Car();
        car.setName(name);
        car.setBrand("Brand");
        car.setType(Car.CarType.SEDAN);
        car.setYear(2022);
        car.setPricePerDay(new BigDecimal("100"));
        car.setSeats(4);
        car.setTransmission(Car.Transmission.AUTOMATIC);
        car.setFuelType(Car.FuelType.PETROL);
        car.setAvailable(true);
        car.setCreatedAt(java.time.LocalDateTime.now());
        car.setUpdatedAt(java.time.LocalDateTime.now());
        return carRepository.save(car);
    }

    private Booking createBooking(User user, Car car, LocalDate start, LocalDate end, BigDecimal total, Booking.BookingStatus status) {
        Booking b = new Booking();
        b.setUser(user);
        b.setCar(car);
        b.setStartDate(start);
        b.setEndDate(end);
        b.setPickupLocation("A");
        b.setDropoffLocation("B");
        b.setTotalPrice(total);
        b.setStatus(status);
        b.setCreatedAt(java.time.LocalDateTime.now());
        b.setUpdatedAt(java.time.LocalDateTime.now());
        return b;
    }

    @Test
    @DisplayName("Booking queries and conflict detection work")
    void bookingQueries() {
        User u1 = userRepository.save(createUser("u1@example.com"));
        User u2 = userRepository.save(createUser("u2@example.com"));
        Car car1 = createCar("Car1");
        Car car2 = createCar("Car2");

        Booking b1 = createBooking(u1, car1, LocalDate.now(), LocalDate.now().plusDays(2), new BigDecimal("200"), Booking.BookingStatus.CONFIRMED);
        Booking b2 = createBooking(u1, car2, LocalDate.now().plusDays(5), LocalDate.now().plusDays(7), new BigDecimal("300"), Booking.BookingStatus.PENDING);
        Booking b3 = createBooking(u2, car1, LocalDate.now().plusDays(1), LocalDate.now().plusDays(3), new BigDecimal("250"), Booking.BookingStatus.COMPLETED);
        bookingRepository.saveAll(List.of(b1, b2, b3));

        assertThat(bookingRepository.findByUserId(u1.getId())).hasSize(2);
        assertThat(bookingRepository.findByCarId(car1.getId())).hasSize(2);
        assertThat(bookingRepository.findByStatus(Booking.BookingStatus.PENDING)).hasSize(1);

        List<Booking> conflicts = bookingRepository.findConflictingBookings(car1.getId(), LocalDate.now(), LocalDate.now().plusDays(1));
        // b1 and b3 overlap in that window (b3 starts on +1)
        assertThat(conflicts).hasSize(2);

        Long count = bookingRepository.countAllBookings();
        assertThat(count).isEqualTo(3);
    }
}


