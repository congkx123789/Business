package com.selfcar.dto.booking;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class BookingRequest {
    @NotNull(message = "Car ID is required")
    private Long carId;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    @NotNull(message = "Pickup location is required")
    private String pickupLocation;

    @NotNull(message = "Dropoff location is required")
    private String dropoffLocation;

    @NotNull(message = "Total price is required")
    private BigDecimal totalPrice;
}

