# Unused Imports Fix Roadmap

## Issue
Unused imports in Java test files causing linter warnings.

## Current Status
✅ **Fixed**: `DashboardServiceTest.java`
- Removed unused `java.util.HashMap` import
- Removed unused `org.junit.jupiter.api.BeforeEach` import

## Roadmap

### Phase 1: Identify All Unused Imports (Scan)
1. Run linter/compiler on entire test directory
2. Identify all files with unused import warnings
3. Categorize by type:
   - Unused test annotations (`@BeforeEach`, `@AfterEach`, etc.)
   - Unused utility classes (`HashMap`, `ArrayList`, etc.)
   - Unused Spring annotations
   - Unused mockito imports

### Phase 2: Automated Cleanup (Recommended)
1. **Option A: IDE Auto-format**
   - Use IDE "Optimize Imports" feature
   - Most IDEs can automatically remove unused imports

2. **Option B: Maven Plugin**
   - Use `maven-checkstyle-plugin` or similar
   - Configure to fail on unused imports (for CI/CD)

3. **Option C: Gradle Checkstyle Plugin** (if using Gradle)

### Phase 3: Manual Fix (If Needed)
For files requiring manual review:
1. Review each unused import
2. Verify it's truly unused (not needed for future code)
3. Remove import
4. Run tests to verify nothing breaks

### Phase 4: Prevention
1. Configure IDE to auto-remove unused imports on save
2. Add pre-commit hook to check for unused imports
3. Add CI/CD check for unused imports

## Quick Fix Command
```bash
# Using IntelliJ IDEA (if available via command line)
# Or use IDE's "Optimize Imports" feature

# Maven checkstyle (if configured)
mvn checkstyle:check
```

## Files to Check (Potential Candidates)
Based on patterns observed:
- All test files in `backend/src/test/java/com/selfcar/`
- Service test files
- Controller test files
- Integration test files
- Advanced test files

## Verification Steps
After fixing:
1. ✅ Run linter: No unused import warnings
2. ✅ Run tests: All tests pass
3. ✅ Compile: No compilation errors

---

**Current Fix**: DashboardServiceTest.java - Removed `HashMap` and `BeforeEach` imports ✅

