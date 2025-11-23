package com.selfcar.service.logistics;

import com.selfcar.model.booking.Booking;
import com.selfcar.model.logistics.Logistics;
import com.selfcar.model.logistics.LogisticsTask;
import com.selfcar.model.order.Order;
import com.selfcar.repository.booking.BookingRepository;
import com.selfcar.repository.logistics.LogisticsRepository;
import com.selfcar.repository.logistics.LogisticsTaskRepository;
import com.selfcar.repository.order.OrderRepository;
import lombok.RequiredArgsConstructor;
import com.selfcar.security.AuditLogger;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class LogisticsServiceImpl implements LogisticsService, LogisticsTaskService {

    private final LogisticsTaskRepository logisticsTaskRepository;
    private final LogisticsRepository logisticsRepository;
    private final OrderRepository orderRepository;
    private final BookingRepository bookingRepository;
    private final AuditLogger auditLogger;

    @Override
    @Transactional
    public LogisticsTask createTask(Long purchaseOrderId, LogisticsTask.TaskType type, String scheduledTime,
                                    String assignedTo, String phone, String pickup, String dropoff, String notes) {
        Objects.requireNonNull(purchaseOrderId, "purchaseOrderId is required");
        Objects.requireNonNull(type, "type is required");
        Order order = orderRepository.findById(Objects.requireNonNull(purchaseOrderId))
                .orElseThrow(() -> new RuntimeException("Order not found"));

        LogisticsTask task = new LogisticsTask();
        task.setOrder(order);
        task.setTaskType(type);
        task.setStatus(LogisticsTask.TaskStatus.PENDING);
        task.setCustomerContactName(assignedTo);
        task.setCustomerContactPhone(phone);
        task.setPickupLocation(pickup);
        task.setDeliveryLocation(dropoff);
        if (scheduledTime != null && !scheduledTime.isEmpty()) {
            try {
                LocalDateTime scheduledDate = LocalDateTime.parse(scheduledTime, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
                task.setScheduledDate(scheduledDate);
            } catch (Exception e) {
                // If parsing fails, leave scheduledDate as null
            }
        }
        task.setDriverNotes(notes);

        return logisticsTaskRepository.save(task);
    }

    @Override
    @Transactional
    public LogisticsTask updateStatus(Long taskId, LogisticsTask.TaskStatus status, String notes) {
        Objects.requireNonNull(taskId, "taskId is required");
        Objects.requireNonNull(status, "status is required");
        LogisticsTask task = logisticsTaskRepository.findById(Objects.requireNonNull(taskId))
                .orElseThrow(() -> new RuntimeException("Logistics task not found"));
        task.setStatus(status);
        if (notes != null) {
            task.setDriverNotes(notes);
        }
        return logisticsTaskRepository.save(task);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LogisticsTask> listTasksForOrder(Long purchaseOrderId) {
        Objects.requireNonNull(purchaseOrderId, "purchaseOrderId is required");
        Order order = orderRepository.findById(Objects.requireNonNull(purchaseOrderId))
                .orElseThrow(() -> new RuntimeException("Order not found"));
        return logisticsTaskRepository.findByOrderIdOrderByCreatedAtAsc(order.getId());
    }

    // Additional LogisticsService methods (LogisticsTask operations)
    @Override
    @Transactional
    public LogisticsTask createTask(Long orderId, LogisticsTask.TaskType taskType, 
                                    LocalDateTime scheduledDate, String pickupLocation, String deliveryLocation) {
        Objects.requireNonNull(orderId, "orderId is required");
        Objects.requireNonNull(taskType, "taskType is required");
        
        Order order = orderRepository.findById(Objects.requireNonNull(orderId))
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        LogisticsTask task = new LogisticsTask();
        task.setOrder(order);
        task.setTaskType(taskType);
        task.setStatus(LogisticsTask.TaskStatus.PENDING);
        task.setPickupLocation(pickupLocation);
        task.setDeliveryLocation(deliveryLocation);
        task.setScheduledDate(scheduledDate);
        
        return logisticsTaskRepository.save(task);
    }

    @Override
    @Transactional(readOnly = true)
    public LogisticsTask getTaskById(Long taskId) {
        Objects.requireNonNull(taskId, "taskId is required");
        return logisticsTaskRepository.findById(Objects.requireNonNull(taskId))
                .orElseThrow(() -> new RuntimeException("Logistics task not found"));
    }

    @Override
    @Transactional(readOnly = true)
    public LogisticsTask getTaskByTaskNumber(String taskNumber) {
        Objects.requireNonNull(taskNumber, "taskNumber is required");
        return logisticsTaskRepository.findByTaskNumber(taskNumber)
                .orElseThrow(() -> new RuntimeException("Logistics task not found"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<LogisticsTask> getTasksByOrder(Long orderId) {
        Objects.requireNonNull(orderId, "orderId is required");
        return logisticsTaskRepository.findByOrderIdOrderByCreatedAtAsc(orderId);
    }

    @Override
    @Transactional
    public LogisticsTask assignDriver(Long taskId, Long driverId) {
        Objects.requireNonNull(taskId, "taskId is required");
        Objects.requireNonNull(driverId, "driverId is required");
        
        LogisticsTask task = getTaskById(taskId);
        // Note: This would require a User lookup for driver
        // For now, setting status to ASSIGNED
        task.setStatus(LogisticsTask.TaskStatus.ASSIGNED);
        
        return logisticsTaskRepository.save(task);
    }

    @Override
    @Transactional
    public LogisticsTask startTask(Long taskId) {
        Objects.requireNonNull(taskId, "taskId is required");
        
        LogisticsTask task = getTaskById(taskId);
        if (!task.canTransitionTo(LogisticsTask.TaskStatus.IN_PROGRESS)) {
            throw new IllegalStateException("Cannot start task from current status: " + task.getStatus());
        }
        
        task.setStatus(LogisticsTask.TaskStatus.IN_PROGRESS);
        task.setActualStartDate(LocalDateTime.now());
        auditLogger.logDomainEvent("LOGISTICS", "TASK_STARTED", java.util.Map.of(
                "taskId", taskId,
                "newStatus", task.getStatus().name()
        ));
        
        return logisticsTaskRepository.save(task);
    }

    @Override
    @Transactional
    public LogisticsTask completeTask(Long taskId, String vehicleConditionNotes, String driverNotes, 
                                     Integer actualDurationMinutes, BigDecimal distanceKm) {
        Objects.requireNonNull(taskId, "taskId is required");
        
        LogisticsTask task = getTaskById(taskId);
        if (!task.canTransitionTo(LogisticsTask.TaskStatus.COMPLETED)) {
            throw new IllegalStateException("Cannot complete task from current status: " + task.getStatus());
        }
        
        task.setStatus(LogisticsTask.TaskStatus.COMPLETED);
        task.setVehicleConditionNotes(vehicleConditionNotes);
        task.setDriverNotes(driverNotes);
        task.setActualDurationMinutes(actualDurationMinutes);
        task.setDistanceKm(distanceKm);
        task.setActualCompletionDate(LocalDateTime.now());
        auditLogger.logDomainEvent("LOGISTICS", "TASK_COMPLETED", java.util.Map.of(
                "taskId", taskId,
                "newStatus", task.getStatus().name()
        ));
        
        return logisticsTaskRepository.save(task);
    }

    @Override
    @Transactional
    public LogisticsTask cancelTask(Long taskId, String reason) {
        Objects.requireNonNull(taskId, "taskId is required");
        
        LogisticsTask task = getTaskById(taskId);
        if (!task.canTransitionTo(LogisticsTask.TaskStatus.CANCELLED)) {
            throw new IllegalStateException("Cannot cancel task from current status: " + task.getStatus());
        }
        
        task.setStatus(LogisticsTask.TaskStatus.CANCELLED);
        task.setDriverNotes(reason);
        task.setReasonCode(reason);
        auditLogger.logDomainEvent("LOGISTICS", "TASK_CANCELLED", java.util.Map.of(
                "taskId", taskId,
                "reason", reason
        ));
        
        return logisticsTaskRepository.save(task);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<LogisticsTask> getTasksByDriver(Long driverId, Pageable pageable) {
        Objects.requireNonNull(driverId, "driverId is required");
        return logisticsTaskRepository.findByAssignedDriverIdAndStatus(driverId, LogisticsTask.TaskStatus.ASSIGNED, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<LogisticsTask> getTasksByStatus(LogisticsTask.TaskStatus status, Pageable pageable) {
        Objects.requireNonNull(status, "status is required");
        return logisticsTaskRepository.findByStatus(status, pageable);
    }

    // Logistics methods (for Booking-based logistics)
    @Override
    @Transactional(readOnly = true)
    public List<Logistics> getBookingLogistics(Long bookingId) {
        Objects.requireNonNull(bookingId, "bookingId is required");
        return logisticsRepository.findByBookingId(bookingId);
    }

    @Override
    @Transactional
    public Logistics createLogistics(Long bookingId, Logistics.LogisticsType type, 
                                    LocalDateTime scheduledDateTime, String notes) {
        Objects.requireNonNull(bookingId, "bookingId is required");
        Objects.requireNonNull(type, "type is required");
        
        Booking booking = bookingRepository.findById(Objects.requireNonNull(bookingId))
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        Logistics logistics = new Logistics();
        logistics.setBooking(booking);
        logistics.setType(type);
        logistics.setStatus(Logistics.LogisticsStatus.PENDING);
        logistics.setScheduledDateTime(scheduledDateTime);
        logistics.setNotes(notes);
        
        return logisticsRepository.save(logistics);
    }

    @Override
    @Transactional
    public Logistics assignInspector(Long logisticsId, String inspectorName, String inspectorContact) {
        Objects.requireNonNull(logisticsId, "logisticsId is required");
        Objects.requireNonNull(inspectorName, "inspectorName is required");
        
        Logistics logistics = logisticsRepository.findById(Objects.requireNonNull(logisticsId))
                .orElseThrow(() -> new RuntimeException("Logistics not found"));
        
        logistics.setInspectorName(inspectorName);
        logistics.setInspectorContact(inspectorContact);
        logistics.setStatus(Logistics.LogisticsStatus.SCHEDULED);
        
        return logisticsRepository.save(logistics);
    }

    @Override
    @Transactional
    public Logistics assignDriver(Long logisticsId, String driverName, String driverContact, String vehiclePlateNumber) {
        Objects.requireNonNull(logisticsId, "logisticsId is required");
        Objects.requireNonNull(driverName, "driverName is required");
        
        Logistics logistics = logisticsRepository.findById(Objects.requireNonNull(logisticsId))
                .orElseThrow(() -> new RuntimeException("Logistics not found"));
        
        logistics.setDriverName(driverName);
        logistics.setDriverContact(driverContact);
        logistics.setVehiclePlateNumber(vehiclePlateNumber);
        logistics.setStatus(Logistics.LogisticsStatus.SCHEDULED);
        
        return logisticsRepository.save(logistics);
    }

    @Override
    @Transactional
    public Logistics updateLogisticsStatus(Long logisticsId, Logistics.LogisticsStatus status) {
        Objects.requireNonNull(logisticsId, "logisticsId is required");
        Objects.requireNonNull(status, "status is required");
        
        Logistics logistics = logisticsRepository.findById(Objects.requireNonNull(logisticsId))
                .orElseThrow(() -> new RuntimeException("Logistics not found"));
        
        logistics.setStatus(status);
        if (status == Logistics.LogisticsStatus.COMPLETED) {
            logistics.setCompletedAt(LocalDateTime.now());
        }
        auditLogger.logDomainEvent("LOGISTICS", "LOGISTICS_STATUS_CHANGED", java.util.Map.of(
                "logisticsId", logisticsId,
                "newStatus", status.name()
        ));
        
        return logisticsRepository.save(logistics);
    }
}


