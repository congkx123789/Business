package com.selfcar.service.order;

import com.selfcar.model.booking.Booking;
import com.selfcar.model.common.Notification;
import com.selfcar.model.order.OrderWorkflow;
import com.selfcar.repository.booking.BookingRepository;
import com.selfcar.repository.order.OrderWorkflowRepository;
import com.selfcar.service.common.NotificationService;
import com.selfcar.service.payment.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class OrderWorkflowService {

    private final OrderWorkflowRepository orderWorkflowRepository;
    private final BookingRepository bookingRepository;
    private final PaymentService paymentService;
    private final NotificationService notificationService;

    @Transactional
    public OrderWorkflow createWorkflow(Long bookingId) {
        Objects.requireNonNull(bookingId, "Booking ID cannot be null");
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        OrderWorkflow workflow = new OrderWorkflow();
        workflow.setBooking(booking);
        workflow.setCurrentStage(OrderWorkflow.WorkflowStage.BOOKED);
        workflow.setBookedAt(LocalDateTime.now());

        return orderWorkflowRepository.save(workflow);
    }

    @Transactional
    public OrderWorkflow scheduleInspection(Long bookingId, LocalDateTime scheduledDateTime) {
        OrderWorkflow workflow = getWorkflowByBooking(bookingId);
        workflow.setCurrentStage(OrderWorkflow.WorkflowStage.INSPECTION_SCHEDULED);
        workflow.setInspectionScheduledAt(scheduledDateTime);

        OrderWorkflow saved = orderWorkflowRepository.save(workflow);

        // Send notification
        notificationService.createNotification(
            workflow.getBooking().getUser().getId(),
            "Inspection Scheduled",
            "Vehicle inspection scheduled for " + scheduledDateTime,
            Notification.NotificationType.BOOKING_REMINDER,
            "booking",
            bookingId
        );

        return saved;
    }

    @Transactional
    public OrderWorkflow completeInspection(Long bookingId, OrderWorkflow.InspectionStatus status, String result) {
        OrderWorkflow workflow = getWorkflowByBooking(bookingId);
        workflow.setCurrentStage(OrderWorkflow.WorkflowStage.INSPECTION_COMPLETED);
        workflow.setInspectionStatus(status);
        workflow.setInspectionResult(result);
        workflow.setInspectionCompletedAt(LocalDateTime.now());

        OrderWorkflow saved = orderWorkflowRepository.save(workflow);

        if (status == OrderWorkflow.InspectionStatus.PASSED || 
            status == OrderWorkflow.InspectionStatus.CONDITIONAL) {
            // Move to payment pending
            saved = proceedToPayment(bookingId);
        } else {
            // Inspection failed - can cancel or reschedule
            workflow.setCurrentStage(OrderWorkflow.WorkflowStage.CANCELLED);
            workflow.setCancelledAt(LocalDateTime.now());
            saved = orderWorkflowRepository.save(workflow);
        }

        return saved;
    }

    @Transactional
    public OrderWorkflow proceedToPayment(Long bookingId) {
        OrderWorkflow workflow = getWorkflowByBooking(bookingId);
        workflow.setCurrentStage(OrderWorkflow.WorkflowStage.PAYMENT_PENDING);

        return orderWorkflowRepository.save(workflow);
    }

    @Transactional
    public OrderWorkflow completePayment(Long bookingId) {
        OrderWorkflow workflow = getWorkflowByBooking(bookingId);
        workflow.setCurrentStage(OrderWorkflow.WorkflowStage.PAYMENT_COMPLETED);
        workflow.setPaymentCompletedAt(LocalDateTime.now());

        OrderWorkflow saved = orderWorkflowRepository.save(workflow);

        // Release escrow to seller - use booking total price
        Booking booking = workflow.getBooking();
        if (booking.getTotalPrice() != null && booking.getTotalPrice().compareTo(java.math.BigDecimal.ZERO) > 0) {
            try {
                paymentService.releaseEscrow(bookingId, booking.getTotalPrice());
            } catch (Exception e) {
                // Log error but don't fail the workflow
                // The escrow can be released manually later if needed
            }
        }

        // Send notification
        notificationService.createNotification(
            booking.getCar().getShop().getOwner().getId(),
            "Payment Received",
            "Payment completed for booking #" + bookingId,
            Notification.NotificationType.PAYMENT_RECEIVED,
            "booking",
            bookingId
        );

        return saved;
    }

    @Transactional
    public OrderWorkflow scheduleDelivery(Long bookingId, LocalDateTime scheduledDateTime) {
        OrderWorkflow workflow = getWorkflowByBooking(bookingId);
        workflow.setCurrentStage(OrderWorkflow.WorkflowStage.DELIVERY_SCHEDULED);
        workflow.setDeliveryScheduledAt(scheduledDateTime);

        return orderWorkflowRepository.save(workflow);
    }

    @Transactional
    public OrderWorkflow completeDelivery(Long bookingId) {
        OrderWorkflow workflow = getWorkflowByBooking(bookingId);
        workflow.setCurrentStage(OrderWorkflow.WorkflowStage.COMPLETED);
        workflow.setDeliveryCompletedAt(LocalDateTime.now());

        OrderWorkflow saved = orderWorkflowRepository.save(workflow);

        // Release escrow to seller after delivery completion
        try {
            java.math.BigDecimal netAmount = paymentService.getCompletedDepositNetAmountForBooking(bookingId);
            if (netAmount != null && netAmount.compareTo(java.math.BigDecimal.ZERO) > 0) {
                paymentService.releaseEscrow(bookingId, netAmount);
            }
        } catch (Exception ignore) { }

        return saved;
    }

    @Transactional
    public OrderWorkflow cancelOrder(Long bookingId, String reason) {
        OrderWorkflow workflow = getWorkflowByBooking(bookingId);
        workflow.setCurrentStage(OrderWorkflow.WorkflowStage.CANCELLED);
        workflow.setCancelledAt(LocalDateTime.now());
        workflow.setCancellationReason(reason);

        return orderWorkflowRepository.save(workflow);
    }

    public OrderWorkflow getWorkflowByBooking(Long bookingId) {
        return orderWorkflowRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new RuntimeException("Workflow not found for booking"));
    }
}
