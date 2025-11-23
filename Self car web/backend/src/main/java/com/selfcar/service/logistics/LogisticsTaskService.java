package com.selfcar.service.logistics;

import com.selfcar.model.logistics.LogisticsTask;

import java.util.List;

public interface LogisticsTaskService {
    LogisticsTask createTask(Long purchaseOrderId, LogisticsTask.TaskType type, String scheduledTime,
                              String assignedTo, String phone, String pickup, String dropoff, String notes);

    LogisticsTask updateStatus(Long taskId, LogisticsTask.TaskStatus status, String notes);

    List<LogisticsTask> listTasksForOrder(Long purchaseOrderId);
}


