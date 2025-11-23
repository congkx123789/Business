package com.selfcar.repository.logistics;

import com.selfcar.model.logistics.LogisticsTask;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface LogisticsTaskRepository extends JpaRepository<LogisticsTask, Long> {
    Optional<LogisticsTask> findByTaskNumber(String taskNumber);

    List<LogisticsTask> findByOrderIdOrderByCreatedAtAsc(Long orderId);

    List<LogisticsTask> findByOrderIdAndTaskType(Long orderId, LogisticsTask.TaskType taskType);

    List<LogisticsTask> findByAssignedDriverIdAndStatus(Long driverId, LogisticsTask.TaskStatus status);

    Page<LogisticsTask> findByAssignedDriverIdAndStatus(Long driverId, LogisticsTask.TaskStatus status, Pageable pageable);

    Page<LogisticsTask> findByStatus(LogisticsTask.TaskStatus status, Pageable pageable);

    @Query("SELECT lt FROM LogisticsTask lt WHERE lt.assignedDriver.id = :driverId AND lt.status IN :statuses AND lt.scheduledDate >= :startDate")
    List<LogisticsTask> findByDriverAndStatusesSince(@Param("driverId") Long driverId,
                                                      @Param("statuses") List<LogisticsTask.TaskStatus> statuses,
                                                      @Param("startDate") LocalDateTime startDate);

    @Query("SELECT lt FROM LogisticsTask lt WHERE lt.order.id = :orderId AND lt.taskType = :taskType AND lt.status != 'CANCELLED'")
    Optional<LogisticsTask> findActiveTaskByOrderAndType(@Param("orderId") Long orderId,
                                                          @Param("taskType") LogisticsTask.TaskType taskType);
}


