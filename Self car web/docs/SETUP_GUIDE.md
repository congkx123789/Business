# SelfCar - Complete Setup Guide

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### Required Software
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Java JDK** (v17 or higher) - [Download](https://www.oracle.com/java/technologies/downloads/)
- **Maven** (v3.8 or higher) - [Download](https://maven.apache.org/download.cgi)
- **MySQL** (v8.0 or higher) - [Download](https://dev.mysql.com/downloads/)
- **Git** - [Download](https://git-scm.com/downloads)

### Optional Tools
- **Postman** - For API testing
- **MySQL Workbench** - For database management
- **VS Code** or **IntelliJ IDEA** - For development

---

## 🚀 Quick Start

### 1. Database Setup

#### Step 1: Start MySQL
```bash
# On Windows (Run as Administrator)
net start MySQL80

# On macOS/Linux
sudo systemctl start mysql
```

#### Step 2: Create Database and Load Schema
```bash
# Navigate to database folder
cd database

# Create database and schema
mysql -u root -p < schema.sql

# Load sample data (optional but recommended)
mysql -u root -p < seed_data.sql
```

Default admin credentials after loading seed data:
- Email: `admin@selfcar.com`
- Password: `admin123`

---

### 2. Backend Setup

#### Step 1: Configure Database Connection
```bash
cd backend/src/main/resources
```

Edit `application.properties`:
```properties
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

#### Step 2: Install Dependencies and Run
```bash
# From backend directory
cd backend

# Clean and install dependencies
mvn clean install

# Run the application
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

#### Verify Backend is Running
Open browser and visit: `http://localhost:8080/api/cars`
You should see a JSON response with car data.

---

### 3. Frontend Setup

#### Step 1: Install Dependencies
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
```

#### Step 2: Configure Environment
Create `.env` file in frontend directory:
```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_NAME=SelfCar
```

#### Step 3: Run Development Server
```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

---

## 🎯 Testing the Application

### 1. Open Browser
Navigate to `http://localhost:5173`

### 2. Test User Registration
1. Click "Sign Up"
2. Fill in registration form
3. Submit to create account

### 3. Test Car Browsing
1. Click "Cars" in navigation
2. Browse available cars
3. Use filters to search

### 4. Test Admin Panel (with seed data)
1. Login with admin credentials
2. Navigate to Dashboard
3. Manage cars and bookings

---

## 📁 Project Structure

```
self-car-web/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   │   ├── Layout/      # Layout components
│   │   │   ├── Cars/        # Car components
│   │   │   └── Admin/       # Admin components
│   │   ├── pages/           # Page components
│   │   │   ├── Admin/       # Admin pages
│   │   │   ├── Home.jsx
│   │   │   ├── Cars.jsx
│   │   │   ├── Login.jsx
│   │   │   └── ...
│   │   ├── services/        # API services
│   │   ├── store/           # State management
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # Entry point
│   ├── public/              # Static assets
│   ├── package.json         # Dependencies
│   └── vite.config.js       # Vite configuration
│
├── backend/                  # Spring Boot application
│   ├── src/main/java/com/selfcar/
│   │   ├── config/          # Configuration classes
│   │   ├── controller/      # REST controllers
│   │   ├── dto/             # Data Transfer Objects
│   │   ├── exception/       # Exception handlers
│   │   ├── model/           # Entity models
│   │   ├── repository/      # Data repositories
│   │   ├── security/        # Security & JWT
│   │   ├── service/         # Business logic
│   │   └── SelfCarApplication.java
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   └── application-*.properties
│   └── pom.xml              # Maven dependencies
│
├── database/                 # Database files
│   ├── schema.sql           # Database schema
│   ├── seed_data.sql        # Sample data
│   └── README.md            # Database documentation
│
└── README.md                # Project overview
```

---

## 🔧 Common Issues and Solutions

### Backend Issues

#### Issue: "Cannot connect to database"
**Solution:**
```bash
# Check MySQL is running
mysqladmin -u root -p status

# Verify database exists
mysql -u root -p -e "SHOW DATABASES;"

# Check credentials in application.properties
```

#### Issue: "Port 8080 already in use"
**Solution:**
```bash
# Kill process using port 8080 (Windows)
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Kill process using port 8080 (Mac/Linux)
lsof -ti:8080 | xargs kill -9
```

#### Issue: "Maven build fails"
**Solution:**
```bash
# Clear Maven cache
mvn clean install -U

# Skip tests if needed
mvn clean install -DskipTests
```

### Frontend Issues

#### Issue: "npm install fails"
**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Issue: "Cannot connect to backend"
**Solution:**
1. Check backend is running on port 8080
2. Verify VITE_API_BASE_URL in .env file
3. Check browser console for CORS errors

---

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Cars (Public)
- `GET /api/cars` - Get all cars
- `GET /api/cars/{id}` - Get car by ID
- `GET /api/cars/available` - Get available cars

### Cars (Admin Only)
- `POST /api/cars` - Create car
- `PUT /api/cars/{id}` - Update car
- `DELETE /api/cars/{id}` - Delete car

### Bookings (Authenticated)
- `GET /api/bookings/user` - Get user bookings
- `POST /api/bookings` - Create booking
- `DELETE /api/bookings/{id}` - Cancel booking

### Bookings (Admin Only)
- `GET /api/bookings` - Get all bookings
- `PATCH /api/bookings/{id}/status` - Update status

### Dashboard (Admin Only)
- `GET /api/dashboard/stats` - Get statistics

---

## 🔐 Security Features

1. **JWT Authentication** - Token-based authentication
2. **Password Encryption** - BCrypt hashing
3. **Role-Based Access** - Admin and Customer roles
4. **CORS Configuration** - Secure cross-origin requests
5. **Input Validation** - Request validation
6. **SQL Injection Prevention** - Parameterized queries

---

## 📱 Features Overview

### Customer Features
✅ User Registration & Login
✅ Browse & Search Cars
✅ Filter Cars by Type, Price, etc.
✅ View Car Details
✅ Book Cars
✅ View Booking History
✅ Cancel Bookings
✅ User Profile Management

### Admin Features
✅ Dashboard with Statistics
✅ Manage Car Inventory (CRUD)
✅ View All Bookings
✅ Approve/Reject Bookings
✅ Mark Bookings as Completed
✅ User Management

---

## 🚢 Production Deployment

### Backend Deployment

#### Build JAR file
```bash
cd backend
mvn clean package -DskipTests
```

#### Run JAR
```bash
java -jar target/selfcar-backend-1.0.0.jar
```

#### Environment Variables
```bash
export DB_HOST=your-production-db-host
export DB_USERNAME=your-db-username
export DB_PASSWORD=your-db-password
export JWT_SECRET=your-super-secure-jwt-secret
```

### Frontend Deployment

#### Build Production
```bash
cd frontend
npm run build
```

The build folder `dist/` can be deployed to:
- Vercel
- Netlify
- AWS S3 + CloudFront
- Any static hosting service

---

## 📊 Performance Optimization

### Backend
- Connection pooling configured
- Hibernate query optimization
- Indexed database columns
- Response caching (future)

### Frontend
- Code splitting
- Lazy loading
- Image optimization
- Minification & compression

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
mvn test
```

### Frontend Tests
```bash
cd frontend
npm test
```

---

## 📝 Development Tips

1. **Hot Reload**: Both frontend and backend support hot reload
2. **Debug Mode**: Set logging level to DEBUG in application.properties
3. **API Testing**: Use Postman collection (can be created)
4. **Database**: Use MySQL Workbench for visual database management

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🆘 Support

If you encounter any issues:
1. Check this guide's troubleshooting section
2. Review application logs
3. Check database connection
4. Verify all services are running

---

## 🎉 Success!

If everything is set up correctly:
- ✅ MySQL database is running
- ✅ Backend API is running on port 8080
- ✅ Frontend is running on port 5173
- ✅ You can access the application in your browser

Happy coding! 🚗💨

