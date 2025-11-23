package com.selfcar.service.car;

import com.selfcar.model.car.Car;
import com.selfcar.model.car.CarAd;
import com.selfcar.model.shop.Shop;
import com.selfcar.repository.car.CarAdRepository;
import com.selfcar.repository.car.CarRepository;
import com.selfcar.repository.shop.ShopRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class CarAdService {

    private final CarAdRepository carAdRepository;
    private final CarRepository carRepository;
    private final ShopRepository shopRepository;

    public List<CarAd> getAllAds() {
        return carAdRepository.findAll();
    }

    public CarAd getAdById(@NonNull Long id) {
        Objects.requireNonNull(id, "Ad ID is required");
        return carAdRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ad not found with id: " + id));
    }

    public List<CarAd> getActiveSearchAds(String keyword) {
        Objects.requireNonNull(keyword, "keyword is required");
        return carAdRepository.findSearchAdsByKeyword(keyword, LocalDateTime.now());
    }

    public List<CarAd> getDiscoveryAds(String location) {
        Objects.requireNonNull(location, "location is required");
        return carAdRepository.findDiscoveryAdsByLocation(location, LocalDateTime.now());
    }

    public List<CarAd> getAdsByCar(Long carId) {
        Objects.requireNonNull(carId, "Car ID is required");
        return carAdRepository.findByCarIdAndActiveTrue(carId);
    }

    public List<CarAd> getAdsByShop(Long shopId) {
        Objects.requireNonNull(shopId, "Shop ID is required");
        return carAdRepository.findByShopIdAndActiveTrue(shopId);
    }

    @Transactional
    public CarAd createAd(CarAd ad) {
        Objects.requireNonNull(ad, "Ad cannot be null");
        Objects.requireNonNull(ad.getCar(), "Car is required");
        Objects.requireNonNull(ad.getShop(), "Shop is required");

        Long carId = Objects.requireNonNull(ad.getCar().getId(), "Car ID cannot be null");
        Long shopId = Objects.requireNonNull(ad.getShop().getId(), "Shop ID cannot be null");
        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new RuntimeException("Car not found"));
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new RuntimeException("Shop not found"));

        ad.setCar(car);
        ad.setShop(shop);

        return carAdRepository.save(ad);
    }

    @Transactional
    @SuppressWarnings("null")
    public @NonNull CarAd updateAd(@NonNull Long id, CarAd adDetails) {
        Objects.requireNonNull(id, "Ad ID is required");
        Objects.requireNonNull(adDetails, "Ad details cannot be null");
        CarAd ad = getAdById(id);

        if (adDetails.getKeywords() != null) {
            ad.setKeywords(adDetails.getKeywords());
        }
        if (adDetails.getBidAmount() != null) {
            ad.setBidAmount(adDetails.getBidAmount());
        }
        if (adDetails.getPlacementLocation() != null) {
            ad.setPlacementLocation(adDetails.getPlacementLocation());
        }
        if (adDetails.getActive() != null) {
            ad.setActive(adDetails.getActive());
        }
        if (adDetails.getStartDate() != null) {
            ad.setStartDate(adDetails.getStartDate());
        }
        if (adDetails.getEndDate() != null) {
            ad.setEndDate(adDetails.getEndDate());
        }
        if (adDetails.getDailyBudget() != null) {
            ad.setDailyBudget(adDetails.getDailyBudget());
        }

        CarAd saved = Objects.requireNonNull(carAdRepository.save(ad), "Saved ad cannot be null");
        return saved;
    }

    @Transactional
    public void incrementClickCount(@NonNull Long id) {
        Objects.requireNonNull(id, "Ad ID is required");
        CarAd ad = getAdById(id);
        if (!Boolean.TRUE.equals(ad.getActive()) || Boolean.TRUE.equals(ad.getPaused())) {
            return;
        }
        enforceDailyBudget(ad);
        // Charge full bid on click
        if (ad.getBidAmount() != null) {
            BigDecimal currentSpend = ad.getSpentToday() != null ? ad.getSpentToday() : BigDecimal.ZERO;
            BigDecimal newSpend = currentSpend.add(ad.getBidAmount());
            ad.setSpentToday(newSpend);
        }
        ad.setClickCount(ad.getClickCount() + 1);
        autoPauseIfExceeded(ad);
        carAdRepository.save(ad);
    }

    @Transactional
    public void incrementImpressionCount(@NonNull Long id) {
        Objects.requireNonNull(id, "Ad ID is required");
        CarAd ad = getAdById(id);
        if (!Boolean.TRUE.equals(ad.getActive()) || Boolean.TRUE.equals(ad.getPaused())) {
            return;
        }
        enforceDailyBudget(ad);
        // Charge a fraction of bid on impression (e.g., 10%)
        if (ad.getBidAmount() != null) {
            BigDecimal impressionCost = ad.getBidAmount().multiply(new BigDecimal("0.10"));
            BigDecimal currentSpend = ad.getSpentToday() != null ? ad.getSpentToday() : BigDecimal.ZERO;
            ad.setSpentToday(currentSpend.add(impressionCost));
        }
        ad.setImpressionCount(ad.getImpressionCount() + 1);
        autoPauseIfExceeded(ad);
        carAdRepository.save(ad);
    }

    @Transactional
    public void deleteAd(@NonNull Long id) {
        Objects.requireNonNull(id, "Ad ID is required");
        carAdRepository.deleteById(id);
    }

    private void enforceDailyBudget(CarAd ad) {
        if (ad.getDailyBudget() == null) {
            return;
        }
        LocalDate today = LocalDate.now();
        if (ad.getBudgetResetDate() == null || !today.equals(ad.getBudgetResetDate())) {
            ad.setBudgetResetDate(today);
            ad.setSpentToday(BigDecimal.ZERO);
            ad.setPaused(false);
        }
    }

    private void autoPauseIfExceeded(CarAd ad) {
        if (ad.getDailyBudget() == null) {
            return;
        }
        if (ad.getSpentToday() != null && ad.getSpentToday().compareTo(ad.getDailyBudget()) >= 0) {
            ad.setPaused(true);
        }
    }

    @Transactional
    public CarAd pauseAd(@NonNull Long id) {
        Objects.requireNonNull(id, "Ad ID is required");
        CarAd ad = getAdById(id);
        ad.setPaused(true);
        return carAdRepository.save(ad);
    }

    @Transactional
    public CarAd resumeAd(@NonNull Long id) {
        Objects.requireNonNull(id, "Ad ID is required");
        CarAd ad = getAdById(id);
        ad.setPaused(false);
        enforceDailyBudget(ad);
        return carAdRepository.save(ad);
    }
}
