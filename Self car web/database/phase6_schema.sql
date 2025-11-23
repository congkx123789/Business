-- ============================================
-- Phase 6: Optimization, Monetization & Scaling
-- ============================================

-- ============================================
-- PART 1: MONETIZATION STRATEGIES
-- ============================================

-- Premium Subscription Tiers for Verified Dealers
CREATE TABLE IF NOT EXISTS subscription_plans (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    plan_name VARCHAR(100) NOT NULL UNIQUE,
    plan_code VARCHAR(50) NOT NULL UNIQUE,
    tier ENUM('BASIC', 'PRO', 'PREMIUM', 'ENTERPRISE') NOT NULL,
    description TEXT,
    monthly_price DECIMAL(10, 2) NOT NULL,
    yearly_price DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'VND',
    max_listings INT DEFAULT 50,
    max_users INT DEFAULT 3,
    featured_listings_enabled BOOLEAN DEFAULT FALSE,
    analytics_enabled BOOLEAN DEFAULT TRUE,
    api_access_enabled BOOLEAN DEFAULT FALSE,
    priority_support BOOLEAN DEFAULT FALSE,
    ad_credits_monthly INT DEFAULT 0,
    transaction_fee_discount DECIMAL(5, 2) DEFAULT 0.00,
    status ENUM('ACTIVE', 'INACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tier (tier),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS dealer_subscriptions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    shop_id BIGINT,
    plan_id BIGINT NOT NULL,
    subscription_number VARCHAR(50) NOT NULL UNIQUE,
    billing_cycle ENUM('MONTHLY', 'YEARLY') NOT NULL DEFAULT 'MONTHLY',
    status ENUM('ACTIVE', 'CANCELLED', 'EXPIRED', 'SUSPENDED', 'TRIAL') NOT NULL DEFAULT 'TRIAL',
    start_date DATE NOT NULL,
    end_date DATE,
    next_billing_date DATE,
    auto_renew BOOLEAN DEFAULT TRUE,
    price_paid DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'VND',
    payment_method VARCHAR(50),
    cancelled_at TIMESTAMP NULL,
    cancellation_reason TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE SET NULL,
    FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE RESTRICT,
    INDEX idx_user_id (user_id),
    INDEX idx_shop_id (shop_id),
    INDEX idx_status (status),
    INDEX idx_end_date (end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS subscription_payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    subscription_id BIGINT NOT NULL,
    payment_transaction_id BIGINT,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'VND',
    billing_period_start DATE NOT NULL,
    billing_period_end DATE NOT NULL,
    status ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    paid_at TIMESTAMP NULL,
    failure_reason TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (subscription_id) REFERENCES dealer_subscriptions(id) ON DELETE CASCADE,
    FOREIGN KEY (payment_transaction_id) REFERENCES payment_transactions(id) ON DELETE SET NULL,
    INDEX idx_subscription_id (subscription_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Transaction Fee Configuration
CREATE TABLE IF NOT EXISTS transaction_fee_configs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    fee_type ENUM('SALE', 'RENTAL', 'SERVICE', 'ALL') NOT NULL,
    fee_percentage DECIMAL(5, 2) NOT NULL,
    min_fee_amount DECIMAL(10, 2) DEFAULT 0.00,
    max_fee_amount DECIMAL(10, 2),
    subscription_tier ENUM('BASIC', 'PRO', 'PREMIUM', 'ENTERPRISE', 'ALL') DEFAULT 'ALL',
    discount_percentage DECIMAL(5, 2) DEFAULT 0.00,
    effective_from DATE NOT NULL,
    effective_to DATE,
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_fee_type (fee_type),
    INDEX idx_status (status),
    INDEX idx_effective_dates (effective_from, effective_to)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS transaction_fees (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    transaction_id BIGINT NOT NULL,
    order_id BIGINT,
    fee_config_id BIGINT,
    transaction_amount DECIMAL(15, 2) NOT NULL,
    fee_percentage DECIMAL(5, 2) NOT NULL,
    fee_amount DECIMAL(15, 2) NOT NULL,
    discount_amount DECIMAL(15, 2) DEFAULT 0.00,
    net_fee_amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'VND',
    subscription_tier VARCHAR(50),
    status ENUM('PENDING', 'COLLECTED', 'REFUNDED', 'WAIVED') NOT NULL DEFAULT 'PENDING',
    collected_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES payment_transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
    FOREIGN KEY (fee_config_id) REFERENCES transaction_fee_configs(id) ON DELETE SET NULL,
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_order_id (order_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ad Placement Packages
CREATE TABLE IF NOT EXISTS ad_packages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    package_name VARCHAR(255) NOT NULL,
    package_code VARCHAR(50) NOT NULL UNIQUE,
    ad_type ENUM('FEATURED', 'BANNER', 'SPONSORED', 'HOMEPAGE', 'SEARCH_RESULT', 'CAROUSEL') NOT NULL,
    description TEXT,
    duration_days INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'VND',
    max_impressions INT,
    max_clicks INT,
    priority_level INT DEFAULT 0,
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_ad_type (ad_type),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ad_purchases (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    purchase_number VARCHAR(50) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    shop_id BIGINT,
    car_id BIGINT,
    ad_package_id BIGINT NOT NULL,
    payment_transaction_id BIGINT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('PENDING', 'ACTIVE', 'PAUSED', 'EXPIRED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    impressions INT DEFAULT 0,
    clicks INT DEFAULT 0,
    cost_per_click DECIMAL(10, 4),
    total_cost DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'VND',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE SET NULL,
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE SET NULL,
    FOREIGN KEY (ad_package_id) REFERENCES ad_packages(id) ON DELETE RESTRICT,
    FOREIGN KEY (payment_transaction_id) REFERENCES payment_transactions(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_car_id (car_id),
    INDEX idx_status (status),
    INDEX idx_dates (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ad_impressions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ad_purchase_id BIGINT NOT NULL,
    user_id BIGINT,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    location VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ad_purchase_id) REFERENCES ad_purchases(id) ON DELETE CASCADE,
    INDEX idx_ad_purchase_id (ad_purchase_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ad_clicks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ad_purchase_id BIGINT NOT NULL,
    impression_id BIGINT,
    user_id BIGINT,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    location VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ad_purchase_id) REFERENCES ad_purchases(id) ON DELETE CASCADE,
    FOREIGN KEY (impression_id) REFERENCES ad_impressions(id) ON DELETE SET NULL,
    INDEX idx_ad_purchase_id (ad_purchase_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- PART 2: INTERNATIONALIZATION (i18n)
-- ============================================

-- Supported Languages
CREATE TABLE IF NOT EXISTS supported_languages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    language_code VARCHAR(10) NOT NULL UNIQUE,
    language_name VARCHAR(100) NOT NULL,
    native_name VARCHAR(100) NOT NULL,
    region_code VARCHAR(10),
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_language_code (language_code),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Supported Currencies
CREATE TABLE IF NOT EXISTS supported_currencies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    currency_code VARCHAR(3) NOT NULL UNIQUE,
    currency_name VARCHAR(100) NOT NULL,
    currency_symbol VARCHAR(10),
    exchange_rate DECIMAL(20, 8) DEFAULT 1.00000000,
    base_currency VARCHAR(3) DEFAULT 'USD',
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    decimal_places INT DEFAULT 2,
    region VARCHAR(100),
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_currency_code (currency_code),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Currency Exchange Rates History
CREATE TABLE IF NOT EXISTS currency_exchange_rates (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    from_currency VARCHAR(3) NOT NULL,
    to_currency VARCHAR(3) NOT NULL,
    exchange_rate DECIMAL(20, 8) NOT NULL,
    rate_date DATE NOT NULL,
    source VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_rate (from_currency, to_currency, rate_date),
    INDEX idx_from_currency (from_currency),
    INDEX idx_to_currency (to_currency),
    INDEX idx_rate_date (rate_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User Language Preferences
CREATE TABLE IF NOT EXISTS user_language_preferences (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    preferred_language VARCHAR(10) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (preferred_language) REFERENCES supported_languages(language_code) ON DELETE RESTRICT,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User Currency Preferences
CREATE TABLE IF NOT EXISTS user_currency_preferences (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    preferred_currency VARCHAR(3) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (preferred_currency) REFERENCES supported_currencies(currency_code) ON DELETE RESTRICT,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Regional Markets
CREATE TABLE IF NOT EXISTS regional_markets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    market_code VARCHAR(10) NOT NULL UNIQUE,
    market_name VARCHAR(100) NOT NULL,
    country_code VARCHAR(2) NOT NULL,
    default_language VARCHAR(10) NOT NULL,
    default_currency VARCHAR(3) NOT NULL,
    timezone VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    launch_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (default_language) REFERENCES supported_languages(language_code) ON DELETE RESTRICT,
    FOREIGN KEY (default_currency) REFERENCES supported_currencies(currency_code) ON DELETE RESTRICT,
    INDEX idx_market_code (market_code),
    INDEX idx_country_code (country_code),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Translation Content
CREATE TABLE IF NOT EXISTS translations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    translation_key VARCHAR(255) NOT NULL,
    language_code VARCHAR(10) NOT NULL,
    translation_value TEXT NOT NULL,
    category VARCHAR(100),
    context VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_translation (translation_key, language_code),
    FOREIGN KEY (language_code) REFERENCES supported_languages(language_code) ON DELETE CASCADE,
    INDEX idx_translation_key (translation_key),
    INDEX idx_language_code (language_code),
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- PART 3: PERFORMANCE OPTIMIZATION
-- ============================================

-- Cache Management
CREATE TABLE IF NOT EXISTS cache_metrics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cache_key VARCHAR(255) NOT NULL,
    cache_type VARCHAR(50) NOT NULL,
    hit_count BIGINT DEFAULT 0,
    miss_count BIGINT DEFAULT 0,
    last_accessed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_cache_key (cache_key),
    INDEX idx_cache_type (cache_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- API Performance Monitoring
CREATE TABLE IF NOT EXISTS api_performance_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    endpoint VARCHAR(500) NOT NULL,
    method VARCHAR(10) NOT NULL,
    response_time_ms INT NOT NULL,
    status_code INT,
    user_id BIGINT,
    ip_address VARCHAR(45),
    request_size_bytes INT,
    response_size_bytes INT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_endpoint (endpoint(255)),
    INDEX idx_created_at (created_at),
    INDEX idx_response_time (response_time_ms)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- PART 4: SEED DATA FOR DEFAULT CONFIGURATIONS
-- ============================================

-- Insert default subscription plans
INSERT INTO subscription_plans (plan_name, plan_code, tier, description, monthly_price, yearly_price, max_listings, max_users, featured_listings_enabled, analytics_enabled, api_access_enabled, priority_support, ad_credits_monthly, transaction_fee_discount) VALUES
('Basic Plan', 'BASIC', 'BASIC', 'Perfect for small dealers', 0.00, 0.00, 50, 3, FALSE, TRUE, FALSE, FALSE, 0, 0.00),
('Pro Plan', 'PRO', 'PRO', 'For growing dealerships', 500000.00, 5000000.00, 200, 10, TRUE, TRUE, FALSE, TRUE, 5, 0.50),
('Premium Plan', 'PREMIUM', 'PREMIUM', 'For established dealers', 1500000.00, 15000000.00, 500, 25, TRUE, TRUE, TRUE, TRUE, 20, 1.00),
('Enterprise Plan', 'ENTERPRISE', 'ENTERPRISE', 'Custom solutions for large dealers', 5000000.00, 50000000.00, -1, -1, TRUE, TRUE, TRUE, TRUE, 100, 2.00)
ON DUPLICATE KEY UPDATE plan_name = plan_name;

-- Insert default transaction fee configs
INSERT INTO transaction_fee_configs (fee_type, fee_percentage, min_fee_amount, subscription_tier, effective_from, status) VALUES
('SALE', 3.00, 0.00, 'ALL', CURDATE(), 'ACTIVE'),
('SALE', 2.50, 0.00, 'PRO', CURDATE(), 'ACTIVE'),
('SALE', 2.00, 0.00, 'PREMIUM', CURDATE(), 'ACTIVE'),
('SALE', 1.00, 0.00, 'ENTERPRISE', CURDATE(), 'ACTIVE'),
('RENTAL', 2.00, 0.00, 'ALL', CURDATE(), 'ACTIVE'),
('SERVICE', 1.50, 0.00, 'ALL', CURDATE(), 'ACTIVE')
ON DUPLICATE KEY UPDATE fee_percentage = fee_percentage;

-- Insert default supported languages (ASEAN)
INSERT INTO supported_languages (language_code, language_name, native_name, region_code, is_default, is_active, sort_order) VALUES
('vi', 'Vietnamese', 'Tiếng Việt', 'VN', TRUE, TRUE, 1),
('en', 'English', 'English', 'US', FALSE, TRUE, 2),
('th', 'Thai', 'ไทย', 'TH', FALSE, TRUE, 3),
('id', 'Indonesian', 'Bahasa Indonesia', 'ID', FALSE, TRUE, 4),
('ms', 'Malay', 'Bahasa Melayu', 'MY', FALSE, TRUE, 5),
('zh', 'Chinese', '中文', 'CN', FALSE, TRUE, 6)
ON DUPLICATE KEY UPDATE language_name = language_name;

-- Insert default supported currencies (ASEAN)
INSERT INTO supported_currencies (currency_code, currency_name, currency_symbol, exchange_rate, base_currency, is_default, is_active, decimal_places, region) VALUES
('VND', 'Vietnamese Dong', '₫', 24500.00, 'USD', TRUE, TRUE, 0, 'Vietnam'),
('USD', 'US Dollar', '$', 1.00, 'USD', FALSE, TRUE, 2, 'United States'),
('THB', 'Thai Baht', '฿', 35.00, 'USD', FALSE, TRUE, 2, 'Thailand'),
('IDR', 'Indonesian Rupiah', 'Rp', 15000.00, 'USD', FALSE, TRUE, 0, 'Indonesia'),
('MYR', 'Malaysian Ringgit', 'RM', 4.50, 'USD', FALSE, TRUE, 2, 'Malaysia'),
('SGD', 'Singapore Dollar', 'S$', 1.35, 'USD', FALSE, TRUE, 2, 'Singapore'),
('PHP', 'Philippine Peso', '₱', 55.00, 'USD', FALSE, TRUE, 2, 'Philippines')
ON DUPLICATE KEY UPDATE currency_name = currency_name;

-- Insert default regional markets
INSERT INTO regional_markets (market_code, market_name, country_code, default_language, default_currency, timezone, is_active, launch_date) VALUES
('VN', 'Vietnam', 'VN', 'vi', 'VND', 'Asia/Ho_Chi_Minh', TRUE, CURDATE()),
('TH', 'Thailand', 'TH', 'th', 'THB', 'Asia/Bangkok', FALSE, NULL),
('ID', 'Indonesia', 'ID', 'id', 'IDR', 'Asia/Jakarta', FALSE, NULL),
('MY', 'Malaysia', 'MY', 'ms', 'MYR', 'Asia/Kuala_Lumpur', FALSE, NULL),
('SG', 'Singapore', 'SG', 'en', 'SGD', 'Asia/Singapore', FALSE, NULL),
('PH', 'Philippines', 'PH', 'en', 'PHP', 'Asia/Manila', FALSE, NULL)
ON DUPLICATE KEY UPDATE market_name = market_name;

