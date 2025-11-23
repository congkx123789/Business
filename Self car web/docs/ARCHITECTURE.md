# 🏗️ SelfCar System Architecture

This document provides a visual and detailed overview of the SelfCar application architecture.

---

## 🎯 System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                          USER BROWSER                               │
│                     http://localhost:5173                           │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ HTTP/HTTPS
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     REACT FRONTEND (Vite)                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │
│  │   Pages     │  │ Components  │  │   Services  │                │
│  │ - Home      │  │ - Navbar    │  │ - API       │                │
│  │ - Cars      │  │ - CarCard   │  │ - Auth      │                │
│  │ - Booking   │  │ - Footer    │  │             │                │
│  └─────────────┘  └─────────────┘  └─────────────┘                │
│                                                                      │
│  State Management: Zustand + React Query                            │
│  Styling: Tailwind CSS + Framer Motion                             │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ REST API (JSON)
                                  │ Authorization: Bearer JWT
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                 SPRING BOOT BACKEND (Port 8080)                     │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐│
│  │              SECURITY LAYER (Spring Security)                  ││
│  │  - JWT Token Validation                                        ││
│  │  - Role-Based Access Control (RBAC)                            ││
│  │  - CORS Configuration                                          ││
│  └────────────────────────────────────────────────────────────────┘│
│                          │                                          │
│                          ▼                                          │
│  ┌────────────────────────────────────────────────────────────────┐│
│  │                  CONTROLLER LAYER (REST APIs)                  ││
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        ││
│  │  │    Auth      │  │     Car      │  │   Booking    │        ││
│  │  │  Controller  │  │  Controller  │  │  Controller  │        ││
│  │  └──────────────┘  └──────────────┘  └──────────────┘        ││
│  └────────────────────────────────────────────────────────────────┘│
│                          │                                          │
│                          ▼                                          │
│  ┌────────────────────────────────────────────────────────────────┐│
│  │                    SERVICE LAYER (Business Logic)              ││
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        ││
│  │  │    Auth      │  │     Car      │  │   Booking    │        ││
│  │  │   Service    │  │   Service    │  │   Service    │        ││
│  │  └──────────────┘  └──────────────┘  └──────────────┘        ││
│  │  - Validation                                                  ││
│  │  - Business Rules                                              ││
│  │  - Transaction Management                                      ││
│  └────────────────────────────────────────────────────────────────┘│
│                          │                                          │
│                          ▼                                          │
│  ┌────────────────────────────────────────────────────────────────┐│
│  │              REPOSITORY LAYER (Spring Data JPA)                ││
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        ││
│  │  │    User      │  │     Car      │  │   Booking    │        ││
│  │  │  Repository  │  │  Repository  │  │  Repository  │        ││
│  │  └──────────────┘  └──────────────┘  └──────────────┘        ││
│  │  - CRUD Operations                                             ││
│  │  - Custom Queries                                              ││
│  └────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ JDBC (Hibernate/JPA)
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      MySQL DATABASE (Port 3306)                     │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │    users     │  │     cars     │  │   bookings   │            │
│  │  table       │  │   table      │  │   table      │            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
│                                                                      │
│  - Indexed columns for performance                                  │
│  - Foreign key relationships                                        │
│  - Transactional integrity                                          │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Request Flow Diagram

### User Authentication Flow

```
USER ACTION: Click "Login" and submit credentials
                    │
                    ▼
┌───────────────────────────────────────────────────────────────┐
│ 1. Frontend (Login.jsx)                                       │
│    - Capture email & password                                 │
│    - Validate form inputs                                     │
│    - Call authAPI.login()                                     │
└───────────────────────────────────────────────────────────────┘
                    │
                    │ POST /api/auth/login
                    │ { email, password }
                    ▼
┌───────────────────────────────────────────────────────────────┐
│ 2. Backend - AuthController                                   │
│    - Receive credentials                                      │
│    - Pass to AuthService                                      │
└───────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌───────────────────────────────────────────────────────────────┐
│ 3. AuthService                                                │
│    - Authenticate with Spring Security                        │
│    - Verify password (BCrypt)                                 │
│    - Generate JWT token (JwtTokenProvider)                    │
└───────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌───────────────────────────────────────────────────────────────┐
│ 4. UserRepository                                             │
│    - Query database for user by email                         │
│    - Return user details                                      │
└───────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌───────────────────────────────────────────────────────────────┐
│ 5. Response Flow                                              │
│    - Return JWT token + user details                          │
│    - Status 200 OK                                            │
└───────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌───────────────────────────────────────────────────────────────┐
│ 6. Frontend - authStore (Zustand)                             │
│    - Store token in state                                     │
│    - Store user details                                       │
│    - Persist to localStorage                                  │
│    - Redirect to homepage                                     │
└───────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌───────────────────────────────────────────────────────────────┐
│ 7. Subsequent Requests                                        │
│    - api.js interceptor adds token to headers                 │
│    - Authorization: Bearer <JWT_TOKEN>                        │
└───────────────────────────────────────────────────────────────┘
```

