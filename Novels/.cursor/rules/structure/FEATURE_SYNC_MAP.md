---
alwaysApply: true
---

# 🔄 Feature Synchronization Map

## 🎯 Overview

Tài liệu này đảm bảo tất cả features được đồng bộ hoàn toàn giữa:
- **Services** (Backend microservices)
- **Shared** (Types, DTOs, Proto files)
- **Gateway** (REST/GraphQL endpoints)
- **Clients** (Web, Mobile iOS, Mobile Android)

## ⚠️ Critical Rule

**Mọi feature mới PHẢI được thêm vào tất cả 4 layers theo thứ tự:**
1. **Shared** (Types, DTOs, Proto) - Định nghĩa contracts TRƯỚC
2. **Services** (Business logic) - Implement trong service tương ứng
3. **Gateway** (REST/GraphQL) - Expose endpoints
4. **Clients** (UI/UX) - Implement UI components

---

## 📋 Feature Synchronization Checklist

### ⭐ Prominent Features (Strategic Impact)

#### 1. Privilege Model (Monetization) - Revenue Engine

| Layer | Status | Location | Notes |
|-------|--------|----------|-------|
| **Shared** | ✅ | `types/monetization/privilege.types.ts`<br>`validation/monetization/purchase-privilege.dto.ts`<br>`proto/monetization.proto` | Types: `Privilege`, `AdvancedChapter`, `PrivilegePurchase` |
| **Service** | ✅ | `monetization-service` (Port 3010)<br>`modules/privilege/` | Business logic: Purchase, Check access, Monthly reset |
| **Gateway** | ✅ | `modules/monetization/privilege.controller.ts`<br>`modules/monetization/privilege.resolver.ts` | REST: `/api/privilege/*`<br>GraphQL: `purchasePrivilege()`, `getPrivilege()` |
| **Client Web** | ✅ | `components/features/Monetization/PrivilegePurchase.tsx` | Purchase flow, Advanced chapters list |
| **Client iOS** | ✅ | `Views/Monetization/PrivilegePurchaseView.swift` | Purchase flow, Monthly reset indicators |
| **Client Android** | ✅ | `ui/monetization/PrivilegePurchaseScreen.kt` | Purchase flow, Advanced chapters list |

**Endpoints:**
- REST: `POST /api/privilege/purchase`, `GET /api/privilege/:storyId`, `GET /api/privilege/:storyId/advanced-chapters`
- GraphQL: `purchasePrivilege()`, `getPrivilege()`, `getAdvancedChapters()`

---

#### 2. Pay-Per-Chapter (PPC) Model (Monetization) - Core Revenue Engine

| Layer | Status | Location | Notes |
|-------|--------|----------|-------|
| **Shared** | ✅ | `types/monetization/pricing.types.ts`<br>`validation/monetization/purchase-chapter.dto.ts`<br>`proto/monetization.proto` | Types: `ChapterPrice`, `PricingRule`, `Purchase` |
| **Service** | ✅ | `monetization-service` (Port 3010)<br>`modules/pricing/`, `modules/payments/` | Business logic: Character-based pricing, Paywall, Purchase processing |
| **Gateway** | ✅ | `modules/monetization/payments.controller.ts`<br>`modules/monetization/payments.resolver.ts` | REST: `/api/payments/*`<br>GraphQL: `purchaseChapter()`, `getPurchaseHistory()` |
| **Client Web** | ✅ | `components/features/Monetization/PPCPurchase.tsx` | Purchase flow, Paywall indicators |
| **Client iOS** | ✅ | `Views/Monetization/PPCPurchaseView.swift` | Purchase flow, Transaction history |
| **Client Android** | ✅ | `ui/monetization/PPCPurchaseScreen.kt` | Purchase flow, Paywall indicators |

**Endpoints:**
- REST: `POST /api/payments/purchase-chapter`, `GET /api/payments/history`
- GraphQL: `purchaseChapter()`, `getPurchaseHistory()`

