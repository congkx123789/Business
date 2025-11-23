# Advanced Testing Guide

This document describes the advanced testing strategies and techniques implemented in the SelfCar project.

## Overview

The advanced testing suite includes:
- **Property-Based Testing** - Tests invariants and properties
- **Mutation Testing** - Validates test quality
- **Security Testing** - Vulnerability scanning
- **Chaos Engineering** - Resilience testing
- **Performance Testing** - Load and stress testing
- **Concurrent Testing** - Race condition detection
- **Boundary Value Testing** - Edge case coverage
- **Visual Regression Testing** - UI consistency
- **Deep Accessibility Testing** - WCAG compliance

## Test Types

### 1. Property-Based Testing

**Location:** `backend/src/test/java/com/selfcar/advanced/PropertyBasedBookingTest.java`

Uses **jqwik** to test properties that should always hold:
- Booking dates should be valid (start <= end)
- Prices should be non-negative
- Booking IDs should be positive
- Concurrent bookings should not overlap

```bash
# Run property-based tests
cd backend
mvn test -Dtest=PropertyBasedBookingTest
```

### 2. Mutation Testing

**Configuration:** `pom.xml` - Pitest plugin

Mutates code to verify tests catch bugs:
- Threshold: 70% mutation score
- Tests service and controller classes

```bash
# Run mutation testing
cd backend
mvn org.pitest:pitest-maven:mutationCoverage
# View report: target/pit-reports/YYYYMMDDHHMMSS/index.html
```

### 3. Security Testing

**Location:** `backend/src/test/java/com/selfcar/advanced/SecurityVulnerabilityTest.java`

Tests for common vulnerabilities:
- SQL Injection
- XSS (Cross-Site Scripting)
- Command Injection
- Path Traversal
- LDAP Injection
- Header Injection
- Null Byte Injection

```bash
# Run security tests
mvn test -Dtest=SecurityVulnerabilityTest
```

### 4. Chaos Engineering

**Location:** `backend/src/test/java/com/selfcar/advanced/ChaosEngineeringTest.java`

Tests system resilience:
- Database constraint violations
- Corrupted data handling
- Extreme date values
- Negative/zero/very large prices
- Missing required fields
- Race conditions
- Concurrent deletions

```bash
# Run chaos tests
mvn test -Dtest=ChaosEngineeringTest
```

### 5. Performance Testing

**Location:** `backend/src/test/java/com/selfcar/advanced/PerformanceTest.java`

Measures performance metrics:
- Response time (average, P95, P99)
- Throughput (requests per second)
- Memory usage
- Performance consistency

```bash
# Run performance tests
mvn test -Dtest=PerformanceTest
```

### 6. Concurrent Execution Testing

**Location:** `backend/src/test/java/com/selfcar/advanced/ConcurrentExecutionTest.java`

Tests thread safety:
- Prevents double booking
- Handles concurrent status updates
- Mixed read-write operations
- Data consistency under load

```bash
# Run concurrent tests
mvn test -Dtest=ConcurrentExecutionTest
```

### 7. Boundary Value Testing

**Location:** `backend/src/test/java/com/selfcar/advanced/BoundaryValueTest.java`

Tests edge cases:
- Minimum/maximum booking periods
- Extreme IDs (Long.MIN_VALUE, Long.MAX_VALUE)
- Various email formats
- Zero and extreme prices
- Boundary date overlaps

```bash
# Run boundary tests
mvn test -Dtest=BoundaryValueTest
```

### 8. Frontend Advanced Testing

**Locations:**
- `frontend/src/test/advanced/VisualRegression.test.jsx`
- `frontend/src/test/advanced/AccessibilityDeep.test.jsx`
- `frontend/src/test/advanced/StressTest.jsx`

**Visual Regression:**
- Component structure consistency
- Layout verification

**Accessibility (WCAG):**
- ARIA attributes
- Keyboard navigation
- Screen reader support
- Color contrast (conceptual)

**Stress Testing:**
- Rapid form interactions
- Memory leak detection
- Large data rendering
- Event handler performance

```bash
# Run frontend advanced tests
cd frontend
npm run test:run -- VisualRegression
npm run test:run -- AccessibilityDeep
npm run test:run -- StressTest
```

## Running All Advanced Tests

### Backend

```bash
cd backend

# All advanced tests
mvn test -Dtest="**/advanced/*Test"

# Specific category
mvn test -Dtest=SecurityVulnerabilityTest
mvn test -Dtest=PerformanceTest
mvn test -Dtest=ConcurrentExecutionTest

# Mutation testing
mvn org.pitest:pitest-maven:mutationCoverage

# With coverage
mvn clean test jacoco:report
```

### Frontend

```bash
cd frontend

# All advanced tests
npm run test:run -- advanced

# Specific category
npm run test:run -- VisualRegression
npm run test:run -- AccessibilityDeep
npm run test:run -- StressTest

# With coverage
npm run test:coverage
```

## Test Metrics

### Coverage Goals
- **Line Coverage:** 70%+ (enforced)
- **Branch Coverage:** 65%+
- **Mutation Score:** 70%+

### Performance Benchmarks
- **API Response Time:** < 100ms (average)
- **P95 Response Time:** < 300ms
- **Throughput:** > 100 req/s
- **Memory Leak:** < 10MB per 100 renders

### Security
- **Zero SQL Injection vulnerabilities**
- **Zero XSS vulnerabilities**
- **Zero command injection vulnerabilities**

## Best Practices

### 1. Property-Based Testing
- Focus on invariants that should always hold
- Use generators for realistic test data
- Test edge cases automatically

### 2. Mutation Testing
- Aim for high mutation score (70%+)
- Fix tests that don't catch mutations
- Review surviving mutations

### 3. Security Testing
- Test all user inputs
- Include edge cases in payloads
- Verify error handling doesn't leak info

### 4. Chaos Engineering
- Test realistic failure scenarios
- Verify graceful degradation
- Ensure data consistency

### 5. Performance Testing
- Test under realistic load
- Measure multiple metrics
- Establish baseline performance

## Continuous Integration

Advanced tests should run:
1. On every commit (quick tests)
2. Nightly (full suite including mutation)
3. Before releases (all tests + security scan)

## Troubleshooting

### Mutation Tests Failing
- Review surviving mutations
- Add more test cases
- Check for weak tests

### Performance Tests Failing
- Check for slow queries
- Review N+1 problems
- Optimize hot paths

### Concurrent Tests Failing
- Check for race conditions
- Review transaction isolation
- Verify locking strategy

## Future Enhancements

1. **Contract Testing** - API contract validation with Pact
2. **Fuzz Testing** - Random input generation
3. **Load Testing** - Realistic traffic simulation
4. **End-to-End Chaos** - Full system failure scenarios
5. **Visual Regression** - Screenshot comparison
6. **Accessibility Automation** - Automated WCAG checks

## Resources

- [jqwik Documentation](https://jqwik.net/)
- [Pitest Documentation](https://pitest.org/)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [Chaos Engineering Principles](https://principlesofchaos.org/)