---

### Car Booking Flow

```
USER ACTION: Select car and click "Book Now"
                    │
                    ▼
┌───────────────────────────────────────────────────────────────┐
│ 1. Frontend (Booking.jsx)                                     │
│    - Display booking form                                     │
│    - User fills dates, locations                              │
│    - Calculate total price                                    │
│    - Submit booking                                           │
└───────────────────────────────────────────────────────────────┘
                    │
                    │ POST /api/bookings
                    │ Authorization: Bearer <token>
                    │ { carId, startDate, endDate, ... }
                    ▼
┌───────────────────────────────────────────────────────────────┐
│ 2. Spring Security Filter                                     │
│    - Validate JWT token                                       │
│    - Extract user from token                                  │
│    - Check authentication                                     │
└───────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌───────────────────────────────────────────────────────────────┐
│ 3. BookingController                                          │
│    - Receive booking request                                  │
│    - Validate input (@Valid)                                  │
│    - Pass to BookingService                                   │
└───────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌───────────────────────────────────────────────────────────────┐
│ 4. BookingService                                             │
│    - Validate dates (start < end, not in past)                │
│    - Check car availability                                   │
│    - Check for conflicting bookings                           │
│    - Calculate total price                                    │
│    - Create booking entity                                    │
└───────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌───────────────────────────────────────────────────────────────┐
│ 5. BookingRepository                                          │
│    - Save booking to database                                 │
│    - Return saved booking with ID                             │
└───────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌───────────────────────────────────────────────────────────────┐
│ 6. Response                                                   │
│    - Return booking details                                   │
│    - Status 200 OK                                            │
└───────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌───────────────────────────────────────────────────────────────┐
│ 7. Frontend                                                   │
│    - Show success toast notification                          │
│    - Redirect to booking history                              │
│    - Update React Query cache                                 │
└───────────────────────────────────────────────────────────────┘
```

---

## 📊 Database Entity Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                        users                                │
├─────────────────────────────────────────────────────────────┤
│ PK │ id                BIGINT AUTO_INCREMENT                │
│    │ first_name        VARCHAR(100)                         │
│    │ last_name         VARCHAR(100)                         │
│ UK │ email             VARCHAR(255) UNIQUE                  │
│    │ phone             VARCHAR(20)                          │
│    │ password          VARCHAR(255) [BCRYPT HASHED]         │
│    │ role              ENUM('CUSTOMER', 'ADMIN')            │
│    │ active            BOOLEAN DEFAULT TRUE                 │
│    │ created_at        TIMESTAMP                            │
│    │ updated_at        TIMESTAMP                            │
└─────────────────────────────────────────────────────────────┘
                               │
                               │ 1:N (One user has many bookings)
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                       bookings                              │
├─────────────────────────────────────────────────────────────┤
│ PK │ id                BIGINT AUTO_INCREMENT                │
│ FK │ user_id           BIGINT → users.id                    │
│ FK │ car_id            BIGINT → cars.id                     │
│    │ start_date        DATE                                 │
│    │ end_date          DATE                                 │
│    │ pickup_location   VARCHAR(255)                         │
│    │ dropoff_location  VARCHAR(255)                         │
│    │ total_price       DECIMAL(10,2)                        │
│    │ status            ENUM('PENDING','CONFIRMED',          │
│    │                       'CANCELLED','COMPLETED')         │
│    │ created_at        TIMESTAMP                            │
│    │ updated_at        TIMESTAMP                            │
│    │                                                         │
│    │ INDEX: idx_user_id, idx_car_id, idx_status            │
│    │ INDEX: idx_dates (start_date, end_date)               │
└─────────────────────────────────────────────────────────────┘
                               ▲
                               │
                               │ 1:N (One car has many bookings)
                               │
