package com.selfcar.controller.car;

import com.selfcar.dto.common.ApiResponse;
import com.selfcar.model.car.Car;
import com.selfcar.model.car.CarImage;
import com.selfcar.repository.car.CarImageRepository;
import com.selfcar.repository.car.CarRepository;
import com.selfcar.service.storage.S3ImageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import jakarta.persistence.EntityNotFoundException;

@Slf4j
@RestController
@RequestMapping("/api/car-images")
@RequiredArgsConstructor
public class CarImageController {

    private final CarImageRepository carImageRepository;
    private final CarRepository carRepository;
    private final S3ImageService s3ImageService;

    @GetMapping("/car/{carId}")
    public ResponseEntity<?> list(@PathVariable Long carId) {
        try {
            List<CarImage> images = carImageRepository.findByCarIdOrderByDisplayOrderAsc(carId);
            // Ensure all image URLs are CDN URLs (convert S3 URLs if needed)
            images.forEach(img -> {
                String url = img.getImageUrl();
                if (url != null && !url.contains("cloudfront") && !url.contains("cdn")) {
                    // Convert S3 URL to CDN URL if it's an S3 URL
                    img.setImageUrl(s3ImageService.getCdnUrl(url));
                }
            });
            return ResponseEntity.ok(images);
        } catch (Exception e) {
            log.error("Error getting car images for car id: {}", carId, e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/presigned-url")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<?> getPresignedUploadUrl(@RequestParam Long carId,
                                                    @RequestParam String contentType,
                                                    @RequestParam Long fileSize,
                                                    @AuthenticationPrincipal com.selfcar.security.UserPrincipal principal) {
        try {
            if (principal == null || principal.getUser() == null) {
                return ResponseEntity.status(401).body(new ApiResponse(false, "Authentication required"));
            }
            Car car = carRepository.findById(carId).orElseThrow(() -> new EntityNotFoundException("Car not found"));
            // BOLA: Only owner (seller) or admin can upload images
            if (car.getShop() != null && car.getShop().getOwner() != null) {
                var ownerId = car.getShop().getOwner().getId();
                var user = principal.getUser();
                if (!user.getRole().name().equals("ADMIN") && (ownerId == null || !ownerId.equals(user.getId()))) {
                    return ResponseEntity.status(403).body(new ApiResponse(false, "Forbidden"));
                }
            }
            String presignedUrl = s3ImageService.generatePresignedUploadUrl(carId, contentType, fileSize);
            return ResponseEntity.ok(new ApiResponse(true, presignedUrl));
        } catch (Exception e) {
            log.error("Error generating presigned URL for car id: {}", carId, e);
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/upload")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file,
                                         @RequestParam Long carId,
                                         @RequestParam(required = false) Integer displayOrder,
                                         @RequestParam(required = false) Boolean primary,
                                         @AuthenticationPrincipal com.selfcar.security.UserPrincipal principal) {
        try {
            if (principal == null || principal.getUser() == null) {
                return ResponseEntity.status(401).body(new ApiResponse(false, "Authentication required"));
            }
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "File is required"));
            }
            Car car = carRepository.findById(carId).orElseThrow(() -> new EntityNotFoundException("Car not found"));
            // BOLA: Only owner (seller) or admin can modify car images
            if (car.getShop() != null && car.getShop().getOwner() != null) {
                var ownerId = car.getShop().getOwner().getId();
                var user = principal.getUser();
                if (!user.getRole().name().equals("ADMIN") && (ownerId == null || !ownerId.equals(user.getId()))) {
                    return ResponseEntity.status(403).body(new ApiResponse(false, "Forbidden"));
                }
            }
            // Upload to S3
            String s3Key = s3ImageService.uploadImage(file, carId);
            String cdnUrl = s3ImageService.getCdnUrl(s3Key);
            
            CarImage img = new CarImage();
            img.setCar(car);
            img.setImageUrl(cdnUrl);
            img.setDisplayOrder(displayOrder != null ? displayOrder : 0);
            img.setIsPrimary(primary != null ? primary : false);
            CarImage saved = carImageRepository.save(img);
            log.info("Image uploaded successfully for car {}: {}", carId, cdnUrl);
            return ResponseEntity.ok(saved);
        } catch (IOException e) {
            log.error("Error uploading image for car id: {}", carId, e);
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Failed to upload image: " + e.getMessage()));
        } catch (Exception e) {
            log.error("Error adding car image for car id: {}", carId, e);
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<?> add(@RequestParam Long carId, @RequestParam String imageUrl, @RequestParam(required = false) Integer displayOrder, @RequestParam(required = false) Boolean primary,
                                 @AuthenticationPrincipal com.selfcar.security.UserPrincipal principal) {
        try {
            if (principal == null || principal.getUser() == null) {
                return ResponseEntity.status(401).body(new ApiResponse(false, "Authentication required"));
            }
            if (imageUrl == null || imageUrl.isBlank()) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "Image URL is required"));
            }
            Car car = carRepository.findById(carId).orElseThrow(() -> new RuntimeException("Car not found"));
            // BOLA: Only owner (seller) or admin can modify car images
            if (car.getShop() != null && car.getShop().getOwner() != null) {
                var ownerId = car.getShop().getOwner().getId();
                var user = principal.getUser();
                if (!user.getRole().name().equals("ADMIN") && (ownerId == null || !ownerId.equals(user.getId()))) {
                    return ResponseEntity.status(403).body(new ApiResponse(false, "Forbidden"));
                }
            }
            CarImage img = new CarImage();
            img.setCar(car);
            img.setImageUrl(imageUrl);
            img.setDisplayOrder(displayOrder != null ? displayOrder : 0);
            img.setIsPrimary(primary != null ? primary : false);
            CarImage saved = carImageRepository.save(img);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            log.error("Error adding car image for car id: {}", carId, e);
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestParam(required = false) Integer displayOrder, @RequestParam(required = false) Boolean primary,
                                    @AuthenticationPrincipal com.selfcar.security.UserPrincipal principal) {
        try {
            CarImage img = carImageRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Image not found"));
            if (principal == null || principal.getUser() == null) {
                return ResponseEntity.status(401).body(new ApiResponse(false, "Authentication required"));
            }
            // BOLA: Ensure principal owns the car (or admin)
            Car car = img.getCar();
            if (car != null && car.getShop() != null && car.getShop().getOwner() != null) {
                var ownerId = car.getShop().getOwner().getId();
                var user = principal.getUser();
                if (!user.getRole().name().equals("ADMIN") && (ownerId == null || !ownerId.equals(user.getId()))) {
                    return ResponseEntity.status(403).body(new ApiResponse(false, "Forbidden"));
                }
            }
            if (displayOrder != null) img.setDisplayOrder(displayOrder);
            if (primary != null) img.setIsPrimary(primary);
            CarImage saved = carImageRepository.save(img);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            log.error("Error updating car image with id: {}", id, e);
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id,
                                    @AuthenticationPrincipal com.selfcar.security.UserPrincipal principal) {
        try {
            if (principal == null || principal.getUser() == null) {
                return ResponseEntity.status(401).body(new ApiResponse(false, "Authentication required"));
            }
            if (!carImageRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            CarImage img = carImageRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Image not found"));
            Car car = img.getCar();
            if (car != null && car.getShop() != null && car.getShop().getOwner() != null) {
                var ownerId = car.getShop().getOwner().getId();
                var user = principal.getUser();
                if (!user.getRole().name().equals("ADMIN") && (ownerId == null || !ownerId.equals(user.getId()))) {
                    return ResponseEntity.status(403).body(new ApiResponse(false, "Forbidden"));
                }
            }
            // Delete from S3 if URL is from S3/CDN
            String imageUrl = img.getImageUrl();
            if (imageUrl != null && (imageUrl.contains("amazonaws.com") || imageUrl.contains("cloudfront"))) {
                try {
                    s3ImageService.deleteImage(imageUrl);
                } catch (Exception e) {
                    log.warn("Failed to delete image from S3: {}", imageUrl, e);
                    // Continue with database deletion even if S3 deletion fails
                }
            }
            carImageRepository.delete(img);
            return ResponseEntity.ok(new ApiResponse(true, "Deleted"));
        } catch (Exception e) {
            log.error("Error deleting car image with id: {}", id, e);
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }
}
