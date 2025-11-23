-- Core inventory schema (MySQL 8+)
-- vehicle, listing, listing_hold, outbox_event

-- Vehicles
CREATE TABLE IF NOT EXISTS vehicles (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  vin VARCHAR(32) NULL UNIQUE,
  make VARCHAR(80) NOT NULL,
  model VARCHAR(120) NOT NULL,
  year INT NOT NULL,
  dealer_id BIGINT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_vehicle_make_model_year (make, model, year),
  INDEX idx_vehicle_dealer (dealer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listings
CREATE TABLE IF NOT EXISTS listings (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  vehicle_id BIGINT NOT NULL,
  dealer_id BIGINT NULL,
  status ENUM('AVAILABLE','RESERVED','SOLD','EXPIRED_HOLD') NOT NULL DEFAULT 'AVAILABLE',
  price DECIMAL(12,2) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  -- Generated column enables partial-unique constraint semantics in MySQL
  active_listing_key BIGINT GENERATED ALWAYS AS (
    CASE WHEN status IN ('AVAILABLE','RESERVED') THEN vehicle_id ELSE NULL END
  ) STORED,
  CONSTRAINT fk_listing_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
  INDEX idx_listing_status_price (status, price),
  INDEX idx_listing_dealer_status (dealer_id, status),
  UNIQUE KEY uq_active_listing_per_vehicle (active_listing_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listing holds
CREATE TABLE IF NOT EXISTS listing_holds (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  listing_id BIGINT NOT NULL,
  user_id BIGINT NULL,
  reason VARCHAR(200) NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_hold_listing FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
  UNIQUE KEY uq_hold_per_listing (listing_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Outbox for reliable events (transactional outbox pattern)
CREATE TABLE IF NOT EXISTS outbox_events (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  aggregate_type VARCHAR(100) NOT NULL,
  aggregate_id BIGINT NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  payload JSON NOT NULL,
  headers JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP NULL,
  status ENUM('PENDING','PUBLISHED','FAILED') NOT NULL DEFAULT 'PENDING',
  INDEX idx_outbox_status_created (status, created_at),
  INDEX idx_outbox_aggregate (aggregate_type, aggregate_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


