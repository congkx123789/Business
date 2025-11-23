Edge bot management and safe releases

Bot management
- Enable bot mitigation at CDN (challenge/JS/CAPTCHA) for /auth/* and /callback/*.
- Add tuned rate limits by IP and user: strict on /auth/*, moderate on search.
- Allowlist provider IPs for webhooks; block others.

Read replicas and ETL
- Route reporting/ETL to read replicas; avoid impacting primary.
- Prefer async projections via outbox to decouple.

Blue/green or canary deploys
- Use two stacks behind a load balancer; shift traffic gradually.
- For schema changes, use expand-and-contract pattern; keep backward compatible for one release cycle.
- Automate health checks and rollback on error budgets.

Chaos tests
- Simulate indexer/outbox consumer downtime; verify at-least-once and idempotent processing on recovery.
- Use fixed-size batch publishing and dead-letter strategy for repeated failures.


