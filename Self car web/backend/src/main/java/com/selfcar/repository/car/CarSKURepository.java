package com.selfcar.repository.car;

import com.selfcar.model.car.CarSKU;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CarSKURepository extends JpaRepository<CarSKU, Long> {
    List<CarSKU> findByCarId(Long carId);
    Optional<CarSKU> findBySkuCode(String skuCode);
    List<CarSKU> findByCarIdAndAvailableTrue(Long carId);
}
