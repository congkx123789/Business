---
alwaysApply: true
---

├── 📦 1-gateway/                    # 🌐 API GATEWAY (NestJS) - BFF Layer
    │   │
    │   ├── 📋 Package Info
    │   │   ├── **Goal:** Single entry point. AuthN, Routing, Rate Limiting, Client-specific Optimizations.
    │   │   ├── **Key Tech:** 
    │   │   │   - `@nestjs/passport` (JWT strategy)
    │   │   │   - `@nestjs/jwt` (token signing/verification)
    │   │   │   - `@nestjs/microservices` (gRPC Client to call 2-services)
    │   │   │   - `@nestjs/throttler` (rate limiting)
    │   │   │   - `@nestjs/graphql` (Apollo Server for Mobile BFF)
    │   │   │   - `cache-manager` (Redis-backed Gateway Caching)
    │   │   └── **Rule #4:** Gateway is a "Bouncer", NOT the "Brain" - NO business logic!
    │   │
    │   ├── 📁 Source Code Structure
    │   │   └── src/
    │   │       ├── main.ts                      # Application entry point
    │   │       ├── app.module.ts                 # Root module
    │   │       │
    │   │       ├── 📁 auth/                      # Authentication Module (Root Level) ✅
    │   │       │   ├── auth.module.ts            # Auth module definition
    │   │       │   ├── auth.controller.ts        # Auth endpoints (login, register, refresh)
    │   │       │   ├── auth.service.ts           # Auth business logic
    │   │       │   ├── jwt.strategy.ts           # JWT passport strategy
    │   │       │   ├── guards/                   # Auth guards
    │   │       │   │   └── jwt-auth.guard.ts     # JWT authentication guard
    │   │       │   └── dto/                      # Auth DTOs
    │   │       │       ├── login.dto.ts
    │   │       │       ├── register.dto.ts
    │   │       │       └── refresh-token.dto.ts
    │   │       │
    │   │       ├── 📁 config/                    # Configuration
    │   │       │   └── app.config.ts             # App configuration (ports, env vars)
    │   │       │
    │   │       ├── 📁 common/                    # Shared infrastructure modules/utilities
    │   │       │   ├── cache/                    # Redis cache integration + cache interceptor
    │   │       │   ├── decorators/               # current-user, roles, public, trace-id
    │   │       │   ├── dto/                      # Common DTOs (pagination, etc.)
    │   │       │   ├── filters/                  # http-exception.filter.ts
    │   │       │   ├── graphql/                  # GraphQL module bootstrap
    │   │       │   ├── guards/                   # Shared guards (if any)
    │   │       │   ├── interceptors/             # logging, transform, cache interceptors
    │   │       │   ├── middleware/               # trace-id middleware, etc.
    │   │       │   ├── pipes/                    # validation.pipe.ts, parse-int pipe
    │   │       │   ├── throttler/                # ThrottlerModule wrapper
    │   │       │   ├── types/                    # gRPC type helpers
    │   │       │   └── utils/                    # error, password, gRPC helpers
    │   │       │
    │   │       ├── 📁 clients/                   # gRPC Clients (to call 2-services)
    │   │       │   ├── users-client.ts           # Users service gRPC client (Port 3001)
    │   │       │   ├── stories-client.ts         # Stories service gRPC client (Port 3002)
    │   │       │   ├── comments-client.ts        # Comments service gRPC client (Port 3003)
    │   │       │   ├── search-client.ts          # Search service gRPC client (Port 3004)
    │   │       │   ├── ai-client.ts              # AI service gRPC client (Port 3005)
    │   │       │   ├── notification-client.ts   # Notification service gRPC client (Port 3006)
    │   │       │   ├── websocket-client.ts      # WebSocket service gRPC client (Port 3007)
    │   │       │   ├── social-client.ts          # Social service gRPC client (Port 3008)
    │   │       │   ├── community-client.ts       # Community service gRPC client (Port 3009) ⭐
    │   │       │   └── monetization-client.ts    # Monetization service gRPC client (Port 3010) ⭐
    │   │       │
            │   │       ├── 📁 clients/                   # gRPC client modules (1 per backend service)
            │   │       │   ├── users-client.module.ts
            │   │       │   ├── stories-client.module.ts
            │   │       │   ├── comments-client.module.ts
            │   │       │   ├── search-client.module.ts
            │   │       │   ├── ai-client.module.ts
            │   │       │   ├── notification-client.module.ts
            │   │       │   ├── websocket-client.module.ts
            │   │       │   ├── social-client.module.ts
            │   │       │   ├── community-client.module.ts
            │   │       │   └── monetization-client.module.ts
            │   │       │
            │   │       └── 📁 modules/                    # Feature Modules (REST Controllers & GraphQL Resolvers)
            │   │           │
            │   │           ├── 📁 stories/                # Stories API Module
            │   │           │   ├── stories.controller.ts  # REST: GET /api/stories, GET /api/stories/:id
            │   │           │   ├── stories.resolver.ts    # GraphQL: story(id), stories()
            │   │           │   └── stories.module.ts
            │   │           │
            │   │           ├── 📁 books/                  # Books API Module (REST only)
            │   │           │   ├── books.controller.ts    # REST: GET /api/books, GET /api/books/:id
            │   │           │   ├── books.service.ts       # Calls stories-service via gRPC
            │   │           │   └── books.module.ts
            │   │           │
            │   │           ├── 📁 chapters/               # Chapters API Module (REST only)
            │   │           │   ├── chapters.controller.ts # REST: GET /api/chapters, GET /api/chapters/:id
            │   │           │   ├── chapters.service.ts    # Calls stories-service via gRPC
            │   │           │   └── chapters.module.ts
            │   │           │
            │   │           ├── 📁 categories/            # Categories API Module (REST only)
            │   │           │   ├── categories.controller.ts # REST: GET /api/categories
            │   │           │   ├── categories.service.ts   # Calls stories-service via gRPC
            │   │           │   └── categories.module.ts
            │   │           │
            │   │           ├── 📁 reviews/                 # Reviews API Module (REST only)
            │   │           │   ├── reviews.controller.ts  # REST: GET/POST /api/reviews
            │   │           │   ├── reviews.service.ts     # Calls comments-service via gRPC
            │   │           │   └── reviews.module.ts
    │   │           │
    │   │           ├── 📁 discovery/              # Discovery & Storefront API Module (Enhanced - Voting System)
    │   │           │   ├── discovery.controller.ts  # REST: Rankings, Editor Picks, Genre Browsing, Search
    │   │           │   │   │                        # - GET /api/rankings (ranking charts)
    │   │           │   │   │                        # - GET /api/editor-picks (featured stories)
    │   │           │   │   │                        # - GET /api/genres (genre navigation)
    │   │           │   │   │                        # - GET /api/genres/:id/stories (genre browsing)
    │   │           │   │   │                        # - GET /api/search (full-text search)
    │   │           │   │   │                        # - GET /api/storefront (homepage data aggregation)
    │   │           │   ├── discovery.resolver.ts    # GraphQL: rankings(), editorPicks(), genres(), search()
    │   │           │   ├── voting.controller.ts     # REST: Voting System (NEW)
    │   │           │   │   │                        # - POST /api/voting/cast-power-stone (Cast Power Stone)
    │   │           │   │   │                        # - POST /api/voting/cast-monthly-vote (Cast Monthly Vote)
    │   │           │   │   │                        # - GET /api/voting/user-votes (Get user's available votes)
    │   │           │   ├── voting.resolver.ts       # GraphQL: castPowerStone(), castMonthlyVote(), getUserVotes()
