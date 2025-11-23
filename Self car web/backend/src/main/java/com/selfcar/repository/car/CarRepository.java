package com.selfcar.repository.car;

import com.selfcar.model.car.Car;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface CarRepository extends JpaRepository<Car, Long>, JpaSpecificationExecutor<Car> {
    List<Car> findByAvailableTrue();
    List<Car> findByFeaturedTrue();
    List<Car> findByType(Car.CarType type);
    List<Car> findByBrand(String brand);
    
    // Additional query methods for comprehensive testing
    List<Car> findByAvailableTrueAndType(Car.CarType type);
    List<Car> findByPricePerDayBetween(BigDecimal minPrice, BigDecimal maxPrice);
    List<Car> findByPricePerDayGreaterThan(BigDecimal price);
    long countByAvailable(boolean available);
}

