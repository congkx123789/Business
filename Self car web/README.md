# Self Car Rental Website

A modern car rental platform built with React and Spring Boot.

## Project Structure (debug-friendly)

```
.
├── backend/                # Spring Boot (Maven standard layout)
│   ├── src/main/java/
│   ├── src/main/resources/ # application*.properties, logback-spring.xml
│   └── src/test/java/
├── frontend/               # React + Vite
│   ├── src/
│   ├── public/
│   └── dist/               # Built assets for Nginx
├── infra/
│   └── docker/
│       └── docker-compose.yml  # Prod-like local stack (db, backend, nginx)
├── tests/
│   └── e2e/                # Playwright specs & config
├── scripts/                # Dev helpers (start both apps, etc.)
└── .vscode/launch.json     # One-click debug configs
```

### One-click Dev
- PowerShell: `./scripts/dev.ps1` (starts backend + frontend)
- VSCode: Run and Debug → Backend or Frontend

### Docker (prod-like)
1. Build frontend: `npm --prefix frontend ci && npm --prefix frontend run build`
2. `docker compose -f infra/docker/docker-compose.yml up -d --build`
3. Open: http://localhost

**📖 For detailed project structure, see:** [`docs/PROJECT_STRUCTURE_CLEAN.md`](docs/PROJECT_STRUCTURE_CLEAN.md)

**🚀 Quick Start:** [`scripts/run-project.ps1`](scripts/run-project.ps1)

## Technology Stack

### Frontend
- **React 18** - UI Framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP client
- **React Query** - Data fetching
- **Framer Motion** - Animations
- **React Hook Form** - Form handling
- **Zustand** - State management

### Backend
- **Java 17+** - Programming language
- **Spring Boot 3.x** - Framework
- **Spring Data JPA** - ORM
- **Spring Security** - Authentication & Authorization
- **MySQL** - Database
- **Maven** - Build tool
- **JWT** - Token-based authentication
- **Lombok** - Reduce boilerplate code

### Database
- **MySQL 8.0+** - Relational database

## Features

### Customer Features
- Browse available cars with advanced filters
- View detailed car information
- Book cars for specific dates
- Manage bookings (view, cancel, modify)
- User authentication and profile management
- Payment integration
- Booking history and receipts

### Admin Features
- Manage car inventory (CRUD operations)
- View and manage all bookings
- User management
- Dashboard with analytics
- Revenue reports

### Phase 5: Ecosystem Integration & Expansion ✨
- **SelfcarCare**: Maintenance, cleaning, inspection network
- **SelfcarFinance**: Car loans, leasing, insurance partnerships
- **SelfcarDelivery**: Integrated car transport and inspection service
- **Multi-Channel Integration**: API for external dealerships to sync inventory
- **Cross-Listing**: Automation with other marketplaces (Chotot Auto, Carmudi)
- **B2B SaaS**: Dealership management tools and enterprise features
- **BI Dashboards**: Advanced analytics and campaign management

📖 **See [`docs/PHASE5_IMPLEMENTATION.md`](docs/PHASE5_IMPLEMENTATION.md) for detailed Phase 5 documentation**

### Phase 6: Optimization, Monetization & Scaling 🚀
- **Premium Subscriptions**: Tiered subscription plans for verified dealers (Basic, Pro, Premium, Enterprise)
- **Transaction Fees**: Dynamic fee calculation (1-3% based on subscription tier)
- **Ad Placement Packages**: Featured listings, banners, sponsored ads with performance tracking
- **Internationalization**: Multi-language (6 languages) and multi-currency (7 currencies) support
- **ASEAN Expansion**: Regional market roadmap (Vietnam → Thailand → Indonesia → Malaysia/Singapore → Philippines)
- **CI/CD Pipeline**: Automated testing, building, and deployment with GitHub Actions
- **Microservices Architecture**: Scalable architecture roadmap for future growth
- **Performance Optimization**: Caching, load balancing, database optimization

📖 **See [`docs/PHASE6_IMPLEMENTATION.md`](docs/PHASE6_IMPLEMENTATION.md) for detailed Phase 6 documentation**

## 🚀 Quick Start

### ⚡ Fastest Way to Run Your Project

**⭐ Run Tests Then Start Project (Recommended):**
```powershell
.\run-tests-then-start.ps1
```
This runs all tests first, then starts backend and frontend so you can use your project at http://localhost:5173!

**To See Your Project Quickly (Skip Tests):**
```powershell
.\run-without-tests.ps1
```
This starts backend and frontend immediately without running tests.

**To Run Tests Only:**
```powershell
.\run-tests.ps1
```

📖 **See `ROADMAP-RUN.md` for detailed step-by-step instructions**

---

## Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Java 17+
- MySQL 8.0+
- Maven 3.8+

### Quick Setup (Step-by-Step)

1. **Database Setup** (First time only):
```bash
cd database
mysql -u root -p < schema.sql
mysql -u root -p < seed_data.sql
mysql -u root -p < phase3_schema.sql
mysql -u root -p < phase5_schema.sql  # Phase 5: Ecosystem & B2B features
mysql -u root -p < phase6_schema.sql  # Phase 6: Monetization & i18n
```

2. **Configure Backend** (First time only):
   - Copy templates from `config/backend/` to `backend/src/main/resources/`
   - Remove `.template` extension from copied files
   - Edit `backend/src/main/resources/application.properties`
   - Update MySQL password, JWT secret, and OAuth2 credentials

3. **Start Backend:**
```powershell
.\run-backend.ps1
# Or manually: cd backend && mvn spring-boot:run
```

4. **Start Frontend** (in a new terminal):
```powershell
.\run-frontend.ps1
# Or manually: cd frontend && npm install && npm run dev
```

5. **Run Tests** (after services are running):
```powershell
.\run-tests.ps1
```

### Frontend Setup

1. **Configure Environment** (First time only):
   - Copy `config/frontend/env.template` to `frontend/.env`
   - Update API URLs and feature flags as needed

2. **Install Dependencies & Run**:
```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:5173`

### Backend Setup

1. Create MySQL database:
```sql
CREATE DATABASE selfcar_db;
```

2. Update `application.properties` with your database credentials

3. Run the application:
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

The backend will run on `http://localhost:8080`

## API Documentation

Once the backend is running, access Swagger UI at:
`http://localhost:8080/swagger-ui.html`

## Database Schema

See `database/schema.sql` for the complete database structure.

## 📚 Documentation

### Quick Links
- **🚨 [Alert Runbook](docs/ALERT_RUNBOOK.md)** - On-call response procedures and alert handling
- **🔒 [Security Hardening](docs/SECURITY_HARDENING_COMPLETE.md)** - Security implementation guide
- **📊 [Performance Monitoring](docs/DASHBOARDS_AND_ALERTS.md)** - Metrics and dashboards
- **🚀 [Production Checklist](docs/PRODUCTION_CHECKLIST.md)** - Pre-deployment checklist

### Full Documentation Index
See [`docs/INDEX.md`](docs/INDEX.md) for complete documentation index.

## License

MIT License

