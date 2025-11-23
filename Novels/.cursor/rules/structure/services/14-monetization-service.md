---
alwaysApply: true
---

├── 📦 monetization-service/           # 💰 MONETIZATION SERVICE
    │   │   │
    │   │   ├── 📋 Service Info
    │   │   │   ├── **Purpose:** Manages Pay-Per-Chapter (PPC) monetization: Virtual Currency, Pricing Engine, Paywall System, Payment Processing, Subscriptions
    │   │   │   ├── **Database:** Own PostgreSQL database (Rule #1)
    │   │   │   ├── **Port:** 3010 (gRPC server)
    │   │   │   ├── **Business Model:** Pay-Per-Chapter (PPC) - 3-5 points per 1000 characters
    │   │   │   └── **Speed Opt:** Use Read Replica for read operations (Rule #7)
    │   │   │
    │   │   ├── 📁 Source Code Structure
    │   │   │   └── src/
    │   │   │       ├── main.ts                      # Service entry point (gRPC server)
    │   │   │       ├── app.module.ts                 # Root module
    │   │   │       │
    │   │   │       ├── 📁 modules/
    │   │   │       │   │
    │   │   │       │   ├── 📁 virtual-currency/      # Virtual Currency Module
    │   │   │       │   │   ├── virtual-currency.module.ts
    │   │   │       │   │   ├── virtual-currency.service.ts  # Wallet entrypoints (top-up, deduct, refund, balance)
    │   │   │       │   │   ├── wallet.service.ts            # In-memory wallet + transaction log
    │   │   │       │   │   └── dto/
    │   │   │       │   │       ├── top-up-request.dto.ts
    │   │   │       │   │       ├── deduct-points.dto.ts
    │   │   │       │   │       ├── transaction-history-query.dto.ts
    │   │   │       │   │       └── balance-response.dto.ts
    │   │   │       │   │
    │   │   │       │   ├── 📁 pricing/              # Pricing Engine Module
    │   │   │       │   │   ├── pricing.module.ts
    │   │   │       │   │   ├── pricing.service.ts    # Character-based pricing (3-5 points/1000 chars)
    │   │   │       │   │   ├── pricing-rule.service.ts  # Pricing rules management
    │   │   │       │   │   └── dto/
    │   │   │       │   │       ├── calculate-price.dto.ts
    │   │   │       │   │       └── update-pricing-rule.dto.ts
    │   │   │       │   │
    │   │   │       │   ├── 📁 paywall/              # Paywall System Module
    │   │   │       │   │   ├── paywall.module.ts
    │   │   │       │   │   ├── paywall.service.ts   # Free chapters (80-130), access control
    │   │   │       │   │   ├── access-control.service.ts  # Chapter access checking
    │   │   │       │   │   └── dto/
    │   │   │       │   │       ├── check-access.dto.ts
    │   │   │       │   │       └── grant-access.dto.ts
    │   │   │       │   │
    │   │   │       │   ├── 📁 payments/              # Payment Processing Module
    │   │   │       │   │   ├── payments.module.ts
    │   │   │       │   │   ├── payments.service.ts   # Purchase flow (idempotent - Rule #12)
    │   │   │       │   │   ├── purchase.service.ts   # Chapter purchases, bulk purchases
    │   │   │       │   │   ├── receipt.service.ts    # Receipt generation
    │   │   │       │   │   └── dto/
    │   │   │       │   │       ├── purchase-chapter.dto.ts
    │   │   │       │   │       └── purchase-bulk.dto.ts
    │   │   │       │   │
    │   │   │       │   └── 📁 subscriptions/         # Subscription & VIP Models Module
    │   │   │       │       ├── subscriptions.module.ts
    │   │   │       │       ├── subscriptions.service.ts  # Main subscription orchestrator
    │   │   │       │       │
    │   │   │       │       ├── 📁 all-you-can-read/  # All-You-Can-Read Model (Netflix Style)
    │   │   │       │       │   └── all-you-can-read.service.ts  # Subscription lifecycle (create/get/cancel)
    │   │   │       │       │
    │   │   │       │       └── 📁 loyalty-program/   # Loyalty Program Model (VIP Levels)
    │   │   │       │           └── loyalty-program.service.ts  # VIP tracking + history (dto/vip-level.dto.ts)
    │   │   │       │
    │   │   │       ├── 📁 controllers/                # gRPC Controllers
    │   │   │       │   └── monetization.controller.ts  # Implements monetization.proto gRPC methods
    │   │   │       │
    │   │   │       └── 📁 prisma/                    # Database Schema
    │   │   │           ├── schema.prisma              # Prisma schema (all monetization models)
    │   │   │           └── migrations/                # Database migrations
    │   │   │
    │   │   ├── 🛰️ gRPC Surface (implemented inside `monetization.controller.ts`)
    │   │   │
    │   │   │   | Domain                | RPCs (see `packages/7-shared/src/proto/definitions/monetization.proto`) |
    │   │   │   |-----------------------|------------------------------------------------------------------------|
    │   │   │   | Virtual Currency      | `GetWallet`, `TopUp`, `DeductPoints`, `RefundPoints`, `GetBalance`, `GetTransactionHistory` |
    │   │   │   | Pricing Engine        | `CalculateChapterPrice`, `CalculateBulkPrice`, `GetPricingRules`, `UpdatePricingRule` |
    │   │   │   | Paywall               | `CheckChapterAccess`, `GetPaywallConfig`, `UpdatePaywallConfig` |
    │   │   │   | Payments (PPC)        | `PurchaseChapter`, `PurchaseBulk`, `GetPurchaseHistory`, `GetPurchaseReceipt`, `RefundPurchase` |
    │   │   │   | Privilege / Advanced  | `GetPrivilegeStatus`, `PurchasePrivilege`, `GetAdvancedChapters`, `PurchaseAdvancedChapter` |
    │   │   │   | Memberships (Coins)   | `CreateMembership`, `GetMembership`, `CancelMembership`, `ClaimDailyBonus` |
    │   │   │   | Subscriptions (AYCR)  | `CreateSubscription`, `GetSubscription`, `CancelSubscription` |
    │   │   │   | VIP / Loyalty         | `GetVIPLevel`, `GetVIPLevels`, `RecordSpending`, `GetVIPHistory` |
    │   │   │
    │   │   ├── 📁 Configuration Files
    │   │   │   ├── package.json
    │   │   │   ├── tsconfig.json
    │   │   │   ├── nest-cli.json
    │   │   │   └── README.md
    │   │   │
    │   │   └── 📁 Database Models (Prisma Schema)
    │   │       └── Models defined in schema.prisma:
    │   │           ├── Wallet                        # Virtual currency wallet
    │   │           ├── CurrencyTransaction          # Currency transactions
    │   │           ├── TopUp                        # Top-up records
    │   │           ├── ChapterPrice                 # Chapter pricing
    │   │           ├── PricingRule                 # Pricing rules
    │   │           ├── StoryPaywall                # Paywall configuration
    │   │           ├── ChapterAccess               # Chapter access records
    │   │           ├── Purchase                    # Chapter purchases
    │   │           ├── BulkPurchase                # Bulk purchases
    │   │           ├── PurchaseReceipt             # Purchase receipts
    │   │           ├── Membership                  # Membership (coin packages) (NEW)
    │   │           ├── MembershipPlan             # Membership plans (NEW)
    │   │           ├── MembershipDailyBonus        # Daily bonus records (NEW)
    │   │           ├── Privilege                   # Privilege (book-specific advanced chapters) (NEW)
    │   │           ├── AdvancedChapter             # Advanced chapters (NEW)
    │   │           ├── PrivilegePurchase           # Privilege purchase records (NEW)
    │   │           ├── Subscription                # All-You-Can-Read subscriptions
    │   │           ├── SubscriptionPlan           # Subscription plans
    │   │           ├── SubscriptionTransaction     # Subscription billing
    │   │           ├── VIPLevel                    # VIP level definitions
    │   │           ├── VIPMember                   # VIP member records
    │   │           └── VIPHistory                  # VIP level history
    │   │
    │   ├── 📋 Pay-Per-Chapter (PPC) Business Model
    │   │   │
    │   │   ├── **Core Concept:** Micropayments model - users pay small amounts (3-5 points per 1000 characters) for each chapter
    │   │   │
    │   │   ├── **Free Chapters:** First 80-130 chapters free (hooks users, creates investment)
    │   │   │
    │   │   ├── **Pricing:** Character-based pricing (3-5 points per 1000 characters)
    │   │   │   - Short chapter (5000 chars) = 15-25 points
    │   │   │   - Long chapter (10000 chars) = 30-50 points
    │   │   │
    │   │   ├── **Virtual Currency:** 1 point = 1/100 CNY (frictionless payments)
    │   │   │
    │   │   ├── **Psychological Factors:**
    │   │   │   - Free content creates investment (time invested)
    │   │   │   - Micropayments feel small (not "real money")
    │   │   │   - Serial content creates addiction (need next chapter)
    │   │   │   - Low barrier = High conversion
    │   │   │
    │   │   └── **Repeat Purchases:** Users purchase thousands of times
    │   │
    │   ├── 📋 Virtual Currency System
    │   │   │
    │   │   ├── **Purpose:** Manage virtual currency (Points/Coins) for frictionless micropayments
    │   │   │
    │   │   ├── **Features:**
    │   │   │   - Wallet management (balance tracking)
    │   │   │   - Top-up processing (recharge with real money)
    │   │   │   - Transaction history (all currency movements)
    │   │   │   - Balance checking (real-time queries)
    │   │   │
    │   │   ├── **Exchange Rates:**
    │   │   │   - Base currency: CNY (Chinese Yuan)
    │   │   │   - 1 point = 1/100 CNY
    │   │   │   - Support multiple currencies
    │   │   │
    │   │   ├── **Storage:**
    │   │   │   - PostgreSQL: Wallet, CurrencyTransaction, TopUp models
    │   │   │   - Redis: Cache user balance (key: `wallet:${userId}`, TTL: 5 minutes)
    │   │   │
    │   │   └── **gRPC Endpoints:**
    │   │       - `GetBalance(userId)` → Returns wallet balance
    │   │       - `TopUp(userId, amount, paymentMethod)` → Process top-up
    │   │       - `DeductPoints(userId, amount, referenceId)` → Deduct points (atomic)
    │   │       - `RefundPoints(userId, amount, purchaseId)` → Refund points
    │   │       - `GetTransactionHistory(userId, filters?)` → Returns transaction history
    │   │
    │   ├── 📋 Pricing Engine
    │   │   │
    │   │   ├── **Purpose:** Calculate chapter prices based on character count
    │   │   │
    │   │   ├── **Pricing Model:**
    │   │   │   - Base rate: 3-5 points per 1000 characters
    │   │   │   - Character-based (not chapter-based) for fairness
    │   │   │   - Dynamic pricing possible (popular stories)
    │   │   │
    │   │   ├── **Features:**
    │   │   │   - Character counting (from Stories Service)
    │   │   │   - Price calculation (automatic)
    │   │   │   - Pricing rules (story-specific, global)
    │   │   │   - Price caching (Redis)
    │   │   │   - Bulk pricing (multiple chapters)
    │   │   │
    │   │   ├── **Storage:**
    │   │   │   - PostgreSQL: ChapterPrice, PricingRule models
    │   │   │   - Redis: Cache prices (key: `price:${chapterId}`, TTL: 24 hours)
    │   │   │
    │   │   └── **gRPC Endpoints:**
    │   │       - `CalculatePrice(chapterId)` → Calculates and returns price
    │   │       - `GetPrice(chapterId)` → Returns cached price
    │   │       - `CalculateBulkPrice(chapterIds)` → Returns total price for multiple chapters
    │   │       - `UpdatePricingRules(storyId, rules)` → Updates pricing rules
    │   │
    │   ├── 📋 Paywall System
    │   │   │
    │   │   ├── **Purpose:** Manage free chapters and access control
    │   │   │
    │   │   ├── **Free Chapters:**
    │   │   │   - First 80-130 chapters free (configurable per story)
    │   │   │   - Automatic paywall after free chapters
    │   │   │
    │   │   ├── **Access Rules:**
    │   │   │   - Free chapters: Always accessible
    │   │   │   - Owned chapters: Accessible if purchased
    │   │   │   - Subscription: VIP users may have unlimited access
    │   │   │   - Preview: Limited preview (first paragraph) for paid chapters
    │   │   │
    │   │   ├── **Storage:**
    │   │   │   - PostgreSQL: StoryPaywall, ChapterAccess models
    │   │   │   - Redis: Cache access status (key: `access:${userId}:${chapterId}`, TTL: 1 hour)
    │   │   │
    │   │   └── **gRPC Endpoints:**
    │   │       - `CheckAccess(userId, chapterId)` → Returns access status
    │   │       - `GetPaywallInfo(storyId)` → Returns paywall configuration
    │   │       - `IsFreeChapter(chapterId)` → Checks if chapter is free
    │   │       - `GrantAccess(userId, chapterId)` → Grants access after purchase
    │   │
    │   ├── 📋 Payment Processing
    │   │   │
    │   │   ├── **Purpose:** Process Pay-Per-Chapter purchases
    │   │   │
    │   │   ├── **Purchase Flow:**
    │   │   │   1. User clicks on locked chapter
    │   │   │   2. System checks balance & calculates price
    │   │   │   3. User confirms purchase
    │   │   │   4. Points deducted from wallet (atomic operation)
    │   │   │   5. Chapter access granted
    │   │   │   6. Transaction recorded
    │   │   │   7. Receipt generated
    │   │   │
    │   │   ├── **Features:**
    │   │   │   - Purchase single chapter (idempotent - Rule #12)
    │   │   │   - Bulk purchase (multiple chapters)
    │   │   │   - Transaction history
    │   │   │   - Receipt generation (digital receipts)
    │   │   │   - Refund handling (if needed)
    │   │   │
    │   │   ├── **Storage:**
    │   │   │   - PostgreSQL: Purchase, BulkPurchase, PurchaseReceipt models
    │   │   │   - Redis: Cache purchase status (key: `purchase:${userId}:${chapterId}`, TTL: 24 hours)
    │   │   │
    │   │   └── **gRPC Endpoints:**
    │   │       - `PurchaseChapter(userId, chapterId)` → Processes purchase (idempotent)
    │   │       - `PurchaseBulk(userId, chapterIds)` → Processes bulk purchase
    │   │       - `GetPurchaseHistory(userId, filters?)` → Returns purchase history
    │   │       - `GetReceipt(purchaseId)` → Returns digital receipt
    │   │       - `RefundPurchase(purchaseId)` → Refunds purchase (if allowed)
    │   │
    │   ├── 📋 Subscription Models
    │   │   │
    │   │   ├── **Membership Model (Coin Packages - NOT All-You-Can-Eat):**
    │   │   │   - **Purpose:** Recurring revenue through coin packages (NOT unlimited reading)
    │   │   │   - **Key Insight:** "Membership" is misleading - it's just a discounted coin package with daily bonuses
    │   │   │   - **How It Works:**
    │   │   │     * User pays monthly fee (e.g., $9.99/month)
    │   │   │     * User receives coins immediately (one-time grant)
    │   │   │     * User receives small daily coin bonus when logging in
    │   │   │     * User still must spend coins to unlock chapters (PPC model remains)
    │   │   │   - **Target:** Users who want guaranteed coins + daily bonuses
    │   │   │   - **Revenue Model:** Recurring revenue + PPC spending (double monetization)
    │   │   │   - **Features:**
    │   │   │     * Monthly/yearly membership plans
    │   │   │     * Immediate coin grant on payment
    │   │   │     * Daily login bonus (small coin amount)
    │   │   │     * Auto-renewal
    │   │   │     * Cancel anytime (but coins already granted remain)
    │   │   │   - **Implementation:**
    │   │   │     * `Membership` model: userId, planId, status, startDate, endDate, autoRenew
    │   │   │     * `MembershipPlan` model: id, name, price, coinsGranted, dailyBonus, billingPeriod
    │   │   │     * `MembershipDailyBonus` model: membershipId, userId, date, coinsAwarded, claimed
    │   │   │     * Background job: Daily bonus distribution (cron job at midnight)
    │   │   │     * Integration with Virtual Currency Service: Grant coins on membership purchase
    │   │   │   - **gRPC Endpoints:**
    │   │   │     * `CreateMembership(userId, planId)` → Creates membership, grants coins
    │   │   │     * `GetMembership(userId)` → Returns user's membership
    │   │   │     * `ClaimDailyBonus(userId)` → Claims daily bonus (if logged in)
    │   │   │     * `CancelMembership(userId)` → Cancels membership (keeps coins already granted)
    │   │   │
    │   │   ├── **Privilege Model (Book-Specific Advanced Chapters):**
    │   │   │   - **Purpose:** Multi-tier monetization - pay for the RIGHT to pay more for early access
    │   │   │   - **Key Insight:** This is NOT a membership - it's a book-specific fee that resets monthly
    │   │   │   - **How It Works:**
    │   │   │     * User pays coins to buy "Privilege" for a specific book
    │   │   │     * Privilege resets on 1st of each month (regardless of when purchased)
    │   │   │     * Privilege does NOT unlock any chapters
    │   │   │     * Privilege grants the RIGHT to purchase "advanced chapters" (chapters not yet released to public)
    │   │   │     * User must still pay coins to unlock each advanced chapter
    │   │   │   - **Target:** Impatient fans (whales) who want to read ahead
    │   │   │   - **Revenue Model:** Double monetization (Privilege fee + Advanced chapter purchases)
    │   │   │   - **Features:**
    │   │   │     * Book-specific (not platform-wide)
    │   │   │     * Monthly reset (always resets on 1st of month)
    │   │   │     * Advanced chapters (author-written but not yet public)
    │   │   │     * Higher pricing for advanced chapters (premium pricing)
    │   │   │   - **Implementation:**
    │   │   │     * `Privilege` model: id, userId, storyId, purchasedAt, expiresAt (1st of next month), status
    │   │   │     * `AdvancedChapter` model: id, storyId, chapterId, chapterNumber, isAdvanced (true), releaseDate (future), privilegeRequired (true)
    │   │   │     * `PrivilegePurchase` model: id, privilegeId, userId, storyId, coinsSpent, purchasedAt
    │   │   │     * Background job: Monthly reset (cron job on 1st of month at midnight)
    │   │   │     * Integration with Paywall System: Check privilege before allowing advanced chapter purchase
    │   │   │     * Integration with Pricing Engine: Higher pricing for advanced chapters
    │   │   │   - **gRPC Endpoints:**
    │   │   │     * `PurchasePrivilege(userId, storyId)` → Purchases privilege for book (spends coins)
    │   │   │     * `GetPrivilege(userId, storyId)` → Returns privilege status
    │   │   │     * `GetAdvancedChapters(storyId, userId?)` → Returns advanced chapters (if user has privilege)
    │   │   │     * `CheckPrivilegeAccess(userId, storyId, chapterId)` → Checks if user can access advanced chapter
    │   │   │
    │   │   ├── **All-You-Can-Read Model (Netflix Style - Optional Alternative):**
    │   │   │   - **Purpose:** Fixed monthly fee, unlimited reading in library (alternative model)
    │   │   │   - **Target:** Casual readers
    │   │   │   - **Revenue Cap:** Limited per user (e.g., $10/month)
    │   │   │   - **Features:** Monthly/yearly plans, auto-renewal, cancel anytime
    │   │   │   - **Implementation:** Handled in `subscriptions/all-you-can-read/all-you-can-read.service.ts` using `Subscription`, `SubscriptionPlan`, and `SubscriptionTransaction` models, wallet deductions via `VirtualCurrencyService`, and queue events via `MonetizationEventsService`.
    │   │   │   - **Access:** Free reading in subscription library
    │   │   │   - **Note:** This is a separate model from Membership (can coexist)
    │   │   │
    │   │   ├── **Loyalty Program Model (VIP Levels):**
    │   │   │   - **Purpose:** VIP levels with discounts, no revenue cap
    │   │   │   - **Target:** Whales (power users who spend hundreds)
    │   │   │   - **Benefits:** Discounts (3 points/1000 chars instead of 5), guaranteed Monthly Votes, status
    │   │   │   - **Progression:** Higher spending = Higher VIP level
    │   │   │   - **Profitability:** Higher for serial content
    │   │   │
    │   │   └── **gRPC Endpoints:**
    │   │       - `CreateSubscription(userId, planId)` → Creates All-You-Can-Read subscription
    │   │       - `GetSubscription(userId)` → Returns user's subscription
    │   │       - `CancelSubscription(userId)` → Cancels subscription
    │   │       - `GetVIPLevel(userId)` → Returns user's VIP level
    │   │       - `GetVIPBenefits(userId)` → Returns VIP benefits
    │   │       - `RecordSpending(userId, amount)` → Records spending, checks for VIP upgrade
    │   │
    │   ├── 📋 Event Emission
    │   │   │
    │   │   ├── **Virtual Currency Events:**
    │   │   │   - `wallet.topup.completed` → Notify user
    │   │   │   - `wallet.balance.updated` → Update cache
    │   │   │   - `wallet.low_balance` → Alert user if balance low
    │   │   │
    │   │   ├── **Payment Events:**
    │   │   │   - `purchase.completed` → Notify user, update analytics
    │   │   │   - `purchase.refunded` → Update access, refund points
    │   │   │   - `purchase.failed` → Log error, notify user
    │   │   │
    │   │   ├── **Subscription Events:**
    │   │   │   - `subscription.created` → Notify user
    │   │   │   - `subscription.renewed` → Update access, notify user
    │   │   │   - `subscription.cancelled` → Notify user, schedule expiration
    │   │   │   - `subscription.expired` → Revoke access
    │   │   │
    │   │   └── **VIP Events:**
    │   │       - `vip.level.upgraded` → Notify user, update cache
    │   │       - `vip.spending.recorded` → Update analytics
    │   │
    │   📝 **Development Steps:**
    │   │   │   * **Dev Steps:**
    │   │   │       1.  Setup NestJS, Prisma. Define all monetization models in `schema.prisma`. Run `prisma generate`.
    │   │   │       2.  **Virtual Currency System:**
    │   │   │           - Create `Wallet` model:
    │   │   │             - `id`, `userId` (FK, unique), `balance` (Decimal, default: 0)
    │   │   │             - `totalEarned` (Decimal), `totalSpent` (Decimal)
    │   │   │             - `createdAt`, `updatedAt`
    │   │   │           - Create `CurrencyTransaction` model:
    │   │   │             - `id`, `walletId` (FK), `userId` (FK)
    │   │   │             - `type` (String: 'topup', 'purchase', 'refund', 'reward')
    │   │   │             - `amount` (Decimal), `balanceBefore`, `balanceAfter`
    │   │   │             - `description`, `referenceId` (optional)
    │   │   │             - `createdAt`
    │   │   │           - Create `TopUp` model:
    │   │   │             - `id`, `userId` (FK), `amount` (Decimal - real money)
    │   │   │             - `currency` (String, default: 'CNY'), `pointsAwarded` (Decimal)
    │   │   │             - `exchangeRate` (Decimal), `paymentMethod` (String)
    │   │   │             - `paymentId` (String, optional), `status` (String)
    │   │   │             - `completedAt`, `createdAt`
    │   │   │           - Create `VirtualCurrencyService`:
    │   │   │             * `getBalance(userId)` → Returns wallet balance (cached in Redis)
    │   │   │             * `topUp(userId, amount, paymentMethod)` → Processes top-up, updates wallet
    │   │   │             * `deduct(userId, amount, referenceId)` → Deducts points (atomic operation)
    │   │   │             * `refund(userId, amount, purchaseId)` → Refunds points
    │   │   │             * `getTransactionHistory(userId, filters?)` → Returns transaction history
    │   │   │           - Integration with payment gateways (Alipay, WeChat Pay, Stripe)
    │   │   │           - Cache balance in Redis (key: `wallet:${userId}`, TTL: 5 minutes)
    │   │   │           - Emit events: `wallet.topup.completed`, `wallet.balance.updated`
    │   │   │       3.  **Pricing Engine:**
    │   │   │           - Create `ChapterPrice` model:
    │   │   │             - `id`, `chapterId` (FK, unique), `storyId` (FK)
    │   │   │             - `characterCount` (Int), `basePrice` (Decimal)
    │   │   │             - `currentPrice` (Decimal), `pricePer1000` (Decimal, default: 4)
    │   │   │             - `discount` (Decimal, default: 0)
    │   │   │             - `calculatedAt`, `updatedAt`
    │   │   │           - Create `PricingRule` model:
    │   │   │             - `id`, `storyId` (FK, optional - null = global rule)
    │   │   │             - `ruleType` (String: 'base_rate', 'popular_story', 'first_purchase', 'bulk')
    │   │   │             - `pricePer1000` (Decimal), `discountPercent` (Decimal)
    │   │   │             - `minChapters` (Int, optional - for bulk discount)
    │   │   │             - `isActive` (Boolean, default: true)
    │   │   │           - Create `PricingService`:
    │   │   │             * `calculatePrice(chapterId)` → Calculates price based on character count
    │   │   │             * `getPrice(chapterId)` → Returns cached price
    │   │   │             * `calculateBulkPrice(chapterIds)` → Calculates total for multiple chapters
    │   │   │             * `updatePricingRules(storyId, rules)` → Updates pricing rules
    │   │   │             * `recalculatePrices(storyId)` → Recalculates all chapter prices
    │   │   │           - Integration with Stories Service to get chapter content (gRPC - Rule #2)
    │   │   │           - Cache prices in Redis (key: `price:${chapterId}`, TTL: 24 hours)
    │   │   │           - Background job to recalculate prices when content updated
    │   │   │       4.  **Paywall System:**
    │   │   │           - Create `StoryPaywall` model:
    │   │   │             - `id`, `storyId` (FK, unique)
    │   │   │             - `freeChapters` (Int, default: 100)
    │   │   │             - `isEnabled` (Boolean, default: true)
    │   │   │             - `previewLength` (Int, default: 500 - characters to show in preview)
    │   │   │           - Create `ChapterAccess` model:
    │   │   │             - `id`, `userId` (FK), `chapterId` (FK), `storyId` (FK)
    │   │   │             - `accessType` (String: 'free', 'purchased', 'subscription', 'preview')
    │   │   │             - `purchasedAt` (DateTime, optional)
    │   │   │             - `expiresAt` (DateTime, optional - for subscriptions)
    │   │   │             - Unique constraint: `[userId, chapterId]`
    │   │   │           - Create `PaywallService`:
    │   │   │             * `checkAccess(userId, chapterId)` → Checks if user can access chapter
    │   │   │             * `getPaywallInfo(storyId)` → Returns paywall configuration
    │   │   │             * `isFreeChapter(chapterId)` → Checks if chapter is free
    │   │   │             * `getFreeChapterCount(storyId)` → Returns number of free chapters
    │   │   │             * `grantAccess(userId, chapterId)` → Grants access after purchase
    │   │   │           - Integration with Stories Service to get chapter number (gRPC - Rule #2)
    │   │   │           - Cache access status in Redis (key: `access:${userId}:${chapterId}`, TTL: 1 hour)
    │   │   │       5.  **Payment Processing:**
    │   │   │           - Create `Purchase` model:
    │   │   │             - `id`, `userId` (FK), `chapterId` (FK), `storyId` (FK)
    │   │   │             - `price` (Decimal), `characterCount` (Int)
    │   │   │             - `status` (String, default: 'completed')
    │   │   │             - `paymentId` (FK to CurrencyTransaction)
    │   │   │             - `purchasedAt` (DateTime)
    │   │   │             - Unique constraint: `[userId, chapterId]` (idempotent - Rule #12)
    │   │   │           - Create `BulkPurchase` model:
    │   │   │             - `id`, `userId` (FK), `storyId` (FK)
    │   │   │             - `chapterIds` (String array)
    │   │   │             - `totalPrice` (Decimal), `discountApplied` (Decimal)
    │   │   │             - `status`, `paymentId`, `purchasedAt`
    │   │   │           - Create `PurchaseReceipt` model:
    │   │   │             - `id`, `purchaseId` (FK, unique)
    │   │   │             - `userId` (FK), `receiptNumber` (String, unique)
    │   │   │             - `items` (JSON), `totalAmount` (Decimal)
    │   │   │             - `paymentMethod` (String), `issuedAt` (DateTime)
    │   │   │           - Create `PaymentsService`:
    │   │   │             * `purchaseChapter(userId, chapterId)` → Processes purchase (idempotent - Rule #12)
    │   │   │               - Check if already purchased (idempotent)
    │   │   │               - Check access (might be free)
    │   │   │               - Get price from Pricing Service
    │   │   │               - Check balance from Virtual Currency Service
    │   │   │               - Deduct points (atomic operation)
    │   │   │               - Create purchase record
    │   │   │               - Grant access via Paywall Service
    │   │   │               - Generate receipt
    │   │   │               - Emit `purchase.completed` event
    │   │   │             * `purchaseBulk(userId, chapterIds)` → Processes bulk purchase
    │   │   │             * `getPurchaseHistory(userId, filters?)` → Returns purchase history
    │   │   │             * `getReceipt(purchaseId)` → Returns digital receipt
    │   │   │             * `refundPurchase(purchaseId)` → Refunds purchase (if allowed)
    │   │   │           - Use database transactions for atomic operations (Rule #12)
    │   │   │           - Cache purchase status in Redis
    │   │   │           - Emit events: `purchase.completed`, `purchase.refunded`
    │   │   │       6.  **Membership Model (Coin Packages):**
    │   │   │           - Create `Membership` model:
    │   │   │             - `id`, `userId` (FK, unique), `planId` (FK)
    │   │   │             - `status` (String: 'active', 'cancelled', 'expired')
    │   │   │             - `startDate`, `endDate`, `autoRenew` (Boolean)
    │   │   │             - `cancelledAt` (DateTime, optional)
    │   │   │           - Create `MembershipPlan` model:
    │   │   │             - `id`, `name` (String), `type` (String: 'membership')
    │   │   │             - `price` (Decimal), `currency` (String)
    │   │   │             - `coinsGranted` (Decimal - immediate grant)
    │   │   │             - `dailyBonus` (Decimal - daily login bonus)
    │   │   │             - `billingPeriod` (String: 'monthly', 'yearly')
    │   │   │             - `isActive` (Boolean)
    │   │   │           - Create `MembershipDailyBonus` model:
    │   │   │             - `id`, `membershipId` (FK), `userId` (FK)
    │   │   │             - `date` (Date), `coinsAwarded` (Decimal), `claimed` (Boolean)
    │   │   │             - Unique constraint: `[membershipId, date]`
    │   │   │           - Create `MembershipService`:
    │   │   │             * `createMembership(userId, planId)` → Creates membership, grants coins immediately
    │   │   │             * `getMembership(userId)` → Returns user's membership
    │   │   │             * `claimDailyBonus(userId)` → Claims daily bonus (if logged in today)
    │   │   │             * `cancelMembership(userId)` → Cancels membership (keeps coins already granted)
    │   │   │             * `renewMembership(membershipId)` → Processes renewal
    │   │   │           - Background job (cron) for daily bonus distribution (midnight)
    │   │   │           - Integration with Virtual Currency Service: Grant coins on purchase
    │   │   │           - Cache membership status in Redis
    │   │   │           - Emit events: `membership.created`, `membership.renewed`, `membership.cancelled`, `daily-bonus.claimed`
    │   │   │       7.  **Privilege Model (Advanced Chapters):**
    │   │   │           - Create `Privilege` model:
    │   │   │             - `id`, `userId` (FK), `storyId` (FK)
    │   │   │             - `purchasedAt` (DateTime), `expiresAt` (DateTime - 1st of next month)
    │   │   │             - `status` (String: 'active', 'expired')
    │   │   │             - Unique constraint: `[userId, storyId]` (one privilege per user per book)
    │   │   │           - Create `AdvancedChapter` model:
    │   │   │             - `id`, `storyId` (FK), `chapterId` (FK)
    │   │   │             - `chapterNumber` (Int), `isAdvanced` (Boolean, default: true)
    │   │   │             - `releaseDate` (DateTime - future date when chapter becomes public)
    │   │   │             - `privilegeRequired` (Boolean, default: true)
    │   │   │             - `premiumPrice` (Decimal - higher price for advanced chapters)
    │   │   │           - Create `PrivilegePurchase` model:
    │   │   │             - `id`, `privilegeId` (FK), `userId` (FK), `storyId` (FK)
    │   │   │             - `coinsSpent` (Decimal), `purchasedAt` (DateTime)
    │   │   │           - Create `PrivilegeService`:
    │   │   │             * `purchasePrivilege(userId, storyId)` → Purchases privilege (spends coins)
    │   │   │             * `getPrivilege(userId, storyId)` → Returns privilege status
    │   │   │             * `getAdvancedChapters(storyId, userId?)` → Returns advanced chapters (if user has privilege)
    │   │   │             * `checkPrivilegeAccess(userId, storyId, chapterId)` → Checks if user can access advanced chapter
    │   │   │             * `resetMonthlyPrivileges()` → Resets all privileges on 1st of month (cron job)
    │   │   │           - Background job (cron) for monthly reset (1st of month at midnight)
    │   │   │           - Integration with Paywall System: Check privilege before allowing advanced chapter purchase
    │   │   │           - Integration with Pricing Engine: Higher pricing for advanced chapters
    │   │   │           - Integration with Virtual Currency Service: Deduct coins on privilege purchase
    │   │   │           - Cache privilege status in Redis (key: `privilege:${userId}:${storyId}`, TTL: 24 hours)
    │   │   │           - Emit events: `privilege.purchased`, `privilege.expired`
    │   │   │       8.  **All-You-Can-Read Subscription:**
    │   │   │           - Create `Subscription` model:
    │   │   │             - `id`, `userId` (FK, unique), `planId` (FK)
    │   │   │             - `status` (String: 'active', 'cancelled', 'expired')
    │   │   │             - `startDate`, `endDate`, `autoRenew` (Boolean)
    │   │   │             - `cancelledAt` (DateTime, optional)
    │   │   │           - Create `SubscriptionPlan` model:
    │   │   │             - `id`, `name` (String), `type` (String: 'all-you-can-read')
    │   │   │             - `price` (Decimal), `currency` (String)
    │   │   │             - `billingPeriod` (String: 'monthly', 'yearly')
    │   │   │             - `libraryScope` (String, optional), `maxBooks` (Int, optional)
    │   │   │             - `isActive` (Boolean)
    │   │   │           - Create `SubscriptionTransaction` model:
    │   │   │             - `id`, `subscriptionId` (FK), `userId` (FK), `planId` (FK)
    │   │   │             - `amount`, `currency`, `paymentMethod`
    │   │   │             - `status`, `billingPeriod`, `periodStart`, `periodEnd`
    │   │   │           - Create `AllYouCanReadService`:
    │   │   │             * `createSubscription(userId, planId)` → Creates subscription
    │   │   │             * `getSubscription(userId)` → Returns user's subscription
    │   │   │             * `cancelSubscription(userId)` → Cancels subscription (keeps until end date)
    │   │   │             * `renewSubscription(subscriptionId)` → Processes renewal
    │   │   │             * `checkAccess(userId, chapterId)` → Checks subscription access
    │   │   │           - Background job (cron) for renewals and expirations
    │   │   │           - Integration with payment gateways for recurring billing
    │   │   │           - Cache subscription status in Redis
    │   │   │           - Emit events: `subscription.created`, `subscription.renewed`, `subscription.cancelled`
    │   │   │       7.  **Loyalty Program (VIP Levels):**
    │   │   │           - Create `VIPLevel` model:
    │   │   │             - `id`, `name` (String), `level` (Int, unique)
    │   │   │             - `minSpending` (Decimal - minimum spending to unlock)
    │   │   │             - `discountPercent` (Decimal - discount on PPC)
    │   │   │             - `pricePer1000` (Decimal - points per 1000 chars at this level)
    │   │   │             - `monthlyVotes` (Int - guaranteed monthly votes)
    │   │   │             - `benefits` (JSON - additional benefits)
    │   │   │           - Create `VIPMember` model:
    │   │   │             - `id`, `userId` (FK, unique), `currentLevel` (Int)
    │   │   │             - `totalSpending` (Decimal), `currentPeriodSpending` (Decimal)
    │   │   │             - `periodStart`, `nextEvaluation`
    │   │   │           - Create `VIPHistory` model:
    │   │   │             - `id`, `memberId` (FK), `userId` (FK)
    │   │   │             - `levelFrom`, `levelTo`, `reason` (String)
    │   │   │             - `spendingAtUpgrade`, `upgradedAt`
    │   │   │           - Create `LoyaltyProgramService`:
    │   │   │             * `getVIPLevel(userId)` → Returns user's VIP level
    │   │   │             * `calculateVIPLevel(totalSpending)` → Calculates VIP level based on spending
    │   │   │             * `upgradeVIP(userId)` → Checks and upgrades VIP level
    │   │   │             * `getVIPBenefits(userId)` → Returns VIP benefits
    │   │   │             * `recordSpending(userId, amount)` → Records spending, checks for upgrade
    │   │   │           - Integration with Pricing Engine to apply VIP discounts
    │   │   │           - Integration with Monthly Votes for guaranteed votes
    │   │   │           - Background job for period reset and level evaluation
    │   │   │           - Cache VIP level in Redis
    │   │   │           - Emit events: `vip.level.upgraded`, `vip.spending.recorded`
    │   │   │       8.  Update `monetization.proto` (in 7-shared) to add gRPC methods for all features
    │   │   │       9.  Implement gRPC handlers in `monetization.controller.ts`
    │   │   │       10. **Rule #2:** Use gRPC for sync communication with Stories Service, Users Service
    │   │   │       11. **Rule #2:** Use Event Bus (BullMQ) for async event emission
    │   │   │       12. **Rule #7:** Cache hot data (prices, access status, balances) in Redis
    │   │   │       13. **Rule #12:** All payment endpoints MUST be idempotent
    │   │   │       14. **Rule #15:** Monitor costs (payment gateway fees, Redis usage)
    │   │   │   * **Speed Opt (Production):** This service should connect to a **Read Replica** of the PostgreSQL DB for read operations (Rule #7).
    │   │   ├── src/           # (Connects to PostgreSQL, Prisma)
    │   │   │   ├── modules/
    │   │   │   │   ├── virtual-currency/  # Wallet, top-up, transactions
    │   │   │   │   ├── pricing/           # Character-based pricing
    │   │   │   │   ├── paywall/          # Free chapters, access control
    │   │   │   │   ├── payments/         # Purchase flow, receipts
    │   │   │   │   └── subscriptions/    # All-You-Can-Read & VIP
    │   │   │   │       ├── all-you-can-read/  # Netflix-style subscription
    │   │   │   │       └── loyalty-program/    # VIP levels
    │   │   ├── test/
    │   │   │   ├── unit/      # (Tests for services, logic)
    │   │   │   └── integration/ # (Tests integrating with the database)
    │   │   └── package.json
    │   │

---

**Xem thêm:** [README](./README.md) | [Overview](./01-overview.md)

