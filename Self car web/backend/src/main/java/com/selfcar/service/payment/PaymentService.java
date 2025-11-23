package com.selfcar.service.payment;

import com.selfcar.model.booking.Booking;
import com.selfcar.model.common.Notification;
import com.selfcar.model.payment.PaymentTransaction;
import com.selfcar.model.payment.Wallet;
import com.selfcar.model.auth.User;
import com.selfcar.repository.auth.UserRepository;
import com.selfcar.repository.booking.BookingRepository;
import com.selfcar.repository.payment.PaymentTransactionRepository;
import com.selfcar.repository.payment.WalletRepository;
import com.selfcar.service.common.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import jakarta.persistence.EntityNotFoundException;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentTransactionRepository paymentTransactionRepository;
    private final WalletRepository walletRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final WalletService walletService;
    private final MomoGatewayService momoGatewayService;
    private final ZaloPayGatewayService zaloPayGatewayService;
    private final StripeConnectGatewayService stripeConnectGatewayService;

    @Value("${payment.platform-fee-percentage:2.5}")
    private BigDecimal platformFeePercentage;

    @Value("${payment.base-url:https://selfcar.com}")
    private String baseUrl;

    @Transactional
    public PaymentTransaction createDeposit(Long bookingId, BigDecimal amount, 
                                           PaymentTransaction.PaymentGateway gateway, Long userId,
                                           String returnUrl) {
        Objects.requireNonNull(bookingId, "Booking ID is required");
        Objects.requireNonNull(amount, "Amount is required");

        Booking booking = bookingRepository.findById(Objects.requireNonNull(bookingId))
                .orElseThrow(() -> {
                    log.warn("Booking not found with ID: {}", bookingId);
                    return new EntityNotFoundException("Booking not found");
                });
        User user = userRepository.findById(Objects.requireNonNull(userId))
                .orElseThrow(() -> {
                    log.warn("User not found with ID: {}", userId);
                    return new EntityNotFoundException("User not found");
                });
        
        log.info("Creating deposit for booking ID: {} with amount: {} via gateway: {}", 
                bookingId, amount, gateway);

        // Calculate fees
        BigDecimal feeAmount = amount.multiply(platformFeePercentage).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal netAmount = amount.subtract(feeAmount);

        PaymentTransaction transaction = new PaymentTransaction();
        transaction.setTransactionId(generateTransactionId());
        transaction.setUser(user);
        transaction.setBooking(booking);
        transaction.setType(PaymentTransaction.TransactionType.DEPOSIT);
        transaction.setStatus(PaymentTransaction.TransactionStatus.PENDING);
        transaction.setGateway(gateway);
        transaction.setAmount(amount);
        transaction.setFeeAmount(feeAmount);
        transaction.setNetAmount(netAmount);
        transaction.setDescription("Deposit for booking #" + bookingId);
        transaction.setCurrency("VND");

        PaymentTransaction saved = paymentTransactionRepository.save(transaction);

        // Process payment through gateway
        PaymentGatewayService.PaymentRequest paymentRequest = new PaymentGatewayService.PaymentRequest();
        paymentRequest.setTransactionId(saved.getTransactionId());
        paymentRequest.setAmount(amount);
        paymentRequest.setCurrency("VND");
        paymentRequest.setDescription("Deposit for booking #" + bookingId);
        paymentRequest.setReturnUrl(returnUrl != null ? returnUrl : baseUrl + "/payment/return");
        paymentRequest.setCustomerEmail(user.getEmail());
        paymentRequest.setCustomerPhone(user.getPhone());

        PaymentGatewayService.PaymentResponse gatewayResponse = getGatewayService(gateway)
                .initiatePayment(paymentRequest);

        if (gatewayResponse.isSuccess()) {
            saved.setGatewayTransactionId(gatewayResponse.getGatewayTransactionId());
            saved.setStatus(PaymentTransaction.TransactionStatus.PROCESSING);
            paymentTransactionRepository.save(saved);
            
            // Hold amount in escrow once payment is initiated
            User seller = booking.getCar().getShop().getOwner();
            Wallet sellerWallet = walletRepository.findByUserId(seller.getId())
                    .orElseThrow(() -> {
                        log.error("Seller wallet not found for user ID: {}", seller.getId());
                        return new EntityNotFoundException("Seller wallet not found");
                    });
            walletService.addToEscrow(sellerWallet.getId(), netAmount);
            log.debug("Escrow hold added for seller wallet ID: {} with amount: {}", 
                    sellerWallet.getId(), netAmount);
        } else {
            saved.setStatus(PaymentTransaction.TransactionStatus.FAILED);
            saved.setFailureReason(gatewayResponse.getErrorMessage());
            paymentTransactionRepository.save(saved);
            throw new IllegalStateException("Payment initiation failed: " + gatewayResponse.getErrorMessage());
        }

        return saved;
    }
    
    public PaymentGatewayService.PaymentResponse getPaymentUrl(String transactionId) {
        Objects.requireNonNull(transactionId, "Transaction ID cannot be null");
        PaymentTransaction transaction = paymentTransactionRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> {
                    log.warn("Transaction not found with ID: {}", transactionId);
                    return new EntityNotFoundException("Transaction not found");
                });
        
        PaymentGatewayService.PaymentRequest request = new PaymentGatewayService.PaymentRequest();
        request.setTransactionId(transaction.getTransactionId());
        request.setAmount(transaction.getAmount());
        request.setCurrency(transaction.getCurrency());
        request.setDescription(transaction.getDescription());
        
        return getGatewayService(transaction.getGateway()).initiatePayment(request);
    }

    @Transactional
    public PaymentTransaction holdInEscrow(Long bookingId, BigDecimal amount) {
        Objects.requireNonNull(bookingId, "Booking ID cannot be null");
        Objects.requireNonNull(amount, "Amount cannot be null");
        
        Booking booking = bookingRepository.findById(Objects.requireNonNull(bookingId))
                .orElseThrow(() -> {
                    log.warn("Booking not found with ID: {}", bookingId);
                    return new EntityNotFoundException("Booking not found");
                });

        User seller = booking.getCar().getShop().getOwner();
        Wallet sellerWallet = walletRepository.findByUserId(seller.getId())
                .orElseThrow(() -> {
                    log.error("Seller wallet not found for user ID: {}", seller.getId());
                    return new EntityNotFoundException("Seller wallet not found");
                });
        
        log.info("Holding amount {} in escrow for booking ID: {}", amount, bookingId);

        PaymentTransaction transaction = new PaymentTransaction();
        transaction.setTransactionId(generateTransactionId());
        transaction.setBooking(booking);
        transaction.setWallet(sellerWallet);
        transaction.setType(PaymentTransaction.TransactionType.ESCROW_HOLD);
        transaction.setStatus(PaymentTransaction.TransactionStatus.COMPLETED);
        transaction.setAmount(amount);
        transaction.setNetAmount(amount);
        transaction.setDescription("Escrow hold for booking #" + bookingId);
        transaction.setProcessedAt(LocalDateTime.now());

        PaymentTransaction saved = paymentTransactionRepository.save(transaction);

        // Add to escrow
        walletService.addToEscrow(sellerWallet.getId(), amount);

        return saved;
    }

    @Transactional
    public PaymentTransaction releaseEscrow(Long bookingId, BigDecimal amount) {
        Objects.requireNonNull(bookingId, "Booking ID cannot be null");
        Objects.requireNonNull(amount, "Amount cannot be null");
        
        Booking booking = bookingRepository.findById(Objects.requireNonNull(bookingId))
                .orElseThrow(() -> {
                    log.warn("Booking not found with ID: {}", bookingId);
                    return new EntityNotFoundException("Booking not found");
                });

        User seller = booking.getCar().getShop().getOwner();
        Wallet sellerWallet = walletRepository.findByUserId(seller.getId())
                .orElseThrow(() -> {
                    log.error("Seller wallet not found for user ID: {}", seller.getId());
                    return new EntityNotFoundException("Seller wallet not found");
                });
        
        log.info("Releasing amount {} from escrow for booking ID: {}", amount, bookingId);

        PaymentTransaction transaction = new PaymentTransaction();
        transaction.setTransactionId(generateTransactionId());
        transaction.setBooking(booking);
        transaction.setWallet(sellerWallet);
        transaction.setType(PaymentTransaction.TransactionType.ESCROW_RELEASE);
        transaction.setStatus(PaymentTransaction.TransactionStatus.COMPLETED);
        transaction.setAmount(amount);
        transaction.setNetAmount(amount);
        transaction.setDescription("Escrow release for booking #" + bookingId);
        transaction.setProcessedAt(LocalDateTime.now());

        PaymentTransaction saved = paymentTransactionRepository.save(transaction);

        // Release from escrow to balance
        walletService.releaseFromEscrow(sellerWallet.getId(), amount);

        // Send notification
        notificationService.createNotification(
            seller.getId(),
            "Payment Released",
            "Escrow funds have been released to your wallet for booking #" + bookingId,
            Notification.NotificationType.PAYMENT_RECEIVED,
            "booking",
            bookingId
        );

        return saved;
    }

    @Transactional
    public PaymentTransaction processRefund(Long transactionId, BigDecimal amount, String reason) {
        Objects.requireNonNull(transactionId, "Transaction ID cannot be null");
        
        PaymentTransaction originalTransaction = paymentTransactionRepository.findById(Objects.requireNonNull(transactionId))
                .orElseThrow(() -> {
                    log.warn("Transaction not found with ID: {}", transactionId);
                    return new EntityNotFoundException("Transaction not found");
                });
        
        log.info("Processing refund for transaction ID: {} with amount: {}, reason: {}", 
                transactionId, amount, reason);

        PaymentTransaction refund = new PaymentTransaction();
        refund.setTransactionId(generateTransactionId());
        refund.setUser(originalTransaction.getUser());
        refund.setBooking(originalTransaction.getBooking());
        refund.setType(PaymentTransaction.TransactionType.REFUND);
        refund.setStatus(PaymentTransaction.TransactionStatus.PENDING);
        refund.setGateway(originalTransaction.getGateway());
        refund.setAmount(amount);
        refund.setNetAmount(amount);
        refund.setDescription("Refund for transaction #" + transactionId + ": " + reason);
        // Link refund to original for incident triage
        refund.setReferenceNumber(originalTransaction.getTransactionId());

        PaymentTransaction saved = paymentTransactionRepository.save(refund);

        // Process refund through gateway if applicable
        if (originalTransaction.getGateway() != null && originalTransaction.getGateway() != PaymentTransaction.PaymentGateway.WALLET) {
            PaymentGatewayService gateway = getGatewayService(originalTransaction.getGateway());
            PaymentGatewayService.RefundResponse resp = gateway.processRefund(
                    originalTransaction.getGatewayTransactionId(), amount != null ? amount : originalTransaction.getAmount(), reason
            );
            if (!resp.isSuccess()) {
                refund.setStatus(PaymentTransaction.TransactionStatus.FAILED);
                refund.setFailureReason(resp.getErrorMessage());
                paymentTransactionRepository.save(refund);
                throw new IllegalStateException("Refund failed: " + resp.getErrorMessage());
            }
            refund.setStatus(PaymentTransaction.TransactionStatus.COMPLETED);
            refund.setProcessedAt(LocalDateTime.now());
            paymentTransactionRepository.save(refund);
        }

        // Update original transaction
        originalTransaction.setStatus(PaymentTransaction.TransactionStatus.REFUNDED);
        paymentTransactionRepository.save(originalTransaction);

        return saved;
    }

    public BigDecimal getCompletedDepositNetAmountForBooking(Long bookingId) {
        return paymentTransactionRepository.findByBookingIdOrderByCreatedAtDesc(bookingId).stream()
                .filter(t -> t.getType() == PaymentTransaction.TransactionType.DEPOSIT)
                .filter(t -> t.getStatus() == PaymentTransaction.TransactionStatus.COMPLETED)
                .map(PaymentTransaction::getNetAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Transactional
    public PaymentTransaction processPayout(Long walletId, BigDecimal amount, String description) {
        Objects.requireNonNull(walletId, "Wallet ID cannot be null");
        Objects.requireNonNull(amount, "Amount cannot be null");
        
        Wallet wallet = walletRepository.findById(Objects.requireNonNull(walletId))
                .orElseThrow(() -> {
                    log.warn("Wallet not found with ID: {}", walletId);
                    return new RuntimeException("Wallet not found");
                });
        
        log.info("Processing payout for wallet ID: {} with amount: {}", walletId, amount);

        PaymentTransaction transaction = new PaymentTransaction();
        transaction.setTransactionId(generateTransactionId());
        transaction.setUser(wallet.getUser());
        transaction.setWallet(wallet);
        transaction.setType(PaymentTransaction.TransactionType.PAYOUT);
        transaction.setStatus(PaymentTransaction.TransactionStatus.PENDING);
        transaction.setGateway(PaymentTransaction.PaymentGateway.BANK_TRANSFER);
        transaction.setAmount(amount);
        transaction.setNetAmount(amount);
        transaction.setDescription(description);

        PaymentTransaction saved = paymentTransactionRepository.save(transaction);

        // Request withdrawal from wallet
        walletService.requestWithdrawal(walletId, amount);

        return saved;
    }

    public List<PaymentTransaction> getUserTransactions(Long userId) {
        return paymentTransactionRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<PaymentTransaction> getBookingTransactions(Long bookingId) {
        return paymentTransactionRepository.findByBookingIdOrderByCreatedAtDesc(bookingId);
    }

    public PaymentTransaction getTransactionByTransactionId(String transactionId) {
        Objects.requireNonNull(transactionId, "Transaction ID cannot be null");
        return paymentTransactionRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> {
                    log.warn("Transaction not found with ID: {}", transactionId);
                    return new RuntimeException("Transaction not found");
                });
    }

    private String generateTransactionId() {
        return "TXN-" + UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase();
    }

    @Transactional
    public void handlePaymentCallback(PaymentTransaction.PaymentGateway gateway, 
                                     String transactionId, 
                                     Map<String, String> callbackData) {
        Objects.requireNonNull(gateway, "Gateway cannot be null");
        Objects.requireNonNull(transactionId, "Transaction ID cannot be null");
        
        PaymentTransaction transaction = paymentTransactionRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> {
                    log.warn("Transaction not found with ID: {} for callback", transactionId);
                    return new EntityNotFoundException("Transaction not found");
                });
        
        log.info("Processing payment callback for transaction ID: {} via gateway: {}", 
                transactionId, gateway);

        PaymentGatewayService gatewayService = getGatewayService(gateway);
        PaymentGatewayService.PaymentVerificationResult verification = 
                gatewayService.verifyPayment(transactionId, callbackData);

        if (verification.isVerified()) {
            transaction.setGatewayTransactionId(verification.getGatewayTransactionId());
            transaction.setStatus(verification.getStatus());
            transaction.setProcessedAt(LocalDateTime.now());

            if (verification.getStatus() == PaymentTransaction.TransactionStatus.COMPLETED) {
                // Update booking status and complete escrow hold
                if (transaction.getType() == PaymentTransaction.TransactionType.DEPOSIT) {
                    Booking booking = transaction.getBooking();
                    if (booking != null) {
                        booking.setStatus(Booking.BookingStatus.CONFIRMED);
                        bookingRepository.save(booking);
                    }
                }
            } else if (verification.getStatus() == PaymentTransaction.TransactionStatus.FAILED) {
                transaction.setFailureReason(verification.getErrorMessage());
                
                // Release escrow if payment failed
                if (transaction.getType() == PaymentTransaction.TransactionType.DEPOSIT) {
                    Booking booking = transaction.getBooking();
                    if (booking != null) {
                        User seller = booking.getCar().getShop().getOwner();
                        Wallet sellerWallet = walletRepository.findByUserId(seller.getId())
                                .orElseThrow(() -> new EntityNotFoundException("Seller wallet not found"));
                        walletService.releaseFromEscrow(sellerWallet.getId(), transaction.getNetAmount());
                    }
                }
            }

            paymentTransactionRepository.save(transaction);
        } else {
            transaction.setFailureReason("Payment verification failed: " + verification.getErrorMessage());
            transaction.setStatus(PaymentTransaction.TransactionStatus.FAILED);
            paymentTransactionRepository.save(transaction);
        }
    }

    private PaymentGatewayService getGatewayService(PaymentTransaction.PaymentGateway gateway) {
        switch (gateway) {
            case MOMO:
                return momoGatewayService;
            case ZALOPAY:
                return zaloPayGatewayService;
            case STRIPE_CONNECT:
                return stripeConnectGatewayService;
            default:
                throw new IllegalArgumentException("Unsupported payment gateway: " + gateway);
        }
    }
}
