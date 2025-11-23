package com.selfcar.controller.car;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.selfcar.model.car.Car;
import com.selfcar.service.car.CarService;
import com.selfcar.service.common.OutboxService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class CarControllerTest {

    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private CarService carService;

    @Mock
    private OutboxService outboxService;

    @InjectMocks
    private CarController carController;

    @BeforeEach
    void setup() {
        mockMvc = MockMvcBuilders.standaloneSetup(carController).build();
    }

    private Car buildCar(long id) {
        Car car = new Car();
        car.setId(id);
        car.setName("Model S");
        car.setBrand("Tesla");
        car.setType(Car.CarType.SEDAN);
        car.setYear(2022);
        car.setPricePerDay(new BigDecimal("149.99"));
        car.setSeats(4);
        car.setTransmission(Car.Transmission.AUTOMATIC);
        car.setFuelType(Car.FuelType.PETROL);
        car.setAvailable(true);
        car.setVersion(1L);
        return car;
    }

    @Test
    @DisplayName("GET /api/cars returns list of cars")
    void getAllCars_success() throws Exception {
        Mockito.when(carService.getAllCars()).thenReturn(List.of(buildCar(1)));

        mockMvc.perform(get("/api/cars"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name", is("Model S")));
    }

    @Test
    @DisplayName("GET /api/cars/{id} returns car by id")
    void getCarById_success() throws Exception {
        Mockito.when(carService.getCarById(1L)).thenReturn(buildCar(1));

        mockMvc.perform(get("/api/cars/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.brand", is("Tesla")));
    }

    @Test
    @DisplayName("GET /api/cars/available returns available cars")
    void getAvailableCars_success() throws Exception {
        Mockito.when(carService.getAvailableCars()).thenReturn(List.of(buildCar(2)));

        mockMvc.perform(get("/api/cars/available"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].available", is(true)));
    }

    @Test
    @DisplayName("GET /api/cars/featured returns featured cars")
    void getFeaturedCars_success() throws Exception {
        Mockito.when(carService.getFeaturedCars()).thenReturn(List.of(buildCar(3)));

        mockMvc.perform(get("/api/cars/featured"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id", is(3)));
    }

    @Test
    @DisplayName("POST /api/cars creates a car when ADMIN")
    void createCar_success_admin() throws Exception {
        Car toCreate = buildCar(0);
        Car created = buildCar(10);
        Mockito.when(carService.createCar(any(Car.class))).thenReturn(created);

        mockMvc.perform(post("/api/cars")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(toCreate)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(10)));

        Mockito.verify(outboxService).enqueue(eq("LISTING"), eq(10L), eq("VIN_Listed"), any(), eq(1L));
    }

    @Test
    @DisplayName("PUT /api/cars/{id} updates a car when ADMIN")
    void updateCar_success_admin() throws Exception {
        Car update = buildCar(10);
        update.setPricePerDay(new BigDecimal("199.00"));
        Mockito.when(carService.updateCar(eq(10L), any(Car.class))).thenReturn(update);

        mockMvc.perform(put("/api/cars/10")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.pricePerDay", is(199.00)));

        Mockito.verify(outboxService).enqueue(eq("LISTING"), eq(10L), eq("Price_Updated"), any(), eq(1L));
    }

    @Test
    @DisplayName("DELETE /api/cars/{id} deletes a car when ADMIN")
    void deleteCar_success_admin() throws Exception {
        mockMvc.perform(delete("/api/cars/5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));

        Mockito.verify(carService).deleteCar(5L);
        Mockito.verify(outboxService).enqueue(eq("LISTING"), eq(5L), eq("VIN_Sold"), any(), eq(0L));
    }

    @Test
    @DisplayName("PATCH /api/cars/{id}/toggle-availability toggles availability and enqueues event")
    void toggleAvailability_success_admin() throws Exception {
        Car updated = buildCar(7);
        updated.setAvailable(false);
        Mockito.when(carService.toggleAvailability(7L)).thenReturn(updated);

        mockMvc.perform(patch("/api/cars/7/toggle-availability"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.available", is(false)));

        Mockito.verify(outboxService).enqueue(eq("LISTING"), eq(7L), eq("VIN_Sold"), any(), eq(1L));
    }
}


