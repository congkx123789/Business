package com.selfcar.service.logistics;

import com.selfcar.model.logistics.Logistics;
import com.selfcar.model.logistics.LogisticsTask;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface LogisticsService {
    // LogisticsTask methods
    LogisticsTask createTask(Long orderId, LogisticsTask.TaskType taskType, 
                            LocalDateTime scheduledDate, String pickupLocation, String deliveryLocation);
    
    LogisticsTask getTaskById(Long taskId);
    
    LogisticsTask getTaskByTaskNumber(String taskNumber);
    
    List<LogisticsTask> getTasksByOrder(Long orderId);
    
    LogisticsTask assignDriver(Long taskId, Long driverId);
    
    LogisticsTask startTask(Long taskId);
    
    LogisticsTask completeTask(Long taskId, String vehicleConditionNotes, String driverNotes, 
                               Integer actualDurationMinutes, BigDecimal distanceKm);
    
    LogisticsTask cancelTask(Long taskId, String reason);
    
    Page<LogisticsTask> getTasksByDriver(Long driverId, Pageable pageable);
    
    Page<LogisticsTask> getTasksByStatus(LogisticsTask.TaskStatus status, Pageable pageable);
    
    // Logistics methods (for Booking-based logistics)
    List<Logistics> getBookingLogistics(Long bookingId);
    
    Logistics createLogistics(Long bookingId, Logistics.LogisticsType type, 
                              LocalDateTime scheduledDateTime, String notes);
    
    Logistics assignInspector(Long logisticsId, String inspectorName, String inspectorContact);
    
    Logistics assignDriver(Long logisticsId, String driverName, String driverContact, String vehiclePlateNumber);
    
    Logistics updateLogisticsStatus(Long logisticsId, Logistics.LogisticsStatus status);
}
