# 🚗 SelfCar Project Structure Documentation

## 📊 Complete Project Architecture

This document provides a comprehensive overview of the SelfCar project structure, designed for easy development and maintenance.

---

## 🏗️ High-Level Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │         │                 │
│  React Frontend │ ◄─────► │  Spring Boot    │ ◄─────► │  MySQL Database │
│  (Port 5173)    │  REST   │  Backend        │  JPA    │  (Port 3306)    │
│                 │   API   │  (Port 8080)    │         │                 │
└─────────────────┘         └─────────────────┘         └─────────────────┘
```

---

## 📁 Directory Structure

```
self-car-web/
│
├── 🎨 frontend/                         # React Frontend Application
│   ├── public/                          # Static assets
│   ├── src/
│   │   ├── components/                  # Reusable React components
│   │   │   ├── Layout/
│   │   │   │   ├── Layout.jsx          # Main layout wrapper
│   │   │   │   ├── Navbar.jsx          # Navigation bar with auth
│   │   │   │   └── Footer.jsx          # Footer component
│   │   │   │
│   │   │   ├── Cars/
│   │   │   │   ├── CarCard.jsx         # Individual car display card
│   │   │   │   └── CarFilters.jsx      # Car search filters
│   │   │   │
│   │   │   ├── Admin/
│   │   │   │   └── CarFormModal.jsx    # Admin car form
│   │   │   │
│   │   │   └── Auth/
│   │   │       └── ProtectedRoute.jsx  # Route protection HOC
│   │   │
│   │   ├── pages/                       # Page components (routes)
│   │   │   ├── Home.jsx                # Landing page
│   │   │   ├── Cars.jsx                # Car listing page
│   │   │   ├── CarDetail.jsx           # Single car details
│   │   │   ├── Booking.jsx             # Booking form page
│   │   │   ├── Login.jsx               # Login page
│   │   │   ├── Register.jsx            # Registration page
│   │   │   ├── Profile.jsx             # User profile page
│   │   │   │
│   │   │   └── Admin/                  # Admin pages
│   │   │       ├── Dashboard.jsx       # Admin dashboard
│   │   │       ├── Cars.jsx            # Car management
│   │   │       └── Bookings.jsx        # Booking management
│   │   │
│   │   ├── services/
│   │   │   └── api.js                  # API service layer (Axios)
│   │   │
│   │   ├── store/
│   │   │   └── authStore.js            # Zustand auth state
│   │   │
│   │   ├── App.jsx                     # Main app with routing
│   │   ├── App.css                     # Global app styles
│   │   ├── main.jsx                    # React entry point
│   │   └── index.css                   # Tailwind imports
│   │
│   ├── index.html                      # HTML template
│   ├── package.json                    # NPM dependencies
│   ├── vite.config.js                  # Vite configuration
│   ├── tailwind.config.js              # Tailwind CSS config
│   ├── postcss.config.js               # PostCSS config
│   └── .env                            # Environment variables (create this)
│
├── ☕ backend/                          # Spring Boot Backend Application
│   ├── src/main/java/com/selfcar/
│   │   ├── config/
│   │   │   └── SecurityConfig.java     # Spring Security & CORS config
│   │   │
│   │   ├── controller/                 # REST API Controllers
│   │   │   ├── AuthController.java     # Authentication endpoints
│   │   │   ├── CarController.java      # Car CRUD endpoints
│   │   │   ├── BookingController.java  # Booking management
│   │   │   └── DashboardController.java # Admin dashboard API
│   │   │
│   │   ├── dto/                        # Data Transfer Objects
│   │   │   ├── ApiResponse.java        # Generic API response
│   │   │   ├── AuthResponse.java       # Auth response with JWT
│   │   │   ├── LoginRequest.java       # Login credentials
│   │   │   ├── RegisterRequest.java    # Registration data
│   │   │   └── BookingRequest.java     # Booking data
│   │   │
│   │   ├── exception/
│   │   │   └── GlobalExceptionHandler.java # Global error handling
│   │   │
│   │   ├── model/                      # JPA Entity Models
│   │   │   ├── User.java              # User entity with roles
│   │   │   ├── Car.java               # Car entity
│   │   │   └── Booking.java           # Booking entity
│   │   │
│   │   ├── repository/                # Spring Data JPA Repositories
│   │   │   ├── UserRepository.java    # User data access
│   │   │   ├── CarRepository.java     # Car data access
│   │   │   └── BookingRepository.java # Booking data access
│   │   │
│   │   ├── security/                  # Security & JWT Implementation
│   │   │   ├── JwtTokenProvider.java  # JWT token generation/validation
│   │   │   ├── JwtAuthenticationFilter.java # JWT filter
│   │   │   ├── UserPrincipal.java     # User details implementation
│   │   │   └── CustomUserDetailsService.java # User loading service
│   │   │
│   │   ├── service/                   # Business Logic Layer
│   │   │   ├── AuthService.java       # Authentication logic
│   │   │   ├── CarService.java        # Car business logic
│   │   │   ├── BookingService.java    # Booking business logic
│   │   │   └── DashboardService.java  # Dashboard statistics
│   │   │
│   │   └── SelfCarApplication.java    # Spring Boot main class
│   │
│   ├── src/main/resources/
│   │   ├── application.properties      # Main configuration
│   │   ├── application-dev.properties  # Development config
│   │   └── application-prod.properties # Production config
│   │
│   ├── pom.xml                        # Maven dependencies
│   └── target/                        # Compiled classes (generated)
│
├── 🗄️ database/                        # Database Scripts
│   ├── schema.sql                     # Database schema definition
│   ├── seed_data.sql                  # Sample data for testing
│   └── README.md                      # Database documentation
│
├── 📚 Documentation Files
│   ├── README.md                      # Project overview
│   ├── SETUP_GUIDE.md                 # Detailed setup instructions
│   └── PROJECT_STRUCTURE.md           # This file
│
└── .gitignore                         # Git ignore rules (if using git)
```

---

## 🎯 Technology Stack Details

### Frontend Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2+ | UI Framework |
| Vite | 5.0+ | Build tool & dev server |
| React Router | 6.21+ | Client-side routing |
| Tailwind CSS | 3.4+ | Utility-first styling |
| Framer Motion | 10.18+ | Animations |
| React Query | 5.17+ | Server state management |
| Zustand | 4.4+ | Client state management |
| Axios | 1.6+ | HTTP client |
| React Hook Form | 7.49+ | Form handling |
| React Hot Toast | 2.4+ | Notifications |
| Lucide React | 0.303+ | Icons |

### Backend Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| Java | 17+ | Programming language |
| Spring Boot | 3.2.0 | Application framework |
| Spring Data JPA | 3.2.0 | Database ORM |
| Spring Security | 6.2.0 | Authentication & authorization |
| MySQL Connector | 8.0+ | Database driver |
| JWT (JJWT) | 0.12.3 | Token-based auth |
| Lombok | 1.18+ | Reduce boilerplate |
| Maven | 3.8+ | Build tool |

### Database
| Technology | Version | Purpose |
|------------|---------|---------|
| MySQL | 8.0+ | Relational database |

---

## 🔄 Data Flow

### Authentication Flow
```
1. User enters credentials → Frontend (Login.jsx)
2. POST /api/auth/login → Backend (AuthController)
3. Validate credentials → AuthService
4. Check database → UserRepository
5. Generate JWT token → JwtTokenProvider
6. Return token → Frontend
7. Store in Zustand + localStorage → authStore.js
8. Add to all requests → api.js interceptor
```

### Car Browsing Flow
```
1. User visits /cars → Frontend (Cars.jsx)
2. GET /api/cars → Backend (CarController)
3. Fetch from database → CarService → CarRepository
4. Return car list → Frontend
5. Display with React Query cache → CarCard components
```

### Booking Flow
```
1. User selects car → CarDetail.jsx
2. Click "Book Now" → Booking.jsx
3. Fill form & submit → bookingAPI.createBooking()
4. POST /api/bookings → BookingController
5. Validate dates → BookingService
6. Check availability → Database queries
7. Create booking → BookingRepository
8. Return confirmation → Frontend
9. Show success message → React Hot Toast
```

---

## 🔐 Security Implementation

### JWT Authentication
- **Token Storage**: localStorage via Zustand
- **Token Expiry**: 24 hours (configurable)
- **Refresh Strategy**: Re-login required
- **Security Headers**: Added via interceptor

### Role-Based Access Control (RBAC)
```java
// Backend - Method level security
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<?> adminOnlyEndpoint() { ... }

