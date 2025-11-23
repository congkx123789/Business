-- Denormalized search table populated from outbox (first step before ES)
CREATE TABLE IF NOT EXISTS listing_search (
  listing_id BIGINT PRIMARY KEY,
  vehicle_id BIGINT NOT NULL,
  status ENUM('AVAILABLE','RESERVED','SOLD','EXPIRED_HOLD') NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  currency CHAR(3) NOT NULL,
  make VARCHAR(80) NULL,
  model VARCHAR(120) NULL,
  year INT NULL,
  dealer_id BIGINT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_ls_status_price (status, price),
  INDEX idx_ls_dealer_status (dealer_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