---

#### 3. Paragraph-Level Comments (Community) - Engagement Engine

| Layer | Status | Location | Notes |
|-------|--------|----------|-------|
| **Shared** | ✅ | `types/comment/paragraph-comment.types.ts`<br>`validation/comment/create-paragraph-comment.dto.ts`<br>`proto/community.proto` | Types: `ParagraphComment`, `ParagraphCommentLike`, `ParagraphCommentReply`, `ReactionType` |
| **Service** | ✅ | `community-service` (Port 3009)<br>`modules/paragraph-comments/` | Business logic: Create, Like, Reply, Real-time updates |
| **Gateway** | ✅ | `modules/community/paragraph-comments.controller.ts`<br>`modules/community/paragraph-comments.resolver.ts` | REST: `/api/paragraph-comments/*`<br>GraphQL: `createParagraphComment()`, `getParagraphComments()` |
| **Client Web** | ✅ | `components/features/Community/ParagraphComments.tsx` | Real-time bubble indicators, Inline panel, Quick reactions |
| **Client iOS** | ✅ | `Views/Community/ParagraphCommentsView.swift` | Real-time bubbles, Inline comments, Author interaction |
| **Client Android** | ✅ | `ui/community/ParagraphCommentsScreen.kt` | Real-time bubbles, Inline comments, Quick reactions |

**Endpoints:**
- REST: `POST /api/paragraph-comments`, `GET /api/paragraph-comments/:chapterId`, `GET /api/paragraph-comments/:chapterId/counts`
- GraphQL: `createParagraphComment()`, `getParagraphComments()`, `getParagraphCommentCounts()`
- WebSocket: Real-time updates via `websocket-service`

---

#### 4. Gamified Missions (Users) - F2P Retention Engine

| Layer | Status | Location | Notes |
|-------|--------|----------|-------|
| **Shared** | ✅ | `types/user/gamification.types.ts`<br>`validation/user/get-daily-missions.dto.ts`<br>`proto/users.proto` | Types: `DailyMission`, `MissionReward`, `PowerStone`, `FastPass`, `GamificationReward` |
| **Service** | ✅ | `users-service` (Port 3001)<br>`modules/gamification/` | Business logic: Daily missions, Power Stones, Fast Passes, Points |
| **Gateway** | ✅ | `modules/users/gamification.controller.ts`<br>`modules/users/gamification.resolver.ts` | REST: `/api/gamification/*`<br>GraphQL: `getDailyMissions()`, `claimDailyMission()`, `getPowerStones()` |
| **Client Web** | ✅ | `components/features/Gamification/DailyMissions.tsx` | Daily missions dashboard, Power Stones counter, Fast Passes display |
| **Client iOS** | ✅ | `Views/Gamification/DailyMissionsView.swift` | Daily missions, Power Stones, Fast Passes, Points exchange |
| **Client Android** | ✅ | `ui/gamification/DailyMissionsScreen.kt` | Daily missions dashboard, Power Stones, Fast Passes |

**Endpoints:**
- REST: `GET /api/gamification/daily-missions`, `POST /api/gamification/claim-mission`, `GET /api/gamification/power-stones`
- GraphQL: `getDailyMissions()`, `claimDailyMission()`, `getPowerStones()`, `getFastPasses()`

---

#### 5. AI Narration (AI) - Technology Disruptor

