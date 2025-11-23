package com.selfcar.repository.car;

import com.selfcar.model.car.CarReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CarReviewRepository extends JpaRepository<CarReview, Long> {

    List<CarReview> findByCarIdOrderByCreatedAtDesc(Long carId);

    List<CarReview> findBySellerIdOrderByCreatedAtDesc(Long sellerId);

    Optional<CarReview> findByCarIdAndUserId(Long carId, Long userId);

    Optional<CarReview> findByBookingId(Long bookingId);

    @Query("SELECT AVG(r.rating) FROM CarReview r WHERE r.car.id = :carId")
    Double getAverageRatingByCarId(@Param("carId") Long carId);

    @Query("SELECT AVG(r.rating) FROM CarReview r WHERE r.seller.id = :sellerId")
    Double getAverageRatingBySellerId(@Param("sellerId") Long sellerId);

    @Query("SELECT COUNT(r) FROM CarReview r WHERE r.car.id = :carId")
    Long getReviewCountByCarId(@Param("carId") Long carId);

    @Query("SELECT COUNT(r) FROM CarReview r WHERE r.seller.id = :sellerId")
    Long getReviewCountBySellerId(@Param("sellerId") Long sellerId);
}
