# UUID Migration Plan

Goal: Replace sequential integer IDs in public APIs/URLs with UUIDv4.

Steps:
1) Schema: Add UUID columns alongside existing IDs; backfill; add unique indexes.
2) Application: Accept UUIDs, translate to internal numeric IDs as needed.
3) Dual-read/write period: Return UUIDs in responses; accept both in requests.
4) Update clients and docs; deprecate integer IDs.
5) Cleanup: Remove old paths/fields after deprecation window.

Testing:
- Verify only owners can GET/PUT/DELETE their resources.
- Verify 404 for non-existent and 403 for non-owned resources.
- Fuzz with random UUIDs to ensure no leakage.

