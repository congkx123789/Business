---
alwaysApply: true
---

├── 📦 stories-service/            # 📚 STORIES SERVICE
    │   │   │
    │   │   ├── 📋 Service Info
    │   │   │   ├── **Purpose:** Manages Stories, Chapters, Genres, Content
    │   │   │   ├── **Database:** Own PostgreSQL database (Rule #1)
    │   │   │   ├── **Port:** 3002 (gRPC server)
    │   │   │   ├── **Storage:** S3 + CloudFront CDN for chapter content
    │   │   │   └── **Speed Opt:** Read Replica for reads, Redis cache for hot stories
    │   │   │
    │   │   ├── 📁 Source Code Structure
    │   │   │   └── src/
    │   │   │       ├── main.ts                      # Service entry point (gRPC server)
    │   │   │       ├── app.module.ts                 # Root module
    │   │   │       │
    │   │   │       ├── 📁 modules/
    │   │   │       │   ├── 📁 stories/                # Stories Module
    │   │   │       │   │   ├── stories.module.ts
    │   │   │       │   │   ├── stories.service.ts     # Story business logic
    │   │   │       │   │   └── dto/
    │   │   │       │   │       ├── create-story.dto.ts
    │   │   │       │   │       └── update-story.dto.ts
    │   │   │       │   │
    │   │   │       │   ├── 📁 chapters/               # Chapters Module (Enhanced - MVP Phase 1)
    │   │   │       │   │   ├── chapters.module.ts
    │   │   │       │   │   ├── chapters.service.ts   # Chapter CRUD, content management
    │   │   │       │   │   ├── chapter-download.service.ts  # Chapter download for offline (NEW - MVP Phase 1)
    │   │   │       │   │   │   │                        # - Serves chapter content for download
    │   │   │       │   │   │   │                        # - Returns chapter content as file/stream
    │   │   │       │   │   │   │                        # - Supports batch download requests
    │   │   │       │   │   │   │                        # - Validates user access (premium chapters)
    │   │   │       │   │   └── dto/
    │   │   │       │   │       ├── create-chapter.dto.ts
    │   │   │       │   │       ├── update-chapter.dto.ts
    │   │   │       │   │       └── download-chapter.dto.ts  # Download chapter request (NEW - MVP Phase 1)
    │   │   │       │   │
    │   │   │       │   ├── 📁 genres/                 # Genres Module
    │   │   │       │   │   ├── genres.module.ts
    │   │   │       │   │   ├── genres.service.ts     # Genre management, hierarchy
    │   │   │       │   │   ├── genre-browsing.service.ts  # Genre browsing logic
    │   │   │       │   │   └── dto/
    │   │   │       │   │       ├── create-genre.dto.ts
    │   │   │       │   │       └── genre-stories-query.dto.ts
    │   │   │       │   │
    │   │   │       │   ├── 📁 discovery/              # Discovery & Engagement Module (Storefront & Curation)
    │   │   │       │   │   ├── discovery.module.ts
    │   │   │       │   │   ├── discovery.service.ts  # Main discovery orchestration
    │   │   │       │   │   ├── ranking.service.ts     # Ranking charts calculation & caching
    │   │   │       │   │   │   │                        # - Calculate rankings (monthly votes, sales, recommendations, popularity)
    │   │   │       │   │   │   │                        # - Cache rankings in Redis (update hourly/daily)
    │   │   │       │   │   │   │                        # - Genre-specific and time-based rankings
    │   │   │       │   │   ├── curation.service.ts    # Editor's picks, featured stories
    │   │   │       │   │   │   │                        # - Manage editor picks (priority, featuredUntil)
    │   │   │       │   │   │   │                        # - Featured stories with banners
    │   │   │       │   │   │   │                        # - Promotional content management
    │   │   │       │   │   ├── storefront.service.ts  # Storefront homepage data aggregation
    │   │   │       │   │   │   │                        # - Combine editor picks, rankings, genres
    │   │   │       │   │   │   │                        # - Homepage data structure
    │   │   │       │   │   └── dto/
    │   │   │       │   │       ├── ranking-query.dto.ts
    │   │   │       │   │       ├── curation-query.dto.ts
    │   │   │       │   │       ├── editor-pick.dto.ts
    │   │   │       │   │       └── storefront-query.dto.ts
    │   │   │       │   │
    │   │   │       │   ├── 📁 drm/                    # DRM Module (Content Protection - Rule #27)
    │   │   │       │   │   ├── drm.module.ts
    │   │   │       │   │   ├── drm.service.ts        # DRM logic (copy protection, watermarking)
    │   │   │       │   │   │   │                        # - Check if chapter is paid/unlocked
    │   │   │       │   │   │   │                        # - Apply copy protection flags
    │   │   │       │   │   │   │                        # - Generate invisible watermarking (user ID)
    │   │   │       │   │   ├── copy-protection.service.ts  # Copy-paste protection logic
    │   │   │       │   │   │   │                        # - Disable text selection for paid content
    │   │   │       │   │   │   │                        # - Block copy-paste operations
    │   │   │       │   │   │   │                        # - CSS-based protection (web)
    │   │   │       │   │   ├── watermarking.service.ts  # Digital watermarking
    │   │   │       │   │   │   │                        # - Embed user ID invisibly in content
    │   │   │       │   │   │   │                        # - Trace content leaks to specific users
    │   │   │       │   │   │   │                        # - Character-level watermarking
    │   │   │       │   │   └── dto/
    │   │   │       │   │       ├── drm-check.dto.ts   # Check DRM status
    │   │   │       │   │       └── watermark-request.dto.ts  # Watermark generation
    │   │   │       │   │
    │   │   │       │   └── 📁 storage/                # Storage Module (S3)
    │   │   │       │       ├── storage.module.ts
    │   │   │       │       └── storage.service.ts    # S3 upload/download, CloudFront URLs
    │   │   │       │
    │   │   │       ├── 📁 search/                 # Search Integration Module (gRPC → search-service)
    │   │   │       │   ├── search.module.ts      # Registers GRPC client (protoPath resolved to packages/7-shared/src/proto/definitions/search.proto)
    │   │   │       │   └── search.service.ts     # SearchIntegrationService (SearchStories, IndexStory, Update/Delete index)
    │   │   │       │
│   │   │       ├── 📁 reading-progress/       # Reading Progress Module
│   │   │       │   ├── reading-progress.module.ts
│   │   │       │   └── reading-progress.service.ts  # SQL Server stored proc wrapper (`spReadingProgress_*`)
│   │   │       │
│   │   │       ├── 📁 author/                 # Author Ecosystem Module
│   │   │       │   ├── author.module.ts
│   │   │       │   ├── author-dashboard.service.ts
│   │   │       │   ├── author-analytics.service.ts
│   │   │       │   └── dto/
│   │   │       │       └── author-dashboard.dto.ts
│   │   │       │
    │   │   │       ├── 📁 controllers/                # gRPC Controllers
    │   │   │       │   └── stories.controller.ts     # Implements stories.proto gRPC methods
    │   │   │       │       │                            # - Story CRUD operations
    │   │   │       │       │                            # - Discovery endpoints (GetRankings, GetEditorPicks, GetGenres, GetStoriesByGenre)
│   │   │       │       │                            # - Storefront endpoints (GetStorefrontData)
│   │   │       │       │                            # - Reading progress endpoints (GetReadingProgress, UpdateReadingProgress)
│   │   │       │       │                            # - Author dashboards/analytics/revenue/engagement/reader insights endpoints
│   │   │       │       │                            # - Reader utilities (reading progress, chapter downloads)
    │   │   │       │       │                            # - DRM endpoints (CheckDrmStatus, GetWatermarkedChapter, DetectWatermark)
    │   │   │       │       │                            # - Search endpoints (SearchStories -> search-service via gRPC)
    │   │   │       │       │                            # - Acts as façade wiring chapters, genres, discovery, DRM, search modules
    │   │   │       │
    │   │   │       ├── 📁 prisma/                     # Database Schema
    │   │   │       │   ├── schema.prisma              # Story, Chapter, Genre models
    │   │   │       │   └── migrations/                # Database migrations
    │   │   │       │
    │   │   │       └── 📁 workers/                    # Event Bus Workers
    │   │   │           ├── story-events.worker.ts     # Emits story.created, story.updated events
    │   │   │           └── ranking-calculation.worker.ts  # Background job for ranking calculation
    │   │   │               │                            # - Hourly/daily ranking recalculation
    │   │   │               │                            # - Cache refresh in Redis
    │   │   │               │                            # - Genre-specific ranking updates
    │   │   │
    │   │   ├── 📁 Configuration Files
    │   │   │   ├── package.json
    │   │   │   ├── tsconfig.json
    │   │   │   └── README.md
    │   │   │
    │   │   └── 📁 Database Models (Prisma Schema)
    │   │       └── Models:
    │   │           - **Story**: id, title, description, authorId, coverImage, status, createdAt, updatedAt
    │   │           - **Chapter**: id, storyId, title, contentUrl (S3), chapterNumber, isPaid, createdAt
    │   │           - **Genre**: id, name, slug, parentId (hierarchy), description, icon
    │   │           - **StoryGenre**: storyId, genreId (many-to-many)
    │   │           - **Ranking**: id, rankingType, genreId?, timeRange, storyId, position, score, calculatedAt
    │   │           - **EditorPick**: id, storyId, priority, featuredUntil, bannerImage, description, createdAt
    │   │           - **StoryMetrics**: storyId, views, reads, votes, recommendations, sales, lastUpdated (for ranking calculation)
    │   │           - **StoryVote**: id, userId, storyId, voteType ('power-stone'|'monthly-vote'), votes, castAt (NEW)
    │   │           - **AuthorDashboard**: id, authorId, storyId (optional), metrics (JSON), lastUpdated (NEW)
    │   │           - **AuthorAnalytics**: id, authorId, storyId, date, views, reads, revenue, engagement (JSON), createdAt (NEW)
    │   │
    │   ├── 📋 Discovery & Engagement Features (The Discovery Engine)
    │   │   │
    │   │   ├── **Core Philosophy:**
    │   │   │   - **Problem:** With millions of books in library, "search" becomes less effective than "discovery"
    │   │   │   - **Solution:** Platform must proactively curate and guide users to content
    │   │   │   - **Strategy:** Hybrid model combining Pull (user-driven), Push (platform-driven), and Social Proof
    │   │   │
    │   │   ├── **Genre Browsing (Duyệt theo Thể loại):**
    │   │   │   - **Purpose:** Main navigation organized by core genres for easy discovery
    │   │   │   - **Core Genres:**
    │   │   │     * Fantasy/Tiên hiệp (Immortal Cultivation)
    │   │   │     * Wuxia/Võ hiệp (Martial Arts)
    │   │   │     * Urban/Đô thị (Urban Modern)
    │   │   │     * Historical/Lịch sử (Historical)
    │   │   │     * Game/Trò chơi (Game/System)
    │   │   │     * Romance/Lãng mạn (Romance)
    │   │   │     * Sci-Fi/Khoa học viễn tưởng (Science Fiction)
    │   │   │   - **Features:**
    │   │   │     * Genre-based filtering and browsing
    │   │   │     * Multi-genre support (stories can belong to multiple genres)
    │   │   │     * Genre navigation bar on storefront
    │   │   │     * Genre-specific landing pages with curated content
    │   │   │   - **Implementation:**
    │   │   │     * `Genre` model with hierarchy (parent/child genres) - supports nested genres
    │   │   │     * `StoryGenre` many-to-many relationship - stories can belong to multiple genres
    │   │   │     * `GenreBrowsingService` handles genre navigation and filtering
    │   │   │     * Genre-specific landing pages with curated content (editor picks, rankings)
    │   │   │     * gRPC endpoints:
    │   │   │       - `GetGenres()` - Get all genres with hierarchy
    │   │   │       - `GetGenreById(genreId)` - Get genre details
    │   │   │       - `GetStoriesByGenre(genreId, page?, limit?, sort?, filters?)` - Get stories filtered by genre
    │   │   │       - `GetGenreLandingPage(genreId)` - Get genre landing page data (rankings, editor picks, featured)
    │   │   │
    │   │   ├── **Ranking Charts (排行榜 - Social Proof):**
    │   │   │   - **Purpose:** Social proof tool for content discovery - users trust "wisdom of the crowd"
    │   │   │   - **Core Philosophy:** Rankings are NOT based on star ratings - they're based on engagement and monetization metrics
    │   │   │   - **Types:**
    │   │   │     * **Monthly Votes Ranking (月度投票榜):** Based on monthly user votes (Power Stones + Monthly Votes)
    │   │   │     * **Recommendations Ranking (推荐榜):** Based on recommendation count
    │   │   │     * **Sales Ranking (销售榜):** Based on purchase volume (spending)
    │   │   │     * **Popularity Ranking (人气榜):** Based on views, reads, engagement, discussion activity
    │   │   │   - **Voting Mechanisms (Gamification):**
    │   │   │     * **Power Stones (Daily Votes):**
    │   │   │       - Users receive free "Power Stones" daily (gamification reward)
    │   │   │       - Users "cast" Power Stones to stories they like
    │   │   │       - Each Power Stone = 1 vote for story ranking
    │   │   │       - Daily reset (users get new Power Stones each day)
    │   │   │       - Integration with F2P gamification system (users-service)
    │   │   │     * **Monthly Votes (VIP Guaranteed Votes):**
    │   │   │       - VIP members receive guaranteed "Monthly Votes" based on spending level
    │   │   │       - Higher VIP level = More guaranteed monthly votes
    │   │   │       - Monthly Votes reset at start of each month
    │   │   │       - Integration with monetization-service (VIP levels)
    │   │   │       - Integration with community-service (Monthly Votes system)
    │   │   │     * **Discussion Activity:**
    │   │   │       - Number of comments and discussion activity also factors into rankings
    │   │   │       - Active discussions = Higher ranking
    │   │   │       - Integration with community-service (comments, paragraph comments)
    │   │   │   - **Features:**
    │   │   │     * Genre-specific rankings (e.g., "Top Fantasy Stories")
    │   │   │     * Time-based rankings (daily, weekly, monthly, all-time)
    │   │   │     * Real-time updates (cached, refreshed hourly/daily)
    │   │   │     * Public leaderboards (transparent ranking system)
    │   │   │   - **Implementation:**
    │   │   │     * `RankingService` calculates rankings based on metrics:
    │   │   │       - Monthly Votes: Count votes (Power Stones + Monthly Votes) in last 30 days
    │   │   │       - Recommendations: Count user recommendations
    │   │   │       - Sales: Count purchases (from monetization-service via Event Bus)
    │   │   │       - Popularity: Weighted combination of views, reads, engagement, discussion activity
    │   │   │     * `VotingService` (NEW): Manages Power Stones and Monthly Votes
    │   │   │       - `castPowerStone(userId, storyId)` - Cast daily Power Stone
    │   │   │       - `castMonthlyVote(userId, storyId, votes)` - Cast monthly votes (from VIP)
    │   │   │       - `getUserVotes(userId)` - Get user's available votes
    │   │   │       - Integration with users-service for Power Stone allocation (daily reset)
    │   │   │       - Integration with monetization-service for Monthly Votes (VIP level)
    │   │   │       - Integration with community-service for Monthly Votes system
    │   │   │     * `RankingCalculationWorker` runs hourly/daily to recalculate rankings
    │   │   │     * Cache rankings in Redis (key: `ranking:${type}:${genre}:${timeRange}`, TTL: 1 hour)
    │   │   │     * `Ranking` model stores computed rankings (persisted for historical data)
    │   │   │     * `StoryVote` model (NEW): userId, storyId, voteType ('power-stone'|'monthly-vote'), votes, castAt
    │   │   │     * Genre-specific rankings: Filter by genre before calculating
    │   │   │     * Time-based rankings: Filter by timeRange (daily, weekly, monthly, all-time)
    │   │   │     * **Anti-Bot Measures:**
    │   │   │       - Rate limiting on votes (prevent bot abuse)
    │   │   │       - User verification for large vote counts
    │   │   │       - Fraud detection (unusual voting patterns)
    │   │   │     * gRPC endpoints:
    │   │   │       - `GetRankings(rankingType, genre?, timeRange?, limit?)` - Get ranking chart
    │   │   │       - `GetRankingPosition(storyId, rankingType, genre?, timeRange?)` - Get story's position in ranking
    │   │   │       - `CastPowerStone(userId, storyId)` - Cast daily Power Stone (NEW)
    │   │   │       - `CastMonthlyVote(userId, storyId, votes)` - Cast monthly votes (NEW)
    │   │   │       - `GetUserVotes(userId)` - Get user's available votes (NEW)
    │   │   │
    │   │   ├── **Editor's Picks (编辑推荐 - Platform Curation):**
    │   │   │   - **Purpose:** Manually curated content to highlight new or platform-prioritized works
    │   │   │   - **Strategy:** Platform-driven (Push) discovery - guides users when they're unsure
    │   │   │   - **Features:**
    │   │   │     * Admin/Editor can mark stories as "Editor's Pick"
    │   │   │     * Featured stories displayed prominently on storefront (hero section)
    │   │   │     * Promotional banners and highlights
    │   │   │     * Priority-based ordering (high priority stories shown first)
    │   │   │     * Time-based featuring (featuredUntil date)
    │   │   │   - **Implementation:**
    │   │   │     * `EditorPick` model in database:
    │   │   │       - storyId, priority (1-10, higher = more prominent)
    │   │   │       - featuredUntil (date when featuring expires)
    │   │   │       - bannerImage (promotional banner URL)
    │   │   │       - description (editor's note/reason for pick)
    │   │   │     * `CurationService` manages editor picks (CRUD operations)
    │   │   │     * Admin interface for managing editor picks (future: admin-service)
    │   │   │     * Priority-based ordering: Higher priority stories shown first
    │   │   │     * Time-based featuring: Auto-expire after featuredUntil date
    │   │   │     * Genre filtering: Can filter editor picks by genre
    │   │   │     * Cache in Redis (key: `editor-picks:${genre}`, TTL: 30 minutes)
    │   │   │     * gRPC endpoints:
    │   │   │       - `GetEditorPicks(limit?, genre?)` - Get featured editor picks
    │   │   │       - `GetFeaturedStories(limit?)` - Get all featured stories (hero section)
    │   │   │
    │   │   ├── **Search (Tìm kiếm - User-Driven Discovery):**
    │   │   │   - **Purpose:** Standard search bar for users who know what they want
    │   │   │   - **Features:**
    │   │   │     * Search by "Book Title / Author Name" (standard search)
    │   │   │     * Full-text search via search-service (MeiliSearch)
    │   │   │     * Search suggestions (auto-complete)
    │   │   │     * Search history (recent searches)
    │   │   │   - **Implementation:**
    │   │   │     * Frontend: Search bar component with auto-complete
    │   │   │     * Backend: Calls search-service via gRPC for full-text search (MeiliSearch)
    │   │   │     * Search by "Book Title / Author Name" - standard search query
    │   │   │     * Search suggestions: Auto-complete based on popular searches and indexed stories
    │   │   │     * Search history: Store recent searches in users-service (per user)
    │   │   │     * Search results ranked by:
    │   │   │       - Relevance (MeiliSearch ranking)
    │   │   │       - Popularity (views, reads, engagement)
    │   │   │       - Recency (newer stories get boost)
    │   │   │     * Integration: stories-service calls search-service via gRPC
    │   │   │     * gRPC endpoints (delegated to search-service):
    │   │   │       - `SearchStories(query, page?, limit?)` - Full-text search
    │   │   │       - `GetSearchSuggestions(query)` - Auto-complete suggestions
    │   │   │
    │   │   └── **Hybrid Discovery Model (Three Methods Combined):**
    │   │       - **1. Pull (User-Driven - Active Discovery):**
    │   │       │   * User knows what they want and actively searches
    │   │       │   * Search by title/author name
    │   │       │   * Browse genres (genre navigation)
    │   │       │   * Filter and sort results
    │   │       │
    │   │       - **2. Push (Platform-Driven - Passive Discovery):**
    │   │       │   * User is unsure and needs guidance
    │   │       │   * Editor's picks (manually curated)
    │   │       │   * Featured content (platform-prioritized)
    │   │       │   * Personalized recommendations (AI-driven)
    │   │       │
    │   │       - **3. Social Proof (Crowd Wisdom - Trust-Based Discovery):**
    │   │       │   * User trusts "wisdom of the crowd"
    │   │       │   * Ranking charts (validated by community)
    │   │       │   * Popularity indicators
    │   │       │   * Trending stories
    │   │       │
    │   │       - **Implementation Strategy:**
    │   │       │   * `StorefrontService` aggregates data from all discovery methods
    │   │       │   * Storefront homepage combines all three methods:
    │   │       │     - **Hero section:** Editor's picks (Push) - Featured stories with banners
    │   │       │     - **Ranking charts:** Social proof (Social) - Top rankings (monthly votes, sales, popularity)
    │   │       │     - **Genre navigation:** User-driven (Pull) - Main navigation bar with core genres
    │   │       │     - **Recommendations section:** AI-driven (Push + Personalization) - Calls ai-service
    │   │       │     - **Trending section:** Trending stories (real-time popularity)
    │   │       │     - **Search bar:** User-driven (Pull) - Prominent search bar
    │   │       │   * Cache storefront data in Redis (key: `storefront:homepage`, TTL: 15 minutes)
    │   │       │   * gRPC endpoint: `GetStorefrontData(userId?)` - Get complete homepage data
    │   │       │   * Personalization: If userId provided, include personalized recommendations
    │   │
    │   ├── 📋 DRM & Content Protection (Rule #27)
    │   │   │
    │   │   ├── **Purpose:** Protect paid content from unauthorized copying and redistribution while maintaining accessibility
    │   │   │
    │   │   ├── **Copy Protection Strategy:**
    │   │   │   - **Block Copy-Paste for Paid Content:**
    │   │   │     * Disable text selection for paid chapters (even if user purchased)
    │   │   │     * Block copy-paste operations (Ctrl+C, right-click copy)
    │   │   │     * CSS-based protection (web): `user-select: none`, disable context menu
    │   │   │     * Mobile: Disable text selection gestures
    │   │   │   - **Rationale:** Core business model depends on monetizing each chapter. Easy copy-paste would break this model.
    │   │   │   - **Balance:** Provide TTS (audio access) via ai-service while blocking text access
    │   │   │
    │   │   ├── **Digital Watermarking:**
    │   │   │   - **Invisible Watermarking:**
    │   │   │     * Embed user ID invisibly into content (character-level encoding)
    │   │   │     * Trace content leaks to specific users
    │   │   │     * Character-level watermarking (subtle character variations)
    │   │   │   - **Watermark Detection:**
    │   │   │     * Analyze leaked content to extract watermark
    │   │   │     * Identify source user from watermark
    │   │   │   - **Advanced:** Investigate content encryption schemes
    │   │   │
    │   │   ├── **Mobile-Specific Protection:**
    │   │   │   - **Android:** Use `FLAG_SECURE` to block screenshots for paid content
    │   │   │   - **iOS:** Use native flags to attempt blocking screenshots and screen recording
    │   │   │   - **Note:** Screenshot blocking is not 100% reliable but adds friction
    │   │   │
    │   │   ├── **Web-Specific Protection:**
    │   │   │   - **CSS Tricks:**
    │   │   │     * `user-select: none` to disable text selection
    │   │   │     * Disable context menu (right-click)
    │   │   │     * Overlay transparent divs to prevent text selection
    │   │   │   - **JavaScript Protection:**
    │   │   │     * Block keyboard shortcuts (Ctrl+C, Ctrl+A)
    │   │   │     * Detect and block developer tools (F12)
    │   │   │   - **Note:** Determined users can bypass with OCR, but adds significant friction
    │   │   │
    │   │   ├── **Integration with Monetization:**
    │   │   │   - Check if chapter is paid/unlocked via monetization-service
    │   │   │   - Apply DRM protection only for paid content
    │   │   │   - Free chapters: No protection (allow copy for sharing/promotion)
    │   │   │
    │   │   └── **gRPC Endpoints:**
    │   │       - `CheckDRMStatus(request: { chapterId, userId })` - Check if DRM should be applied
    │   │       - `GetWatermarkedContent(request: { chapterId, userId })` - Get content with watermark
    │   │       - `DetectWatermark(request: { content })` - Detect watermark in leaked content
    │   │
    │   ├── 📋 Author Ecosystem (Two-Sided Marketplace)
    │   │   │
    │   │   ├── **Purpose:** Platform is not just for readers - it's also a marketplace for authors to publish and monetize
    │   │   │
    │   │   ├── **Core Philosophy:** Two-sided marketplace - authors create content, readers consume and pay, platform takes cut
    │   │   │
    │   │   ├── **Author Dashboard:**
    │   │   │   - **Story Management:**
    │   │   │     * Create/edit stories (serialized publishing)
    │   │   │     * Chapter management (upload, edit, schedule release)
    │   │   │     * Cover image upload
    │   │   │     * Genre selection
    │   │   │     * Story status (draft, publishing, completed, on hiatus)
    │   │   │   - **In-App Editing Tools:**
    │   │   │     * Rich text editor for chapters
    │   │   │     * Formatting tools (bold, italic, paragraphs)
    │   │   │     * Auto-save drafts
    │   │   │     * Version history
    │   │   │   - **Publishing Controls:**
    │   │   │     * Schedule chapter releases
    │   │   │     * Set free chapter count (paywall configuration)
    │   │   │     * Advanced chapters (for Privilege model)
    │   │   │     * Chapter pricing (if custom pricing enabled)
    │   │   │
    │   │   ├── **Author Analytics:**
    │   │   │   - **Revenue Tracking:**
    │   │   │     * Revenue per chapter (PPC sales)
    │   │   │     * Total revenue (all-time, monthly, weekly)
    │   │   │     * Revenue breakdown (PPC, tips, subscriptions)
    │   │   │     * Integration with monetization-service
    │   │   │   - **Reading Analytics:**
    │   │   │     * Views per chapter
    │   │   │     * Reads per chapter (completed reads)
    │   │   │     * Reading completion rate
    │   │   │     * Drop-off points (where readers stop reading)
    │   │   │   - **Engagement Analytics:**
    │   │   │     * Comments per chapter (paragraph comments, chapter comments)
    │   │   │     * Votes received (Power Stones, Monthly Votes)
    │   │   │     * Rankings position
    │   │   │     * Fan rankings (top supporters)
    │   │   │     * Integration with community-service
    │   │   │   - **Audience Insights:**
    │   │   │     * Reader demographics (if available)
    │   │   │     * Reading patterns (peak reading times)
    │   │   │     * Chapter popularity (which chapters get most engagement)
    │   │   │
    │   │   ├── **Author Tools:**
    │   │   │   - **Feedback Loop:**
    │   │   │     * See paragraph comments in real-time
    │   │   │     * Respond to comments (author-fan interaction)
    │   │   │     * Like/reply to paragraph comments
    │   │   │     * Integration with community-service
    │   │   │   - **Reader Behavior Analysis:**
    │   │   │     * Algorithm analyzes reading habits
    │   │   │     * Provides feedback on chapter engagement
    │   │   │     * Suggests optimal chapter length
    │   │   │     * Identifies popular plot points
    │   │   │     * Integration with ai-service (analytics)
    │   │   │   - **Content Optimization:**
    │   │   │     * Chapter performance metrics
    │   │   │     * A/B testing suggestions (if implemented)
    │   │   │     * Release timing optimization
    │   │   │
    │   │   ├── **Monetization Tools:**
    │   │   │   - **Revenue Sharing:**
    │   │   │     * View revenue share breakdown (platform %, author %)
    │   │   │     * Payment history
    │   │   │     * Payout schedule
    │   │   │     * Integration with monetization-service
    │   │   │   - **Pricing Management:**
    │   │   │     * Set custom pricing (if allowed)
    │   │   │     * View pricing recommendations
    │   │   │     * Bulk pricing updates
    │   │   │
    │   │   ├── **Implementation:**
    │   │   │   * `AuthorDashboard` model: authorId, storyId, metrics (JSON), lastUpdated
    │   │   │   * `AuthorAnalytics` model: authorId, storyId, date, views, reads, revenue, engagement (JSON)
    │   │   │   * `AuthorDashboardService`: Aggregates data from multiple services
    │   │   │   * `AuthorAnalyticsService`: Calculates analytics, generates insights
    │   │   │   * Integration with monetization-service: Revenue data
    │   │   │   * Integration with community-service: Engagement data (comments, votes, tips)
    │   │   │   * Integration with users-service: Reading behavior data
    │   │   │   * Background job: Daily analytics calculation
    │   │   │   * Cache analytics in Redis (key: `author-analytics:${authorId}:${storyId}`, TTL: 1 hour)
    │   │   │   * gRPC endpoints:
    │   │   │     - `GetAuthorDashboard(authorId, storyId?)` → Returns dashboard data
    │   │   │     - `GetAuthorAnalytics(authorId, storyId?, timeRange?)` → Returns analytics
    │   │   │     - `GetAuthorRevenue(authorId, storyId?, timeRange?)` → Returns revenue data
    │   │   │     - `GetAuthorEngagement(authorId, storyId?)` → Returns engagement metrics
    │   │   │     - `GetReaderInsights(authorId, storyId?)` → Returns reader behavior insights
    │   │   │
    │   📝 **Development Steps:**
    │   │   │       1.  Setup NestJS, Prisma (for `Story`, `Chapter`).
    │   │   │       2.  Install `cache-manager` (with `redis-store`) to cache hot stories.
    │   │   │       3.  Install `aws-sdk` (for S3) and `@nestjs/bull` (for BullMQ) to emit events.
    │   │   │       4.  On story/chapter creation, emit an event (using `@nestjs/bull` 's `Queue.add()`) to the Event Bus (BullMQ).
    │   │   │       5.  Define `stories.proto` (gRPC) in `7-shared/src/proto/` and implement it here.
    │   │   │       6.  **Discovery & Engagement (Storefront & Curation):**
    │   │   │           * Create `discovery` module with ranking, curation, storefront, voting services
    │   │   │           * Implement `VotingService` (NEW):
    │   │   │             - `castPowerStone(userId, storyId)` - Cast daily Power Stone
    │   │   │             - `castMonthlyVote(userId, storyId, votes)` - Cast monthly votes (from VIP)
    │   │   │             - `getUserVotes(userId)` - Get user's available votes (Power Stones + Monthly Votes)
    │   │   │             - Integration with users-service for Power Stone allocation (daily reset)
    │   │   │             - Integration with monetization-service for Monthly Votes (VIP level)
    │   │   │             - Integration with community-service for Monthly Votes system
    │   │   │             - Create `StoryVote` model: userId, storyId, voteType, votes, castAt
    │   │   │             - Anti-bot measures: Rate limiting, fraud detection
    │   │   │           * Implement `RankingService`:
    │   │   │             - Calculate rankings based on metrics (votes, sales, views, recommendations, discussion activity)
    │   │   │             - Support multiple ranking types (monthly votes, sales, recommendations, popularity)
    │   │   │             - Genre-specific and time-based rankings
    │   │   │             - Cache rankings in Redis (update hourly/daily via worker)
    │   │   │             - Create `RankingCalculationWorker` for background recalculation
    │   │   │             - **Key Insight:** Rankings are NOT based on star ratings - they're based on engagement (votes, spending, discussion)
    │   │   │           * Implement `CurationService`:
    │   │   │             - Manage editor picks (CRUD operations)
    │   │   │             - Priority-based ordering
    │   │   │             - Time-based featuring (auto-expire)
    │   │   │             - Cache editor picks in Redis
    │   │   │           * Implement `GenreBrowsingService`:
    │   │   │             - Genre hierarchy management
    │   │   │             - Genre-specific story filtering
    │   │   │             - Genre landing pages with curated content
    │   │   │           * Implement `StorefrontService`:
    │   │   │             - Aggregate homepage data (editor picks, rankings, genres, recommendations)
    │   │   │             - Cache storefront data in Redis
    │   │   │             - Personalization support (if userId provided)
    │   │   │           * Create `EditorPick`, `Ranking`, `StoryMetrics` models in Prisma schema
    │   │   │           * Add gRPC methods to `stories.proto`:
    │   │   │             - `GetGenres()` - Get all genres
    │   │   │             - `GetStoriesByGenre(genreId, page?, limit?, sort?, filters?)` - Genre browsing
    │   │   │             - `GetRankings(rankingType, genre?, timeRange?, limit?)` - Ranking charts
    │   │   │             - `GetEditorPicks(limit?, genre?)` - Editor's picks
    │   │   │             - `GetStorefrontData(userId?)` - Homepage data
    │   │   │           * Integrate with search-service for search functionality (gRPC call)
    │   │   │           * Follow Rule #7: PostgreSQL is truth, Redis is cache (rankings cached, recalculated from DB)
    │   │   │           * Follow Rule #2: Use Event Bus to listen for purchase events (for sales rankings)
    │   │
    │

---

**Xem thêm:** [README](./README.md) | [Overview](./01-overview.md)
