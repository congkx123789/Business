# SelfCar Project - Clean Structure

## 📁 Project Organization

```
Self car web/
├── README.md                    # Main project README
├── backend/                     # Spring Boot Backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/selfcar/
│   │   │   │   ├── config/           # Configuration classes
│   │   │   │   ├── exception/        # Exception handlers
│   │   │   │   ├── security/         # Security configuration
│   │   │   │   ├── controller/       # REST Controllers (organized by domain)
│   │   │   │   │   ├── auth/         # Authentication controllers
│   │   │   │   │   ├── car/          # Car-related controllers
│   │   │   │   │   ├── order/        # Order controllers
│   │   │   │   │   ├── payment/      # Payment controllers
│   │   │   │   │   ├── booking/      # Booking controllers
│   │   │   │   │   ├── shop/         # Shop controllers
│   │   │   │   │   ├── analytics/     # Analytics controllers
│   │   │   │   │   ├── logistics/    # Logistics controllers
│   │   │   │   │   └── common/       # Common/shared controllers
│   │   │   │   ├── service/          # Business Logic Services
│   │   │   │   │   ├── impl/         # Service implementations
│   │   │   │   │   ├── auth/         # Auth services
│   │   │   │   │   ├── car/          # Car services
│   │   │   │   │   ├── order/        # Order services
│   │   │   │   │   ├── payment/      # Payment services
│   │   │   │   │   ├── booking/      # Booking services
│   │   │   │   │   ├── shop/         # Shop services
│   │   │   │   │   ├── analytics/    # Analytics services
│   │   │   │   │   ├── logistics/    # Logistics services
│   │   │   │   │   └── common/       # Common services
│   │   │   │   ├── model/            # Entity Models
│   │   │   │   │   ├── auth/         # Auth models
│   │   │   │   │   ├── car/          # Car models
│   │   │   │   │   ├── order/        # Order models
│   │   │   │   │   ├── payment/      # Payment models
│   │   │   │   │   ├── booking/      # Booking models
│   │   │   │   │   ├── shop/         # Shop models
│   │   │   │   │   ├── analytics/    # Analytics models
│   │   │   │   │   ├── logistics/    # Logistics models
│   │   │   │   │   └── common/       # Common models
│   │   │   │   ├── repository/       # Data Access Layer
│   │   │   │   │   ├── auth/         # Auth repositories
│   │   │   │   │   ├── car/          # Car repositories
│   │   │   │   │   ├── order/        # Order repositories
│   │   │   │   │   ├── payment/      # Payment repositories
│   │   │   │   │   ├── booking/      # Booking repositories
│   │   │   │   │   ├── shop/         # Shop repositories
│   │   │   │   │   ├── analytics/    # Analytics repositories
│   │   │   │   │   ├── logistics/    # Logistics repositories
│   │   │   │   │   └── common/       # Common repositories
│   │   │   │   ├── dto/              # Data Transfer Objects
│   │   │   │   │   ├── auth/         # Auth DTOs
│   │   │   │   │   ├── car/          # Car DTOs
│   │   │   │   │   ├── order/        # Order DTOs
│   │   │   │   │   ├── payment/      # Payment DTOs
│   │   │   │   │   ├── booking/      # Booking DTOs
│   │   │   │   │   ├── shop/         # Shop DTOs
│   │   │   │   │   ├── analytics/    # Analytics DTOs
│   │   │   │   │   ├── logistics/    # Logistics DTOs
│   │   │   │   │   └── common/       # Common DTOs
│   │   │   │   └── SelfCarApplication.java
│   │   │   └── resources/            # Configuration files
│   │   └── test/                     # Test files
│   └── pom.xml
├── frontend/                    # React Frontend
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── pages/              # Page components
│   │   ├── services/           # API services
│   │   ├── store/              # State management
│   │   └── ...
│   └── package.json
├── database/                    # Database scripts
│   ├── schema.sql
│   ├── seed_data.sql
│   └── ...
├── docs/                       # 📚 Documentation
│   ├── PHASE3_IMPLEMENTATION.md
│   ├── PHASE4_IMPLEMENTATION.md
│   ├── SETUP_GUIDE.md
│   ├── ARCHITECTURE.md
│   └── ...
├── scripts/                     # 🔧 Scripts
│   ├── run-backend.ps1
│   ├── run-frontend.ps1
│   ├── run-project.ps1
│   ├── check-status.ps1
│   └── ...
└── image/                      # Images/assets
```

## 🎯 Domain Organization

The backend is organized by **domain** (business capability) rather than by technical layer:

### Domains

