# 🚀 START HERE - Run Your Project

## 🗺️ Simple Roadmap

```
STEP 1: Start Backend    →  http://localhost:8080
STEP 2: Start Frontend   →  http://localhost:5173  
STEP 3: Run Tests        →  ✅ All passing
```

---

## ⚡ One Command (Easiest)

### ⭐ Run Tests Then Start Project (Recommended)
```powershell
.\run-tests-then-start.ps1
```
**This will:**
1. ✅ Run all tests (backend + frontend)
2. ✅ If tests pass → Start Backend
3. ✅ Start Frontend  
4. ✅ Open in browser at http://localhost:5173

**Perfect when you want:** Tests → Then use your project!

### Run Project Without Tests (Fast - Skip Tests)
```powershell
.\run-without-tests.ps1
```
**This will:**
1. ✅ Start Backend
2. ✅ Start Frontend  
3. ✅ Open in browser

### Run Tests Only
```powershell
.\run-tests.ps1
```
Runs all tests without starting servers.

---

## 📋 Manual Steps (If you prefer control)

### Step 1: Start Backend
```powershell
.\run-backend.ps1
```
**Wait for:** "Started SelfCarBackendApplication"  
**Verify:** Open http://localhost:8080/api/cars

### Step 2: Start Frontend (New Terminal)
```powershell
.\run-frontend.ps1
```
**Wait for:** "Local: http://localhost:5173/"  
**Verify:** Open http://localhost:5173

### Step 3: Run Tests (New Terminal)
```powershell
.\run-tests.ps1
```
**Wait for:** All tests to complete

---

## ✅ Success Checklist

After running, you should have:

- [ ] ✅ Backend running on http://localhost:8080
- [ ] ✅ Frontend running on http://localhost:5173
- [ ] ✅ All tests passing
- [ ] ✅ Can access the application in browser

---

## 📖 Need More Details?

- **Full Roadmap:** See `ROADMAP-RUN.md`
- **Script Guide:** See `README-SCRIPTS.md`
- **Quick Start:** See `QUICK_START.md`

---

## 🎯 That's It!

Run `.\run-project.ps1` and you're done! 🎉


