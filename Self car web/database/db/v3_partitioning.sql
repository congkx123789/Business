-- OPTIONAL: MySQL 8+ partitioning strategies for high-churn tables
-- Validate row counts and query patterns before applying in production.

-- Example 1: RANGE partition listings by month on created_at
-- Preconditions: ensure listings.created_at exists and is TIMESTAMP/DATETIME
-- ALTER TABLE listings PARTITION BY RANGE (TO_DAYS(created_at)) (
--   PARTITION p2025_01 VALUES LESS THAN (TO_DAYS('2025-02-01')),
--   PARTITION p2025_02 VALUES LESS THAN (TO_DAYS('2025-03-01')),
--   PARTITION pmax VALUES LESS THAN MAXVALUE
-- );

-- Example 2: LIST partition by status for quick deletes/archival
-- ALTER TABLE listings PARTITION BY LIST COLUMNS(status) (
--   PARTITION p_avail VALUES IN ('AVAILABLE'),
--   PARTITION p_reserved VALUES IN ('RESERVED'),
--   PARTITION p_sold VALUES IN ('SOLD','EXPIRED_HOLD')
-- );

-- Example 3: RANGE partition outbox_events by month
-- ALTER TABLE outbox_events PARTITION BY RANGE (TO_DAYS(created_at)) (
--   PARTITION p2025_01 VALUES LESS THAN (TO_DAYS('2025-02-01')),
--   PARTITION p2025_02 VALUES LESS THAN (TO_DAYS('2025-03-01')),
--   PARTITION pmax VALUES LESS THAN MAXVALUE
-- );

-- Note: Partition maintenance requires scheduled creation of future partitions.
-- Test on staging with representative data.


