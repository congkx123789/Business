package com.selfcar.service.car;

import com.selfcar.events.CarChangedEvent;
import com.selfcar.model.car.Car;
import com.selfcar.repository.car.CarRepository;
import com.selfcar.service.cache.CacheInvalidationService;
import com.selfcar.service.cache.VehicleDetailCacheService;
import org.springframework.beans.factory.annotation.Autowired;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.lang.NonNull;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Slf4j
@Service
public class CarService {

    private final CarRepository carRepository;
    private final CacheInvalidationService cacheInvalidationService;
    @Autowired(required = false)
    private VehicleDetailCacheService vehicleDetailCacheService;
    private final ApplicationEventPublisher eventPublisher;

    public CarService(CarRepository carRepository,
                      CacheInvalidationService cacheInvalidationService,
                      ApplicationEventPublisher eventPublisher) {
        this.carRepository = carRepository;
        this.cacheInvalidationService = cacheInvalidationService;
        this.eventPublisher = eventPublisher;
    }

    public List<Car> getAllCars() {
        return carRepository.findAll();
    }

    /**
     * Get car by ID with cache-aside pattern for VDP optimization
     * Uses vehicleDetailCacheService for ≥80% cache hit rate target
     */
    @Cacheable(cacheNames = "carById", key = "#id")
    public @NonNull Car getCarById(@NonNull Long id) {
        Objects.requireNonNull(id, "Car ID cannot be null");

        // Use cache-aside pattern for VDP (hot path)
        if (vehicleDetailCacheService != null) {
            Optional<Car> cachedCar = vehicleDetailCacheService.getVehicleDetails(id);
            if (cachedCar.isPresent()) {
                return cachedCar.get();
            }
        }

        // Fallback to direct database query (should rarely happen)
        Car car = carRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Car not found with ID: {}", id);
                    return new EntityNotFoundException("Car not found with id: " + id);
                });
        return Objects.requireNonNull(car, "Car should not be null after orElseThrow");
    }

    @Cacheable(cacheNames = "availableCars", unless = "#result == null || #result.isEmpty()")
    public List<Car> getAvailableCars() {
        return carRepository.findByAvailableTrue();
    }

    @Cacheable(cacheNames = "featuredCars", unless = "#result == null || #result.isEmpty()")
    public List<Car> getFeaturedCars() {
        return carRepository.findByFeaturedTrue();
    }

    public List<Car> getCarsByType(Car.CarType type) {
        Objects.requireNonNull(type, "Car type cannot be null");
        return carRepository.findByType(type);
    }

    @Transactional
    public Car createCar(Car car) {
        Objects.requireNonNull(car, "Car cannot be null");
        Car savedCar = carRepository.save(car);
        log.info("Car created successfully with ID: {}", savedCar.getId());
        return savedCar;
    }

    @Transactional
    @CacheEvict(cacheNames = {"carById", "availableCars", "carList", "featuredCars"}, allEntries = true)
    public Car updateCar(@NonNull Long id, Car carDetails) {
        Objects.requireNonNull(id, "Car ID cannot be null");
        Objects.requireNonNull(carDetails, "Car details cannot be null");
        Car car = getCarById(id);

        car.setName(carDetails.getName());
        car.setBrand(carDetails.getBrand());
        car.setType(carDetails.getType());
        car.setYear(carDetails.getYear());
        car.setPricePerDay(carDetails.getPricePerDay());
        car.setSeats(carDetails.getSeats());
        car.setTransmission(carDetails.getTransmission());
        car.setFuelType(carDetails.getFuelType());
        car.setDescription(carDetails.getDescription());
        car.setImageUrl(carDetails.getImageUrl());
        car.setAvailable(carDetails.getAvailable());
        car.setFeatured(carDetails.getFeatured());

        Car updatedCar = carRepository.save(car);
        // Invalidate all car-related caches
        cacheInvalidationService.invalidateCarCaches(id);
        // Publish event for version bump and CDN purge
        eventPublisher.publishEvent(new CarChangedEvent(id, CarChangedEvent.ChangeType.DETAILS));
        log.info("Car updated successfully with ID: {}", id);
        return updatedCar;
    }

    @Transactional
    @CacheEvict(cacheNames = {"carById", "availableCars", "carList", "featuredCars"}, allEntries = true)
    public void deleteCar(@NonNull Long id) {
        Objects.requireNonNull(id, "Car ID cannot be null");
        Car car = getCarById(id);
        Objects.requireNonNull(car, "Car cannot be null");
        carRepository.delete(car);
        // Invalidate all car-related caches
        cacheInvalidationService.invalidateCarCaches(id);
        // Publish event
        eventPublisher.publishEvent(new CarChangedEvent(id, CarChangedEvent.ChangeType.DETAILS));
        log.info("Car deleted successfully with ID: {}", id);
    }

    @Transactional
    @CacheEvict(cacheNames = {"carById", "availableCars", "carList", "inventory", "carAvailability"}, allEntries = true)
    public Car toggleAvailability(@NonNull Long id) {
        Objects.requireNonNull(id, "Car ID cannot be null");
        Car car = getCarById(id);
        car.setAvailable(!car.getAvailable());
        Car updatedCar = carRepository.save(car);
        // Invalidate availability and inventory caches
        cacheInvalidationService.invalidateInventoryCaches(id);
        cacheInvalidationService.invalidateCarCaches(id);
        // Publish event for version bump and CDN purge
        eventPublisher.publishEvent(new CarChangedEvent(id, CarChangedEvent.ChangeType.AVAILABILITY));
        return updatedCar;
    }
}

