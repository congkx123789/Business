package com.selfcar.controller.order;

import com.selfcar.dto.common.ApiResponse;
import com.selfcar.model.logistics.Logistics;
import com.selfcar.model.order.OrderWorkflow;
import com.selfcar.service.logistics.LogisticsService;
import com.selfcar.service.order.OrderWorkflowService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Optional;

@RestController
@RequestMapping("/api/order-workflow")
@RequiredArgsConstructor
public class OrderWorkflowController {

    private final OrderWorkflowService orderWorkflowService;
    private final LogisticsService logisticsService;

    @PostMapping("/booking/{bookingId}/create")
    public ResponseEntity<?> createWorkflow(@PathVariable Long bookingId) {
        try {
            OrderWorkflow workflow = orderWorkflowService.createWorkflow(bookingId);
            return ResponseEntity.ok(workflow);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/booking/{bookingId}/schedule-inspection")
    public ResponseEntity<?> scheduleInspection(
            @PathVariable Long bookingId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime scheduledDateTime) {
        try {
            OrderWorkflow workflow = orderWorkflowService.scheduleInspection(bookingId, scheduledDateTime);
            
            // Create logistics record for inspection
            logisticsService.createLogistics(
                    bookingId,
                    Logistics.LogisticsType.INSPECTION,
                    scheduledDateTime,
                    null
            );
            
            return ResponseEntity.ok(workflow);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/booking/{bookingId}/complete-inspection")
    public ResponseEntity<?> completeInspection(
            @PathVariable Long bookingId,
            @RequestParam OrderWorkflow.InspectionStatus status,
            @RequestParam(required = false) String result) {
        try {
            OrderWorkflow workflow = orderWorkflowService.completeInspection(bookingId, status, result);
            return ResponseEntity.ok(workflow);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/booking/{bookingId}/assign-inspector")
    public ResponseEntity<?> assignInspector(
            @PathVariable Long bookingId,
            @RequestParam String inspectorName,
            @RequestParam String inspectorContact) {
        try {
            // Find inspection logistics
            var logisticsList = logisticsService.getBookingLogistics(bookingId);
            var inspectionLogistics = logisticsList.stream()
                    .filter(l -> l.getType() == Logistics.LogisticsType.INSPECTION)
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Inspection logistics not found"));
            
            Logistics updated = logisticsService.assignInspector(
                    inspectionLogistics.getId(),
                    inspectorName,
                    inspectorContact
            );
            
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/booking/{bookingId}/complete-payment")
    public ResponseEntity<?> completePayment(@PathVariable Long bookingId) {
        try {
            OrderWorkflow workflow = orderWorkflowService.completePayment(bookingId);
            return ResponseEntity.ok(workflow);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/booking/{bookingId}/schedule-delivery")
    public ResponseEntity<?> scheduleDelivery(
            @PathVariable Long bookingId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime scheduledDateTime) {
        try {
            OrderWorkflow workflow = orderWorkflowService.scheduleDelivery(bookingId, scheduledDateTime);
            
            // Create logistics record for delivery
            logisticsService.createLogistics(
                    bookingId,
                    Logistics.LogisticsType.DELIVERY,
                    scheduledDateTime,
                    null
            );
            
            return ResponseEntity.ok(workflow);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/booking/{bookingId}/assign-driver")
    public ResponseEntity<?> assignDriver(
            @PathVariable Long bookingId,
            @RequestParam String driverName,
            @RequestParam String driverContact,
            @RequestParam String vehiclePlateNumber) {
        try {
            // Find delivery logistics
            var logisticsList = logisticsService.getBookingLogistics(bookingId);
            var deliveryLogistics = logisticsList.stream()
                    .filter(l -> l.getType() == Logistics.LogisticsType.DELIVERY)
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Delivery logistics not found"));
            
            Logistics updated = logisticsService.assignDriver(
                    deliveryLogistics.getId(),
                    driverName,
                    driverContact,
                    vehiclePlateNumber
            );
            
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/booking/{bookingId}/complete-delivery")
    public ResponseEntity<?> completeDelivery(@PathVariable Long bookingId) {
        try {
            OrderWorkflow workflow = orderWorkflowService.completeDelivery(bookingId);
            
            // Update delivery logistics status
            var logisticsList = logisticsService.getBookingLogistics(bookingId);
            Optional<Logistics> deliveryLogistics = logisticsList.stream()
                    .filter(l -> l.getType() == Logistics.LogisticsType.DELIVERY)
                    .findFirst();
            
            if (deliveryLogistics.isPresent()) {
                logisticsService.updateLogisticsStatus(
                        deliveryLogistics.get().getId(),
                        Logistics.LogisticsStatus.COMPLETED
                );
            }
            
            return ResponseEntity.ok(workflow);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/booking/{bookingId}/cancel")
    public ResponseEntity<?> cancelOrder(
            @PathVariable Long bookingId,
            @RequestParam String reason) {
        try {
            OrderWorkflow workflow = orderWorkflowService.cancelOrder(bookingId, reason);
            return ResponseEntity.ok(workflow);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<?> getWorkflow(@PathVariable Long bookingId) {
        try {
            OrderWorkflow workflow = orderWorkflowService.getWorkflowByBooking(bookingId);
            return ResponseEntity.ok(workflow);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
}
