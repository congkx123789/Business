# Project Structure Reorganization Plan

## New Structure Overview

### Root Level
```
Self car web/
├── README.md                    # Main project README
├── docs/                       # All documentation
│   ├── phases/                 # Phase implementation docs
│   ├── testing/                # Testing documentation
│   ├── setup/                  # Setup guides
│   └── frontend/               # Frontend-specific docs
├── scripts/                    # All PowerShell scripts
├── database/                   # Database scripts
├── backend/                    # Backend application
└── frontend/                   # Frontend application
```

### Backend Structure (Feature-Based)
```
backend/src/main/java/com/selfcar/
├── SelfCarApplication.java
├── auth/                       # Authentication & Authorization
│   ├── model/                  # User
│   ├── controller/             # AuthController
│   ├── service/                # AuthService
│   ├── dto/                    # LoginRequest, RegisterRequest, AuthResponse
│   ├── repository/             # UserRepository
│   └── security/               # JWT, SecurityConfig
├── car/                        # Car Management
│   ├── model/                  # Car, CarImage, CarReview, CarSKU, CarAd
│   ├── controller/             # CarController, CarImageController, CarReviewController
│   ├── service/                # CarService, CarReviewService
│   ├── dto/                    # Car-related DTOs
│   └── repository/             # CarRepository, CarImageRepository, etc.
├── order/                      # Orders & Bookings
│   ├── model/                  # Order, Booking, OrderWorkflow, PurchaseOrder
│   ├── controller/             # OrderController, BookingController, OrdersController
│   ├── service/                # OrderService, BookingService, OrderWorkflowService
│   ├── dto/                    # Order-related DTOs
│   └── repository/             # OrderRepository, BookingRepository
├── payment/                    # Payments & Wallets
│   ├── model/                  # PaymentTransaction, Wallet, WalletLedgerEntry
│   ├── controller/             # PaymentController, WalletController
│   ├── service/                # PaymentService, WalletService, PaymentGatewayService
│   ├── dto/                    # PaymentRequestDTO, WalletBalanceDTO
│   └── repository/             # PaymentTransactionRepository, WalletRepository
├── analytics/                  # Analytics & Insights (Phase 4)
│   ├── model/                  # CarAnalytics, CarView, SellerScore, CarRecommendation
│   ├── controller/             # BusinessInsightsController, SellerScoringController, RecommendationController
│   ├── service/                # BusinessInsightsService, SellerScoringService, RecommendationService
│   ├── dto/                    # BusinessInsightsDTO, SellerScoreDTO, CarRecommendationDTO
│   └── repository/             # CarAnalyticsRepository, SellerScoreRepository
├── logistics/                  # Logistics & Delivery
│   ├── model/                  # Logistics, LogisticsTask
│   ├── controller/             # LogisticsController, OrderWorkflowController
│   ├── service/                # LogisticsService, LogisticsTaskService
│   ├── dto/                    # Logistics-related DTOs
│   └── repository/             # LogisticsRepository, LogisticsTaskRepository
├── shop/                       # Shop Management
│   ├── model/                  # Shop, ShopReview, SellerVerification
│   ├── controller/             # ShopController, ShopCustomizationController
│   ├── service/                # SellerVerificationService
│   ├── dto/                    # Shop-related DTOs
│   └── repository/             # ShopRepository, ShopReviewRepository
├── common/                     # Shared Components
│   ├── model/                  # Notification, Voucher, FlashSale, FinancialSummary
│   ├── controller/             # NotificationController, DashboardController, FinancialDashboardController
│   ├── service/                # NotificationService, DashboardService, FinancialDashboardService
│   ├── dto/                    # ApiResponse, FinancialDashboardDTO
│   ├── config/                 # JpaAuditingConfig, SecurityConfig
│   ├── exception/              # GlobalExceptionHandler
│   └── repository/            # Common repositories
└── chat/                       # Messaging (if exists)
    ├── model/                  # ChatMessage, MessageConversation
    ├── controller/             # (if exists)
    ├── service/                # ChatService
    └── repository/             # ChatMessageRepository
```

## Migration Strategy

### Phase 1: Organize Root Level ✅
- ✅ Created `docs/` folder and organized documentation
- ✅ Created `scripts/` folder for PowerShell scripts
- ✅ Organized docs into subfolders (phases, testing, setup)

### Phase 2: Backend Package Reorganization (Recommended)
This is a larger refactoring that requires:
1. Moving Java files to new package structure
2. Updating all imports
3. Updating package declarations
4. Testing compilation

**Note**: This is a significant refactoring. Consider doing it incrementally:
- Start with one feature (e.g., `auth`)
- Test thoroughly
- Move to next feature

## Current State
- ✅ Root level organized
- ✅ Documentation organized
- ✅ Scripts organized
- ⚠️ Backend Java packages still flat (can be reorganized if needed)

## Benefits of New Structure
1. **Better Organization**: Related files grouped together
2. **Easier Navigation**: Find files by feature, not by type
3. **Clearer Dependencies**: See what belongs to what feature
4. **Scalability**: Easy to add new features
5. **Team Collaboration**: Different teams can work on different features

