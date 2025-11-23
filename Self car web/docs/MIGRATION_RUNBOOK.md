Migration checklist (MySQL 8+)

Pre-checks
- Confirm DB backups and PITR enabled; note binlog coordinates/snapshot.
- Verify app version and maintenance window approved.
- Review SQL in `database/db/v1_core_inventory.sql` and rollback in `database/db/v1_core_inventory_rollback.sql`.

Staging smoke test
- Provision staging DB from latest production snapshot.
- Apply migration: run `v1_core_inventory.sql`.
- Run seed as needed; execute service smoke tests.
- Perform rollback test: run `v1_core_inventory_rollback.sql` on staging clone and validate revert.

Production rollout
- Enable maintenance (read-only if required).
- Apply `v1_core_inventory.sql`.
- Verify:
  - Unique active listing per vehicle works (try insert two AVAILABLE for same vehicle; second should fail).
  - Indexes exist: `idx_listing_status_price`, `idx_listing_dealer_status`, `idx_vehicle_make_model_year`.
  - `listing_holds` enforces UNIQUE(listing_id) and honors `expires_at` in app logic.
- Remove maintenance; monitor error rates and slow queries.

Rollback plan
- If failure, stop writers; apply `v1_core_inventory_rollback.sql`.
- If partial, restore from PITR to pre-change timestamp.
- File incident report and RCA.