| Layer | Status | Location | Notes |
|-------|--------|----------|-------|
| **Shared** | ✅ | `types/ai/tts.types.ts`<br>`validation/ai/synthesize-speech.dto.ts`<br>`proto/ai.proto` | Types: `TTSAudio`, `EmotionControl`, `VoiceStyle`, `TTSSyncData`, `SyncMode` |
| **Service** | ✅ | `ai-service` (Port 3005)<br>`modules/tts/` | Business logic: Emotional AI narration, Sync data generation |
| **Gateway** | ✅ | `modules/tts/tts.controller.ts`<br>`modules/tts/tts.resolver.ts` | REST: `/api/tts/*`<br>GraphQL: `synthesizeEmotionalSpeech()`, `getTTSWithSync()` |
| **Client Web** | ✅ | `components/features/AI/TTSPlayer.tsx` | Emotional TTS player, Text highlighting sync, Voice style selection |
| **Client iOS** | ✅ | `Views/AI/TTSPlayerView.swift` | Emotional TTS player, Sync highlighting, Emotion control |
| **Client Android** | ✅ | `ui/ai/TTSPlayerScreen.kt` | Emotional TTS player, Text sync, Voice styles |

**Endpoints:**
- REST: `POST /api/tts/synthesize-emotional`, `POST /api/tts/synthesize-with-sync`
- GraphQL: `synthesizeEmotionalSpeech()`, `getTTSWithSync()`

---

## 📚 Core Features

### Library Management

| Layer | Status | Location | Notes |
|-------|--------|----------|-------|
| **Shared** | ✅ | `types/user/library.types.ts`<br>`validation/user/add-to-library.dto.ts`<br>`proto/users.proto` | Types: `Library`, `Bookshelf`, `Wishlist` |
| **Service** | ✅ | `users-service` (Port 3001)<br>`modules/library/`, `modules/bookshelf/` | Business logic: CRUD, Sync, Download, Storage |
| **Gateway** | ✅ | `modules/library/library.controller.ts`<br>`modules/library/library.resolver.ts` | REST: `/api/library/*`<br>GraphQL: `library()`, `addToLibrary()` |
| **Client Web** | ✅ | `components/features/Library/LibraryView.tsx` | Library view, Bookshelf management, Sync status |
| **Client iOS** | ✅ | `Views/Library/LibraryView.swift` | Library view, Bookshelf organization, Offline download |
| **Client Android** | ✅ | `ui/library/LibraryScreen.kt` | Library view, Bookshelf management, Offline support |

**Endpoints:**
- REST: `GET /api/library`, `POST /api/library`, `GET /api/bookshelves`
- GraphQL: `library()`, `addToLibrary()`, `bookshelves()`

---

### Reading Progress

| Layer | Status | Location | Notes |
|-------|--------|----------|-------|
| **Shared** | ✅ | `types/user/reading-progress.types.ts`<br>`validation/user/update-reading-progress.dto.ts`<br>`proto/users.proto` | Types: `ReadingProgress` |
| **Service** | ✅ | `users-service` (Port 3001)<br>`modules/reading-progress/` | Business logic: Track progress, Sync across devices |
| **Gateway** | ✅ | `modules/library/reading-progress.controller.ts`<br>`modules/library/reading-progress.resolver.ts` | REST: `/api/reading-progress/*`<br>GraphQL: `readingProgress()`, `updateReadingProgress()` |
| **Client Web** | ✅ | `components/features/Reader/ReadingProgress.tsx` | Progress display, Sync indicator |
| **Client iOS** | ✅ | `Views/Reader/ReadingProgressView.swift` | Progress tracking, Auto-sync |
| **Client Android** | ✅ | `ui/reader/ReadingProgressScreen.kt` | Progress display, Background sync |

**Endpoints:**
- REST: `GET /api/reading-progress`, `PUT /api/reading-progress`, `GET /api/reading-progress/sync`
- GraphQL: `readingProgress()`, `updateReadingProgress()`, `syncReadingProgress()`

---

### Annotations (Enhanced - Annotation Suite)

