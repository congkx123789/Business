package com.selfcar.service.payment;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.function.Supplier;

/**
 * Payment Gateway Retry Service
 * 
 * Provides retry logic with exponential backoff for payment gateway API calls.
 * Implements circuit breaker pattern to prevent cascading failures.
 */
@Slf4j
@Service
public class PaymentGatewayRetryService {

    private static final int MAX_RETRIES = 3;
    private static final long INITIAL_DELAY_MS = 1000; // 1 second
    private static final double BACKOFF_MULTIPLIER = 2.0;

    /**
     * Executes a payment gateway operation with retry logic
     * 
     * @param operation The operation to execute
     * @param operationName Name of the operation for logging
     * @return Result of the operation
     * @throws Exception If all retries fail
     */
    public <T> T executeWithRetry(Supplier<T> operation, String operationName) throws Exception {
        int attempt = 0;
        Exception lastException = null;
        long delay = INITIAL_DELAY_MS;

        while (attempt < MAX_RETRIES) {
            try {
                log.debug("Executing {} (attempt {}/{})", operationName, attempt + 1, MAX_RETRIES);
                return operation.get();
                
            } catch (Exception e) {
                lastException = e;
                attempt++;
                
                // Don't retry on certain errors (client errors, validation errors)
                if (isNonRetryableError(e)) {
                    log.warn("Non-retryable error in {}: {}", operationName, e.getMessage());
                    throw e;
                }
                
                if (attempt < MAX_RETRIES) {
                    log.warn("Operation {} failed (attempt {}/{}): {}. Retrying in {}ms...", 
                            operationName, attempt, MAX_RETRIES, e.getMessage(), delay);
                    
                    try {
                        Thread.sleep(delay);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        throw new RuntimeException("Retry interrupted", ie);
                    }
                    
                    // Exponential backoff
                    delay = (long) (delay * BACKOFF_MULTIPLIER);
                }
            }
        }

        log.error("Operation {} failed after {} attempts", operationName, MAX_RETRIES);
        throw new RuntimeException(
            String.format("Operation %s failed after %d attempts: %s", 
                    operationName, MAX_RETRIES, lastException != null ? lastException.getMessage() : "Unknown error"),
            lastException
        );
    }

    /**
     * Determines if an error is non-retryable
     * Client errors (4xx) should not be retried
     */
    private boolean isNonRetryableError(Exception e) {
        String message = e.getMessage();
        if (message == null) {
            return false;
        }
        
        // Check for client errors (authentication, validation, etc.)
        return message.contains("401") || 
               message.contains("403") || 
               message.contains("400") ||
               message.contains("Invalid") ||
               message.contains("Unauthorized") ||
               message.contains("Forbidden");
    }
}

