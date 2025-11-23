Data architecture and lifecycle

Core schemas
- Vehicles, listings, listing_holds, outbox_events, listing_status_audit.
- Unique active listing per vehicle enforced via generated-column unique key.

Indexes
- Listings: (status, price), (dealer_id, status). Vehicles: (make, model, year).
- Tune with real query plans; drop unused indexes quarterly.

Partitioning (optional)
- Templates in `database/db/v3_partitioning.sql` for monthly RANGE and LIST by status.
- Maintain future partitions; validate on staging first.

Read models and search
- Denormalized `listing_search` populated from Outbox publisher.
- External search indexer hook integrated; SOLD/EXPIRED removed promptly.

Caching
- Redis-backed caches for hot reads (`carById`, `availableCars`).
- Cache busting: evict on updates/deletes/toggles; price/availability mutations trigger evictions.

Retention and archival
- Outbox and audit rows archived monthly to cold storage.
- See `database/db/v4_archive_policies.sql` for example move/purge statements.

Backups and DR
- Daily full backups + binlogs retained ≥7 days; quarterly PITR restore test.
- RPO/RTO targets documented in DR runbook; failover procedure validated on staging.

Tenancy
- `owner_dealer_id` on listings for isolation; future Postgres RLS can use session tenant id.