| Layer | Status | Location | Notes |
|-------|--------|----------|-------|
| **Shared** | ✅ | `types/user/annotation.types.ts`<br>`validation/user/create-annotation.dto.ts`<br>`validation/user/generate-annotation-summary.dto.ts`<br>`proto/users.proto` | Types: `Annotation`, `AnnotationSource`, `AnnotationSummary`, `ExportFormat` |
| **Service** | ✅ | `users-service` (Port 3001)<br>`modules/annotations/` | Business logic: CRUD, AI Summary, Export, Unification, Revisitation |
| **Gateway** | ✅ | `modules/annotations/annotations.controller.ts`<br>`modules/annotations/annotations.resolver.ts` | REST: `/api/annotations/*`<br>GraphQL: `annotations()`, `generateAnnotationSummary()`, `exportAnnotations()` |
| **Client Web** | ✅ | `components/features/Reader/Annotations.tsx` | AI Summary, Export to Notion/Obsidian, Unification, Revisitation queue |
| **Client iOS** | ✅ | `Views/Reader/AnnotationsView.swift` | AI Summary, Export, Annotation templates, Search |
| **Client Android** | ✅ | `ui/reader/AnnotationsScreen.kt` | AI Summary, Export, Templates, Search |

**Endpoints:**
- REST: `POST /api/annotations/generate-summary`, `POST /api/annotations/export`, `GET /api/annotations/revisitation-queue`
- GraphQL: `generateAnnotationSummary()`, `exportAnnotations()`, `getRevisitationQueue()`

---

### Discovery & Rankings

| Layer | Status | Location | Notes |
|-------|--------|----------|-------|
| **Shared** | ✅ | `types/story/ranking.types.ts`<br>`validation/story/get-rankings.dto.ts`<br>`proto/stories.proto` | Types: `Ranking`, `RankingType`, `TimeRange` |
| **Service** | ✅ | `stories-service` (Port 3002)<br>`modules/rankings/` | Business logic: Calculate rankings, Editor's Picks, Genre browsing |
| **Gateway** | ✅ | `modules/discovery/discovery.controller.ts`<br>`modules/discovery/discovery.resolver.ts` | REST: `/api/rankings`, `/api/editor-picks`, `/api/genres/*`<br>GraphQL: `rankings()`, `editorPicks()`, `genres()` |
| **Client Web** | ✅ | `components/features/Storefront/Rankings.tsx` | Rankings display, Editor's Picks, Genre navigation |
| **Client iOS** | ✅ | `Views/Storefront/RankingsView.swift` | Rankings, Editor's Picks, Genre browsing |
| **Client Android** | ✅ | `ui/storefront/RankingsScreen.kt` | Rankings display, Editor's Picks |

**Endpoints:**
- REST: `GET /api/rankings`, `GET /api/editor-picks`, `GET /api/genres/:id/stories`
- GraphQL: `rankings()`, `editorPicks()`, `genres()`

---

### Voting System (Power Stones & Monthly Votes)

| Layer | Status | Location | Notes |
|-------|--------|----------|-------|
| **Shared** | ✅ | `types/story/voting.types.ts`<br>`validation/story/cast-power-stone.dto.ts`<br>`proto/stories.proto` | Types: `PowerStone`, `StoryVote`, `VoteType` |
| **Service** | ✅ | `stories-service` (Port 3002)<br>`modules/voting/` | Business logic: Cast votes, Calculate rankings |
| **Gateway** | ✅ | `modules/discovery/voting.controller.ts`<br>`modules/discovery/voting.resolver.ts` | REST: `/api/voting/*`<br>GraphQL: `castPowerStone()`, `castMonthlyVote()` |
| **Client Web** | ✅ | `components/features/Community/Voting.tsx` | Power Stones casting, Monthly Votes, Vote history |
| **Client iOS** | ✅ | `Views/Community/VotingView.swift` | Power Stones, Monthly Votes |
| **Client Android** | ✅ | `ui/community/VotingScreen.kt` | Power Stones casting, Monthly Votes |

**Endpoints:**
- REST: `POST /api/voting/cast-power-stone`, `POST /api/voting/cast-monthly-vote`, `GET /api/voting/user-votes`
- GraphQL: `castPowerStone()`, `castMonthlyVote()`, `getUserVotes()`

---

### AI Recommendations (Enhanced)

