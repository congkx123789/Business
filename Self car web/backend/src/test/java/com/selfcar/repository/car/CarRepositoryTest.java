package com.selfcar.repository.car;

import com.selfcar.model.car.Car;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class CarRepositoryTest {

    @Autowired
    private CarRepository carRepository;

    private Car createCar(String name, String brand, Car.CarType type, boolean available, boolean featured, BigDecimal price) {
        Car car = new Car();
        car.setName(name);
        car.setBrand(brand);
        car.setType(type);
        car.setYear(2022);
        car.setPricePerDay(price);
        car.setSeats(4);
        car.setTransmission(Car.Transmission.AUTOMATIC);
        car.setFuelType(Car.FuelType.PETROL);
        car.setAvailable(available);
        car.setFeatured(featured);
        car.setCreatedAt(java.time.LocalDateTime.now());
        car.setUpdatedAt(java.time.LocalDateTime.now());
        return car;
    }

    @Test
    @DisplayName("CRUD and basic derived queries work")
    void crudAndQueries() {
        Car a = createCar("A", "Tesla", Car.CarType.SEDAN, true, false, new BigDecimal("100"));
        Car b = createCar("B", "BMW", Car.CarType.SUV, false, true, new BigDecimal("200"));
        Car c = createCar("C", "Tesla", Car.CarType.SUV, true, true, new BigDecimal("300"));

        carRepository.saveAll(List.of(a, b, c));

        assertThat(carRepository.count()).isEqualTo(3);
        assertThat(carRepository.findByAvailableTrue()).hasSize(2);
        assertThat(carRepository.findByFeaturedTrue()).hasSize(2);
        assertThat(carRepository.findByType(Car.CarType.SUV)).hasSize(2);
        assertThat(carRepository.findByBrand("Tesla")).hasSize(2);
        assertThat(carRepository.findByAvailableTrueAndType(Car.CarType.SUV)).hasSize(1);
        assertThat(carRepository.findByPricePerDayBetween(new BigDecimal("150"), new BigDecimal("350"))).hasSize(2);
        assertThat(carRepository.findByPricePerDayGreaterThan(new BigDecimal("150"))).hasSize(2);
        assertThat(carRepository.countByAvailable(true)).isEqualTo(2);
    }
}


