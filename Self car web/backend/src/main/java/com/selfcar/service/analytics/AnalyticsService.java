package com.selfcar.service.analytics;

import java.time.LocalDate;
import java.util.Map;

public interface AnalyticsService {
    Map<String, Object> revenueByDealer(LocalDate from, LocalDate to);
    Map<String, Object> revenueByCategory(LocalDate from, LocalDate to);
    Map<String, Object> revenueByLocation(LocalDate from, LocalDate to);
    Map<String, Object> balanceOverview();
}

