-- Rollback for core inventory schema
DROP TABLE IF EXISTS outbox_events;
DROP TABLE IF EXISTS listing_holds;
DROP TABLE IF EXISTS listings;
DROP TABLE IF EXISTS vehicles;


