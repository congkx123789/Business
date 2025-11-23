# SelfCar Project - Clean Structure

## 📁 Project Organization

```
Self car web/
├── 📄 README.md                 # Main project documentation
├── 📁 docs/                      # All documentation
│   ├── 📁 phases/                # Phase implementation documents
│   │   ├── PHASE3_IMPLEMENTATION.md
│   │   └── PHASE4_IMPLEMENTATION.md
│   ├── 📁 testing/               # Testing guides and reports
│   │   ├── BACKEND_TEST_FIX_COMPLETE.md
│   │   ├── TESTING_GUIDE.md
│   │   └── ...
│   ├── 📁 setup/                 # Setup and configuration guides
│   │   ├── SETUP_GUIDE.md
│   │   ├── QUICK_START.md
│   │   └── ...
│   ├── 📁 frontend/              # Frontend-specific documentation
│   ├── ARCHITECTURE.md
│   ├── PROJECT_STRUCTURE.md
│   └── PROJECT_REORGANIZATION.md
│
├── 📁 scripts/                   # PowerShell automation scripts
│   ├── run-backend.ps1
│   ├── run-frontend.ps1
│   ├── run-project.ps1
│   ├── check-status.ps1
│   └── ...
│
├── 📁 database/                  # Database scripts and migrations
│   ├── schema.sql
│   ├── seed_data.sql
│   └── ...
│
├── 📁 backend/                   # Spring Boot backend
│   ├── pom.xml
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/selfcar/
│   │   │   │   ├── SelfCarApplication.java
│   │   │   │   ├── model/          # Domain models
│   │   │   │   ├── controller/      # REST controllers
│   │   │   │   ├── service/         # Business logic
│   │   │   │   ├── repository/      # Data access
│   │   │   │   ├── dto/             # Data transfer objects
│   │   │   │   ├── config/          # Configuration
│   │   │   │   ├── security/        # Security (JWT, OAuth2)
│   │   │   │   └── exception/       # Exception handling
│   │   │   └── resources/
│   │   └── test/
│   └── target/
│
└── 📁 frontend/                  # React frontend
    ├── package.json
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── services/
    │   ├── store/
    │   └── ...
    └── dist/
```

## 🎯 Key Features

### Backend Features
- **Authentication & Authorization**: JWT, OAuth2
- **Car Management**: CRUD, images, reviews
- **Order Management**: Bookings, orders, workflows
- **Payment Integration**: Wallets, payment gateways
- **Analytics**: Business insights, seller scoring
- **Logistics**: Delivery, inspection, pickup
- **Shop Management**: Seller verification, customization

### Frontend Features
- React with Vite
- Component-based architecture
- State management
- E2E testing with Playwright

## 🚀 Quick Start

See `docs/setup/QUICK_START.md` or run:
```powershell
.\scripts\run-project.ps1
```

## 📚 Documentation

- **Setup**: `docs/setup/`
- **Phases**: `docs/phases/`
- **Testing**: `docs/testing/`
- **Architecture**: `docs/ARCHITECTURE.md`

## 🛠️ Scripts

All scripts are in `scripts/` folder:
- `run-project.ps1` - Start full project
- `run-backend.ps1` - Start backend only
- `run-frontend.ps1` - Start frontend only
- `check-status.ps1` - Check project status

## 📝 Notes

- Documentation is organized by category
- Scripts are centralized in `scripts/` folder
- Backend uses Spring Boot with Maven
- Frontend uses React with Vite

