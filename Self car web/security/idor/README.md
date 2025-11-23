# IDOR Prevention

Objectives:
- Enforce server-side ownership checks for resource access.
- Prefer UUIDs for public identifiers.

Approach:
- Add authorization middleware/policies that verify resource ownership against the authenticated subject.
- Replace incremental IDs in URLs/APIs with UUIDv4 identifiers to reduce guessing.

Middleware examples:
- Node/Express: see `middleware/node-express.ts`
- Python/FastAPI: see `middleware/python-fastapi.py`

Tests:
- See `../../tests/example-idor-tests.md` for test outlines to prove users can only access their own resources.

Migration:
- See `migration/uuid-migration-plan.md` for planning steps.