│   │           │   ├── author-ecosystem.controller.ts  # REST: Author Ecosystem (NEW)
│   │           │   │   │                        # - GET /api/authors/:id/dashboard (Author dashboard)
│   │           │   │   │                        # - GET /api/authors/:id/analytics (Author analytics)
│   │           │   │   │                        # - GET /api/authors/:id/revenue (Author revenue)
│   │           │   │   │                        # - GET /api/authors/:id/engagement (Votes/comments/tips)
│   │           │   │   │                        # - GET /api/authors/:id/reader-insights (Reading behavior)
    │   │           │   │   │                        # - GET /api/authors/:id/engagement (Engagement metrics)
    │   │           │   │   │                        # - GET /api/authors/:id/reader-insights (Reader behavior insights)
│   │           │   ├── author-ecosystem.resolver.ts  # GraphQL: getAuthorDashboard(), getAuthorAnalytics(), getAuthorRevenue(), getAuthorEngagement(), getReaderInsights()
    │   │           │   └── discovery.module.ts
    │   │           │
    │   │           ├── 📁 recommendations/        # Recommendations API Module (Enhanced)
    │   │           │   ├── recommendations.controller.ts  # REST: Personalized Recommendations
    │   │           │   │   │                        # - GET /api/recommendations (personalized recommendations)
    │   │           │   │   │                        # - GET /api/recommendations/mood-based (mood-based recommendations) (NEW)
    │   │           │   │   │                        # - POST /api/recommendations/natural-language-search (natural language search) (NEW)
    │   │           │   │   │                        # - GET /api/recommendations/explore-new-territories (breaking filter bubbles) (NEW)
    │   │           │   │   │                        # - GET /api/stories/:id/similar (similar stories)
    │   │           │   │   │                        # - GET /api/trending (trending stories)
    │   │           │   │   │                        # - GET /api/recommendations/:storyId/explain (explanation)
    │   │           │   ├── recommendations.resolver.ts    # GraphQL: recommendations(), getMoodBasedRecommendations(), searchByNaturalLanguage(), exploreNewTerritories()
    │   │           │   └── recommendations.module.ts
    │   │           │
    │   │           ├── 📁 users/                  # Users API Module (Enhanced - F2P Gamification)
    │   │           │   ├── users.controller.ts    # REST: GET /api/users/:id
    │   │           │   ├── users.resolver.ts      # GraphQL: user(id)
    │   │           │   ├── gamification.controller.ts  # REST: F2P Gamification (NEW)
    │   │           │   │   │                        # - GET /api/gamification/daily-missions (Get daily missions)
    │   │           │   │   │                        # - POST /api/gamification/claim-mission (Claim mission reward)
    │   │           │   │   │                        # - GET /api/gamification/power-stones (Get Power Stones)
    │   │           │   │   │                        # - GET /api/gamification/fast-passes (Get Fast Passes)
    │   │           │   │   │                        # - POST /api/gamification/use-fast-pass (Use Fast Pass)
    │   │           │   │   │                        # - POST /api/gamification/exchange-points (Exchange Points for Fast Pass)
    │   │           │   ├── gamification.resolver.ts  # GraphQL: getDailyMissions(), claimDailyMission(), getPowerStones(), getFastPasses()
    │   │           │   └── users.module.ts
    │   │           │
    │   │           ├── 📁 reading-preferences/    # Reading Preferences API
    │   │           │   ├── reading-preferences.controller.ts  # REST: GET/PUT /api/reading-preferences
    │   │           │   ├── reading-preferences.resolver.ts    # GraphQL: readingPreferences(), updateReadingPreferences()
    │   │           │   └── reading-preferences.module.ts
    │   │           │
    │   │           ├── 📁 bookmarks/              # Bookmarks API
    │   │           │   ├── bookmarks.controller.ts  # REST: GET/POST/DELETE /api/bookmarks
    │   │           │   ├── bookmarks.resolver.ts    # GraphQL: bookmarks(storyId)
    │   │           │   └── bookmarks.module.ts
    │   │           │
    │   │           ├── 📁 annotations/             # Annotations API (Enhanced - Annotation Suite)
    │   │           │   ├── annotations.controller.ts  # REST: GET/POST/PUT/DELETE /api/annotations
    │   │           │   │   │                        # - POST /api/annotations/generate-summary (AI summary from highlights) (NEW)
    │   │           │   │   │                        # - POST /api/annotations/export (Export to Notion/Obsidian/Capacities) (NEW)
    │   │           │   │   │                        # - POST /api/annotations/unify (Unify from multiple sources) (NEW)
    │   │           │   │   │                        # - GET /api/annotations/revisitation-queue (Spaced repetition queue) (NEW)
    │   │           │   ├── annotations.resolver.ts    # GraphQL: annotations(chapterId), generateAnnotationSummary(), exportAnnotations()
    │   │           │   └── annotations.module.ts
    │   │           │
            │   │           ├── 📁 library/                 # Library & Bookshelf API (Consolidated Module)
            │   │           │   ├── library.controller.ts     # REST: GET/POST/DELETE /api/library
            │   │           │   ├── bookshelves.controller.ts # REST: GET/POST/PUT/DELETE /api/bookshelves
            │   │           │   ├── wishlist.controller.ts    # REST: GET/POST/DELETE /api/wishlist
            │   │           │   ├── reading-progress.controller.ts  # REST: GET/PUT /api/reading-progress
            │   │           │   ├── library.resolver.ts       # GraphQL: library(), bookshelves(), wishlist(), readingProgress() (all in one resolver)
            │   │           │   ├── library.service.ts        # Service layer (calls users-service via gRPC)
            │   │           │   └── library.module.ts
    │   │           │
    │   │           ├── 📁 social/                  # Social Features API (Enhanced - Traditional Social Features)
    │   │           │   ├── feed.controller.ts       # REST: GET /api/feed
    │   │           │   ├── feed.resolver.ts        # GraphQL: feed()
    │   │           │   ├── posts.controller.ts      # REST: POST /api/posts
    │   │           │   ├── posts.resolver.ts       # GraphQL: createPost()
    │   │           │   ├── groups.controller.ts     # REST: GET/POST /api/groups
    │   │           │   ├── groups.resolver.ts      # GraphQL: group(id), joinGroup()
    │   │           │   ├── book-clubs.controller.ts  # REST: Book Clubs (NEW)
    │   │           │   │   │                        # - POST /api/book-clubs (Create book club)
    │   │           │   │   │                        # - POST /api/book-clubs/:id/schedule-reading (Schedule group reading)
    │   │           │   │   │                        # - GET /api/book-clubs/:id/schedule (Get reading schedule)
    │   │           │   ├── book-clubs.resolver.ts    # GraphQL: createBookClub(), scheduleGroupReading()
    │   │           │   ├── reading-challenges.controller.ts  # REST: Reading Challenges (NEW)
    │   │           │   │   │                        # - POST /api/reading-challenges (Create challenge)
    │   │           │   │   │                        # - POST /api/reading-challenges/:id/join (Join challenge)
    │   │           │   │   │                        # - GET /api/reading-challenges/:id/progress (Get progress)
    │   │           │   │   │                        # - GET /api/reading-challenges/friends-progress (Get friends' progress) (KEY FEATURE)
    │   │           │   ├── reading-challenges.resolver.ts  # GraphQL: createReadingChallenge(), joinChallenge(), getFriendProgress()
    │   │           │   ├── activity-tracking.controller.ts  # REST: Activity Tracking (NEW)
    │   │           │   │   │                        # - POST /api/activity-tracking/goals (Set reading goal)
    │   │           │   │   │                        # - GET /api/activity-tracking/feed (Get activity feed)
    │   │           │   │   │                        # - GET /api/activity-tracking/statistics (Get reading statistics)
    │   │           │   ├── activity-tracking.resolver.ts  # GraphQL: setReadingGoal(), getActivityFeed(), getReadingStatistics()
    │   │           │   └── social.module.ts
    │   │           │
            │   │           ├── 📁 tts/                     # TTS API (Emotional AI narration)
            │   │           │   ├── tts.controller.ts       # REST: POST /api/tts/synthesize (+ emotional/sync variants)
            │   │           │   ├── tts.resolver.ts         # GraphQL: synthesizeSpeech(), synthesizeEmotionalSpeech(), getTTSWithSync()
            │   │           │   └── tts.module.ts
            │   │           │
            │   │           ├── 📁 translation/             # Translation APIs
            │   │           │   ├── translation.controller.ts  # REST: POST /api/translate/*
            │   │           │   ├── translation.resolver.ts    # GraphQL: translateText(), translateSentence(), getParallelTranslation()
            │   │           │   └── translation.module.ts
            │   │           │
            │   │           ├── 📁 dictionary/              # Dictionary & touch-to-translate
            │   │           │   ├── dictionary.controller.ts  # REST: GET /api/dictionary/lookup, POST /api/dictionary/touch-translate
            │   │           │   ├── dictionary.resolver.ts    # GraphQL: lookupWord(), touchTranslate()
            │   │           │   └── dictionary.module.ts
    │   │           │
    │   │           ├── 📁 monetization/            # Monetization API (Enhanced - Membership, Privilege)
    │   │           │   ├── wallet.controller.ts   # REST: Virtual Currency
    │   │           │   │   │                        # - GET /api/wallet/balance (Get wallet balance)
    │   │           │   │   │                        # - POST /api/wallet/top-up (Top-up wallet)
    │   │           │   │   │                        # - GET /api/wallet/transactions (Get transaction history)
    │   │           │   ├── wallet.resolver.ts     # GraphQL: getBalance(), topUp(), getTransactionHistory()
    │   │           │   ├── membership.controller.ts  # REST: Membership (Coin Packages) (NEW)
    │   │           │   │   │                        # - POST /api/membership/create (Create membership)
    │   │           │   │   │                        # - GET /api/membership (Get membership)
    │   │           │   │   │                        # - POST /api/membership/claim-daily-bonus (Claim daily bonus)
    │   │           │   │   │                        # - POST /api/membership/cancel (Cancel membership)
    │   │           │   ├── membership.resolver.ts  # GraphQL: createMembership(), getMembership(), claimDailyBonus()
    │   │           │   ├── privilege.controller.ts  # REST: Privilege (Advanced Chapters) (NEW)
    │   │           │   │   │                        # - POST /api/privilege/purchase (Purchase privilege)
    │   │           │   │   │                        # - GET /api/privilege/:storyId (Get privilege status)
    │   │           │   │   │                        # - GET /api/privilege/:storyId/advanced-chapters (Get advanced chapters)
    │   │           │   │   │                        # - GET /api/privilege/:storyId/:chapterId/check-access (Check privilege access)
    │   │           │   ├── privilege.resolver.ts   # GraphQL: purchasePrivilege(), getPrivilege(), getAdvancedChapters()
    │   │           │   ├── payments.controller.ts  # REST: Payment Processing
    │   │           │   │   │                        # - POST /api/payments/purchase-chapter (Purchase chapter)
    │   │           │   │   │                        # - POST /api/payments/purchase-bulk (Bulk purchase)
    │   │           │   │   │                        # - GET /api/payments/history (Get purchase history)
    │   │           │   ├── payments.resolver.ts  # GraphQL: purchaseChapter(), purchaseBulk(), getPurchaseHistory()
    │   │           │   └── monetization.module.ts
    │   │           │
            │   │           ├── 📁 community/              # Community API (Enhanced - Hierarchical Comments, Fan Economy) ⭐
            │   │           │   ├── paragraph-comments.controller.ts  # REST: Paragraph Comments (Micro Level - Duanping) ⭐
            │   │           │   │   │                        # - POST /api/paragraph-comments (Create paragraph comment)
            │   │           │   │   │                        # - GET /api/paragraph-comments/:chapterId (Get comments for chapter)
            │   │           │   │   │                        # - GET /api/paragraph-comments/:chapterId/counts (Get comment counts for bubble indicators)
            │   │           │   │   │                        # - POST /api/paragraph-comments/:id/like (Like paragraph comment)
            │   │           │   │   │                        # - POST /api/paragraph-comments/:id/reply (Reply to paragraph comment)
            │   │           │   ├── paragraph-comments.resolver.ts  # GraphQL: createParagraphComment(), getParagraphComments(), getParagraphCommentCounts()
            │   │           │   ├── chapter-comments.controller.ts  # REST: Chapter Comments (Meso Level - 本章说)
            │   │           │   ├── chapter-comments.resolver.ts   # GraphQL: Chapter comments resolvers
            │   │           │   ├── reviews-forums.controller.ts    # REST: Reviews & Forums (Macro Level)
            │   │           │   ├── reviews-forums.resolver.ts      # GraphQL: Reviews & forums resolvers
            │   │           │   ├── platform-interactions.controller.ts  # REST: Polls & Quizzes (Platform Level)
            │   │           │   ├── platform-interactions.resolver.ts    # GraphQL: Polls & quizzes resolvers
            │   │           │   ├── fan-economy.controller.ts  # REST: Fan Economy (Tipping, Rankings, Monthly Votes)
            │   │           │   │   │                        # - POST /api/fan-economy/tips (Create tip)
            │   │           │   │   │                        # - GET /api/fan-economy/rankings (Get fan rankings)
            │   │           │   │   │                        # - POST /api/fan-economy/monthly-votes (Cast monthly votes)
            │   │           │   ├── fan-economy.resolver.ts  # GraphQL: createTip(), getFanRankings(), castMonthlyVote()
            │   │           │   ├── community.service.ts     # Service layer (calls community-service via gRPC)
            │   │           │   └── community.module.ts
    │   │           │
            │   │           ├── 📁 comments/                # Comments API (legacy compatibility)
            │   │           │   ├── comments.controller.ts   # REST: GET/POST /api/comments
            │   │           │   ├── comments.resolver.ts    # GraphQL: comments(storyId)
            │   │           │   └── comments.module.ts
            │   │           │
            │   │           ├── 📁 rest/                    # REST aggregation layer (thin wrappers over newer services)
            │   │           │   ├── social.module.ts        # Imports SocialClientModule, exposes social REST controllers
            │   │           │   ├── social.controller.ts
            │   │           │   ├── stories.controller.ts
            │   │           │   └── users.controller.ts
            │   │           │
            │   │           ├── 📁 graphql/                 # GraphQL aggregation layer (BFF resolvers)
            │   │           │   ├── graphql.module.ts
            │   │           │   ├── story.resolver.ts
            │   │           │   ├── stories.resolver.ts
            │   │           │   ├── social.resolver.ts
            │   │           │   └── user.resolver.ts
            │   │           │
            │   │           └── 📁 health/                  # Health checks
            │   │               ├── health.controller.ts    # GET /health
            │   │               └── health.module.ts
    │   │
    │   ├── 📁 Configuration Files
    │   │   ├── package.json                       # Dependencies
    │   │   ├── tsconfig.json                      # TypeScript config
    │   │   ├── tsconfig.build.json                 # Build config
    │   │   ├── nest-cli.json                      # NestJS CLI config
    │   │   ├── Dockerfile                           # Docker image
    │   │   └── README.md                          # Service documentation
    │   │
    │   ├── 📁 Build Output
    │   │   └── dist/                              # Compiled JavaScript (generated)
    │   │
    │   └── 📁 GraphQL Schema
    │       └── schema.gql                         # Generated GraphQL schema
    │
    │   📝 **Development Steps:**
    │   │       1.  Setup `AuthModule` (using `@nestjs/passport` and `@nestjs/jwt`) and `ThrottlerModule` (using `@nestjs/throttler`).
    │   │       2.  Import all `.proto` (gRPC) files from **`7-shared/src/proto/`** and register as "clients" (using `@nestjs/microservices`).
    │   │       3.  **API for Web (REST):** Create REST Controllers for `3-web` (e.g., `GET /stories`). Integrate **Gateway Cache** (using `cache-manager` and Redis) here.
    │   │       4.  **API for Mobile (GraphQL BFF):** Setup `@nestjs/graphql` (Apollo Server). Create "Resolvers" (e.g., `story(id)`).
    │   │       5.  In GraphQL Resolvers, call gRPC clients (using `@nestjs/microservices`) to fetch *only* the data the mobile app needs, reducing payload size.
    │   │       6.  Import `social.proto` (from 7-shared) and register gRPC client for `social-service`.
    │   │       7.  **Social API for Web (REST):** Add REST Controllers: `GET /api/feed`, `POST /api/posts`, `GET /api/groups`, `POST /api/groups`, `POST /api/follow`, `DELETE /api/follow/:userId`.
    │   │       8.  **Social API for Mobile (GraphQL BFF):** Add GraphQL Resolvers: `feed()`, `createPost()`, `group(id)`, `joinGroup()`, `followUser()`, `unfollowUser()`.
    │   │       9.  All social endpoints call gRPC to `social-service`.
    │   │       9a. **Discovery & Engagement API (NEW - Storefront & Curation):** Add REST Controllers for `3-web`:
    │   │           - **Rankings API:**
    │   │           - `GET /api/rankings` -> Returns ranking charts (calls stories-service via gRPC)
    │   │             * Query params: `type` (monthly-votes|recommendations|sales|popularity), `genre?`, `timeRange?` (daily|weekly|monthly|all-time)
    │   │             * Calls stories-service via gRPC: `GetRankings(rankingType, genre?, timeRange?)`
    │   │             * Cache in Gateway Cache (Redis) with key: `rankings:${type}:${genre}:${timeRange}` (1-hour TTL)
    │   │           - **Editor's Picks API:**
    │   │           - `GET /api/editor-picks` -> Returns editor's picks (calls stories-service via gRPC)
    │   │             * Query params: `limit?` (default: 10), `genre?`
    │   │             * Calls stories-service via gRPC: `GetEditorPicks(limit?, genre?)`
    │   │             * Cache in Gateway Cache (Redis) with key: `editor_picks:${genre}` (30-min TTL)
    │   │           - **Genre Browsing API:**
    │   │           - `GET /api/genres` -> Returns all genres (calls stories-service via gRPC)
    │   │             * Calls stories-service via gRPC: `GetGenres()`
    │   │             * Cache in Gateway Cache (Redis) with key: `genres` (24-hour TTL, rarely changes)
    │   │           - `GET /api/genres/:id/stories` -> Returns stories by genre (calls stories-service via gRPC)
    │   │             * Query params: `page?`, `limit?`, `sort?` (recent|popular|rating), `filters?`
    │   │             * Calls stories-service via gRPC: `GetStoriesByGenre(genreId, filters?)`
    │   │             * Cache in Gateway Cache (Redis) with key: `genre_stories:${genreId}:${page}:${sort}` (15-min TTL)
    │   │           - **Search API (User-Driven Discovery):**
    │   │           - `GET /api/search` -> Full-text search (calls search-service via gRPC)
    │   │             * Query params: `q` (query string), `type?` (stories|authors|all), `page?`, `limit?`
    │   │             * Calls search-service via gRPC: `Search(query, type?, page?, limit?)`
    │   │             * Cache in Gateway Cache (Redis) with key: `search:${q}:${type}` (5-min TTL)
    │   │       9b. **Recommendations API (NEW - AI-Driven Discovery):** Add REST Controllers for `3-web`:
    │   │           - **Personalized Recommendations:**
    │   │           - `GET /api/recommendations` -> Returns personalized recommendations (calls ai-service via gRPC)
    │   │             * Query params: `limit?` (default: 20), `context?` (home|story|chapter)
    │   │             * Calls ai-service via gRPC: `GetRecommendations(userId, limit?, context?)`
    │   │             * Cache in Gateway Cache (Redis) with key: `recommendations:${userId}` (1-hour TTL)
    │   │             * **Note:** Recommendations are pre-computed and cached, refreshed hourly for active users
    │   │           - **Similar Stories:**
    │   │           - `GET /api/stories/:id/similar` -> Returns similar stories (calls ai-service via gRPC)
    │   │             * Query params: `limit?` (default: 10)
    │   │             * Calls ai-service via gRPC: `GetSimilarStories(storyId, limit?)`
    │   │             * Cache in Gateway Cache (Redis) with key: `similar_stories:${storyId}` (24-hour TTL)
    │   │           - **Trending Stories:**
    │   │           - `GET /api/trending` -> Returns trending stories (calls ai-service via gRPC)
    │   │             * Query params: `genre?`, `timeRange?` (daily|weekly|monthly)
    │   │             * Calls ai-service via gRPC: `GetTrendingStories(genre?, timeRange?)`
    │   │             * Cache in Gateway Cache (Redis) with key: `trending:${genre}:${timeRange}` (1-hour TTL)
    │   │           - **Recommendation Explanation:**
    │   │           - `GET /api/recommendations/:storyId/explain` -> Explains why story was recommended (calls ai-service via gRPC)
    │   │             * Calls ai-service via gRPC: `ExplainRecommendation(storyId, userId)`
    │   │             * Returns: Explanation text (e.g., "Recommended because you read similar stories")
    │   │       10. **Reading Preferences API (NEW):** Add REST Controllers for `3-web`:
    │   │           - `GET /api/reading-preferences` -> Returns current user's reading preferences (calls users-service via gRPC)
    │   │           - `PUT /api/reading-preferences` -> Updates reading preferences (validates DTO, calls users-service via gRPC)
    │   │           - Cache responses in Gateway Cache (Redis) with key: `reading_prefs:${userId}` (1-hour TTL)
    │   │       10a. **Desktop Preferences API (NEW - Power-User Features):** Add REST Controllers for `3-web`:
    │   │           - `GET /api/desktop-preferences` -> Returns desktop preferences (tab state, layout, focus mode, shortcuts)
    │   │             * Calls users-service via gRPC: `GetDesktopPreferences(userId)`
    │   │             * Cache in Gateway Cache (Redis) with key: `desktop_prefs:${userId}` (30-min TTL)
    │   │           - `PUT /api/desktop-preferences` -> Updates desktop preferences (validates DTO, calls users-service via gRPC)
    │   │           - `GET /api/desktop/tab-state` -> Returns current tab state (open tabs, active tab, tab groups)
    │   │           - `PUT /api/desktop/tab-state` -> Updates tab state (syncs across devices, emits WebSocket event)
    │   │           - `GET /api/desktop/layout` -> Returns layout presets and panel sizes
    │   │           - `PUT /api/desktop/layout` -> Updates layout preferences
    │   │           - `GET /api/desktop/focus-mode` -> Returns focus mode settings (max-width, alignment)
    │   │           - `PUT /api/desktop/focus-mode` -> Updates focus mode preferences
    │   │           - `GET /api/desktop/keyboard-shortcuts` -> Returns custom keyboard shortcuts
    │   │           - `PUT /api/desktop/keyboard-shortcuts` -> Updates custom keyboard shortcuts
    │   │           - `POST /api/desktop/sync` -> Syncs desktop preferences across devices
    │   │       11. **Bookmarks & Annotations API (NEW):** Add REST Controllers:
    │   │           - `GET /api/bookmarks` -> Returns user's bookmarks (calls users-service via gRPC)
    │   │           - `POST /api/bookmarks` -> Creates bookmark (validates DTO, calls users-service via gRPC)
    │   │           - `DELETE /api/bookmarks/:id` -> Deletes bookmark
    │   │           - `GET /api/annotations/:chapterId` -> Returns annotations for chapter
    │   │           - `POST /api/annotations` -> Creates annotation
    │   │           - `PUT /api/annotations/:id` -> Updates annotation
    │   │           - `DELETE /api/annotations/:id` -> Deletes annotation
    │   │       11a. **Bookshelf & Library API (NEW):** Add REST Controllers for `3-web`:
    │   │           - `GET /api/library` -> Returns user's library (calls users-service via gRPC)
    │   │             * Query params: `bookshelfId?`, `tags?`, `layout?` (grid|list), `sort?` (recent|title|progress)
    │   │             * Cache in Gateway Cache (Redis) with key: `library:${userId}:${bookshelfId}` (15-min TTL)
    │   │           - `POST /api/library` -> Adds story to library (validates DTO, calls users-service via gRPC)
    │   │           - `DELETE /api/library/:storyId` -> Removes story from library
    │   │           - `PUT /api/library/:libraryId` -> Updates library item (tags, notes)
    │   │           - `GET /api/library/sync` -> Syncs library across devices (calls users-service via gRPC)
    │   │           - `GET /api/bookshelves` -> Returns all user's bookshelves (calls users-service via gRPC)
    │   │           - `POST /api/bookshelves` -> Creates new bookshelf (validates DTO, calls users-service via gRPC)
    │   │           - `PUT /api/bookshelves/:id` -> Updates bookshelf (name, description)
    │   │           - `DELETE /api/bookshelves/:id` -> Deletes bookshelf
    │   │           - `POST /api/bookshelves/:id/items` -> Adds library item to bookshelf
    │   │           - `DELETE /api/bookshelves/:id/items/:libraryId` -> Removes item from bookshelf
    │   │           - `PUT /api/bookshelves/:id/reorder` -> Reorders items in bookshelf
    │   │           - `GET /api/wishlist` -> Returns user's wishlist (calls users-service via gRPC)
    │   │           - `POST /api/wishlist` -> Adds story to wishlist (validates DTO, calls users-service via gRPC)
    │   │           - `DELETE /api/wishlist/:storyId` -> Removes from wishlist
    │   │           - `POST /api/wishlist/:storyId/move-to-library` -> Moves wishlist item to library
