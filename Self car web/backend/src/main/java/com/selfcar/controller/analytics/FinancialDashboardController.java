package com.selfcar.controller.analytics;

import com.selfcar.dto.common.ApiResponse;
import com.selfcar.dto.analytics.FinancialDashboardDTO;
import com.selfcar.model.analytics.FinancialReport;
import com.selfcar.model.auth.User;
import com.selfcar.security.UserPrincipal;
import com.selfcar.service.analytics.FinancialDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/financial")
@RequiredArgsConstructor
public class FinancialDashboardController {

    private final FinancialDashboardService financialDashboardService;

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard(
            @RequestParam(required = false) Long shopId,
            @RequestParam(required = false) Long dealerId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) FinancialReport.ReportPeriod period,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            // For dealers, filter by their own data
            if (userPrincipal != null && userPrincipal.getUser() != null 
                    && userPrincipal.getUser().getRole() == User.Role.SELLER) {
                dealerId = userPrincipal.getUser().getId();
            }

            FinancialDashboardDTO dashboard = financialDashboardService.getDashboardData(
                    shopId, dealerId, startDate, endDate, period);
            return ResponseEntity.ok(dashboard);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/reports/generate")
    public ResponseEntity<?> generateReport(
            @RequestParam(required = false) Long shopId,
            @RequestParam(required = false) Long dealerId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate reportDate,
            @RequestParam FinancialReport.ReportPeriod period,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            // For dealers, filter by their own data
            if (userPrincipal != null && userPrincipal.getUser() != null 
                    && userPrincipal.getUser().getRole() == User.Role.SELLER) {
                dealerId = userPrincipal.getUser().getId();
            }

            FinancialReport report = financialDashboardService.generateReport(
                    shopId, dealerId, reportDate, period);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
}
