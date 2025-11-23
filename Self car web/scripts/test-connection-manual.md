# Manual Backend-Frontend Connection Test

## Quick Test Steps

### 1. Verify Servers Are Running

**Backend Check:**
```powershell
# In browser or PowerShell:
Invoke-WebRequest -Uri "http://localhost:8080/api/health"
```

**Frontend Check:**
```powershell
# In browser or PowerShell:
Invoke-WebRequest -Uri "http://localhost:5173"
```

### 2. Test Backend API Directly

Open browser and visit:
- **Health Check:** http://localhost:8080/api/health
- **Cars API:** http://localhost:8080/api/cars
- **Available Cars:** http://localhost:8080/api/cars/available

### 3. Test Frontend Connection

Open browser and visit:
- **Frontend:** http://localhost:5173

Then open browser console (F12) and check:
- No CORS errors
- API calls are successful
- Network tab shows requests to `http://localhost:8080/api/...`

### 4. Test Authentication Flow

1. Open http://localhost:5173
2. Go to Login page
3. Enter credentials:
   - Email: `admin@selfcar.com`
   - Password: `admin123`
4. Check browser console for:
   - Successful login API call
   - Token received
   - No errors

### 5. Configuration Check

**Frontend API Configuration:**
- File: `frontend/src/services/api.js`
- Expected: `http://localhost:8080/api`

**Vite Proxy Configuration:**
- File: `frontend/vite.config.js`
- Proxy: `/api` -> `http://localhost:8080`

**Backend CORS Configuration:**
- File: `backend/src/main/resources/application.properties`
- Allowed Origins: `http://localhost:5173`

## Troubleshooting

### Backend Not Starting
- Check backend PowerShell window for errors
- Verify Java is installed: `java -version`
- Verify Maven is installed: `mvn -version`
- Check database connection (if using MySQL)

### Frontend Not Starting
- Check frontend PowerShell window for errors
- Verify Node.js is installed: `node -version`
- Install dependencies: `cd frontend && npm install`

### Connection Issues
- Verify both servers are running
- Check firewall settings
- Verify ports are not blocked:
  - Backend: 8080
  - Frontend: 5173

### CORS Errors
- Verify backend CORS configuration allows `http://localhost:5173`
- Check Vite proxy configuration
- Ensure frontend uses correct API base URL

