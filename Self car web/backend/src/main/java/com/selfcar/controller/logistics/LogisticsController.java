package com.selfcar.controller.logistics;

import com.selfcar.model.logistics.LogisticsTask;
import com.selfcar.service.logistics.LogisticsTaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/logistics")
@RequiredArgsConstructor
public class LogisticsController {

    private final LogisticsTaskService logisticsService;

    @PostMapping("/task")
    public ResponseEntity<LogisticsTask> create(@RequestParam Long purchaseOrderId,
                                                @RequestParam LogisticsTask.TaskType type,
                                                @RequestParam String scheduledTime,
                                                @RequestParam(required = false) String assignedTo,
                                                @RequestParam(required = false) String phone,
                                                @RequestParam(required = false) String pickup,
                                                @RequestParam(required = false) String dropoff,
                                                @RequestParam(required = false) String notes) {
        return ResponseEntity.ok(
                logisticsService.createTask(purchaseOrderId, type, scheduledTime, assignedTo, phone, pickup, dropoff, notes)
        );
    }

    @PostMapping("/task/{id}/status")
    public ResponseEntity<LogisticsTask> updateStatus(@PathVariable Long id,
                                                      @RequestParam LogisticsTask.TaskStatus status,
                                                      @RequestParam(required = false) String notes) {
        return ResponseEntity.ok(logisticsService.updateStatus(id, status, notes));
    }

    @GetMapping("/order/{purchaseOrderId}/tasks")
    public ResponseEntity<List<LogisticsTask>> list(@PathVariable Long purchaseOrderId) {
        return ResponseEntity.ok(logisticsService.listTasksForOrder(purchaseOrderId));
    }
}


