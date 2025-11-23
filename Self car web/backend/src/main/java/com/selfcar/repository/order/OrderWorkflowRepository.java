package com.selfcar.repository.order;

import com.selfcar.model.order.OrderWorkflow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderWorkflowRepository extends JpaRepository<OrderWorkflow, Long> {
    Optional<OrderWorkflow> findByBookingId(Long bookingId);
    
    List<OrderWorkflow> findByCurrentStage(OrderWorkflow.WorkflowStage stage);
}
