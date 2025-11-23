# 🚀 SelfCar - Run Scripts Guide

This guide explains how to use the provided scripts to run the entire project, tests, and individual components.

## 📋 Available Scripts

### 1. **Run Without Tests** (`run-without-tests.ps1`) ⭐ RECOMMENDED
Starts backend and frontend servers only - perfect for viewing your project quickly!

```powershell
.\run-without-tests.ps1
```

**What it does:**
- ✅ Checks prerequisites (Node.js, Java, Maven)
- ✅ Starts backend server (http://localhost:8080)
- ✅ Starts frontend server (http://localhost:5173)
- ✅ Shows URLs and credentials
- ⚠️ Does NOT run tests

**Use this when:** You just want to see your project running!

---

### 2. **Run Everything** (`run-all.ps1`)
Runs all tests and starts both backend and frontend servers.

```powershell
.\run-all.ps1
```

**What it does:**
- ✅ Checks prerequisites (Node.js, Java, Maven)
- ✅ Runs backend tests
- ✅ Runs frontend tests
- ✅ Starts backend server (http://localhost:8080)
- ✅ Starts frontend server (http://localhost:5173)

---

### 2. **Run All Tests** (`run-tests.ps1`)
Runs both backend and frontend test suites.

```powershell
.\run-tests.ps1
```

**What it does:**
- ✅ Runs backend Maven tests
- ✅ Runs frontend Vitest unit tests
- ⚠️ Returns exit code 0 if all pass, 1 if any fail

---

### 3. **Run Backend** (`run-backend.ps1`)
Starts only the Spring Boot backend server.

```powershell
.\run-backend.ps1
```

**What it does:**
- ✅ Starts backend on http://localhost:8080
- ✅ API available at http://localhost:8080/api
- ✅ Swagger UI at http://localhost:8080/swagger-ui.html

---

### 4. **Run Frontend** (`run-frontend.ps1`)
Starts only the React frontend development server.

```powershell
.\run-frontend.ps1
```

**What it does:**
- ✅ Installs dependencies if needed
- ✅ Starts frontend on http://localhost:5173
- ✅ Hot module replacement enabled

---

### 5. **Run Backend Tests** (`run-backend-tests.ps1`)
Runs only the backend test suite.

```powershell
.\run-backend-tests.ps1
```

**What it does:**
- ✅ Runs Maven tests (`mvn test`)
- ✅ Shows test results and coverage

---

### 6. **Run Frontend Tests** (`run-frontend-tests.ps1`)
Runs only the frontend test suite.

```powershell
.\run-frontend-tests.ps1
```

**What it does:**
- ✅ Installs dependencies if needed
- ✅ Runs Vitest unit tests (`npm run test:run`)
- 💡 Note: E2E tests not included (use `npm run test:e2e` in frontend folder)

---

## 🎯 Quick Start

### First Time Setup
1. Make sure you have:
   - ✅ Node.js 18+
   - ✅ Java 17+
   - ✅ Maven 3.8+
   - ✅ MySQL 8.0+ (database must be set up)

2. Set up the database:
   ```bash
   cd database
   mysql -u root -p < schema.sql
   mysql -u root -p < seed_data.sql
   ```

3. Configure backend:
   - Edit `backend/src/main/resources/application.properties`
   - Set your MySQL password

### Run Everything
```powershell
.\run-all.ps1
```

This will:
1. Run all tests
2. Start backend (opens in new window)
3. Start frontend (opens in new window)

---

## 🧪 Testing

### Run All Tests
```powershell
.\run-tests.ps1
```

### Run Tests Separately
```powershell
# Backend tests only
.\run-backend-tests.ps1

# Frontend tests only
.\run-frontend-tests.ps1
```

### Frontend E2E Tests
```powershell
cd frontend
npm run test:e2e
```

### Frontend Test UI (Interactive)
```powershell
cd frontend
npm run test:ui
```

---

## 🔧 Development Workflow

### Option 1: Run Everything in One Command
```powershell
.\run-all.ps1
```

### Option 2: Run Separately (Recommended for Development)
```powershell
# Terminal 1 - Backend
.\run-backend.ps1

# Terminal 2 - Frontend
.\run-frontend.ps1

# Terminal 3 - Tests (when needed)
.\run-tests.ps1
```

---

## 🐛 Troubleshooting

### "Script execution is disabled"
Run this in PowerShell as Administrator:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### "Port already in use"
- Backend (8080): Check if Spring Boot is already running
- Frontend (5173): Check if Vite is already running

Kill processes on Windows:
```powershell
# Find process on port 8080
netstat -ano | findstr :8080
# Kill process (replace <PID> with actual PID)
taskkill /PID <PID> /F
```

### "Cannot connect to database"
- Make sure MySQL is running
- Verify database exists: `selfcar_db`
- Check credentials in `backend/src/main/resources/application.properties`

### "npm install fails"
```powershell
cd frontend
npm cache clean --force
rm -r node_modules, package-lock.json
npm install
```

---

## 📝 Notes

- **Backend**: Requires MySQL database to be set up and running
- **Frontend**: Automatically installs dependencies if `node_modules` doesn't exist
- **Tests**: Backend uses Maven Surefire, Frontend uses Vitest
- **E2E Tests**: Require both backend and frontend to be running

---

## 🎉 Happy Coding!

For more information:
- `README.md` - Project overview
- `QUICK_START.md` - Quick setup guide
- `SETUP_GUIDE.md` - Detailed setup instructions

