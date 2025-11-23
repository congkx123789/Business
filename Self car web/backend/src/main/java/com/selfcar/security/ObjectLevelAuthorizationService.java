package com.selfcar.security;

import com.selfcar.model.booking.Booking;
import com.selfcar.model.order.Order;
import com.selfcar.model.payment.PaymentTransaction;
import com.selfcar.repository.booking.BookingRepository;
import com.selfcar.repository.order.OrderRepository;
import com.selfcar.repository.payment.PaymentTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

/**
 * Object-Level Authorization Service
 * 
 * Prevents Broken Object Level Authorization (BOLA) attacks by verifying
 * that users can only access resources they own or are authorized to access.
 * 
 * NEVER trust resource IDs from URL parameters - always derive ownership
 * from the authenticated user's token subject.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ObjectLevelAuthorizationService {

    private final BookingRepository bookingRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final OrderRepository orderRepository;
    private final SecurityEventLogger securityEventLogger;
    private final AuditLogger auditLogger;

    /**
     * Verifies that a booking belongs to the specified user
     * Throws AccessDeniedException if not authorized
     * 
     * @param bookingId The booking ID from the request
     * @param userId The authenticated user's ID from the JWT token
     * @return The booking if authorized
     * @throws AccessDeniedException if user doesn't own the booking
     */
    public Booking verifyBookingOwnership(Long bookingId, Long userId) {
        if (bookingId == null || userId == null) {
            throw new AccessDeniedException("Invalid booking ID or user ID");
        }

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new AccessDeniedException("Booking not found"));

        // Check if user owns the booking (customer) or is admin
        if (!booking.getUser().getId().equals(userId)) {
            securityEventLogger.logUnauthorizedAccess("BOOKING", bookingId, userId, 
                    "User does not own booking");
            auditLogger.logPaymentEvent("BOLA_DENY", String.valueOf(bookingId), userId, "N/A",
                    java.util.Map.of("resource", "BOOKING"));
            throw new AccessDeniedException("You do not have permission to access this booking");
        }

        auditLogger.logPaymentEvent("BOLA_ALLOW", String.valueOf(bookingId), userId, "N/A",
                java.util.Map.of("resource", "BOOKING"));
        return booking;
    }

    /**
     * Verifies that a booking can be accessed by the user (owner or admin)
     * More permissive than verifyBookingOwnership - allows sellers to see bookings for their cars
     * 
     * @param bookingId The booking ID from the request
     * @param userId The authenticated user's ID from the JWT token
     * @param userRole The authenticated user's role
     * @return The booking if authorized
     * @throws AccessDeniedException if user doesn't have access
     */
    public Booking verifyBookingAccess(Long bookingId, Long userId, String userRole) {
        if (bookingId == null || userId == null) {
            throw new AccessDeniedException("Invalid booking ID or user ID");
        }

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new AccessDeniedException("Booking not found"));

        // Admin can access any booking
        if ("ADMIN".equals(userRole)) {
            return booking;
        }

        // Customer can access their own bookings
        if (booking.getUser().getId().equals(userId)) {
            return booking;
        }

        // Seller can access bookings for their cars
        if ("SELLER".equals(userRole) && booking.getCar() != null 
                && booking.getCar().getShop() != null
                && booking.getCar().getShop().getOwner() != null
                && booking.getCar().getShop().getOwner().getId().equals(userId)) {
            return booking;
        }

        securityEventLogger.logUnauthorizedAccess("BOOKING", bookingId, userId, 
                "User role " + userRole + " does not have access");
        auditLogger.logPaymentEvent("BOLA_DENY", String.valueOf(bookingId), userId, "N/A",
                java.util.Map.of("resource", "BOOKING", "role", userRole));
        throw new AccessDeniedException("You do not have permission to access this booking");
    }

    /**
     * Verifies that a payment transaction belongs to the specified user
     * 
     * @param transactionId The transaction ID from the request
     * @param userId The authenticated user's ID from the JWT token
     * @return The transaction if authorized
     * @throws AccessDeniedException if user doesn't own the transaction
     */
    public PaymentTransaction verifyTransactionOwnership(Long transactionId, Long userId) {
        if (transactionId == null || userId == null) {
            throw new AccessDeniedException("Invalid transaction ID or user ID");
        }

        PaymentTransaction transaction = paymentTransactionRepository.findById(transactionId)
                .orElseThrow(() -> new AccessDeniedException("Transaction not found"));

        // Check if user owns the transaction (via booking or wallet)
        boolean isOwner = false;
        
        if (transaction.getBooking() != null && transaction.getBooking().getUser() != null) {
            isOwner = transaction.getBooking().getUser().getId().equals(userId);
        }
        
        if (!isOwner && transaction.getWallet() != null && transaction.getWallet().getUser() != null) {
            isOwner = transaction.getWallet().getUser().getId().equals(userId);
        }

        if (!isOwner) {
            securityEventLogger.logUnauthorizedAccess("PAYMENT_TRANSACTION", transactionId, userId, 
                    "User does not own transaction");
            auditLogger.logPaymentEvent("BOLA_DENY", String.valueOf(transactionId), userId, "N/A",
                    java.util.Map.of("resource", "PAYMENT_TRANSACTION"));
            throw new AccessDeniedException("You do not have permission to access this transaction");
        }

        auditLogger.logPaymentEvent("BOLA_ALLOW", String.valueOf(transactionId), userId, "N/A",
                java.util.Map.of("resource", "PAYMENT_TRANSACTION"));
        return transaction;
    }

    /**
     * Verifies that a payment transaction can be accessed by the user
     * 
     * @param transactionIdString The transaction ID string from the request
     * @param userId The authenticated user's ID from the JWT token
     * @return The transaction if authorized
     * @throws AccessDeniedException if user doesn't have access
     */
    public PaymentTransaction verifyTransactionAccess(String transactionIdString, Long userId) {
        if (transactionIdString == null || userId == null) {
            throw new AccessDeniedException("Invalid transaction ID or user ID");
        }

        PaymentTransaction transaction = paymentTransactionRepository
                .findByTransactionId(transactionIdString)
                .orElseThrow(() -> new AccessDeniedException("Transaction not found"));

        // Check ownership
        boolean isOwner = false;
        
        if (transaction.getBooking() != null && transaction.getBooking().getUser() != null) {
            isOwner = transaction.getBooking().getUser().getId().equals(userId);
        }
        
        if (!isOwner && transaction.getWallet() != null && transaction.getWallet().getUser() != null) {
            isOwner = transaction.getWallet().getUser().getId().equals(userId);
        }

        if (!isOwner) {
            securityEventLogger.logUnauthorizedAccess("PAYMENT_TRANSACTION", null, userId, 
                    "User does not own transaction: " + transactionIdString);
            auditLogger.logPaymentEvent("BOLA_DENY", transactionIdString, userId, "N/A",
                    java.util.Map.of("resource", "PAYMENT_TRANSACTION"));
            throw new AccessDeniedException("You do not have permission to access this transaction");
        }

        auditLogger.logPaymentEvent("BOLA_ALLOW", transactionIdString, userId, "N/A",
                java.util.Map.of("resource", "PAYMENT_TRANSACTION"));
        return transaction;
    }

    /**
     * Verifies that a booking's transactions can be accessed by the user
     * 
     * @param bookingId The booking ID from the request
     * @param userId The authenticated user's ID from the JWT token
     * @throws AccessDeniedException if user doesn't have access to the booking
     */
    public void verifyBookingTransactionsAccess(Long bookingId, Long userId) {
        // First verify the user can access the booking
        verifyBookingAccess(bookingId, userId, "CUSTOMER"); // Will throw if not authorized
    }

    /**
     * Verifies that an order belongs to the specified user (buyer or seller)
     * 
     * @param orderId The order ID from the request
     * @param userId The authenticated user's ID from the JWT token
     * @param userRole The authenticated user's role
     * @return The order if authorized
     * @throws AccessDeniedException if user doesn't have access
     */
    public com.selfcar.model.order.Order verifyOrderAccess(Long orderId, Long userId, String userRole) {
        if (orderId == null || userId == null) {
            throw new AccessDeniedException("Invalid order ID or user ID");
        }

        com.selfcar.model.order.Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AccessDeniedException("Order not found"));

        // Admin can access any order
        if ("ADMIN".equals(userRole)) {
            return order;
        }

        // Buyer can access their own orders
        if (order.getBuyer() != null && order.getBuyer().getId().equals(userId)) {
            return order;
        }

        // Seller can access orders for their cars
        if ("SELLER".equals(userRole) && order.getSeller() != null && order.getSeller().getId().equals(userId)) {
            return order;
        }

        securityEventLogger.logUnauthorizedAccess("ORDER", orderId, userId, 
                "User role " + userRole + " does not have access");
        auditLogger.logPaymentEvent("BOLA_DENY", String.valueOf(orderId), userId, "N/A",
                java.util.Map.of("resource", "ORDER", "role", userRole));
        throw new AccessDeniedException("You do not have permission to access this order");
    }
}

