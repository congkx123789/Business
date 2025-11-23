package com.selfcar.repository.car;

import com.selfcar.model.car.CarAd;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CarAdRepository extends JpaRepository<CarAd, Long> {

    List<CarAd> findByActiveTrueAndType(CarAd.AdType type);

    List<CarAd> findByCarIdAndActiveTrue(Long carId);

    List<CarAd> findByShopIdAndActiveTrue(Long shopId);

    @Query("SELECT a FROM CarAd a WHERE a.active = true AND a.type = :type " +
           "AND (a.startDate IS NULL OR a.startDate <= :now) " +
           "AND (a.endDate IS NULL OR a.endDate >= :now)")
    List<CarAd> findActiveAdsByType(@Param("type") CarAd.AdType type, @Param("now") LocalDateTime now);

    @Query("SELECT a FROM CarAd a WHERE a.active = true AND a.type = 'SEARCH_AD' " +
           "AND LOWER(a.keywords) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "AND (a.startDate IS NULL OR a.startDate <= :now) " +
           "AND (a.endDate IS NULL OR a.endDate >= :now) " +
           "ORDER BY a.bidAmount DESC")
    List<CarAd> findSearchAdsByKeyword(@Param("keyword") String keyword, @Param("now") LocalDateTime now);

    @Query("SELECT a FROM CarAd a WHERE a.active = true AND a.type = 'DISCOVERY_AD' " +
           "AND a.placementLocation = :location " +
           "AND (a.startDate IS NULL OR a.startDate <= :now) " +
           "AND (a.endDate IS NULL OR a.endDate >= :now) " +
           "ORDER BY a.bidAmount DESC")
    List<CarAd> findDiscoveryAdsByLocation(@Param("location") String location, @Param("now") LocalDateTime now);
}
