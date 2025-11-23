-- ============================================
-- Phase 3: Payment, Logistics & Financial Ecosystem
-- ============================================

-- Wallets Table (Escrow-based wallet for sellers)
CREATE TABLE IF NOT EXISTS wallets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    escrow_balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    pending_balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    total_earned DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    total_withdrawn DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    status ENUM('ACTIVE', 'SUSPENDED', 'CLOSED') NOT NULL DEFAULT 'ACTIVE',
    bank_account_number VARCHAR(50),
    bank_name VARCHAR(100),
    account_holder_name VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payment Transactions Table (Enhanced)
CREATE TABLE IF NOT EXISTS payment_transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    transaction_id VARCHAR(100) NOT NULL UNIQUE,
    user_id BIGINT,
    booking_id BIGINT,
    order_id BIGINT,
    wallet_id BIGINT,
    type ENUM('DEPOSIT', 'ESCROW_HOLD', 'ESCROW_RELEASE', 'REFUND', 'WITHDRAWAL', 'PAYOUT', 'FEE', 'ADJUSTMENT') NOT NULL,
    status ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    gateway ENUM('MOMO', 'ZALOPAY', 'STRIPE_CONNECT', 'WALLET', 'BANK_TRANSFER'),
    amount DECIMAL(15, 2) NOT NULL,
    fee_amount DECIMAL(15, 2),
    net_amount DECIMAL(15, 2),
    currency VARCHAR(3) DEFAULT 'VND',
    gateway_transaction_id VARCHAR(200),
    gateway_response TEXT,
    description TEXT,
    reference_number VARCHAR(100),
    failure_reason TEXT,
    processed_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
    FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE SET NULL,
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_user_id (user_id),
    INDEX idx_booking_id (booking_id),
    INDEX idx_order_id (order_id),
    INDEX idx_wallet_id (wallet_id),
    INDEX idx_status (status),
    INDEX idx_type (type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Orders Table (Vehicle Purchase Orders - "Book – Inspect – Pay" workflow)
CREATE TABLE IF NOT EXISTS orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    buyer_id BIGINT NOT NULL,
    seller_id BIGINT NOT NULL,
    car_id BIGINT NOT NULL,
    booking_id BIGINT,
    total_amount DECIMAL(15, 2) NOT NULL,
    deposit_amount DECIMAL(15, 2) NOT NULL,
    remaining_amount DECIMAL(15, 2) NOT NULL,
    platform_fee DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    status ENUM('BOOKED', 'INSPECTION_SCHEDULED', 'INSPECTION_IN_PROGRESS', 'INSPECTION_COMPLETED', 
                'PAYMENT_PENDING', 'PAYMENT_COMPLETED', 'PICKUP_SCHEDULED', 'PICKUP_IN_PROGRESS', 
                'DELIVERY_SCHEDULED', 'DELIVERY_IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REFUNDED') NOT NULL DEFAULT 'BOOKED',
    currency VARCHAR(3) DEFAULT 'VND',
    inspection_date DATETIME,
    inspection_location VARCHAR(500),
    inspection_notes TEXT,
    inspection_status ENUM('PENDING', 'SCHEDULED', 'PASSED', 'FAILED', 'RESCHEDULED') DEFAULT 'PENDING',
    pickup_date DATETIME,
    pickup_location VARCHAR(500),
    delivery_date DATETIME,
    delivery_location VARCHAR(500),
    cancellation_reason TEXT,
    cancelled_by BIGINT,
    cancelled_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
    FOREIGN KEY (cancelled_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_order_number (order_number),
    INDEX idx_buyer_id (buyer_id),
    INDEX idx_seller_id (seller_id),
    INDEX idx_car_id (car_id),
    INDEX idx_status (status),
    INDEX idx_inspection_date (inspection_date),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Logistics Tasks Table (Pickup, Inspection, Delivery coordination)
CREATE TABLE IF NOT EXISTS logistics_tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    task_number VARCHAR(50) NOT NULL UNIQUE,
    order_id BIGINT NOT NULL,
    task_type ENUM('INSPECTION', 'PICKUP', 'DELIVERY') NOT NULL,
    status ENUM('PENDING', 'SCHEDULED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    assigned_driver_id BIGINT,
    scheduled_date DATETIME,
    actual_start_date DATETIME,
    actual_completion_date DATETIME,
    pickup_location VARCHAR(500),
    delivery_location VARCHAR(500),
    vehicle_condition_notes TEXT,
    driver_notes TEXT,
    customer_contact_name VARCHAR(255),
    customer_contact_phone VARCHAR(20),
    estimated_duration_minutes INT,
    actual_duration_minutes INT,
    distance_km DECIMAL(10, 2),
    logistics_cost DECIMAL(10, 2),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_driver_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_task_number (task_number),
    INDEX idx_order_id (order_id),
    INDEX idx_task_type (task_type),
    INDEX idx_status (status),
    INDEX idx_assigned_driver_id (assigned_driver_id),
    INDEX idx_scheduled_date (scheduled_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Financial Analytics Views and Tables
CREATE TABLE IF NOT EXISTS financial_summary (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    period_type ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY') NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    dealer_id BIGINT,
    category VARCHAR(100),
    location VARCHAR(255),
    total_revenue DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    total_orders INT NOT NULL DEFAULT 0,
    completed_orders INT NOT NULL DEFAULT 0,
    cancelled_orders INT NOT NULL DEFAULT 0,
    platform_fees DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    refunds DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    net_profit DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    average_order_value DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (dealer_id) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_period (period_type, period_start, dealer_id, category, location),
    INDEX idx_period (period_type, period_start, period_end),
    INDEX idx_dealer_id (dealer_id),
    INDEX idx_category (category),
    INDEX idx_location (location)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Wallet Transactions Log (Audit trail)
CREATE TABLE IF NOT EXISTS wallet_transactions_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    wallet_id BIGINT NOT NULL,
    transaction_id BIGINT,
    transaction_type ENUM('DEPOSIT', 'WITHDRAWAL', 'ESCROW_HOLD', 'ESCROW_RELEASE', 'FEE', 'ADJUSTMENT') NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    balance_before DECIMAL(15, 2) NOT NULL,
    balance_after DECIMAL(15, 2) NOT NULL,
    escrow_balance_before DECIMAL(15, 2) NOT NULL,
    escrow_balance_after DECIMAL(15, 2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE CASCADE,
    FOREIGN KEY (transaction_id) REFERENCES payment_transactions(id) ON DELETE SET NULL,
    INDEX idx_wallet_id (wallet_id),
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Webhook Events (Payment gateway callbacks)
CREATE TABLE IF NOT EXISTS webhook_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    source VARCHAR(100) NOT NULL,
    event_id VARCHAR(255),
    payload_hash VARCHAR(64) NOT NULL,
    payload TEXT NOT NULL,
    status ENUM('RECEIVED', 'PROCESSING', 'PROCESSED', 'FAILED') NOT NULL DEFAULT 'RECEIVED',
    error_message TEXT,
    processed_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_source_event (source, event_id),
    INDEX idx_payload_hash (payload_hash),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add foreign key for order_id in payment_transactions
ALTER TABLE payment_transactions 
ADD CONSTRAINT fk_payment_order 
FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX idx_payment_order_id ON payment_transactions(order_id);
CREATE INDEX idx_order_buyer_status ON orders(buyer_id, status);
CREATE INDEX idx_order_seller_status ON orders(seller_id, status);
CREATE INDEX idx_logistics_order_type ON logistics_tasks(order_id, task_type);
CREATE INDEX idx_financial_period_dealer ON financial_summary(period_type, period_start, dealer_id);