┌─────────────────────────────────────────────────────────────┐
│                         cars                                │
├─────────────────────────────────────────────────────────────┤
│ PK │ id                BIGINT AUTO_INCREMENT                │
│    │ name              VARCHAR(255)                         │
│    │ brand             VARCHAR(100)                         │
│    │ type              ENUM('SEDAN','SUV','SPORTS',         │
│    │                       'LUXURY','VAN')                  │
│    │ year              INT                                  │
│    │ price_per_day     DECIMAL(10,2)                        │
│    │ seats             INT                                  │
│    │ transmission      ENUM('AUTOMATIC','MANUAL')           │
│    │ fuel_type         ENUM('PETROL','DIESEL',              │
│    │                       'ELECTRIC','HYBRID')             │
│    │ description       TEXT                                 │
│    │ image_url         VARCHAR(500)                         │
│    │ available         BOOLEAN DEFAULT TRUE                 │
│    │ featured          BOOLEAN DEFAULT FALSE                │
│    │ created_at        TIMESTAMP                            │
│    │ updated_at        TIMESTAMP                            │
│    │                                                         │
│    │ INDEX: idx_type, idx_brand, idx_available             │
│    │ INDEX: idx_featured, idx_price                        │
└─────────────────────────────────────────────────────────────┘

KEY:
PK = Primary Key
FK = Foreign Key
UK = Unique Key
1:N = One-to-Many Relationship
```

---

## 🔐 Security Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Security Layers                            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Layer 1: Frontend Security                                      │
├─────────────────────────────────────────────────────────────────┤
│ • Route Protection (ProtectedRoute component)                   │
│ • Token stored in localStorage (auto-expires)                   │
│ • Automatic logout on 401 response                              │
│ • Input validation with React Hook Form                         │
│ • XSS prevention (React auto-escaping)                          │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│ Layer 2: Network Security                                       │
├─────────────────────────────────────────────────────────────────┤
│ • HTTPS in production                                           │
│ • CORS configured (Spring Security)                             │
│ • JWT sent via Authorization header                             │
│ • Secure cookie options (production)                            │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│ Layer 3: Application Security (Spring Security)                 │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ JWT Authentication Filter                                   ││
│ │ • Extracts token from header                                ││
│ │ • Validates token signature                                 ││
│ │ • Checks expiration                                         ││
│ │ • Loads user details                                        ││
│ └─────────────────────────────────────────────────────────────┘│
│                               │                                  │
│                               ▼                                  │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ Authorization (Role-Based)                                  ││
│ │ • @PreAuthorize("hasRole('ADMIN')")                        ││
│ │ • Method-level security                                     ││
│ │ • CUSTOMER vs ADMIN roles                                   ││
│ └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│ Layer 4: Data Security                                          │
├─────────────────────────────────────────────────────────────────┤
│ • Passwords hashed with BCrypt                                  │
│ • SQL injection prevention (JPA parameterized queries)          │
│ • Sensitive data not logged                                     │
│ • Database access restricted (credentials)                      │
│ • Input validation (@Valid annotations)                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🌊 State Management Flow

### Frontend State Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    STATE MANAGEMENT                             │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────┐     ┌──────────────────────────┐
│   Zustand (authStore)    │     │   React Query            │
├──────────────────────────┤     ├──────────────────────────┤
│ • User authentication    │     │ • Server state cache     │
│ • JWT token              │     │ • Cars data              │
│ • User profile           │     │ • Bookings data          │
│ • Login/Logout           │     │ • Auto refetch           │
│                          │     │ • Optimistic updates     │
│ Persisted to:            │     │ • Loading states         │
│ localStorage             │     │ • Error handling         │
└──────────────────────────┘     └──────────────────────────┘
            │                                 │
            │                                 │
            └──────────────┬──────────────────┘
                           │
                           ▼
            ┌──────────────────────────────┐
            │   React Components           │
            │   • Access state via hooks   │
            │   • Trigger actions          │
            │   • Auto re-render on change │
            └──────────────────────────────┘

Example Usage:

// Zustand (Client State)
const { user, token, login, logout } = useAuthStore()

// React Query (Server State)
const { data: cars, isLoading } = useQuery({
  queryKey: ['cars'],
  queryFn: () => carAPI.getAllCars()
})
```

---

## 🎨 Frontend Component Tree