// Frontend - Component level
<ProtectedRoute adminOnly>
  <AdminDashboard />
</ProtectedRoute>
```

### Password Security
- **Algorithm**: BCrypt with salt
- **Rounds**: 10 (default)
- **Storage**: Hashed in database
- **Validation**: Spring Security

---

## 🗃️ Database Schema

### Tables

#### **users**
```sql
- id (PK, BIGINT)
- first_name (VARCHAR)
- last_name (VARCHAR)
- email (VARCHAR, UNIQUE)
- phone (VARCHAR)
- password (VARCHAR, hashed)
- role (ENUM: 'CUSTOMER', 'ADMIN')
- active (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### **cars**
```sql
- id (PK, BIGINT)
- name (VARCHAR)
- brand (VARCHAR)
- type (ENUM: 'SEDAN', 'SUV', 'SPORTS', 'LUXURY', 'VAN')
- year (INT)
- price_per_day (DECIMAL)
- seats (INT)
- transmission (ENUM: 'AUTOMATIC', 'MANUAL')
- fuel_type (ENUM: 'PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID')
- description (TEXT)
- image_url (VARCHAR)
- available (BOOLEAN)
- featured (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### **bookings**
```sql
- id (PK, BIGINT)
- user_id (FK → users)
- car_id (FK → cars)
- start_date (DATE)
- end_date (DATE)
- pickup_location (VARCHAR)
- dropoff_location (VARCHAR)
- total_price (DECIMAL)
- status (ENUM: 'PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED')
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Relationships
- User → Bookings (One-to-Many)
- Car → Bookings (One-to-Many)

### Indexes (Optimized for Performance)
```sql
-- Users
idx_email, idx_role

-- Cars
idx_type, idx_brand, idx_available, idx_featured, idx_price

-- Bookings
idx_user_id, idx_car_id, idx_status, idx_dates
idx_booking_user_status (composite)
idx_booking_car_dates (composite)
```

---

## 🛣️ API Routes

### Public Endpoints
```
GET    /api/cars              - Get all cars
GET    /api/cars/{id}         - Get car by ID
GET    /api/cars/available    - Get available cars
GET    /api/cars/featured     - Get featured cars
POST   /api/auth/register     - Register new user
POST   /api/auth/login        - Login user
```

### Authenticated Endpoints (Customer)
```
GET    /api/auth/me           - Get current user
GET    /api/bookings/user     - Get user's bookings
POST   /api/bookings          - Create new booking
DELETE /api/bookings/{id}     - Cancel booking
PUT    /api/users/profile     - Update profile
```

### Admin Only Endpoints
```
POST   /api/cars              - Create car
PUT    /api/cars/{id}         - Update car
DELETE /api/cars/{id}         - Delete car
PATCH  /api/cars/{id}/toggle  - Toggle availability

GET    /api/bookings          - Get all bookings
PATCH  /api/bookings/{id}/status - Update booking status

GET    /api/dashboard/stats   - Get dashboard statistics
GET    /api/users             - Get all users
```

---

## 🎨 Frontend Component Hierarchy

```
App (Root)
├── Layout
│   ├── Navbar
│   │   └── User Menu / Auth Buttons
│   │
│   ├── <Outlet> (Page Content)
│   │   ├── Home
│   │   ├── Cars
│   │   │   ├── CarFilters
│   │   │   └── CarCard (multiple)
│   │   │
│   │   ├── CarDetail
│   │   ├── Booking
│   │   ├── Login
│   │   ├── Register
│   │   │
│   │   ├── Profile (Protected)
│   │   │
│   │   └── Admin (Protected, Admin Only)
│   │       ├── Dashboard
│   │       ├── Cars Management
│   │       │   └── CarFormModal
│   │       └── Bookings Management
│   │
│   └── Footer
│
└── Toaster (Global Notifications)
```

---

## 🔧 Configuration Files

### Frontend Configuration

#### `.env` (Create this file)
```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_NAME=SelfCar
```

#### `vite.config.js`
```javascript
export default {
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8080'
    }
  }
}
```

#### `tailwind.config.js`
- Custom color palette (primary blue theme)
- Extended font family (Inter)
- Custom shadows

### Backend Configuration

#### `application.properties`
```properties
# Server
server.port=8080

# Database
spring.datasource.url=jdbc:mysql://localhost:3306/selfcar_db
spring.datasource.username=root
spring.datasource.password=password

# JPA
spring.jpa.hibernate.ddl-auto=update

# JWT
jwt.secret=your-secret-key
jwt.expiration=86400000

# CORS (Development)
spring.web.cors.allowed-origins=http://localhost:5173
```

---

## 📦 Key Features Implementation

### 1. User Authentication
- **Files**: AuthController, AuthService, JwtTokenProvider, authStore.js
- **Flow**: Registration → Login → JWT → Protected Routes

### 2. Car Management
- **Files**: CarController, CarService, Cars.jsx, CarCard.jsx
- **Features**: CRUD operations, filters, search, featured cars

### 3. Booking System
- **Files**: BookingController, BookingService, Booking.jsx
- **Features**: Date selection, availability check, booking history

### 4. Admin Dashboard
- **Files**: DashboardController, DashboardService, Admin pages
- **Features**: Statistics, manage cars, manage bookings

### 5. Responsive Design
- **Implementation**: Tailwind CSS, mobile-first approach
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)

