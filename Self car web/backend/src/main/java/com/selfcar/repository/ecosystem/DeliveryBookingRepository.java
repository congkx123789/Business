package com.selfcar.repository.ecosystem;

import com.selfcar.model.ecosystem.DeliveryBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeliveryBookingRepository extends JpaRepository<DeliveryBooking, Long> {
    List<DeliveryBooking> findByUserId(Long userId);
    List<DeliveryBooking> findByPartnerId(Long partnerId);
    List<DeliveryBooking> findByOrderId(Long orderId);
    List<DeliveryBooking> findByStatus(DeliveryBooking.DeliveryStatus status);
    DeliveryBooking findByBookingNumber(String bookingNumber);
}