│   │           - `GET /api/reading-progress` -> Returns aggregated reading progress (calls users-service via gRPC)
│   │             * Query params: `storyId?` (if omitted, returns all stories)
│   │           - `PUT /api/reading-progress` -> Updates/syncs multi-device progress (calls users-service via gRPC)
│   │           - `GET /api/reading-progress/sync` -> Syncs reading progress across devices
│   │           - `POST /api/reading-progress/:storyId/complete` -> Marks story as completed
│   │           - `GET /api/reading-progress/book/:bookId` -> High-frequency in-reader fetch (calls stories-service via gRPC `getReadingProgress`)
│   │           - `POST /api/reading-progress/book/:bookId` -> Updates in-reader progress (calls stories-service via gRPC `updateReadingProgress`)
    │   │           - **Offline Download Management (Mobile):**
    │   │           - `POST /api/library/:storyId/download` -> Initiates download for offline reading
    │   │             * Validates user has access to all chapters (premium chapters must be unlocked)
    │   │             * Returns download job ID for tracking
    │   │           - `GET /api/library/:storyId/download/status` -> Gets download progress
    │   │           - `DELETE /api/library/:storyId/download` -> Cancels/removes downloaded content
    │   │           - `GET /api/library/downloads` -> Returns all downloaded stories
    │   │       12. **TTS & Language Tools API (NEW):** Add REST Controllers:
    │   │           - `POST /api/tts/synthesize` -> Synthesizes speech (calls ai-service via gRPC)
    │   │             * Rate limited: 100 requests/hour per user (Rule #15)
    │   │             * Returns audio URL (pre-signed S3 URL)
    │   │           - `GET /api/tts/narration/:storyId/:chapterId` -> Gets human narration if available
    │   │           - `POST /api/translate` -> Translates text (calls ai-service via gRPC)
    │   │             * Rate limited: 50 requests/hour per user
    │   │           - `GET /api/dictionary/lookup` -> Looks up word in dictionary (calls ai-service via gRPC)
    │   │             * Rate limited: 200 requests/hour per user
    │   │       13. **Reading Preferences GraphQL (NEW):** Add GraphQL Resolvers for mobile:
    │   │           - `readingPreferences()` -> Query resolver that calls users-service gRPC
    │   │           - `updateReadingPreferences(input: UpdateReadingPreferencesInput!)` -> Mutation resolver
    │   │           - `bookmarks(storyId: ID)` -> Query resolver
    │   │           - `annotations(chapterId: ID!)` -> Query resolver
    │   │           - `synthesizeSpeech(text: String!, language: String!)` -> Mutation resolver
    │   │           - `translateText(text: String!, fromLang: String!, toLang: String!)` -> Query resolver
    │   │           - `lookupWord(word: String!, fromLang: String!, toLang: String!)` -> Query resolver
    │   │       13a. **Bookshelf & Library GraphQL (NEW):** Add GraphQL Resolvers for mobile:
    │   │           - `library(bookshelfId: ID, tags: [String!], layout: String)` -> Query resolver (calls users-service gRPC)
    │   │           - `addToLibrary(storyId: ID!)` -> Mutation resolver
    │   │           - `removeFromLibrary(storyId: ID!)` -> Mutation resolver
    │   │           - `updateLibraryItem(libraryId: ID!, tags: [String!], notes: String)` -> Mutation resolver
    │   │           - `syncLibrary(deviceId: String!)` -> Mutation resolver (syncs across devices)
    │   │           - `bookshelves()` -> Query resolver (returns all bookshelves)
    │   │           - `createBookshelf(name: String!, description: String)` -> Mutation resolver
    │   │           - `updateBookshelf(id: ID!, name: String, description: String)` -> Mutation resolver
    │   │           - `deleteBookshelf(id: ID!)` -> Mutation resolver
    │   │           - `addToBookshelf(bookshelfId: ID!, libraryId: ID!)` -> Mutation resolver
    │   │           - `removeFromBookshelf(bookshelfId: ID!, libraryId: ID!)` -> Mutation resolver
    │   │           - `reorderBookshelf(bookshelfId: ID!, items: [BookshelfItemInput!]!)` -> Mutation resolver
    │   │           - `wishlist()` -> Query resolver (returns wishlist)
    │   │           - `addToWishlist(storyId: ID!, priority: Int, notes: String)` -> Mutation resolver
    │   │           - `removeFromWishlist(storyId: ID!)` -> Mutation resolver
    │   │           - `moveToLibrary(storyId: ID!)` -> Mutation resolver (moves from wishlist to library)
    │   │           - `readingProgress(storyId: ID)` -> Query resolver (returns progress for story or all stories)
    │   │           - `updateReadingProgress(input: UpdateReadingProgressInput!)` -> Mutation resolver
    │   │           - `syncReadingProgress(deviceId: String!)` -> Mutation resolver
    │   │           - `markStoryCompleted(storyId: ID!)` -> Mutation resolver
    │   │           - `downloadStory(storyId: ID!)` -> Mutation resolver (initiates offline download)
    │   │           - `downloadStatus(storyId: ID!)` -> Query resolver (returns download progress)
    │   │           - `cancelDownload(storyId: ID!)` -> Mutation resolver
    │   │           - `downloadedStories()` -> Query resolver (returns all downloaded stories)
    │   │       14. **Note:** Do **NOT** connect to the database (Rule #4).
    │   ├── src/             # (Main entrypoint, JWT Auth, Rate Limit (Throttler), WAF (Cloudflare))
    │   │   ├── modules/     # (Routes requests to internal services via gRPC)
    │   │   └── test/        # (Unit tests for routing/auth logic)
    │   └── package.json
    │

## ⚠️ Known Issues & Code Fixes Required

### 1. REST / GraphQL Aggregators Need Consolidation
**Issue:** `src/modules/rest` and `src/modules/graphql` still duplicate logic that already lives inside feature modules (stories, social, users, etc.).
- **Action:** Evaluate whether these BFF wrappers can be merged into feature modules or removed once clients rely solely on the newer controllers/resolvers.
- **Impact:** Reduces code duplication and keeps routing logic in a single place per feature.

### 2. Comments Module Still Maintained for Legacy Consumers
**Issue:** `src/modules/comments` overlaps with the richer `community` module but remains for backward compatibility.
- **Action:** Plan a deprecation path (documented contract changes, migration guide) before removing the legacy endpoints/resolvers.
- **Impact:** Encourages clients to move to the hierarchical comments APIs while ensuring no regression for existing integrations.

---

**Xem thêm:** [README](./README.md) | [Overview](./01-overview.md) | [Structure Comparison](../../../packages/1-gateway/STRUCTURE_COMPARISON.md)