---

## 🚀 Development Workflow

### Starting Development

1. **Start Database**
```bash
# Start MySQL service
mysql.server start  # macOS
net start MySQL80   # Windows
```

2. **Start Backend**
```bash
cd backend
mvn spring-boot:run
# Runs on http://localhost:8080
```

3. **Start Frontend**
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

### Adding New Features

#### Backend: Add New Endpoint
1. Create/Update Entity in `model/`
2. Create Repository interface in `repository/`
3. Implement Service in `service/`
4. Create Controller in `controller/`
5. Add DTO if needed in `dto/`

#### Frontend: Add New Page
1. Create page component in `pages/`
2. Add route in `App.jsx`
3. Create API method in `services/api.js`
4. Add navigation link in `Navbar.jsx`

---

## 🧪 Testing Strategy

### Backend Testing
```bash
cd backend
mvn test
```

### Frontend Testing
```bash
cd frontend
npm test
```

### Manual Testing
1. Use Postman for API endpoints
2. Test all user flows in browser
3. Test responsiveness (mobile, tablet, desktop)
4. Test authentication & authorization
5. Test admin features

---

## 📊 Performance Optimizations

### Database
✅ Indexed columns for fast queries
✅ Composite indexes for complex queries
✅ Views for common query patterns
✅ Connection pooling

