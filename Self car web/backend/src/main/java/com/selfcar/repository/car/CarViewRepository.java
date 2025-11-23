package com.selfcar.repository.car;

import com.selfcar.model.car.CarView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CarViewRepository extends JpaRepository<CarView, Long> {
    List<CarView> findByCarId(Long carId);
    
    List<CarView> findByCarIdAndCreatedAtBetween(Long carId, LocalDateTime start, LocalDateTime end);
    
    @Query("SELECT COUNT(DISTINCT cv.user.id) FROM CarView cv WHERE cv.car.id = :carId AND cv.createdAt BETWEEN :start AND :end")
    Long countUniqueViewsByCarAndPeriod(@Param("carId") Long carId, 
                                        @Param("start") LocalDateTime start, 
                                        @Param("end") LocalDateTime end);
    
    @Query("SELECT COUNT(cv) FROM CarView cv WHERE cv.car.id = :carId AND cv.trafficSource = :source AND cv.createdAt BETWEEN :start AND :end")
    Long countViewsByCarAndSource(@Param("carId") Long carId,
                                  @Param("source") CarView.TrafficSource source,
                                  @Param("start") LocalDateTime start,
                                  @Param("end") LocalDateTime end);
}

