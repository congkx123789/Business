package com.selfcar.service.ecosystem;

import com.selfcar.model.ecosystem.CareBooking;
import com.selfcar.model.ecosystem.CareService;
import com.selfcar.model.ecosystem.CareServiceProvider;
import com.selfcar.model.car.Car;
import com.selfcar.model.auth.User;
import com.selfcar.repository.ecosystem.CareBookingRepository;
import com.selfcar.repository.ecosystem.CareServiceRepository;
import com.selfcar.repository.ecosystem.CareServiceProviderRepository;
import com.selfcar.repository.car.CarRepository;
import com.selfcar.repository.auth.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CareServiceService {

    private final CareServiceProviderRepository providerRepository;
    private final CareServiceRepository serviceRepository;
    private final CareBookingRepository bookingRepository;
    private final CarRepository carRepository;
    private final UserRepository userRepository;

    // Provider Management
    public List<CareServiceProvider> getAllProviders() {
        return providerRepository.findAll();
    }

    public List<CareServiceProvider> getActiveProviders(CareServiceProvider.ProviderType type) {
        return providerRepository.findByTypeAndStatus(type, CareServiceProvider.ProviderStatus.ACTIVE);
    }

    public CareServiceProvider getProviderById(Long id) {
        return providerRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("Care service provider not found"));
    }

    @Transactional
    public CareServiceProvider createProvider(CareServiceProvider provider) {
        return providerRepository.save(Objects.requireNonNull(provider));
    }

    // Service Management
    public List<CareService> getServicesByProvider(Long providerId) {
        return serviceRepository.findByProviderIdAndAvailableTrue(providerId);
    }

    public List<CareService> getServicesByType(CareService.ServiceType serviceType) {
        return serviceRepository.findByServiceTypeAndAvailableTrue(serviceType);
    }

    public CareService getServiceById(Long id) {
        return serviceRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("Care service not found"));
    }

    @Transactional
    public CareService createService(CareService service) {
        CareServiceProvider provider = getProviderById(service.getProviderId());
        service.setProvider(provider);
        return serviceRepository.save(service);
    }

    // Booking Management
    public List<CareBooking> getBookingsByUser(Long userId) {
        return bookingRepository.findByUserId(userId);
    }

    public List<CareBooking> getBookingsByProvider(Long providerId) {
        return bookingRepository.findByProviderId(providerId);
    }

    public CareBooking getBookingById(Long id) {
        return bookingRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("Care booking not found"));
    }

    @Transactional
    public CareBooking createBooking(Long userId, Long carId, Long serviceId, LocalDateTime scheduledDate) {
        User user = userRepository.findById(Objects.requireNonNull(userId))
                .orElseThrow(() -> new RuntimeException("User not found"));
        Car car = carRepository.findById(Objects.requireNonNull(carId))
                .orElseThrow(() -> new RuntimeException("Car not found"));
        CareService service = getServiceById(serviceId);
        CareServiceProvider provider = service.getProvider();

        CareBooking booking = new CareBooking();
        booking.setBookingNumber("CARE-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        booking.setUser(user);
        booking.setUserId(userId);
        booking.setCar(car);
        booking.setCarId(carId);
        booking.setProvider(provider);
        booking.setProviderId(provider.getId());
        booking.setService(service);
        booking.setServiceId(serviceId);
        booking.setScheduledDate(scheduledDate);
        booking.setTotalAmount(service.getPrice());
        booking.setStatus(CareBooking.BookingStatus.PENDING);
        booking.setPaymentStatus(CareBooking.PaymentStatus.PENDING);

        return bookingRepository.save(booking);
    }

    @Transactional
    public CareBooking updateBookingStatus(Long bookingId, CareBooking.BookingStatus status) {
        CareBooking booking = getBookingById(Objects.requireNonNull(bookingId));
        booking.setStatus(status);
        if (status == CareBooking.BookingStatus.COMPLETED) {
            booking.setCompletedAt(LocalDateTime.now());
        }
        return bookingRepository.save(booking);
    }
}

