package com.selfcar.repository.logistics;

import com.selfcar.model.logistics.Logistics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LogisticsRepository extends JpaRepository<Logistics, Long> {
    List<Logistics> findByBookingId(Long bookingId);
    
    List<Logistics> findByType(Logistics.LogisticsType type);
    
    List<Logistics> findByStatus(Logistics.LogisticsStatus status);
}
