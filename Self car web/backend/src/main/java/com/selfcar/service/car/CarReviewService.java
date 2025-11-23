package com.selfcar.service.car;

import com.selfcar.model.auth.User;
import com.selfcar.model.booking.Booking;
import com.selfcar.model.car.Car;
import com.selfcar.model.car.CarReview;
import com.selfcar.repository.auth.UserRepository;
import com.selfcar.repository.booking.BookingRepository;
import com.selfcar.repository.car.CarRepository;
import com.selfcar.repository.car.CarReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CarReviewService {

    private final CarReviewRepository carReviewRepository;
    private final CarRepository carRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;

    public List<CarReview> getReviewsByCar(Long carId) {
        Objects.requireNonNull(carId, "Car ID cannot be null");
        return carReviewRepository.findByCarIdOrderByCreatedAtDesc(carId);
    }

    public List<CarReview> getReviewsBySeller(Long sellerId) {
        Objects.requireNonNull(sellerId, "Seller ID cannot be null");
        return carReviewRepository.findBySellerIdOrderByCreatedAtDesc(sellerId);
    }

    public @NonNull CarReview getReviewById(@NonNull Long id) {
        Objects.requireNonNull(id, "Review ID cannot be null");
        CarReview review = carReviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found with id: " + id));
        return Objects.requireNonNull(review, "Review should not be null after orElseThrow");
    }

    public Double getAverageRatingByCar(Long carId) {
        Objects.requireNonNull(carId, "Car ID cannot be null");
        Double rating = carReviewRepository.getAverageRatingByCarId(carId);
        return rating != null ? rating : 0.0;
    }

    public Double getAverageRatingBySeller(Long sellerId) {
        Objects.requireNonNull(sellerId, "Seller ID cannot be null");
        Double rating = carReviewRepository.getAverageRatingBySellerId(sellerId);
        return rating != null ? rating : 0.0;
    }

    public Long getReviewCountByCar(Long carId) {
        Objects.requireNonNull(carId, "Car ID cannot be null");
        return carReviewRepository.getReviewCountByCarId(carId);
    }

    public Long getReviewCountBySeller(Long sellerId) {
        Objects.requireNonNull(sellerId, "Seller ID cannot be null");
        return carReviewRepository.getReviewCountBySellerId(sellerId);
    }

    @Transactional
    public CarReview createReview(CarReview review) {
        Objects.requireNonNull(review, "Review cannot be null");
        Objects.requireNonNull(review.getCar(), "Car is required");
        Objects.requireNonNull(review.getUser(), "User is required");

        Long carId = Objects.requireNonNull(review.getCar().getId(), "Car ID cannot be null");
        Long userId = Objects.requireNonNull(review.getUser().getId(), "User ID cannot be null");
        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new RuntimeException("Car not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if user already reviewed this car
        Optional<CarReview> existingReview = carReviewRepository.findByCarIdAndUserId(car.getId(), user.getId());
        if (existingReview.isPresent()) {
            throw new RuntimeException("You have already reviewed this car");
        }

        review.setCar(car);
        review.setUser(user);

        // Set seller if car has a shop
        if (car.getShop() != null && car.getShop().getOwner() != null) {
            review.setSeller(car.getShop().getOwner());
        }

        // Mark as verified if linked to booking
        if (review.getBooking() != null && review.getBooking().getId() != null) {
            Long bookingId = Objects.requireNonNull(review.getBooking().getId(), "Booking ID cannot be null");
            Booking booking = bookingRepository.findById(bookingId)
                    .orElse(null);
            if (booking != null && booking.getUser() != null && booking.getUser().getId() != null 
                    && booking.getUser().getId().equals(user.getId())) {
                review.setBooking(booking);
                review.setVerifiedPurchase(true);
            }
        }

        return carReviewRepository.save(review);
    }

    @Transactional
    public CarReview updateReview(@NonNull Long id, CarReview reviewDetails) {
        Objects.requireNonNull(reviewDetails, "Review details cannot be null");
        CarReview review = getReviewById(id);

        if (reviewDetails.getRating() != null) {
            review.setRating(reviewDetails.getRating());
        }
        if (reviewDetails.getContent() != null) {
            review.setContent(reviewDetails.getContent());
        }
        if (reviewDetails.getPros() != null) {
            review.setPros(reviewDetails.getPros());
        }
        if (reviewDetails.getCons() != null) {
            review.setCons(reviewDetails.getCons());
        }

        return carReviewRepository.save(review);
    }

    @Transactional
    public void deleteReview(@NonNull Long id) {
        Objects.requireNonNull(id, "Review ID cannot be null");
        carReviewRepository.deleteById(id);
    }
}
