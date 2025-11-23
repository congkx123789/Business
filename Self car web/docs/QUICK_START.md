# ⚡ SelfCar - Quick Start Guide

Get up and running in 5 minutes! 🚀

---

## 🎯 Prerequisites Check

Run these commands to verify installations:

```bash
node --version    # Should be v18+
java --version    # Should be 17+
mvn --version     # Should be 3.8+
mysql --version   # Should be 8.0+
```

If any are missing, see `SETUP_GUIDE.md` for installation links.

---

## 🚀 3-Step Setup

### Step 1: Database (2 minutes)

```bash
# Start MySQL
net start MySQL80              # Windows
brew services start mysql      # macOS

# Create database and load data
cd database
mysql -u root -p < schema.sql
mysql -u root -p < seed_data.sql
```

✅ **Test:** `mysql -u root -p -e "USE selfcar_db; SHOW TABLES;"`  
Should show: `bookings`, `cars`, `users`

---

### Step 2: Backend (1 minute)

```bash
cd backend

# Update password in: src/main/resources/application.properties
# Change: spring.datasource.password=YOUR_MYSQL_PASSWORD

# Start backend
mvn spring-boot:run
```

✅ **Test:** Open browser → http://localhost:8080/api/cars  
Should show JSON array of cars

---

### Step 3: Frontend (1 minute)

```bash
cd frontend

# Install & start
npm install
npm run dev
```

✅ **Test:** Open browser → http://localhost:5173  
Should see SelfCar homepage

---

## 🎉 You're Done!

### Test Login

**Admin Access:**
- Email: `admin@selfcar.com`
- Password: `admin123`

**Customer Access:**
- Email: `john.doe@example.com`
- Password: `password`

---

## 🔧 Troubleshooting

### "Cannot connect to database"
```bash
# Verify MySQL is running
mysql -u root -p -e "SELECT 1;"

# Check database exists
mysql -u root -p -e "SHOW DATABASES LIKE 'selfcar_db';"
```

### "Port 8080 already in use"
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:8080 | xargs kill -9
```

### "npm install fails"
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Next Steps

1. **Read Documentation**
   - `README.md` - Project overview
   - `SETUP_GUIDE.md` - Detailed setup
   - `PROJECT_STRUCTURE.md` - Code structure
   - `ARCHITECTURE.md` - System design

2. **Explore Features**
   - Browse cars
   - Create booking
   - Try admin dashboard
   - Check booking history

3. **Start Development**
   - See `DEVELOPMENT_CHECKLIST.md`
   - Check `PROJECT_STRUCTURE.md`
   - Review code comments

---

## 💡 Tips

- Keep 2 terminals open (backend + frontend)
- Use browser DevTools for debugging
- Check console logs for errors
- Test with sample data from seed_data.sql

---

## 🆘 Still Having Issues?

1. Check all services are running
2. Verify ports 3306, 8080, 5173 are free
3. Review error messages in console
4. See `SETUP_GUIDE.md` troubleshooting section

---

**Happy Coding! 🚗💨**

Need detailed info? → See `SETUP_GUIDE.md`

