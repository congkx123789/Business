package com.selfcar.service.common;

import com.selfcar.repository.booking.BookingRepository;
import com.selfcar.repository.car.CarRepository;
import com.selfcar.repository.auth.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final CarRepository carRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public Map<String, Object> getStats() {
        log.debug("Retrieving dashboard statistics");
        
        try {
            Map<String, Object> stats = new HashMap<>();
            
            Long totalCars = carRepository.count();
            Long totalBookings = bookingRepository.count();
            Long totalUsers = userRepository.count();
            
            log.debug("Retrieved counts - Cars: {}, Bookings: {}, Users: {}", 
                    totalCars, totalBookings, totalUsers);
            
            stats.put("totalCars", totalCars);
            stats.put("totalBookings", totalBookings);
            stats.put("totalUsers", totalUsers);
            
            Double revenue = bookingRepository.getTotalRevenue();
            stats.put("totalRevenue", revenue != null ? revenue : 0.0);
            
            log.debug("Retrieved revenue: {}", revenue);
            log.info("Successfully retrieved dashboard statistics");
            
            return stats;
        } catch (Exception e) {
            log.error("Error retrieving dashboard statistics", e);
            throw new RuntimeException("Failed to retrieve dashboard statistics", e);
        }
    }
}

