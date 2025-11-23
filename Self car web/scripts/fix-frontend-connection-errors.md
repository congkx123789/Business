# Common Frontend Connection Errors & Solutions

## Error Types and Fixes

### 1. CORS Error (Cross-Origin Resource Sharing)

**Error Message:**
```
Access to fetch at 'http://localhost:8080/api/...' from origin 'http://localhost:5173' 
has been blocked by CORS policy
```

**Solution:**
1. Check backend CORS configuration in `backend/src/main/resources/application.properties`:
   ```properties
   spring.web.cors.allowed-origins=http://localhost:5173
   spring.web.cors.allowed-methods=GET,POST,PUT,DELETE,PATCH,OPTIONS
   spring.web.cors.allowed-headers=*
   spring.web.cors.allow-credentials=true
   ```

2. Verify SecurityConfig.java has CORS configured (already configured)

3. If using Vite proxy, ensure proxy is configured in `frontend/vite.config.js`:
   ```js
   proxy: {
     '/api': {
       target: 'http://localhost:8080',
       changeOrigin: true,
       secure: false,
     }
   }
   ```

### 2. Network Error / Connection Refused

**Error Message:**
```
Network Error
Failed to fetch
ERR_CONNECTION_REFUSED
```

**Solution:**
1. Verify backend is running:
   ```powershell
   Invoke-WebRequest -Uri "http://localhost:8080/api/health"
   ```

2. Check if backend port is listening:
   ```powershell
   Get-NetTCPConnection -LocalPort 8080
   ```

3. Restart backend server if needed

### 3. 401 Unauthorized Error

**Error Message:**
```
401 Unauthorized
Request failed with status code 401
```

**Solution:**
1. This is normal for protected endpoints without auth
2. Login first to get a token
3. Check if token is being sent in headers:
   - Open browser DevTools (F12)
   - Network tab → Check request headers
   - Look for `Authorization: Bearer <token>`

### 4. 404 Not Found Error

**Error Message:**
```
404 Not Found
Request failed with status code 404
```

**Solution:**
1. Verify API endpoint exists in backend
2. Check API base URL matches:
   - Frontend uses: `http://localhost:8080/api`
   - Check `frontend/src/services/api.js`
3. Verify backend route mapping

### 5. Timeout Error

**Error Message:**
```
timeout of 30000ms exceeded
```

**Solution:**
1. Backend might be slow to respond
2. Check backend logs for errors
3. Increase timeout in `frontend/src/services/api.js` if needed

### 6. CSP (Content Security Policy) Error

**Error Message:**
```
Refused to connect to 'http://localhost:8080' because it violates 
the following Content Security Policy directive
```

**Solution:**
1. Check `frontend/vite.config.js` CSP configuration
2. Ensure `connect-src` includes `http://localhost:8080`:
   ```js
   `connect-src 'self' http://localhost:8080`
   ```

## Quick Diagnostic Steps

### Step 1: Check if servers are running
```powershell
# Run the diagnostic script
.\scripts\diagnose-frontend-connection.ps1
```

### Step 2: Test backend directly
Open browser: `http://localhost:8080/api/health`

### Step 3: Test frontend
Open browser: `http://localhost:5173`

### Step 4: Check browser console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for red error messages
4. Copy the exact error message

### Step 5: Check Network tab
1. Open browser DevTools (F12)
2. Go to Network tab
3. Filter by "XHR" or "Fetch"
4. Click on failed requests
5. Check:
   - Request URL
   - Request Headers
   - Response Headers
   - Response Body

## Common Configuration Issues

### Issue: API URL mismatch
**Check:** `frontend/src/services/api.js`
- Should be: `http://localhost:8080/api`
- Or use Vite proxy: `/api` (will proxy to backend)

### Issue: CORS not allowing credentials
**Check:** Backend `SecurityConfig.java`
- `setAllowCredentials(true)` must be set
- Frontend must send `credentials: 'include'` in requests

### Issue: Vite proxy not working
**Check:** `frontend/vite.config.js`
- Proxy configuration must be correct
- Restart Vite dev server after changes

## Testing the Connection

### Test 1: Direct Backend Test
```powershell
Invoke-WebRequest -Uri "http://localhost:8080/api/cars"
```

### Test 2: Frontend Proxy Test
```powershell
Invoke-WebRequest -Uri "http://localhost:5173/api/cars"
```

### Test 3: Browser Test
1. Open `http://localhost:5173`
2. Open DevTools (F12)
3. Try to login
4. Check Network tab for API calls

## Still Having Issues?

Share the exact error message from browser console and I can help fix it!