```
App
├── Toaster (Global)
│
└── Router
    └── Layout
        ├── Navbar
        │   ├── Logo
        │   ├── Navigation Links
        │   └── User Menu (conditional)
        │       ├── Profile Link (if authenticated)
        │       ├── Dashboard Link (if admin)
        │       ├── Logout Button (if authenticated)
        │       └── Login/Register (if not authenticated)
        │
        ├── <Outlet> (Page Content)
        │   │
        │   ├── Home (/)
        │   │   ├── Hero Section
        │   │   ├── Features Grid
        │   │   ├── CTA Section
        │   │   └── Stats Section
        │   │
        │   ├── Cars (/cars)
        │   │   ├── CarFilters (Sidebar)
        │   │   │   ├── Type Filter
        │   │   │   ├── Transmission Filter
        │   │   │   ├── Fuel Type Filter
        │   │   │   └── Price Range
        │   │   │
        │   │   └── Cars Grid
        │   │       └── CarCard (multiple)
        │   │           ├── Car Image
        │   │           ├── Car Details
        │   │           ├── Specs (seats, transmission, fuel)
        │   │           └── Price & Book Button
        │   │
        │   ├── CarDetail (/cars/:id)
        │   │   ├── Image Gallery
        │   │   ├── Car Information
        │   │   ├── Specifications
        │   │   └── Book Button
        │   │
        │   ├── Booking (/booking/:carId) [Protected]
        │   │   ├── Car Summary
        │   │   ├── Booking Form
        │   │   │   ├── Date Picker
        │   │   │   ├── Location Inputs
        │   │   │   └── Price Calculator
        │   │   └── Submit Button
        │   │
        │   ├── Profile (/profile) [Protected]
        │   │   ├── User Information
        │   │   └── Booking History
        │   │       └── BookingCard (multiple)
        │   │
        │   ├── Login (/login)
        │   │   └── Login Form
        │   │
        │   ├── Register (/register)
        │   │   └── Registration Form
        │   │
        │   └── Admin Pages [Protected, Admin Only]
        │       ├── Dashboard (/admin/dashboard)
        │       │   ├── Statistics Cards
        │       │   ├── Revenue Chart
        │       │   └── Recent Bookings
        │       │
        │       ├── Cars Management (/admin/cars)
        │       │   ├── Add Car Button
        │       │   │   └── CarFormModal
        │       │   └── Cars Table
        │       │       └── Edit/Delete Actions
        │       │
        │       └── Bookings Management (/admin/bookings)
        │           └── Bookings Table
        │               └── Status Update Actions
        │
        └── Footer
            ├── Company Info
            ├── Quick Links
            └── Social Media
```

---

## 🔄 API Request/Response Examples

### Authentication

**Request:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "user@example.com",
    "role": "CUSTOMER"
  }
}
```

### Get Cars

**Request:**
```http
GET /api/cars?type=SUV&available=true
```

**Response:**
```json
[
  {
    "id": 4,
    "name": "RAV4 Adventure",
    "brand": "Toyota",
    "type": "SUV",
    "year": 2023,
    "pricePerDay": 85.00,
    "seats": 5,
    "transmission": "AUTOMATIC",
    "fuelType": "HYBRID",
    "description": "Versatile hybrid SUV...",
    "imageUrl": "https://...",
    "available": true,
    "featured": true
  }
]
```

### Create Booking

**Request:**
```http
POST /api/bookings
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "carId": 4,
  "startDate": "2024-12-20",
  "endDate": "2024-12-25",
  "pickupLocation": "123 Main St, New York, NY",
  "dropoffLocation": "123 Main St, New York, NY"
}
```

**Response:**
```json
{
  "id": 15,
  "carId": 4,
  "userId": 2,
  "startDate": "2024-12-20",
  "endDate": "2024-12-25",
  "pickupLocation": "123 Main St, New York, NY",
  "dropoffLocation": "123 Main St, New York, NY",
  "totalPrice": 425.00,
  "status": "PENDING",
  "createdAt": "2024-11-01T10:30:00"
}
```

---

## 🚀 Deployment Architecture

### Development Environment
```
Developer Machine
├── Frontend (localhost:5173)
├── Backend (localhost:8080)
└── MySQL (localhost:3306)
```

### Production Architecture (Recommended)

```
┌──────────────────────────────────────────────────────────────┐
│                      USERS / INTERNET                        │
└──────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                   LOAD BALANCER / CDN                        │
│                   (Cloudflare / AWS CloudFront)              │
└──────────────────────────────────────────────────────────────┘
                           │
            ┌──────────────┴──────────────┐
            │                             │
            ▼                             ▼
