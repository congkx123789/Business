package com.selfcar.controller.analytics;

import com.selfcar.service.analytics.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final AnalyticsService analyticsService;

    @GetMapping("/revenue/dealer")
    public ResponseEntity<Map<String, Object>> revenueByDealer(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
                                                               @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(analyticsService.revenueByDealer(from, to));
    }

    @GetMapping("/revenue/category")
    public ResponseEntity<Map<String, Object>> revenueByCategory(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
                                                                 @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(analyticsService.revenueByCategory(from, to));
    }

    @GetMapping("/revenue/location")
    public ResponseEntity<Map<String, Object>> revenueByLocation(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
                                                                 @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(analyticsService.revenueByLocation(from, to));
    }

    @GetMapping("/balance-overview")
    public ResponseEntity<Map<String, Object>> balanceOverview() {
        return ResponseEntity.ok(analyticsService.balanceOverview());
    }
}

