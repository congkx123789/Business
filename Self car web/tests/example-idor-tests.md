# IDOR Test Outlines

Scenarios:
- User A cannot access User B's resource by guessing UUID
- User A receives 403 for non-owned resource; 404 for non-existent
- Admin role can access any resource per policy

Given:
- Authenticated user context with subject_id
- API endpoints like /api/orders/{orderId}

Checks:
- GET returns 200 for own resource; 403 for other user's resource; 404 for random UUID
- PUT/DELETE follow the same enforcement