| Layer | Status | Location | Notes |
|-------|--------|----------|-------|
| **Shared** | ✅ | `types/ai/recommendation.types.ts`<br>`validation/ai/get-recommendations.dto.ts`<br>`proto/ai.proto` | Types: `Recommendation`, `MoodBasedRecommendation`, `Mood`, `NaturalLanguageQuery`, `FilterBubbleBreaker` |
| **Service** | ✅ | `ai-service` (Port 3005)<br>`modules/recommendations/` | Business logic: Mood-based, Natural language search, Filter bubble breaker |
| **Gateway** | ✅ | `modules/recommendations/recommendations.controller.ts`<br>`modules/recommendations/recommendations.resolver.ts` | REST: `/api/recommendations/*`<br>GraphQL: `getMoodBasedRecommendations()`, `searchByNaturalLanguage()` |
| **Client Web** | ✅ | `components/features/Recommendations/MoodBased.tsx` | Mood selector, Natural language search, Explore New Territories |
| **Client iOS** | ✅ | `Views/Recommendations/RecommendationsView.swift` | Mood-based, Natural language search |
| **Client Android** | ✅ | `ui/recommendations/RecommendationsScreen.kt` | Mood-based recommendations, Natural language search |

**Endpoints:**
- REST: `GET /api/recommendations/mood-based`, `POST /api/recommendations/natural-language-search`, `GET /api/recommendations/explore-new-territories`
- GraphQL: `getMoodBasedRecommendations()`, `searchByNaturalLanguage()`, `exploreNewTerritories()`

---

### Translation & Dictionary (Enhanced)

| Layer | Status | Location | Notes |
|-------|--------|----------|-------|
| **Shared** | ✅ | `types/ai/translation.types.ts`<br>`types/ai/dictionary.types.ts`<br>`validation/ai/translate-text.dto.ts`<br>`proto/ai.proto` | Types: `SentenceTranslation`, `ParallelTranslation`, `TouchTranslateResult`, `DictionarySource` |
| **Service** | ✅ | `ai-service` (Port 3005)<br>`modules/translation/`, `modules/dictionary/` | Business logic: Sentence-level, Parallel translation, Touch-to-translate |
| **Gateway** | ✅ | `modules/tts/translation.controller.ts`<br>`modules/tts/dictionary.controller.ts` | REST: `/api/translate/*`, `/api/dictionary/*`<br>GraphQL: `translateSentence()`, `getParallelTranslation()`, `touchTranslate()` |
| **Client Web** | ✅ | `components/features/AI/Translation.tsx` | Sentence translation, Parallel view, Dictionary popup |
| **Client iOS** | ✅ | `Views/AI/TranslationView.swift` | Touch-to-translate, Sentence/Parallel translation, Dictionary (ABBYY) |
| **Client Android** | ✅ | `ui/ai/TranslationScreen.kt` | Touch-to-translate, Sentence/Parallel translation, Dictionary |

**Endpoints:**
- REST: `POST /api/translate/sentence`, `POST /api/translate/parallel`, `POST /api/dictionary/touch-translate`
- GraphQL: `translateSentence()`, `getParallelTranslation()`, `touchTranslate()`

---

### Social Features (Traditional)

| Layer | Status | Location | Notes |
|-------|--------|----------|-------|
| **Shared** | ✅ | `types/social/post.types.ts`<br>`types/social/group.types.ts`<br>`types/social/reading-challenge.types.ts`<br>`proto/social.proto` | Types: `Post`, `Group`, `BookClub`, `ReadingChallenge`, `ActivityTracking` |
| **Service** | ✅ | `social-service` (Port 3008)<br>`modules/posts/`, `modules/groups/`, `modules/reading-challenges/` | Business logic: Posts, Groups, Book Clubs, Reading Challenges, Activity Tracking |
| **Gateway** | ✅ | `modules/social/posts.controller.ts`<br>`modules/social/groups.controller.ts`<br>`modules/social/reading-challenges.controller.ts` | REST: `/api/posts/*`, `/api/groups/*`, `/api/reading-challenges/*`<br>GraphQL: `createPost()`, `joinGroup()`, `createReadingChallenge()` |
| **Client Web** | ✅ | `components/features/Social/Feed.tsx` | Social feed, Book Clubs, Reading Challenges, Friends' progress |
| **Client iOS** | ✅ | `Views/Social/FeedView.swift` | Social feed, Groups, Challenges |
| **Client Android** | ✅ | `ui/social/FeedScreen.kt` | Social feed, Book Clubs, Challenges |