┌────────────────────────┐    ┌────────────────────────┐
│  FRONTEND (Static)     │    │  BACKEND (API)         │
│  Vercel / Netlify      │    │  AWS EC2 / Heroku      │
│  React Build (dist/)   │    │  Spring Boot JAR       │
└────────────────────────┘    └────────────────────────┘
                                          │
                                          ▼
                              ┌────────────────────────┐
                              │  DATABASE (MySQL)      │
                              │  AWS RDS / DigitalOcean│
                              └────────────────────────┘
```

---

## 🔧 Configuration Management

```
┌──────────────────────────────────────────────────────────────┐
│                 Environment Configuration                     │
└──────────────────────────────────────────────────────────────┘

FRONTEND (.env)
├── VITE_API_BASE_URL=http://localhost:8080/api  (dev)
├── VITE_API_BASE_URL=https://api.selfcar.com    (prod)
└── VITE_APP_NAME=SelfCar

BACKEND (application.properties)
├── spring.datasource.url=jdbc:mysql://localhost:3306/selfcar_db
├── spring.datasource.username=root
├── spring.datasource.password=***
├── jwt.secret=***  (MUST change in production)
└── spring.web.cors.allowed-origins=http://localhost:5173

BACKEND (application-prod.properties)
├── spring.datasource.url=${DB_URL}  (from environment)
├── spring.datasource.username=${DB_USERNAME}
├── spring.datasource.password=${DB_PASSWORD}
├── jwt.secret=${JWT_SECRET}  (from environment)
└── spring.web.cors.allowed-origins=${FRONTEND_URL}
```

---

## 📊 Performance Optimization Strategy

```
┌──────────────────────────────────────────────────────────────┐
│                   Performance Layers                         │
└──────────────────────────────────────────────────────────────┘

Frontend
├── Code Splitting (Vite automatic)
├── React Query Caching (5min stale time)
├── Image Lazy Loading
├── Tailwind CSS Purging (production)
└── Compression (gzip/brotli)

Backend
├── Database Connection Pooling
├── JPA Query Optimization
│   ├── Eager/Lazy loading configured
│   ├── N+1 query prevention
│   └── @Query optimization
├── Response Caching (future: Redis)
└── Pagination Support

Database
├── Primary Key Indexing (automatic)
├── Foreign Key Indexing
├── Composite Indexes
│   ├── (user_id, status)
│   └── (car_id, start_date, end_date)
├── Query Optimization
└── Connection Pooling
```

---

## 🎓 Key Design Patterns Used

### Backend Patterns

| Pattern | Implementation | Location |
|---------|---------------|----------|
| **MVC** | Model-View-Controller | Entire backend |
| **DTO** | Data Transfer Objects | `dto/` package |
| **Repository** | Data access abstraction | `repository/` |
| **Service Layer** | Business logic separation | `service/` |
| **Dependency Injection** | Spring IoC | Throughout |
| **Builder** | Lombok @Builder | Entity models |
| **Factory** | Spring Bean Factory | Security config |

### Frontend Patterns

| Pattern | Implementation | Location |
|---------|---------------|----------|
| **Component Composition** | React components | `components/` |
| **Container/Presentational** | Pages vs Components | Project structure |
| **Custom Hooks** | Reusable logic | Throughout |
| **HOC** | ProtectedRoute | `components/Auth/` |
| **State Management** | Zustand | `store/` |
| **API Service Layer** | Centralized API calls | `services/api.js` |

---

## 📈 Scalability Path

### Current: Monolithic (Good for MVP)
```
[Frontend] → [Backend] → [Database]
```

### Phase 1: Horizontal Scaling
```
                  ┌─→ [Backend Instance 1] ─┐
[Frontend] → [LB] ├─→ [Backend Instance 2] ─┼→ [Database]
                  └─→ [Backend Instance 3] ─┘
```

### Phase 2: Microservices (If needed)
```
                  ┌─→ [Auth Service] ────────┐
                  │                           │
[Frontend] → [Gateway] ├─→ [Car Service] ──────────┼→ [MySQL]
                  │                           │
                  ├─→ [Booking Service] ─────┤
                  │                           │
                  └─→ [Notification Service]─┘
                             ↓
                      [Message Queue]
```

---

**This architecture is designed to be:**
✅ Scalable - Can grow with your needs  
✅ Maintainable - Clear separation of concerns  
✅ Secure - Multiple security layers  
✅ Performant - Optimized at every layer  
✅ Developer-Friendly - Easy to understand and extend  

---

*Last Updated: November 2025*
*Version: 1.0.0*

