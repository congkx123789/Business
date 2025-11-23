-- Example archival policies for outbox and audit tables (MySQL 8+)
-- Run monthly via scheduler after verifying row counts.

-- 1) Move old outbox events to archive table
CREATE TABLE IF NOT EXISTS outbox_events_archive LIKE outbox_events;

-- Move rows older than 30 days
INSERT INTO outbox_events_archive SELECT * FROM outbox_events WHERE created_at < NOW() - INTERVAL 30 DAY;
DELETE FROM outbox_events WHERE created_at < NOW() - INTERVAL 30 DAY;

-- 2) Archive listing status audit older than 90 days
CREATE TABLE IF NOT EXISTS listing_status_audit_archive LIKE listing_status_audit;
INSERT INTO listing_status_audit_archive SELECT * FROM listing_status_audit WHERE changed_at < NOW() - INTERVAL 90 DAY;
DELETE FROM listing_status_audit WHERE changed_at < NOW() - INTERVAL 90 DAY;

-- Optional: compress/archive tablespace offline depending on storage class


