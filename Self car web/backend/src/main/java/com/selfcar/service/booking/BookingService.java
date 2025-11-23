package com.selfcar.service.booking;

import com.selfcar.dto.booking.BookingRequest;
import com.selfcar.model.booking.Booking;
import com.selfcar.model.car.Car;
import com.selfcar.model.auth.User;
import com.selfcar.repository.booking.BookingRepository;
import com.selfcar.repository.car.CarRepository;
import com.selfcar.repository.auth.UserRepository;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final CarRepository carRepository;
    private final UserRepository userRepository;

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public Booking getBookingById(@NotNull Long id) {
        Objects.requireNonNull(id, "Booking ID cannot be null");
        return bookingRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Booking not found with ID: {}", id);
                    return new RuntimeException("Booking not found with id: " + id);
                });
    }

    public List<Booking> getUserBookings(@NotNull Long userId) {
        Objects.requireNonNull(userId, "User ID cannot be null");
        return bookingRepository.findByUserId(userId);
    }

    public List<Booking> getCarBookings(@NotNull Long carId) {
        Objects.requireNonNull(carId, "Car ID cannot be null");
        return bookingRepository.findByCarId(carId);
    }

    @Transactional
    public Booking createBooking(@NotNull BookingRequest request, @NotNull Long userId) {
        Objects.requireNonNull(request, "Booking request cannot be null");
        Objects.requireNonNull(userId, "User ID cannot be null");
        
        Long carId = request.getCarId();
        Objects.requireNonNull(carId, "Car ID cannot be null");
        
        // Validate dates
        if (request.getStartDate() != null && request.getEndDate() != null) {
            if (request.getStartDate().isBefore(java.time.LocalDate.now())) {
                throw new RuntimeException("Booking cannot start in the past");
            }
            if (request.getEndDate().isBefore(request.getStartDate())) {
                throw new RuntimeException("End date cannot be before start date");
            }
        }
        
        // Validate car exists and is available
        Car car = carRepository.findById(carId)
                .orElseThrow(() -> {
                    log.warn("Car not found with ID: {}", carId);
                    return new RuntimeException("Car not found");
                });

        if (!car.getAvailable()) {
            log.warn("Attempted to book unavailable car with ID: {}", carId);
            throw new RuntimeException("Car is not available");
        }

        // Check for conflicting bookings
        List<Booking> conflictingBookings = bookingRepository.findConflictingBookings(
                carId,
                request.getStartDate(),
                request.getEndDate()
        );

        if (!conflictingBookings.isEmpty()) {
            log.warn("Conflicting bookings found for car ID: {} between {} and {}", 
                    carId, request.getStartDate(), request.getEndDate());
            throw new RuntimeException("Car is already booked for the selected dates");
        }

        // Get user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.warn("User not found with ID: {}", userId);
                    return new RuntimeException("User not found");
                });

        // Create booking
        Booking booking = new Booking();
        booking.setUser(user);
        booking.setCar(car);
        booking.setStartDate(request.getStartDate());
        booking.setEndDate(request.getEndDate());
        booking.setPickupLocation(request.getPickupLocation());
        booking.setDropoffLocation(request.getDropoffLocation());
        booking.setTotalPrice(request.getTotalPrice());
        booking.setStatus(Booking.BookingStatus.PENDING);

        Booking savedBooking = bookingRepository.save(booking);
        log.info("Booking created successfully with ID: {} for user ID: {} and car ID: {}", 
                savedBooking.getId(), userId, carId);
        return savedBooking;
    }

    @Transactional
    public Booking updateBookingStatus(@NotNull Long id, @NotNull Booking.BookingStatus status) {
        Objects.requireNonNull(id, "Booking ID cannot be null");
        Objects.requireNonNull(status, "Booking status cannot be null");
        Booking booking = getBookingById(id);
        booking.setStatus(status);
        return bookingRepository.save(booking);
    }

    @Transactional
    public void cancelBooking(@NotNull Long id, @NotNull Long userId) {
        Objects.requireNonNull(id, "Booking ID cannot be null");
        Objects.requireNonNull(userId, "User ID cannot be null");
        Booking booking = getBookingById(id);
        
        if (!booking.getUser().getId().equals(userId)) {
            log.warn("User ID: {} attempted to cancel booking ID: {} owned by user ID: {}", 
                    userId, id, booking.getUser().getId());
            throw new RuntimeException("You can only cancel your own bookings");
        }

        if (booking.getStatus() == Booking.BookingStatus.COMPLETED) {
            log.warn("Attempted to cancel completed booking ID: {}", id);
            throw new RuntimeException("Cannot cancel completed bookings");
        }

        booking.setStatus(Booking.BookingStatus.CANCELLED);
        bookingRepository.save(booking);
    }
}