1. **auth** - Authentication & Authorization
   - Controllers: AuthController
   - Services: AuthService
   - Models: User, OAuth2 tokens
   - DTOs: LoginRequest, RegisterRequest, AuthResponse

2. **car** - Car Listings & Management
   - Controllers: CarController, CarImageController, CarReviewController, CarAdController
   - Services: CarService, CarReviewService, CarAdService
   - Models: Car, CarImage, CarReview, CarAd, CarSKU
   - DTOs: Car-related DTOs

3. **order** - Order Management
   - Controllers: OrderController, OrdersController, OrderWorkflowController
   - Services: OrderService, OrderWorkflowService
   - Models: Order, OrderWorkflow, PurchaseOrder
   - DTOs: Order-related DTOs

4. **payment** - Payment Processing
   - Controllers: PaymentController, PaymentsController, WalletController
   - Services: PaymentService, PaymentGatewayService, WalletService
   - Models: PaymentTransaction, Wallet, WalletLedgerEntry
   - DTOs: PaymentRequestDTO, PaymentResponseDTO, WalletBalanceDTO

5. **booking** - Booking Management
   - Controllers: BookingController
   - Services: BookingService
   - Models: Booking
   - DTOs: BookingRequest

6. **shop** - Shop Management
   - Controllers: ShopController, ShopCustomizationController, SellerVerificationController
   - Services: SellerVerificationService
   - Models: Shop, ShopReview, SellerVerification
   - DTOs: Shop-related DTOs

7. **analytics** - Business Intelligence & Analytics (Phase 4)
   - Controllers: BusinessInsightsController, RecommendationController, SellerScoringController, DashboardController
   - Services: BusinessInsightsService, RecommendationService, SellerScoringService
   - Models: CarAnalytics, CarView, CarRecommendation, SellerScore
   - DTOs: BusinessInsightsDTO, CarRecommendationDTO, SellerScoreDTO

8. **logistics** - Logistics & Delivery
   - Controllers: LogisticsController
   - Services: LogisticsService, LogisticsTaskService
   - Models: Logistics, LogisticsTask
   - DTOs: Logistics-related DTOs

9. **common** - Shared/Common Components
   - Controllers: NotificationController, AutomatedReplyController, FlashSaleController, VoucherController
   - Services: NotificationService, ChatService, WebhookService
   - Models: Notification, ChatMessage, Voucher, FlashSale
   - DTOs: ApiResponse, common DTOs

## 📂 Key Directories

### `docs/` - All Documentation
- Implementation guides (Phase 3, Phase 4)
- Setup guides
- Architecture documentation
- Testing guides
- API documentation

### `scripts/` - All Scripts
- `run-backend.ps1` - Start backend server
- `run-frontend.ps1` - Start frontend server
- `run-project.ps1` - Start both servers
- `check-status.ps1` - Check service status
- Test scripts
- Deployment scripts

### `database/` - Database Scripts
- Schema definitions
- Migration scripts
- Seed data

## 🚀 Benefits of This Structure

1. **Domain-Driven Design**: Files are organized by business domain, making it easier to find related code
2. **Scalability**: Easy to add new domains without cluttering existing structure
3. **Maintainability**: Related code is grouped together
4. **Team Collaboration**: Different teams can work on different domains
5. **Clean Root**: Root directory only contains essential files (README, config)

## 📝 Package Naming Convention

```
com.selfcar.controller.{domain}.{Controller}
com.selfcar.service.{domain}.{Service}
com.selfcar.model.{domain}.{Model}
com.selfcar.repository.{domain}.{Repository}
com.selfcar.dto.{domain}.{DTO}
```

Example:
- `com.selfcar.controller.car.CarController`
- `com.selfcar.service.car.CarService`
- `com.selfcar.model.car.Car`
- `com.selfcar.repository.car.CarRepository`
- `com.selfcar.dto.car.CarDTO`

## 🔄 Migration Status

✅ **Completed:**
- Domain folders created
- Documentation files moved to `docs/`
- Script files moved to `scripts/`

⚠️ **Future Work (Optional):**
- Move Java files to domain folders (requires package declaration updates)
- Create domain-specific subpackages
- Add domain-specific README files

## 📖 Quick Links

- **Setup Guide**: `docs/SETUP_GUIDE.md`
- **Architecture**: `docs/ARCHITECTURE.md`
- **Phase 3**: `docs/PHASE3_IMPLEMENTATION.md`
- **Phase 4**: `docs/PHASE4_IMPLEMENTATION.md`
- **Run Project**: `scripts/run-project.ps1`

