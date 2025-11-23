package com.selfcar.repository.car;

import com.selfcar.model.car.FlashSale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface FlashSaleRepository extends JpaRepository<FlashSale, Long> {

    Optional<FlashSale> findByCarIdAndActiveTrue(Long carId);

    @Query("SELECT f FROM FlashSale f WHERE f.active = true " +
           "AND f.startTime <= :now AND f.endTime >= :now")
    List<FlashSale> findActiveFlashSales(@Param("now") LocalDateTime now);

    @Query("SELECT f FROM FlashSale f WHERE f.active = true " +
           "AND f.startTime <= :now AND f.endTime >= :now " +
           "AND (f.maxQuantity IS NULL OR f.soldQuantity < f.maxQuantity)")
    List<FlashSale> findAvailableFlashSales(@Param("now") LocalDateTime now);

    List<FlashSale> findByActiveTrueOrderByStartTimeDesc();
}
