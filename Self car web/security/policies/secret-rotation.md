# Secret Rotation Policy (90-Day)

Scope: All non-expiring credentials (DB, API keys, tokens) not auto-rotated by provider.

Requirements:
- Maximum lifetime: 90 days; rotate earlier if exposure is suspected.
- Dual keys where supported to allow seamless rotation (old+new overlap < 7 days).
- Immediately revoke leaked credentials; document incident linkage.
- Record rotation in a change log (date, owner, secret id, method).

Process:
1) Create a new version of the secret in the centralized store.
2) Update applications to reference the new version/alias.
3) Validate functionality in staging, then production.
4) Remove old version after overlap window.

Ownership:
- Each service team owns their secrets and rotation cadence.
- Security reviews compliance quarterly via audit logs.

