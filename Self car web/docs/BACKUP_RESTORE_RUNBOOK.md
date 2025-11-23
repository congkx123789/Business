Backup and PITR runbook (MySQL 8+)

Backups
- Enable automated daily full backups and binary log retention (>= 7 days).
- Verify backup completion and retention via provider or cron logs.

Point-in-time recovery (PITR)
1) Restore last full backup to staging target.
2) Apply binary logs up to target timestamp (`mysqlbinlog --stop-datetime`), then `mysql` apply.
3) Validate app connectivity and counts on staging.

Production restore test (quarterly)
- Execute PITR to a staging DB; run smoke tests; document restore time and steps.

Secrets
- Store DB credentials in secret manager or environment; never in repo.


