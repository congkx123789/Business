package com.selfcar.service.car;

import com.selfcar.events.CarChangedEvent;
import com.selfcar.model.car.Car;
import com.selfcar.repository.car.CarRepository;
import com.selfcar.service.cache.CacheInvalidationService;
import com.selfcar.service.cache.VehicleDetailCacheService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.context.ApplicationEventPublisher;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class CarServiceTest {

	@Mock private CarRepository carRepository;
	@Mock private CacheInvalidationService cacheInvalidationService;
	@Mock private VehicleDetailCacheService vehicleDetailCacheService;
	@Mock private ApplicationEventPublisher eventPublisher;

	@InjectMocks private CarService carService;

	private Car car;

	@BeforeEach
	void init() {
		car = new Car();
		car.setId(1L);
		car.setName("Model S");
		car.setBrand("Tesla");
		car.setType(Car.CarType.SEDAN);
		car.setYear(2022);
		car.setPricePerDay(new BigDecimal("100"));
		car.setSeats(4);
		car.setTransmission(Car.Transmission.AUTOMATIC);
		car.setFuelType(Car.FuelType.PETROL);
		car.setAvailable(true);
		// Inject the optional vehicleDetailCacheService mock into field (constructor doesn't take it)
		ReflectionTestUtils.setField(carService, "vehicleDetailCacheService", vehicleDetailCacheService);
	}

	@Test
	@DisplayName("getCarById returns from cache when present, else repository")
	void getCarById_cache_then_repo() {
		when(vehicleDetailCacheService.getVehicleDetails(1L)).thenReturn(Optional.of(car));
		Car cached = carService.getCarById(1L);
		assertThat(cached.getName()).isEqualTo("Model S");

		when(vehicleDetailCacheService.getVehicleDetails(1L)).thenReturn(Optional.empty());
		when(carRepository.findById(1L)).thenReturn(Optional.of(car));
		Car fromRepo = carService.getCarById(1L);
		assertThat(fromRepo.getId()).isEqualTo(1L);
	}

	@Test
	@DisplayName("getCarById throws when not found")
	void getCarById_notFound() {
		when(vehicleDetailCacheService.getVehicleDetails(1L)).thenReturn(Optional.empty());
		when(carRepository.findById(1L)).thenReturn(Optional.empty());
		assertThrows(RuntimeException.class, () -> carService.getCarById(1L));
	}

	@Test
	@DisplayName("createCar saves and returns car")
	void createCar() {
		when(carRepository.save(any(Car.class))).thenReturn(car);
		Car created = carService.createCar(car);
		assertThat(created.getId()).isEqualTo(1L);
		verify(carRepository).save(car);
	}

	@Test
	@DisplayName("getAvailableCars and getFeaturedCars delegate to repository")
	void listQueries() {
		when(carRepository.findByAvailableTrue()).thenReturn(List.of(car));
		when(carRepository.findByFeaturedTrue()).thenReturn(List.of(car));
		assertThat(carService.getAvailableCars()).hasSize(1);
		assertThat(carService.getFeaturedCars()).hasSize(1);
	}

	@Test
	@DisplayName("updateCar copies fields, saves, invalidates caches, publishes event")
	void updateCar_updates_and_invalidates() {
		when(vehicleDetailCacheService.getVehicleDetails(1L)).thenReturn(Optional.empty());
		when(carRepository.findById(1L)).thenReturn(Optional.of(car));
		when(carRepository.save(any(Car.class))).thenAnswer(inv -> inv.getArgument(0));

		Car update = new Car();
		update.setName("New");
		update.setBrand("Brand");
		update.setType(Car.CarType.SUV);
		update.setYear(2023);
		update.setPricePerDay(new BigDecimal("200"));
		update.setSeats(5);
		update.setTransmission(Car.Transmission.MANUAL);
		update.setFuelType(Car.FuelType.ELECTRIC);
		update.setAvailable(false);
		update.setFeatured(true);

		Car result = carService.updateCar(1L, update);
		assertThat(result.getName()).isEqualTo("New");
		verify(cacheInvalidationService).invalidateCarCaches(1L);
		verify(eventPublisher, atLeastOnce()).publishEvent(any(CarChangedEvent.class));
	}

	@Test
	@DisplayName("deleteCar deletes, invalidates caches, publishes event")
	void deleteCar_flow() {
		when(vehicleDetailCacheService.getVehicleDetails(1L)).thenReturn(Optional.empty());
		when(carRepository.findById(1L)).thenReturn(Optional.of(car));

		carService.deleteCar(1L);

		verify(carRepository).delete(car);
		verify(cacheInvalidationService).invalidateCarCaches(1L);
		verify(eventPublisher, atLeastOnce()).publishEvent(any(CarChangedEvent.class));
	}

	@Test
	@DisplayName("toggleAvailability flips flag, saves, invalidates caches, publishes event")
	void toggleAvailability_flow() {
		when(vehicleDetailCacheService.getVehicleDetails(1L)).thenReturn(Optional.empty());
		when(carRepository.findById(1L)).thenReturn(Optional.of(car));
		when(carRepository.save(any(Car.class))).thenAnswer(inv -> inv.getArgument(0));

		Car updated = carService.toggleAvailability(1L);
		assertThat(updated.getAvailable()).isFalse();
		verify(cacheInvalidationService).invalidateInventoryCaches(1L);
		verify(cacheInvalidationService).invalidateCarCaches(1L);
		verify(eventPublisher, atLeastOnce()).publishEvent(any(CarChangedEvent.class));
	}
}


