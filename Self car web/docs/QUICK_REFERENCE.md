# 🚀 Quick Reference Guide

## Project Structure

```
Self car web/
├── backend/          # Spring Boot backend
├── frontend/         # React frontend  
├── database/         # Database scripts
├── docs/             # 📚 All documentation
├── scripts/          # 🔧 All scripts
├── assets/           # 🖼️ Shared assets
│   └── images/      # Image assets
├── config/           # ⚙️ Configuration templates
│   ├── backend/     # Backend config templates
│   └── frontend/    # Frontend config templates
└── README.md         # Main README
```

## 🎯 Quick Commands

### Start Project
```powershell
# Start both backend and frontend
.\scripts\run-project.ps1

# Start only backend
.\scripts\run-backend.ps1

# Start only frontend
.\scripts\run-frontend.ps1
```

### Check Status
```powershell
.\scripts\check-status.ps1
```

### Run Tests
```powershell
.\scripts\run-tests.ps1
.\scripts\run-backend-tests.ps1
.\scripts\run-frontend-tests.ps1
```

## 📚 Documentation Quick Links

| Document | Location |
|----------|----------|
| Setup Guide | `docs/SETUP_GUIDE.md` |
| Quick Start | `docs/QUICK_START.md` |
| Architecture | `docs/ARCHITECTURE.md` |
| Project Structure | `docs/PROJECT_STRUCTURE_CLEAN.md` |
| Phase 3 Implementation | `docs/PHASE3_IMPLEMENTATION.md` |
| Phase 4 Implementation | `docs/PHASE4_IMPLEMENTATION.md` |
| Reorganization Summary | `docs/REORGANIZATION_SUMMARY.md` |

## 🏗️ Backend Structure

**Domain-based organization:**
- `controller/{domain}/` - REST Controllers
- `service/{domain}/` - Business Logic
- `model/{domain}/` - Entity Models
- `repository/{domain}/` - Data Access
- `dto/{domain}/` - Data Transfer Objects

**Domains:**
- `auth` - Authentication
- `car` - Car listings
- `order` - Orders
- `payment` - Payments
- `booking` - Bookings
- `shop` - Shops
- `analytics` - Analytics (Phase 4)
- `logistics` - Logistics
- `common` - Shared components

## 🔍 Finding Files

### Controllers
- Auth: `backend/src/main/java/com/selfcar/controller/auth/`
- Car: `backend/src/main/java/com/selfcar/controller/car/`
- Order: `backend/src/main/java/com/selfcar/controller/order/`
- Payment: `backend/src/main/java/com/selfcar/controller/payment/`
- Analytics: `backend/src/main/java/com/selfcar/controller/analytics/`

### Services
- All services: `backend/src/main/java/com/selfcar/service/`
- Implementations: `backend/src/main/java/com/selfcar/service/impl/`

### Models
- All models: `backend/src/main/java/com/selfcar/model/`

## 📝 Scripts Location

All scripts are in `scripts/` folder:
- Run scripts: `scripts/run-*.ps1`
- Test scripts: `scripts/run-*-tests.ps1`
- Utility: `scripts/check-status.ps1`, `scripts/fix-frontend.ps1`

## 🎨 Frontend Structure

```
frontend/src/
├── components/      # React components
│   ├── Auth/
│   ├── Cars/
│   └── Layout/
├── pages/           # Page components
├── services/        # API services
└── store/           # State management
```

## 💡 Tips

1. **Use scripts folder**: All PowerShell scripts are in `scripts/`
2. **Check docs folder**: All documentation is in `docs/`
3. **Domain organization**: Backend code organized by business domain
4. **Clean root**: Root directory only has essential files

## 📖 For More Details

See: [`docs/PROJECT_STRUCTURE_CLEAN.md`](docs/PROJECT_STRUCTURE_CLEAN.md)

