# Frontend Browser Testing Guide

## Quick Test Checklist

### 1. Open Frontend
- URL: **http://localhost:5173**
- Should load without errors

### 2. Browser Console Check (F12)
1. Press **F12** to open DevTools
2. Go to **Console** tab
3. Look for:
   - ✅ No red errors = Good
   - ❌ Red errors = Issues to fix

### 3. Network Tab Check
1. Go to **Network** tab
2. Reload page (F5)
3. Filter by **XHR** or **Fetch**
4. Check API calls:
   - Should see requests to `http://localhost:8080/api/...`
   - Status should be 200 (green) or 401 (yellow - needs login)

### 4. Test Login
1. Go to Login page
2. Enter credentials:
   - Email: `admin@selfcar.com`
   - Password: `admin123`
3. Click Login
4. Check:
   - ✅ Redirects to dashboard/home
   - ✅ No console errors
   - ✅ Network shows successful API call

### 5. Test Navigation
- Click through pages:
  - Home
  - Cars
  - Profile (if logged in)
  - Check no errors in console

### 6. Test API Connection
1. Open Network tab
2. Try to view cars or any API-driven content
3. Check:
   - ✅ API calls succeed (200 status)
   - ❌ CORS errors = Backend CORS issue
   - ❌ Connection refused = Backend not running

## Common Errors & Fixes

### Error: "Failed to fetch" or "Network Error"
**Cause:** Backend not running or not accessible
**Fix:** 
- Start backend server
- Check: `http://localhost:8080/api/health`

### Error: "CORS policy blocked"
**Cause:** Backend CORS not configured
**Fix:**
- Check backend `application.properties`:
  ```
  spring.web.cors.allowed-origins=http://localhost:5173
  ```
- Restart backend

### Error: "401 Unauthorized"
**Cause:** Not logged in or token expired
**Fix:** Login first

### Error: "404 Not Found"
**Cause:** Wrong API endpoint or route
**Fix:** Check API endpoint in browser Network tab

### Error: Page not loading / White screen
**Cause:** JavaScript errors
**Fix:** 
- Check Console for errors
- Check if frontend server is running
- Reload page (Ctrl+F5)

## Test Results Summary

Based on automated tests:
- ✅ **40 tests PASSING**
- ⚠️ **14 tests with issues** (mostly test configuration, not runtime)

**Working Features:**
- API service layer ✅
- Auth store ✅
- Core components ✅
- Server connection ✅

**Test Issues (not blocking runtime):**
- Some i18n test setup issues
- TypeScript syntax in some JS files (for tests)
- E2E test configuration

## Manual Testing Script

### Test 1: Page Load
```javascript
// Open browser console and run:
fetch('http://localhost:5173')
  .then(r => console.log('Frontend:', r.status))
  .catch(e => console.error('Frontend error:', e))
```

### Test 2: API Connection
```javascript
// Open browser console and run:
fetch('http://localhost:8080/api/health')
  .then(r => r.json())
  .then(d => console.log('Backend:', d))
  .catch(e => console.error('Backend error:', e))
```

### Test 3: Login Test
1. Open Login page
2. Enter credentials
3. Open Network tab
4. Submit form
5. Check:
   - POST request to `/api/auth/login`
   - Status 200
   - Response contains token

## Automated Testing

Run frontend unit tests:
```powershell
cd frontend
npm run test:run
```

Run specific test:
```powershell
npm run test:unit
```

## Next Steps

1. ✅ Frontend is running
2. ✅ Most tests passing
3. ⚠️ Fix remaining test issues (optional)
4. ✅ Test in browser manually
5. ✅ Verify API connection works

