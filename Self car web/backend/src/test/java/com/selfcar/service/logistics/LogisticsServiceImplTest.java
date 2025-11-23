package com.selfcar.service.logistics;

import com.selfcar.model.logistics.LogisticsTask;
import com.selfcar.repository.booking.BookingRepository;
import com.selfcar.repository.logistics.LogisticsRepository;
import com.selfcar.repository.logistics.LogisticsTaskRepository;
import com.selfcar.repository.order.OrderRepository;
import com.selfcar.security.AuditLogger;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class LogisticsServiceImplTest {

    @Mock LogisticsTaskRepository logisticsTaskRepository;
    @Mock LogisticsRepository logisticsRepository;
    @Mock OrderRepository orderRepository;
    @Mock BookingRepository bookingRepository;
    @Mock AuditLogger auditLogger;

    @InjectMocks LogisticsServiceImpl logisticsService;

    @Test
    void startTask_validTransition_setsInProgress() {
        LogisticsTask task = new LogisticsTask();
        task.setId(1L);
        task.setStatus(LogisticsTask.TaskStatus.ASSIGNED);
        when(logisticsTaskRepository.findById(1L)).thenReturn(Optional.of(task));
        when(logisticsTaskRepository.save(any(LogisticsTask.class))).thenAnswer(inv -> inv.getArgument(0));

        LogisticsTask updated = logisticsService.startTask(1L);
        assertEquals(LogisticsTask.TaskStatus.IN_PROGRESS, updated.getStatus());
        verify(auditLogger).logDomainEvent(eq("LOGISTICS"), anyString(), any());
    }

    @Test
    void startTask_invalidTransition_throws() {
        LogisticsTask task = new LogisticsTask();
        task.setId(1L);
        task.setStatus(LogisticsTask.TaskStatus.PENDING);
        when(logisticsTaskRepository.findById(1L)).thenReturn(Optional.of(task));

        assertThrows(IllegalStateException.class, () -> logisticsService.startTask(1L));
    }

    @Test
    void cancelTask_setsCancelled_andReasonCode() {
        LogisticsTask task = new LogisticsTask();
        task.setId(1L);
        task.setStatus(LogisticsTask.TaskStatus.ASSIGNED);
        when(logisticsTaskRepository.findById(1L)).thenReturn(Optional.of(task));
        when(logisticsTaskRepository.save(any(LogisticsTask.class))).thenAnswer(inv -> inv.getArgument(0));

        LogisticsTask updated = logisticsService.cancelTask(1L, "CUSTOMER_NO_SHOW");
        assertEquals(LogisticsTask.TaskStatus.CANCELLED, updated.getStatus());
        assertEquals("CUSTOMER_NO_SHOW", updated.getReasonCode());
        verify(auditLogger).logDomainEvent(eq("LOGISTICS"), anyString(), any());
    }
}


