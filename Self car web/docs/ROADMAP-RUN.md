# 🗺️ SelfCar Project - Run Roadmap

This roadmap guides you through running the entire project in the correct order.

---

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- ✅ **Node.js 18+** - `node --version`
- ✅ **Java 17+** - `java --version`
- ✅ **Maven 3.8+** - `mvn --version`
- ✅ **MySQL 8.0+** - `mysql --version`
- ✅ **Database created** - `selfcar_db` database exists

---

## 🗺️ Roadmap: Step-by-Step Execution

### **STEP 1: Database Setup** (First time only)

```bash
# 1. Start MySQL service (Windows)
net start MySQL80

# 2. Create database and tables
cd database
mysql -u root -p < schema.sql
mysql -u root -p < seed_data.sql
cd ..
```

✅ **Verify:** `mysql -u root -p -e "USE selfcar_db; SHOW TABLES;"`  
Should show: `bookings`, `cars`, `users`

---

### **STEP 2: Configure Backend** (First time only)

```bash
# Edit backend/src/main/resources/application.properties
# Update MySQL password:
# spring.datasource.password=YOUR_MYSQL_PASSWORD
```

---

### **STEP 3: Install Frontend Dependencies** (First time only)

```bash
cd frontend
npm install
cd ..
```

---

### **STEP 4: Start Backend Server**

**Option A: Using Script (Recommended)**
```powershell
.\run-backend.ps1
```

**Option B: Manual**
```bash
cd backend
mvn spring-boot:run
```

**Wait for:** 
```
Started SelfCarBackendApplication in X.XXX seconds
```

✅ **Verify:** Open browser → http://localhost:8080/api/cars  
Should return JSON array of cars

📍 **Backend running on:** http://localhost:8080  
📍 **API Docs:** http://localhost:8080/swagger-ui.html

---

### **STEP 5: Start Frontend Server** (New Terminal)

**Option A: Using Script (Recommended)**
```powershell
.\run-frontend.ps1
```

**Option B: Manual**
```bash
cd frontend
npm run dev
```

**Wait for:**
```
VITE v5.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
```

✅ **Verify:** Open browser → http://localhost:5173  
Should see SelfCar homepage

📍 **Frontend running on:** http://localhost:5173

---

### **STEP 6: Run All Tests** (After services are running)

**Option A: Using Script (Recommended)**
```powershell
# Open a new terminal and run:
.\run-tests.ps1
```

**Option B: Manual - Backend Tests**
```bash
cd backend
mvn test
cd ..
```

**Option B: Manual - Frontend Tests**
```bash
cd frontend
npm run test:run
cd ..
```

**Option B: Manual - Frontend E2E Tests** (Optional)
```bash
cd frontend
npm run test:e2e
cd ..
```

---

## 🎯 Quick Command Summary

### **⭐ Run Tests Then Start Project (Recommended)**
```powershell
# Runs tests → If pass → Starts backend → Starts frontend
.\run-tests-then-start.ps1
```
**Perfect when:** You want to run tests first, then use your project!

### **Run Project WITHOUT Tests (See Your Project Quickly)**
```powershell
# Just start backend and frontend - no tests
.\run-without-tests.ps1
```

### **Run Everything Automatically (With Tests)**
```powershell
# This will: start backend → start frontend → run tests
.\run-project.ps1
```

### **Run Everything At Once (Alternative)**
```powershell
# This will: run tests → start backend → start frontend
.\run-all.ps1
```

### **Manual Step-by-Step (Recommended for Development)**

```powershell
# Terminal 1 - Backend
.\run-backend.ps1

# Terminal 2 - Frontend (wait for backend to start first)
.\run-frontend.ps1

# Terminal 3 - Tests (after both are running)
.\run-tests.ps1
```

---

## ✅ Verification Checklist

After following the roadmap, verify:

- [ ] Backend server running on http://localhost:8080
- [ ] Backend API responding: http://localhost:8080/api/cars
- [ ] Frontend server running on http://localhost:5173
- [ ] Frontend homepage loads successfully
- [ ] All backend tests pass
- [ ] All frontend tests pass
- [ ] Can login with test credentials:
  - Admin: `admin@selfcar.com` / `admin123`
  - Customer: `john.doe@example.com` / `password`

---

## 🔄 Development Workflow

### Daily Development

1. **Start Backend** → `.\run-backend.ps1`
2. **Start Frontend** → `.\run-frontend.ps1`
3. **Make changes** → Auto-reload enabled
4. **Run tests** → `.\run-tests.ps1` (when needed)

### Before Committing Code

1. ✅ Run all tests: `.\run-tests.ps1`
2. ✅ Fix any failing tests
3. ✅ Verify both servers still work
4. ✅ Commit changes

---

## 🐛 Troubleshooting

### Backend won't start
- ✅ Check MySQL is running
- ✅ Verify database exists
- ✅ Check application.properties credentials
- ✅ Port 8080 not in use

### Frontend won't start
- ✅ Run `npm install` in frontend folder
- ✅ Port 5173 not in use
- ✅ Node.js version is 18+

### Tests failing
- ✅ Backend tests: Ensure database is accessible
- ✅ Frontend tests: Ensure dependencies installed
- ✅ E2E tests: Ensure both backend and frontend are running

---

## 📊 Project Status Dashboard

After running, check these URLs:

| Service | URL | Status |
|---------|-----|--------|
| Backend API | http://localhost:8080/api/cars | ✅ Running |
| Backend Swagger | http://localhost:8080/swagger-ui.html | ✅ Running |
| Frontend App | http://localhost:5173 | ✅ Running |
| Frontend Login | http://localhost:5173/login | ✅ Running |

---

## 🎉 Success!

If everything is running:
- ✅ Backend: http://localhost:8080
- ✅ Frontend: http://localhost:5173
- ✅ Tests: All passing

**You're ready to develop! 🚀**

---

## 📚 Additional Resources

- **Quick Start:** `QUICK_START.md`
- **Scripts Guide:** `README-SCRIPTS.md`
- **Setup Guide:** `SETUP_GUIDE.md`
- **Testing Guide:** `backend/TESTING_GUIDE.md`

---

**Need help?** Check troubleshooting sections in `SETUP_GUIDE.md`


