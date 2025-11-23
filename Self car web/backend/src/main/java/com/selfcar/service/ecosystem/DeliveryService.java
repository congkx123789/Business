package com.selfcar.service.ecosystem;

import com.selfcar.model.ecosystem.DeliveryBooking;
import com.selfcar.model.ecosystem.DeliveryPartner;
import com.selfcar.model.car.Car;
import com.selfcar.model.auth.User;
import com.selfcar.repository.ecosystem.DeliveryBookingRepository;
import com.selfcar.repository.ecosystem.DeliveryPartnerRepository;
import com.selfcar.repository.car.CarRepository;
import com.selfcar.repository.auth.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class DeliveryService {

    private final DeliveryPartnerRepository partnerRepository;
    private final DeliveryBookingRepository bookingRepository;
    private final CarRepository carRepository;
    private final UserRepository userRepository;

    public List<DeliveryPartner> getAllPartners() {
        return partnerRepository.findAll();
    }

    public List<DeliveryPartner> getActivePartners() {
        return partnerRepository.findByStatus(DeliveryPartner.PartnerStatus.ACTIVE);
    }

    public DeliveryPartner getPartnerById(Long id) {
        return partnerRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("Delivery partner not found"));
    }

    public List<DeliveryBooking> getBookingsByUser(Long userId) {
        return bookingRepository.findByUserId(userId);
    }

    public List<DeliveryBooking> getBookingsByOrder(Long orderId) {
        return bookingRepository.findByOrderId(orderId);
    }

    public DeliveryBooking getBookingById(Long id) {
        return bookingRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("Delivery booking not found"));
    }

    @Transactional
    public DeliveryBooking createDeliveryBooking(
            Long userId,
            Long carId,
            Long partnerId,
            DeliveryBooking.DeliveryType deliveryType,
            String pickupLocation,
            BigDecimal pickupLatitude,
            BigDecimal pickupLongitude,
            String deliveryLocation,
            BigDecimal deliveryLatitude,
            BigDecimal deliveryLongitude,
            LocalDateTime scheduledDate) {

        User user = userRepository.findById(Objects.requireNonNull(userId))
                .orElseThrow(() -> new RuntimeException("User not found"));
        Car car = carRepository.findById(Objects.requireNonNull(carId))
                .orElseThrow(() -> new RuntimeException("Car not found"));
        DeliveryPartner partner = getPartnerById(partnerId);

        // Calculate distance (simplified - in production, use a mapping service)
        BigDecimal distanceKm = calculateDistance(pickupLatitude, pickupLongitude, deliveryLatitude, deliveryLongitude);
        BigDecimal estimatedCost = partner.getBasePricePerKm().multiply(distanceKm);

        DeliveryBooking booking = new DeliveryBooking();
        booking.setBookingNumber("DEL-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        booking.setUser(user);
        booking.setUserId(userId);
        booking.setCar(car);
        booking.setCarId(carId);
        booking.setPartner(partner);
        booking.setPartnerId(partnerId);
        booking.setDeliveryType(deliveryType);
        booking.setPickupLocation(pickupLocation);
        booking.setPickupLatitude(pickupLatitude);
        booking.setPickupLongitude(pickupLongitude);
        booking.setDeliveryLocation(deliveryLocation);
        booking.setDeliveryLatitude(deliveryLatitude);
        booking.setDeliveryLongitude(deliveryLongitude);
        booking.setScheduledDate(scheduledDate);
        booking.setDistanceKm(distanceKm);
        booking.setEstimatedCost(estimatedCost);
        booking.setStatus(DeliveryBooking.DeliveryStatus.PENDING);

        return bookingRepository.save(booking);
    }

    @Transactional
    public DeliveryBooking updateDeliveryStatus(Long bookingId, DeliveryBooking.DeliveryStatus status) {
        DeliveryBooking booking = getBookingById(Objects.requireNonNull(bookingId));
        booking.setStatus(status);
        if (status == DeliveryBooking.DeliveryStatus.COMPLETED) {
            booking.setCompletedAt(LocalDateTime.now());
        }
        return bookingRepository.save(booking);
    }

    @Transactional
    public DeliveryBooking assignDriver(Long bookingId, Long driverId, String driverName, String driverPhone, String vehiclePlateNumber) {
        DeliveryBooking booking = getBookingById(Objects.requireNonNull(bookingId));
        User driver = userRepository.findById(Objects.requireNonNull(driverId))
                .orElseThrow(() -> new RuntimeException("Driver not found"));
        booking.setDriver(driver);
        booking.setDriverId(driverId);
        booking.setDriverName(driverName);
        booking.setDriverPhone(driverPhone);
        booking.setVehiclePlateNumber(vehiclePlateNumber);
        booking.setStatus(DeliveryBooking.DeliveryStatus.CONFIRMED);
        return bookingRepository.save(booking);
    }

    private BigDecimal calculateDistance(BigDecimal lat1, BigDecimal lon1, BigDecimal lat2, BigDecimal lon2) {
        // Simplified distance calculation (Haversine formula would be more accurate)
        // For production, use a proper geolocation service
        double deltaLat = lat2.subtract(lat1).doubleValue();
        double deltaLon = lon2.subtract(lon1).doubleValue();
        double distance = Math.sqrt(deltaLat * deltaLat + deltaLon * deltaLon) * 111.0; // Approximate km
        return BigDecimal.valueOf(distance).setScale(2, java.math.RoundingMode.HALF_UP);
    }
}

