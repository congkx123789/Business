package com.selfcar.repository.ecosystem;

import com.selfcar.model.ecosystem.CareBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CareBookingRepository extends JpaRepository<CareBooking, Long> {
    List<CareBooking> findByUserId(Long userId);
    List<CareBooking> findByProviderId(Long providerId);
    List<CareBooking> findByStatus(CareBooking.BookingStatus status);
    CareBooking findByBookingNumber(String bookingNumber);
}

