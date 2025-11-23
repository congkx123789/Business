# Baseline Security Review Checklist

Mapping: OWASP Top 10, CWE Top 25

Areas:
- AuthN/AuthZ and session management
- Input validation and output encoding
- Secrets handling and configuration
- Data access and multi-tenancy
- Payment processing flows
- User profile flows
- Orders flows

Checks:
- Access control: server-side checks for ownership and role-based access
- IDOR: no direct access by user-controllable identifiers
- CSRF/XSS/Injection mitigations present and tested
- Passwords/tokens: secure storage, rotation, and transport
- Logging and monitoring of security events
- 3rd-party dependencies: reviewed and updated
- Error handling: no sensitive data leakage

Findings template:
- Issue
- Impact (High/Med/Low)
- Evidence (code refs)
- CWE/OWASP mapping
- Fix recommendation

