package com.selfcar.service.car;

import com.selfcar.model.car.Car;
import com.selfcar.model.car.FlashSale;
import com.selfcar.repository.car.CarRepository;
import com.selfcar.repository.car.FlashSaleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
public class FlashSaleService {

    private final FlashSaleRepository flashSaleRepository;
    private final CarRepository carRepository;

    public List<FlashSale> getAllFlashSales() {
        return flashSaleRepository.findAll();
    }

    public FlashSale getFlashSaleById(@NonNull Long id) {
        Objects.requireNonNull(id, "Flash sale ID is required");
        return flashSaleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Flash sale not found with id: " + id));
    }

    public List<FlashSale> getActiveFlashSales() {
        return flashSaleRepository.findActiveFlashSales(LocalDateTime.now());
    }

    public List<FlashSale> getAvailableFlashSales() {
        return flashSaleRepository.findAvailableFlashSales(LocalDateTime.now());
    }

    public FlashSale getFlashSaleByCar(Long carId) {
        Objects.requireNonNull(carId, "Car ID is required");
        return flashSaleRepository.findByCarIdAndActiveTrue(carId)
                .orElse(null);
    }

    @Transactional
    public FlashSale createFlashSale(FlashSale flashSale) {
        Objects.requireNonNull(flashSale, "Flash sale cannot be null");
        Objects.requireNonNull(flashSale.getCar(), "Car is required");
        Long carId = Objects.requireNonNull(flashSale.getCar().getId(), "Car ID is required");

        Car car = carRepository.findById(carId)
                .orElseThrow(() -> {
                    log.warn("Car not found with ID: {}", carId);
                    return new RuntimeException("Car not found");
                });

        flashSale.setCar(car);
        log.info("Creating flash sale for car ID: {}", carId);

        // Calculate discount percentage if not provided
        if (flashSale.getDiscountPercentage() == null && 
            flashSale.getOriginalPrice() != null && 
            flashSale.getSalePrice() != null) {
            BigDecimal discount = flashSale.getOriginalPrice().subtract(flashSale.getSalePrice());
            BigDecimal percentage = discount.divide(flashSale.getOriginalPrice(), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
            flashSale.setDiscountPercentage(percentage);
        }

        FlashSale saved = flashSaleRepository.save(flashSale);
        log.info("Flash sale created successfully with ID: {} for car ID: {}", saved.getId(), carId);
        return saved;
    }

    @Transactional
    public FlashSale updateFlashSale(@NonNull Long id, FlashSale flashSaleDetails) {
        Objects.requireNonNull(id, "Flash sale ID is required");
        Objects.requireNonNull(flashSaleDetails, "Flash sale details cannot be null");
        FlashSale flashSale = getFlashSaleById(id);

        if (flashSaleDetails.getTitle() != null) {
            flashSale.setTitle(flashSaleDetails.getTitle());
        }
        if (flashSaleDetails.getDescription() != null) {
            flashSale.setDescription(flashSaleDetails.getDescription());
        }
        if (flashSaleDetails.getOriginalPrice() != null) {
            flashSale.setOriginalPrice(flashSaleDetails.getOriginalPrice());
        }
        if (flashSaleDetails.getSalePrice() != null) {
            flashSale.setSalePrice(flashSaleDetails.getSalePrice());
        }
        if (flashSaleDetails.getStartTime() != null) {
            flashSale.setStartTime(flashSaleDetails.getStartTime());
        }
        if (flashSaleDetails.getEndTime() != null) {
            flashSale.setEndTime(flashSaleDetails.getEndTime());
        }
        if (flashSaleDetails.getMaxQuantity() != null) {
            flashSale.setMaxQuantity(flashSaleDetails.getMaxQuantity());
        }
        if (flashSaleDetails.getActive() != null) {
            flashSale.setActive(flashSaleDetails.getActive());
        }
        if (flashSaleDetails.getFeaturedImageUrl() != null) {
            flashSale.setFeaturedImageUrl(flashSaleDetails.getFeaturedImageUrl());
        }

        // Recalculate discount percentage if prices changed
        if (flashSale.getOriginalPrice() != null && flashSale.getSalePrice() != null) {
            BigDecimal discount = flashSale.getOriginalPrice().subtract(flashSale.getSalePrice());
            BigDecimal percentage = discount.divide(flashSale.getOriginalPrice(), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
            flashSale.setDiscountPercentage(percentage);
        }

        return flashSaleRepository.save(flashSale);
    }

    @Transactional
    public void incrementSoldQuantity(@NonNull Long id) {
        Objects.requireNonNull(id, "Flash sale ID is required");
        FlashSale flashSale = getFlashSaleById(id);
        flashSale.setSoldQuantity(flashSale.getSoldQuantity() + 1);
        flashSaleRepository.save(flashSale);
    }

    @Transactional
    public void deleteFlashSale(@NonNull Long id) {
        Objects.requireNonNull(id, "Flash sale ID is required");
        flashSaleRepository.deleteById(id);
    }
}