**Endpoints:**
- REST: `GET /api/feed`, `POST /api/posts`, `POST /api/book-clubs`, `GET /api/reading-challenges/friends-progress`
- GraphQL: `feed()`, `createPost()`, `createBookClub()`, `getFriendProgress()`

---

### Virtual Currency & Wallet

| Layer | Status | Location | Notes |
|-------|--------|----------|-------|
| **Shared** | ✅ | `types/monetization/virtual-currency.types.ts`<br>`validation/monetization/top-up.dto.ts`<br>`proto/monetization.proto` | Types: `Wallet`, `CurrencyTransaction` |
| **Service** | ✅ | `monetization-service` (Port 3010)<br>`modules/wallet/` | Business logic: Balance, Top-up, Transaction history |
| **Gateway** | ✅ | `modules/monetization/wallet.controller.ts`<br>`modules/monetization/wallet.resolver.ts` | REST: `/api/wallet/*`<br>GraphQL: `getBalance()`, `topUp()`, `getTransactionHistory()` |
| **Client Web** | ✅ | `components/features/Monetization/Wallet.tsx` | Wallet display, Top-up flow, Transaction history |
| **Client iOS** | ✅ | `Views/Monetization/WalletView.swift` | Wallet balance, Top-up, History |
| **Client Android** | ✅ | `ui/monetization/WalletScreen.kt` | Wallet display, Top-up, Transactions |

**Endpoints:**
- REST: `GET /api/wallet/balance`, `POST /api/wallet/top-up`, `GET /api/wallet/transactions`
- GraphQL: `getBalance()`, `topUp()`, `getTransactionHistory()`

---

### Membership (Coin Packages)

| Layer | Status | Location | Notes |
|-------|--------|----------|-------|
| **Shared** | ✅ | `types/monetization/membership.types.ts`<br>`validation/monetization/create-membership.dto.ts`<br>`proto/monetization.proto` | Types: `Membership`, `MembershipPlan`, `MembershipDailyBonus` |
| **Service** | ✅ | `monetization-service` (Port 3010)<br>`modules/membership/` | Business logic: Create membership, Daily bonus, Auto-renew |
| **Gateway** | ✅ | `modules/monetization/membership.controller.ts`<br>`modules/monetization/membership.resolver.ts` | REST: `/api/membership/*`<br>GraphQL: `createMembership()`, `getMembership()`, `claimDailyBonus()` |
| **Client Web** | ✅ | `components/features/Monetization/Membership.tsx` | Membership plans, Daily bonus claim, Status display |
| **Client iOS** | ✅ | `Views/Monetization/MembershipView.swift` | Membership plans, Daily bonus |
| **Client Android** | ✅ | `ui/monetization/MembershipScreen.kt` | Membership display, Daily bonus |

**Endpoints:**
- REST: `POST /api/membership/create`, `GET /api/membership`, `POST /api/membership/claim-daily-bonus`
- GraphQL: `createMembership()`, `getMembership()`, `claimDailyBonus()`

---

### Fan Economy (Tipping, Rankings, Monthly Votes)

