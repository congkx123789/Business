# 🚀 SelfCar Development Checklist

Quick reference guide to get your development environment up and running.

---

## ✅ Initial Setup Checklist

### 1️⃣ Prerequisites Installation

- [ ] **Node.js 18+** installed ([Download](https://nodejs.org/))
  ```bash
  node --version  # Should be v18 or higher
  ```

- [ ] **Java JDK 17+** installed ([Download](https://www.oracle.com/java/technologies/downloads/))
  ```bash
  java --version  # Should be 17 or higher
  ```

- [ ] **Maven 3.8+** installed ([Download](https://maven.apache.org/download.cgi))
  ```bash
  mvn --version  # Should be 3.8 or higher
  ```

- [ ] **MySQL 8.0+** installed and running ([Download](https://dev.mysql.com/downloads/))
  ```bash
  mysql --version  # Should be 8.0 or higher
  ```

---

### 2️⃣ Database Setup

- [ ] **Start MySQL service**
  ```bash
  # Windows (PowerShell as Admin)
  net start MySQL80
  
  # macOS
  brew services start mysql
  
  # Linux
  sudo systemctl start mysql
  ```

- [ ] **Create database and schema**
  ```bash
  cd database
  mysql -u root -p < schema.sql
  ```

- [ ] **Load sample data (recommended)**
  ```bash
  mysql -u root -p < seed_data.sql
  ```

- [ ] **Verify database created**
  ```bash
  mysql -u root -p -e "USE selfcar_db; SHOW TABLES;"
  ```
  Should show: `users`, `cars`, `bookings`

---

### 3️⃣ Backend Setup

- [ ] **Configure database credentials**
  - Open: `backend/src/main/resources/application.properties`
  - Update: `spring.datasource.username` and `spring.datasource.password`

- [ ] **Install dependencies**
  ```bash
  cd backend
  mvn clean install
  ```

- [ ] **Run backend server**
  ```bash
  mvn spring-boot:run
  ```

- [ ] **Verify backend is running**
  - Open browser: http://localhost:8080/api/cars
  - Should see JSON array of cars

---

### 4️⃣ Frontend Setup

- [ ] **Install dependencies**
  ```bash
  cd frontend
  npm install
  ```

- [ ] **Create environment file**
  ```bash
  # Copy the example file
  cp .env.example .env
  
  # Or create manually with:
  echo "VITE_API_BASE_URL=http://localhost:8080/api" > .env
  ```

- [ ] **Run frontend development server**
  ```bash
  npm run dev
  ```

- [ ] **Verify frontend is running**
  - Open browser: http://localhost:5173
  - Should see SelfCar homepage

---

## 🧪 Testing Checklist

### Test User Flow

- [ ] **Test Homepage**
  - Visit http://localhost:5173
  - Check hero section displays
  - Check features section loads
  - Click "Browse Cars" button

- [ ] **Test Car Browsing**
  - Navigate to Cars page
  - Verify cars load from database
  - Test filters (type, transmission, fuel)
  - Click on a car card

- [ ] **Test Registration**
  - Click "Sign Up" in navbar
  - Fill registration form
  - Submit and verify account creation

- [ ] **Test Login**
  - Click "Login" in navbar
  - Use credentials (or admin@selfcar.com / admin123)
  - Verify redirect to homepage
  - Check user name appears in navbar

- [ ] **Test Booking (Logged In)**
  - Browse cars
  - Click "Book Now" on a car
  - Fill booking form
  - Submit and verify booking created

- [ ] **Test User Profile**
  - Click on username in navbar
  - View profile page
  - Check booking history displays

### Test Admin Flow (Use admin@selfcar.com / admin123)

- [ ] **Test Admin Dashboard**
  - Login as admin
  - Click "Dashboard" in navbar
  - Verify statistics display

- [ ] **Test Car Management**
  - Navigate to "Cars" (admin section)
  - Create new car
  - Edit existing car
  - Delete a car (test car)
  - Toggle car availability

- [ ] **Test Booking Management**
  - Navigate to "Bookings" (admin section)
  - View all bookings
  - Update booking status
  - Filter bookings by status

---

## 🔍 Troubleshooting Checklist

### Backend Issues

- [ ] **Backend won't start**
  ```bash
  # Check if port 8080 is in use
  netstat -ano | findstr :8080  # Windows
  lsof -ti:8080  # Mac/Linux
  
  # Kill the process if needed
  taskkill /PID <PID> /F  # Windows
  kill -9 <PID>  # Mac/Linux
  ```

- [ ] **Database connection error**
  ```bash
  # Test MySQL connection
  mysql -u root -p -e "SELECT 1;"
  
  # Verify database exists
  mysql -u root -p -e "SHOW DATABASES LIKE 'selfcar_db';"
  
  # Check credentials in application.properties
  ```

- [ ] **Maven build fails**
  ```bash
  # Clear Maven cache and rebuild
  mvn clean install -U
  
  # Skip tests if needed
  mvn clean install -DskipTests
  ```

### Frontend Issues

- [ ] **npm install fails**
  ```bash
  # Clear npm cache
  npm cache clean --force
  
  # Delete node_modules and reinstall
  rm -rf node_modules package-lock.json
  npm install
  ```

- [ ] **Frontend can't connect to backend**
  - Check backend is running on port 8080
  - Verify `.env` file exists with correct API URL
  - Check browser console for errors
  - Verify CORS is configured in `application.properties`

- [ ] **Page shows blank**
  - Check browser console for errors
  - Verify all npm packages installed correctly
  - Try clearing browser cache
  - Restart Vite dev server

---

## 🎯 Daily Development Checklist

### Starting Your Day

- [ ] Pull latest code (if using Git)
- [ ] Start MySQL service
- [ ] Start backend server (Terminal 1)
- [ ] Start frontend dev server (Terminal 2)
- [ ] Open browser to http://localhost:5173

### Before Committing Code

- [ ] Test your changes manually
- [ ] Check for console errors (browser & terminal)
- [ ] Run backend tests: `mvn test`
- [ ] Run frontend linter: `npm run lint`
- [ ] Check all modified files
- [ ] Write meaningful commit message

### End of Day

- [ ] Stop frontend server (Ctrl+C)
- [ ] Stop backend server (Ctrl+C)
- [ ] Optional: Stop MySQL service (to save resources)
- [ ] Commit and push changes (if using Git)

---

## 📋 Common Development Tasks

### Adding a New Car (Admin)

1. [ ] Login as admin
2. [ ] Go to Admin → Cars
3. [ ] Click "Add New Car"
4. [ ] Fill form with car details
5. [ ] Add image URL (use Unsplash for free images)
6. [ ] Submit and verify car appears

### Creating a Test Booking

1. [ ] Login as customer
2. [ ] Browse cars
3. [ ] Select a car
4. [ ] Click "Book Now"
5. [ ] Fill booking details
6. [ ] Submit and check booking history

### Testing API Endpoints (Postman)

- [ ] Import API collection (can be created)
- [ ] Test authentication endpoints
- [ ] Test car CRUD operations
- [ ] Test booking operations
- [ ] Save commonly used requests

---

## 🛠️ Development Tools Setup (Optional but Recommended)

### VS Code Extensions

- [ ] **ES7+ React/Redux/React-Native snippets** - React snippets
- [ ] **Tailwind CSS IntelliSense** - Tailwind autocomplete
- [ ] **ESLint** - JavaScript linting
- [ ] **Prettier** - Code formatting
- [ ] **Auto Rename Tag** - HTML/JSX tag renaming
- [ ] **Path Intellisense** - File path autocomplete

### IntelliJ IDEA Plugins (for Java)

- [ ] **Lombok** - Lombok support
- [ ] **Spring Boot Assistant** - Spring Boot tools
- [ ] **Database Navigator** - Database management
- [ ] **GitToolBox** - Enhanced Git integration

### Browser Extensions

- [ ] **React Developer Tools** - React debugging
- [ ] **Redux DevTools** - State debugging (if using Redux)
- [ ] **JSON Formatter** - Pretty JSON in browser

---

## 📚 Quick Reference

### Important URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:5173 | React application |
| Backend | http://localhost:8080 | Spring Boot API |
| API Docs | http://localhost:8080/swagger-ui.html | API documentation |
| MySQL | localhost:3306 | Database |

### Default Credentials (from seed data)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@selfcar.com | admin123 |
| Customer | john.doe@example.com | password |
| Customer | jane.smith@example.com | password |

### Important Commands

```bash
# Backend
mvn spring-boot:run          # Start backend
mvn clean install            # Build project
mvn test                     # Run tests

# Frontend
npm run dev                  # Start dev server
npm run build                # Build for production
npm run lint                 # Run linter

# Database
mysql -u root -p             # Connect to MySQL
mysql -u root -p selfcar_db  # Connect to specific DB
```

---

## ✨ Feature Development Guide

### Adding a New Feature

1. [ ] **Plan the feature**
   - Define requirements
   - Design database changes (if needed)
   - Plan API endpoints
   - Sketch UI components

2. [ ] **Backend Development**
   - Update/create entity model
   - Create/update repository
   - Implement service layer
   - Create controller endpoints
   - Add validation
   - Test endpoints

3. [ ] **Frontend Development**
   - Create API service methods
   - Design UI components
   - Implement page/component
   - Add routing (if new page)
   - Handle loading/error states
   - Test user flow

4. [ ] **Testing**
   - Test backend endpoints
   - Test frontend features
   - Test integration
   - Test error scenarios
   - Test on different browsers

5. [ ] **Documentation**
   - Update API documentation
   - Add code comments
   - Update README if needed

---

## 🎓 Learning Path

### For Backend Developers

1. [ ] Understand Spring Boot project structure
2. [ ] Learn JPA entity relationships
3. [ ] Study Spring Security implementation
4. [ ] Review JWT authentication flow
5. [ ] Understand service layer pattern

### For Frontend Developers

1. [ ] Review React component structure
2. [ ] Understand React Router setup
3. [ ] Learn React Query usage
4. [ ] Study Zustand state management
5. [ ] Master Tailwind CSS utilities

### For Full-Stack Understanding

1. [ ] Follow complete user flow (registration to booking)
2. [ ] Trace API call from frontend to database
3. [ ] Understand authentication mechanism
4. [ ] Review database schema and relationships
5. [ ] Study error handling across layers

---

## 🎉 Success Criteria

Your development environment is fully set up when:

✅ Backend starts without errors on port 8080  
✅ Frontend starts without errors on port 5173  
✅ You can browse cars in the browser  
✅ You can register a new user  
✅ You can login successfully  
✅ You can create a booking  
✅ Admin can access dashboard  
✅ No console errors in browser  
✅ No exceptions in backend logs  

---

## 📞 Need Help?

1. Check `SETUP_GUIDE.md` for detailed setup instructions
2. Review `PROJECT_STRUCTURE.md` for architecture details
3. Check application logs for error messages
4. Review code comments in source files
5. Test with sample data from `seed_data.sql`

---

**Happy Coding! 🚗💨**

---

*Last Updated: November 2025*