### Backend
✅ JPA fetch strategies optimized
✅ Query pagination support
✅ DTO pattern to reduce data transfer
✅ Lombok to reduce boilerplate

### Frontend
✅ React Query for caching
✅ Lazy loading for routes
✅ Image optimization
✅ Vite for fast builds
✅ Tailwind CSS purging unused styles

---

## 🐛 Common Development Issues

### "Port already in use"
```bash
# Kill process on port 8080 (backend)
lsof -ti:8080 | xargs kill -9

# Kill process on port 5173 (frontend)
lsof -ti:5173 | xargs kill -9
```

### "Cannot connect to database"
```bash
# Check MySQL is running
mysqladmin -u root -p status

# Verify database exists
mysql -u root -p -e "SHOW DATABASES;"
```

### "CORS Error"
- Check `application.properties` has correct origins
- Verify frontend URL matches configured origin

---

## 📈 Scalability Considerations

### Current Architecture
- Monolithic backend
- MySQL single instance
- Frontend on static hosting

### Future Scalability Options
1. **Microservices**: Split into auth, booking, car services
2. **Database**: Read replicas, sharding
3. **Caching**: Redis for sessions and frequent queries
4. **CDN**: Static assets delivery
5. **Load Balancer**: Multiple backend instances
6. **Message Queue**: Async booking notifications

---

## 🎓 Learning Resources

### Spring Boot
- [Official Documentation](https://spring.io/projects/spring-boot)
- [Spring Security Guide](https://spring.io/guides/gs/securing-web/)

### React
- [Official Documentation](https://react.dev)
- [React Router](https://reactrouter.com)
- [Tailwind CSS](https://tailwindcss.com)

### Database
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [JPA Best Practices](https://vladmihalcea.com/tutorials/hibernate/)

---

## 🤝 Contribution Guidelines

1. Follow existing code structure
2. Use meaningful commit messages
3. Write comments for complex logic
4. Test before committing
5. Update documentation when adding features

---

## 📝 Code Style Guidelines

### Java (Backend)
- Use Lombok annotations
- Follow Spring naming conventions
- Service methods should be transactional
- Use DTOs for API responses

### JavaScript (Frontend)
- Use functional components with hooks
- Follow React best practices
- Use descriptive variable names
- Extract reusable logic to custom hooks

---

## 🎉 Project Status

✅ User Authentication & Authorization
✅ Car Browsing & Filtering
✅ Booking System
✅ Admin Dashboard
✅ Responsive Design
✅ Database Optimization
✅ Security Implementation
✅ Documentation

---

## 📞 Support

For questions or issues:
1. Check documentation files
2. Review code comments
3. Test with sample data
4. Check application logs

---

**Last Updated**: November 2025
**Version**: 1.0.0
**Status**: Production Ready ✅