| Layer | Status | Location | Notes |
|-------|--------|----------|-------|
| **Shared** | ✅ | `types/comment/paragraph-comment.types.ts`<br>`validation/community/create-tip.dto.ts`<br>`proto/community.proto` | Types: `Tip`, `FanRanking`, `MonthlyVote` |
| **Service** | ✅ | `community-service` (Port 3009)<br>`modules/fan-economy/` | Business logic: Tipping, Fan rankings, Monthly votes |
| **Gateway** | ✅ | `modules/community/fan-economy.controller.ts`<br>`modules/community/fan-economy.resolver.ts` | REST: `/api/fan-economy/*`<br>GraphQL: `createTip()`, `getFanRankings()`, `castMonthlyVote()` |
| **Client Web** | ✅ | `components/features/Community/FanEconomy.tsx` | Tipping UI, Fan rankings, Monthly votes |
| **Client iOS** | ✅ | `Views/Community/FanEconomyView.swift` | Tipping, Rankings display |
| **Client Android** | ✅ | `ui/community/FanEconomyScreen.kt` | Tipping flow, Rankings |

**Endpoints:**
- REST: `POST /api/fan-economy/tips`, `GET /api/fan-economy/rankings`, `POST /api/fan-economy/monthly-votes`
- GraphQL: `createTip()`, `getFanRankings()`, `castMonthlyVote()`

---

### Author Ecosystem

| Layer | Status | Location | Notes |
|-------|--------|----------|-------|
| **Shared** | ✅ | `types/story/author-ecosystem.types.ts`<br>`validation/story/get-author-dashboard.dto.ts`<br>`proto/stories.proto` | Types: `AuthorDashboard`, `AuthorAnalytics`, `AuthorRevenue`, `ReaderInsights` |
| **Service** | ✅ | `stories-service` (Port 3002)<br>`modules/author-ecosystem/` | Business logic: Dashboard, Analytics, Revenue tracking, Reader insights |
| **Gateway** | ✅ | `modules/discovery/author-ecosystem.controller.ts`<br>`modules/discovery/author-ecosystem.resolver.ts` | REST: `/api/authors/:id/*`<br>GraphQL: `getAuthorDashboard()`, `getAuthorAnalytics()`, `getAuthorRevenue()` |
| **Client Web** | ✅ | `components/features/Author/Dashboard.tsx` | Author dashboard, Analytics, Revenue, Reader insights |
| **Client iOS** | ✅ | `Views/Author/DashboardView.swift` | Author dashboard, Analytics |
| **Client Android** | ✅ | `ui/author/DashboardScreen.kt` | Author dashboard, Analytics display |

**Endpoints:**
- REST: `GET /api/authors/:id/dashboard`, `GET /api/authors/:id/analytics`, `GET /api/authors/:id/revenue`
- GraphQL: `getAuthorDashboard()`, `getAuthorAnalytics()`, `getAuthorRevenue()`

---

## 🔍 Verification Checklist

Khi thêm feature mới, đảm bảo:

- [ ] **Shared**: Types, DTOs, Proto files đã được định nghĩa
- [ ] **Service**: Business logic đã được implement trong service tương ứng
- [ ] **Gateway**: REST controllers và GraphQL resolvers đã được tạo
- [ ] **Client Web**: React components đã được implement
- [ ] **Client iOS**: SwiftUI views đã được implement
- [ ] **Client Android**: Jetpack Compose screens đã được implement
- [ ] **Documentation**: Tất cả documentation đã được cập nhật
- [ ] **Testing**: Unit tests và integration tests đã được viết

---

## 📝 Notes

- **Rule #3**: Tất cả contracts PHẢI được định nghĩa trong Shared trước
- **Rule #4**: Gateway chỉ routing, KHÔNG có business logic
- **Rule #5**: Web dùng React Query + Zustand, Mobile dùng MVVM + Repository
- Tất cả features phải có cả REST (Web) và GraphQL (Mobile) endpoints
- WebSocket được sử dụng cho real-time features (Paragraph Comments, Notifications)

---

**💡 Tip**: Sử dụng tài liệu này như một checklist khi thêm feature mới để đảm bảo đồng bộ hoàn toàn!

