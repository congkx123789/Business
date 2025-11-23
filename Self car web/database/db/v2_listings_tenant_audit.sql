-- Tenant field and audit logs for listings

ALTER TABLE listings
  ADD COLUMN owner_dealer_id BIGINT NULL,
  ADD INDEX idx_listing_owner_status (owner_dealer_id, status);

-- Append-only audit table for listing status changes
CREATE TABLE IF NOT EXISTS listing_status_audit (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  listing_id BIGINT NOT NULL,
  old_status ENUM('AVAILABLE','RESERVED','SOLD','EXPIRED_HOLD') NULL,
  new_status ENUM('AVAILABLE','RESERVED','SOLD','EXPIRED_HOLD') NOT NULL,
  reason VARCHAR(200) NULL,
  changed_by VARCHAR(100) NULL,
  changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
  INDEX idx_lsa_listing_time (listing_id, changed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


