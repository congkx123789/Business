package com.selfcar.repository.car;

import com.selfcar.model.car.CarImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CarImageRepository extends JpaRepository<CarImage, Long> {
    List<CarImage> findByCarIdOrderByDisplayOrderAsc(Long carId);
    List<CarImage> findByCarIdAndIsPrimaryTrue(Long carId);
}
