---
alwaysApply: true
---

├── 📦 users-service/              # 👤 USERS SERVICE
    │   │   │
    │   │   ├── 📋 Service Info
    │   │   │   ├── **Purpose:** Manages Users, Profiles, Library, Auth (JWT), Reading Preferences, Bookmarks, Annotations, Bookshelf
    │   │   │   ├── **Database:** Own PostgreSQL database (Rule #1)
    │   │   │   ├── **Port:** 3002 (HTTP server), 50051 (gRPC server)
    │   │   │   └── **Speed Opt:** Use Read Replica for read operations (Rule #7)
    │   │   │
    │   │   ├── 📁 Source Code Structure
    │   │   │   └── src/
    │   │   │       ├── main.ts                      # Service entry point (gRPC + HTTP server)
    │   │   │       ├── app.module.ts                 # Root module (imports UsersModule)
    │   │   │       │
    │   │   │       ├── 📁 common/
    │   │   │       │   └── 📁 database/
    │   │   │       │       ├── database.module.ts    # Exposes Prisma client as DatabaseService
    │   │   │       │       └── database.service.ts   # PrismaClient wrapper (reads USERS_SERVICE_DATABASE_URL)
    │   │   │       │
    │   │   │       ├── 📁 modules/
    │   │   │       │   │
    │   │   │       │   ├── 📁 auth/                  # Authentication Module
    │   │   │       │   │   ├── auth.module.ts
    │   │   │       │   │   ├── auth.service.ts       # JWT token creation/validation
    │   │   │       │   │   └── strategies/
    │   │   │       │   │       └── jwt.strategy.ts
    │   │   │       │   │
    │   │   │       │   ├── 📁 users/                 # Users CRUD Module
    │   │   │       │   │   ├── users.module.ts
    │   │   │       │   │   ├── users.service.ts       # User business logic
    │   │   │       │   │   └── dto/
    │   │   │       │   │       ├── create-user.dto.ts
    │   │   │       │   │       └── update-user.dto.ts
    │   │   │       │   │
    │   │   │       │   ├── 📁 reading-preferences/    # Reading Preferences Module (Enhanced for Desktop)
    │   │   │       │   │   ├── reading-preferences.module.ts
    │   │   │       │   │   ├── reading-preferences.service.ts  # Business logic
    │   │   │       │   │   └── uses DTOs from `7-shared/validation/user` (Rule #3 - no local DTOs)
    │   │   │       │   │
    │   │   │       │   ├── 📁 desktop-preferences/     # Desktop-Specific Preferences (NEW)
    │   │   │       │   │   ├── desktop-preferences.module.ts
    │   │   │       │   │   ├── desktop-preferences.service.ts    # Desktop UI preferences
    │   │   │       │   │   ├── tab-state.service.ts             # Tab state management & sync (NEW)
    │   │   │       │   │   ├── layout-preferences.service.ts    # Layout preferences (NEW)
    │   │   │       │   │   └── dto/
    │   │   │       │   │       ├── update-tab-state.dto.ts      # Tab state sync (open tabs, active tab)
    │   │   │       │   │       ├── update-layout-preferences.dto.ts  # Layout presets, panel sizes
    │   │   │       │   │       └── update-keyboard-shortcuts.dto.ts  # Custom keyboard shortcuts
    │   │   │       │   │
            │   │   │       │   ├── 📁 library/                # Library Management Module (Enhanced - 2.1, 2.2, 2.3)
            │   │   │       │   │   ├── library.module.ts
            │   │   │       │   │   ├── library.service.ts     # Library CRUD operations + Sync
            │   │   │       │   │   ├── library-sync.service.ts # Cross-device synchronization (Rule #8 - Enhanced 2.3)
            │   │   │       │   │   ├── library-download.service.ts # Offline download management (Enhanced 2.2)
            │   │   │       │   │   ├── library-storage.service.ts # Storage management (NEW - 2.2)
            │   │   │       │   │   └── dto/
            │   │   │       │   │       ├── add-to-library.dto.ts
            │   │   │       │   │       ├── update-library-item.dto.ts
            │   │   │       │   │       ├── sync-library.dto.ts
            │   │   │       │   │       ├── download-library.dto.ts
            │   │   │       │   │       ├── batch-download.dto.ts
            │   │   │       │   │       └── storage-usage.dto.ts
    │   │   │       │   │
            │   │   │       │   ├── 📁 bookshelf/              # Bookshelf Organization Module (Enhanced)
            │   │   │       │   │   ├── bookshelf.module.ts
            │   │   │       │   │   ├── bookshelf.service.ts   # Virtual bookshelves logic
            │   │   │       │   │   ├── bookshelf-organization.service.ts # Tags, layouts, sorting
            │   │   │       │   │   └── dto/
            │   │   │       │   │       ├── create-bookshelf.dto.ts
            │   │   │       │   │       ├── update-bookshelf.dto.ts
            │   │   │       │   │       ├── reorder-bookshelf.dto.ts
            │   │   │       │   │       └── filter-library.dto.ts
            │   │   │       │   │
            │   │   │       │   ├── 📁 library-auto-organization/  # Auto-Organization Module (NEW - 2.1)
            │   │   │       │   │   ├── library-auto-organization.module.ts
            │   │   │       │   │   ├── library-auto-organization.service.ts  # Auto-grouping by author/series
            │   │   │       │   │   ├── system-lists.service.ts  # System lists (Favorites, To Read, etc.)
            │   │   │       │   │   └── dto/
            │   │   │       │   │       ├── get-books-by-author.dto.ts
            │   │   │       │   │       ├── get-books-by-series.dto.ts
            │   │   │       │   │       └── get-system-lists.dto.ts
            │   │   │       │   │
            │   │   │       │   ├── 📁 library-advanced-organization/  # Advanced Organization Module (NEW - 2.1)
            │   │   │       │   │   ├── library-advanced-organization.module.ts
            │   │   │       │   │   ├── tags.service.ts  # Tag management (hierarchy, colors, icons)
            │   │   │       │   │   ├── filtered-views.service.ts  # Filtered views (dynamic queries)
            │   │   │       │   │   └── dto/
            │   │   │       │   │       ├── create-tag.dto.ts
            │   │   │       │   │       ├── update-tag.dto.ts
            │   │   │       │   │       ├── create-filtered-view.dto.ts
            │   │   │       │   │       ├── update-filtered-view.dto.ts
            │   │   │       │   │       └── filter-query.dto.ts
    │   │   │       │   │
    │   │   │       │   ├── 📁 wishlist/               # Wishlist Module
    │   │   │       │   │   ├── wishlist.module.ts
    │   │   │       │   │   ├── wishlist.service.ts    # Wishlist operations
    │   │   │       │   │   └── dto/
    │   │   │       │   │       └── add-to-wishlist.dto.ts
    │   │   │       │   │
    │   │   │       │   ├── 📁 reading-progress/      # Reading Progress Tracking (Enhanced)
    │   │   │       │   │   ├── reading-progress.module.ts
    │   │   │       │   │   ├── reading-progress.service.ts  # Progress tracking logic
    │   │   │       │   │   ├── reading-progress-sync.service.ts # Cross-device sync (Rule #8)
    │   │   │       │   │   └── dto/
    │   │   │       │   │       ├── update-progress.dto.ts
    │   │   │       │   │       └── sync-progress.dto.ts
    │   │   │       │   │
    │   │   │       │   ├── 📁 user-behavior/          # User Behavior Tracking (NEW)
    │   │   │       │   │   ├── user-behavior.module.ts
    │   │   │       │   │   ├── user-behavior.service.ts  # Tracks user interactions for recommendations
    │   │   │       │   │   ├── behavior-event-emitter.service.ts  # Emits behavior events to Event Bus
    │   │   │       │   │   └── dto/
    │   │   │       │   │       ├── track-click.dto.ts
    │   │   │       │   │       ├── track-reading-time.dto.ts
    │   │   │       │   │       └── track-purchase.dto.ts
    │   │   │       │   │
    │   │   │       │   ├── 📁 gamification/           # F2P Gamification Module (NEW)
    │   │   │       │   │   ├── gamification.module.ts
    │   │   │       │   │   ├── gamification.service.ts  # Main gamification orchestrator
    │   │   │       │   │   ├── daily-missions.service.ts  # Daily missions (check-in, reading, voting, ads)
    │   │   │       │   │   ├── rewards.service.ts     # Reward distribution (Power Stones, Fast Passes, Points)
    │   │   │       │   │   ├── power-stones.service.ts # Power Stones allocation (daily reset)
    │   │   │       │   │   └── dto/
    │   │   │       │   │       ├── claim-daily-mission.dto.ts
    │   │   │       │   │       ├── get-daily-missions.dto.ts
    │   │   │       │   │       ├── claim-reward.dto.ts
    │   │   │       │   │       └── get-power-stones.dto.ts
    │   │   │       │   │
    │   │   │       │   ├── 📁 bookmarks/              # Bookmarks Module
    │   │   │       │   │   ├── bookmarks.module.ts
    │   │   │       │   │   ├── bookmarks.service.ts   # Bookmark operations
    │   │   │       │   │   └── dto/
    │   │   │       │   │       └── create-bookmark.dto.ts
    │   │   │       │   │
    │   │   │       │   └── 📁 annotations/            # Annotations Module (Enhanced - Annotation Suite)
    │   │   │       │       ├── annotations.module.ts
    │   │   │       │       ├── annotations.service.ts  # Core annotation operations (CRUD)
    │   │   │       │       ├── annotation-unification.service.ts  # Unification: Collect annotations from all sources (EPUB, PDF, web, YouTube, Twitter)
    │   │   │       │       ├── annotation-revisitation.service.ts  # Revisitation: Spaced repetition, review highlights
    │   │   │       │       ├── annotation-export.service.ts  # Workflow Integration: Export to Notion, Obsidian, Capacities (Markdown)
    │   │   │       │       ├── annotation-ai-summary.service.ts  # AI Summary: Generate summaries from highlighted text only (calls ai-service)
    │   │   │       │       └── dto/
    │   │   │       │           ├── create-annotation.dto.ts
    │   │   │       │           ├── update-annotation.dto.ts
    │   │   │       │           ├── get-annotations.dto.ts
    │   │   │       │           ├── export-annotations.dto.ts  # Export format (Markdown, JSON, etc.)
    │   │   │       │           ├── unify-annotations.dto.ts  # Unify from multiple sources
    │   │   │       │           ├── get-revisitation-queue.dto.ts  # Get highlights for review
    │   │   │       │           └── generate-annotation-summary.dto.ts  # AI summary request (annotationIds, highlights, context?)
    │   │   │       │
    │   │   │       ├── 📁 config/                    # Configuration
    │   │   │       │   └── configuration.ts          # App, database, JWT configs
    │   │   │       │
    │   │   │       └── 📁 modules/
    │   │   │           └── 📁 users/                 # Users Module (contains gRPC Controller)
    │   │   │               ├── users.controller.ts  # Implements users.proto gRPC methods
    │   │   │               ├── users.service.ts
    │   │   │               └── users.module.ts
    │   │   │
    │   │   │       └── 📁 prisma/                    # Database Schema (at root level)
    │   │   │           ├── schema.prisma              # Prisma schema (User, Profile, Library, Bookshelf, etc.)
    │   │   │           └── migrations/                # Database migrations
    │   │   │
    │   │   ├── 📁 Configuration Files
    │   │   │   ├── package.json
    │   │   │   ├── tsconfig.json
    │   │   │   ├── nest-cli.json
    │   │   │   └── README.md
    │   │   │
    │   │   └── 📁 Database Models (Prisma Schema)
    │   │       └── Models defined in schema.prisma:
    │   │           ├── User                          # User account
    │   │           ├── Profile                      # User profile
    │   │           ├── ReadingPreferences          # Reading settings
    │   │           ├── DesktopPreferences          # Desktop UI preferences (tab state, layout, focus mode) (NEW)
    │   │           ├── TabState                     # Tab state (open tabs, active tab, tab groups) (NEW)
    │   │           ├── LayoutPreset                 # Saved layout configurations (NEW)
    │   │           ├── Library                      # Saved stories (Enhanced - 2.1, 2.2, 2.3)
    │   │           ├── Bookshelf                    # Virtual bookshelves (Enhanced - 2.1)
    │   │           ├── BookshelfItem                # Bookshelf-Library link
    │   │           ├── Tag                          # Tags for flexible categorization (NEW - 2.1)
    │   │           ├── LibraryTag                    # Many-to-many: Library-Tag relationship (NEW - 2.1)
    │   │           ├── FilteredView                 # Filtered views (dynamic queries) (NEW - 2.1)
    │   │           ├── SystemList                   # System lists (Favorites, To Read, etc.) (NEW - 2.1)
    │   │           ├── LibrarySystemList            # Many-to-many: Library-SystemList (NEW - 2.1)
    │   │           ├── Wishlist                     # Wishlist items
    │   │           ├── ReadingProgress              # Reading progress tracking (Enhanced - 2.3)
    │   │           ├── Bookmark                      # Bookmarks (Enhanced - 2.3)
    │   │           ├── Annotation                    # Text annotations (Enhanced - Annotation Suite)
    │   │           │   │                              # - selectedText, startOffset, endOffset, note, color
    │   │           │   │                              # - sourceType: 'epub'|'pdf'|'web'|'youtube'|'twitter'
    │   │           │   │                              # - sourceId: ID of source document/content
    │   │           │   │                              # - unifiedAt: Timestamp when unified from source
    │   │           │   │                              # - lastReviewedAt: For revisitation tracking
    │   │           │   │                              # - reviewCount: Number of times reviewed
    │   │           │   │                              # - nextReviewDate: Next scheduled review (spaced repetition)
    │   │           ├── AnnotationSource               # Source tracking for unification (NEW)
    │   │           │   │                              # - sourceType, sourceId, sourceUrl, importedAt
    │   │           ├── UserBehaviorEvent            # User behavior tracking (for recommendations)
    │   │           ├── DailyMission                   # Daily missions (check-in, reading, voting, ads) (NEW)
    │   │           ├── MissionReward                 # Mission rewards (Power Stones, Fast Passes, Points) (NEW)
    │   │           ├── PowerStone                   # Power Stones allocation (daily reset) (NEW)
    │   │           ├── FastPass                      # Fast Passes (unlock 1 chapter, expires in 7 days) (NEW)
    │   │           └── GamificationReward            # Reward history (NEW)
    │   │
    │   ├── 📋 F2P Gamification System (Free-to-Play Retention)
    │   │   │
    │   │   ├── **Purpose:** Gamified system to keep free users engaged and provide indirect monetization (ads, engagement)
    │   │   │
    │   │   ├── **Core Philosophy:** Platform structured like mobile F2P games - users "grind" for rewards to read free
    │   │   │
    │   │   ├── **Daily Missions (Daily Tasks):**
    │   │   │   - **Daily Check-in:**
    │   │   │     * Users receive small reward when opening app each day
    │   │   │     * Reward: Small amount of Points or Fast Pass
    │   │   │     * Streak bonuses (consecutive days = better rewards)
    │   │   │   - **Daily Reading:**
    │   │   │     * Read for a certain time (e.g., 20 minutes)
    │   │   │     * Reward: Fast Pass or Points
    │   │   │     * Integration with reading progress tracking
    │   │   │   - **Watching Ads (Rewarded Ads):**
    │   │   │     * Watch ad to receive reward
    │   │   │     * Reward: Fast Pass (unlock 1 chapter) or Coins
    │   │   │     * Creates ad revenue for platform
    │   │   │   - **Voting:**
    │   │   │     * Use Power Stones to vote for stories
    │   │   │     * Reward: Points (can be exchanged for Fast Passes)
    │   │   │     * Integration with stories-service voting system
    │   │   │
    │   │   ├── **Rewards (Soft Currency):**
    │   │   │   - **Power Stones (Daily Votes):**
    │   │   │     * Users receive free Power Stones daily (gamification reward)
    │   │   │     * Daily reset (users get new Power Stones each day)
    │   │   │     * Used to vote for stories (stories-service)
    │   │   │     * Each Power Stone = 1 vote for story ranking
    │   │   │   - **Fast Passes:**
    │   │   │     * Unlock 1 chapter (but expires after 7 days - creates urgency)
    │   │   │     * Can be earned from missions or exchanged from Points
    │   │   │     * Expiration creates FOMO (fear of missing out)
    │   │   │   - **Points:**
    │   │   │     * Soft currency that can be exchanged for Fast Passes
    │   │   │     * Earned from missions, voting, engagement
    │   │   │
    │   │   ├── **Retention Strategy:**
    │   │   │   - Free users provide value through:
    │   │   │     * Ad revenue (watching ads)
    │   │   │     * Engagement (voting, commenting - makes platform "alive")
    │   │   │     * Social proof (large user base attracts paying users)
    │   │   │   - Gamification keeps free users engaged daily
    │   │   │   - Some free users convert to paying users over time
    │   │   │
    │   │   ├── **Implementation:**
    │   │   │   * `DailyMission` model: id, userId, missionType ('check-in'|'reading'|'ad'|'voting'), date, completed, claimed
    │   │   │   * `MissionReward` model: id, missionId, rewardType ('power-stone'|'fast-pass'|'points'), amount, claimed
    │   │   │   * `PowerStone` model: id, userId, amount, date, resetAt (daily reset timestamp)
    │   │   │   * `FastPass` model: id, userId, storyId (optional), chapterId (optional), expiresAt (7 days), used
    │   │   │   * `GamificationReward` model: id, userId, rewardType, amount, source ('mission'|'exchange'|'bonus'), createdAt
    │   │   │   * `DailyMissionsService`: Create daily missions, check completion, claim rewards
    │   │   │   * `RewardsService`: Distribute rewards, manage Fast Passes, Points
    │   │   │   * `PowerStonesService`: Allocate Power Stones daily, reset daily
    │   │   │   * Background job: Daily reset (midnight) - reset Power Stones, create new daily missions
    │   │   │   * Background job: Fast Pass expiration (daily check) - expire Fast Passes older than 7 days
    │   │   │   * Integration with stories-service: Power Stones used for voting
    │   │   │   * Integration with monetization-service: Fast Passes unlock chapters
    │   │   │   * gRPC endpoints:
    │   │   │     - `GetDailyMissions(userId)` → Returns today's missions
    │   │   │     - `ClaimDailyMission(userId, missionType)` → Claims mission reward
    │   │   │     - `GetPowerStones(userId)` → Returns user's Power Stones
    │   │   │     - `GetFastPasses(userId)` → Returns user's Fast Passes
    │   │   │     - `UseFastPass(userId, chapterId)` → Uses Fast Pass to unlock chapter
    │   │   │     - `ExchangePointsForFastPass(userId, points)` → Exchanges Points for Fast Pass
    │   │   │
    │   ├── 📋 Cross-Device Synchronization Architecture (Rule #8)
    │   │   │
    │   │   ├── **Purpose:** Seamless synchronization of library, reading progress, bookmarks, and preferences across all devices (web, mobile, desktop)
    │   │   │
    │   │   ├── **Critical Requirement:** Synchronization is the MOST IMPORTANT feature. Any sync failure is a critical violation of user trust.
    │   │   │
    │   │   ├── **Synchronization Strategy:**
    │   │   │   - **Last-Write-Wins:** Timestamp-based conflict resolution (most recent update wins)
    │   │   │   - **Sync Version:** Each update increments `syncVersion` for conflict detection
    │   │   │   - **Device Tracking:** `deviceId` field tracks which device made the last update
    │   │   │   - **Sync Events:** Emit events to Event Bus for real-time sync notifications
    │   │   │
    │   │   ├── **What Gets Synced (Enhanced - 2.3):**
    │   │   │   1. **Library Items:**
    │   │   │      - Story additions/removals
    │   │   │      - Custom tags (Tag assignments)
    │   │   │      - Notes
    │   │   │      - Bookshelf assignments
    │   │   │      - System list assignments (Favorites, To Read, etc.)
    │   │   │      - Filtered views (saved filter queries)
    │   │   │   2. **Desktop-Specific Data (NEW):**
    │   │   │      - Tab state: Open tabs, active tab, tab order, tab groups
    │   │   │      - Layout preferences: Panel sizes, layout presets, workspace modes
    │   │   │      - Focus mode settings: Max-width, alignment, reading line guide
    │   │   │      - Keyboard shortcuts: Custom shortcut mappings
    │   │   │      - Split-view state: Left/right chapters, split position, sync scroll
    │   │   │      - Saved filters: Advanced search filter presets
    │   │   │      - Export/import history: Recent exports and imports
    │   │   │   3. **Reading Progress (Critical - 2.3):**
    │   │   │      - Current chapter
    │   │   │      - Scroll position / page number
    │   │   │      - Progress percentage
    │   │   │      - Completion status
    │   │   │      - Last read timestamp
    │   │   │   4. **Bookmarks (Critical - 2.3):**
    │   │   │      - All bookmarks (chapter, position, notes)
    │   │   │      - Bookmark creation/deletion
    │   │   │      - Bookmark ordering
    │   │   │      - **CRITICAL:** Losing bookmarks causes user churn
    │   │   │   5. **Annotations/Highlights (CRITICAL - 2.3):**
    │   │   │      - All highlights (selected text, color)
    │   │   │      - All notes (annotations)
    │   │   │      - Highlight/note creation, updates, deletion
    │   │   │      - **CRITICAL:** Losing highlights/notes is catastrophic - user's intellectual property
    │   │   │      - This is the strongest retention mechanism - data loss = immediate churn
    │   │   │   6. **Reading Preferences:**
    │   │   │      - Font size, font family, custom fonts
    │   │   │      - Background mode, blue light filter
    │   │   │      - Reading mode (scroll/page)
    │   │   │      - All customization settings
    │   │   │   7. **Wishlist:**
    │   │   │      - Wishlist items
    │   │   │      - Priority, notes
    │   │   │   8. **Download Status (2.2):**
    │   │   │      - Download progress
    │   │   │      - Download completion status
    │   │   │      - Storage usage
    │   │   │
    │   │   ├── **Sync Flow:**
    │   │   │   1. **Client initiates sync:** Client calls `SyncLibrary(userId, deviceId)` or `SyncReadingProgress(userId, deviceId)`
    │   │   │   2. **Server compares timestamps:** Server compares `lastSyncedAt` with `updatedAt` for each item
    │   │   │   3. **Conflict detection:** If `syncVersion` differs, conflict detected
    │   │   │   4. **Resolution:** Last-write-wins (newer timestamp wins)
    │   │   │   5. **Update:** Server updates database with synced data
    │   │   │   6. **Event emission:** Emit `library.synced` or `reading.progress.synced` event
    │   │   │   7. **Response:** Return synced data to client
    │   │   │
    │   │   ├── **Real-time Sync (WebSocket):**
    │   │   │   - When user updates progress on Device A, emit WebSocket event to Device B
    │   │   │   - Device B receives event and updates local state
    │   │   │   - Reduces need for manual sync
    │   │   │
    │   │   ├── **Offline-First (Mobile - Rule #8):**
    │   │   │   - Mobile apps store data locally (Room/Core Data)
    │   │   │   - When online, sync queue processes pending updates
    │   │   │   - Conflict resolution happens on server
    │   │   │
    │   │   └── **gRPC Endpoints (Enhanced - 2.3 + MVP Phase 1):**
    │   │       - `SyncLibrary(userId, deviceId)` -> Syncs library across devices (includes tags, bookshelves, system lists)
    │   │       - `SyncReadingProgress(userId, deviceId)` -> Syncs reading progress
    │   │       - `SyncBookmarks(userId, deviceId)` -> Syncs all bookmarks (NEW - 2.3)
    │   │       - `SyncAnnotations(userId, deviceId)` -> Syncs all highlights/notes (NEW - 2.3)
    │   │       - `SyncDesktopPreferences(userId, deviceId)` -> Syncs desktop preferences (tab state, layout, focus mode)
    │   │       - `SyncTabState(userId, deviceId)` -> Syncs tab state (open tabs, active tab, tab groups)
    │   │       - `GetSyncStatus(userId)` -> Returns sync status (last sync time, conflicts, error count)
    │   │       - `ResolveSyncConflict(userId, libraryId, resolution)` -> Manual conflict resolution
    │   │       - **Enhanced Sync with Conflict Resolution (NEW - MVP Phase 1):**
    │   │         * `SyncWithConflictResolution(userId, deviceId, localData, conflictStrategy?)` -> Sync with explicit conflict handling
    │   │           - `conflictStrategy`: 'last-write-wins' (default), 'server-wins', 'client-wins', 'merge'
    │   │           - Returns: `{ syncedData, conflicts: [] }` - conflicts array contains items needing manual resolution
    │   │           - Supports partial sync: Only syncs items changed since `lastSyncedAt` timestamp
    │   │           - Optimized for offline-first: Handles large sync payloads efficiently
    │   │         * `GetPendingSyncQueue(userId, deviceId)` -> Returns pending sync operations (for offline queue)
    │   │         * `ProcessSyncQueue(userId, deviceId, syncOperations[])` -> Processes batch of sync operations
    │   │       - **Critical:** All sync endpoints must have < 2 second response time
    │   │       - **Critical:** 99.9% sync success rate required
    │   │
    │   ├── 📋 User Behavior Tracking (For Recommendation Engine - Critical Data Collection)
    │   │   │
    │   │   ├── **Purpose:** Collect comprehensive user behavior data for AI recommendation engine
    │   │   │
    │   │   ├── **Critical Requirement:**
    │   │   │   - **Design from Day One:** Platform must be designed from day one to collect every possible data point
    │   │   │   - **Big Data Collection:** All data feeds into Big Data pipeline for ML training
    │   │   │   - **Reference:** QQ Browser recommends search terms based on articles user has read (similar approach)
    │   │   │   - **Risk:** Without comprehensive data collection, recommendation engine will be ineffective
    │   │   │
    │   │   ├── **Data Collected (Comprehensive - Every Possible Data Point):**
    │   │   │   - **Clicks (Every Click):** Every user click/interaction tracked
    │   │   │     * Story viewed, chapter opened, button clicked
    │   │   │     * Navigation patterns (which pages user visits)
    │   │   │     * Click-through rates on recommendations
    │   │   │   - **Reading Time:** Time spent reading each chapter (tracked per chapter)
    │   │   │     * Reading speed (words per minute)
    │   │   │     * Completion rate (did user finish chapter?)
    │   │   │     * Drop-off points (where user stopped reading)
    │   │   │   - **Genres Browsed:** Which genres user explores (genre navigation, filters)
    │   │   │     * Genre click-through rates
    │   │   │     * Genre preferences over time
    │   │   │     * Genre exploration patterns
    │   │   │   - **Comments Liked:** Social engagement signals (likes, comments, shares)
    │   │   │     * Which comments user engages with
    │   │   │     * Social interaction patterns
    │   │   │     * Engagement depth (read, like, comment, share)
    │   │   │   - **Purchase History:** What stories user has purchased
    │   │   │     * Purchase patterns
    │   │   │     * Price sensitivity
    │   │   │     * Purchase frequency
    │   │   │   - **Reading Patterns:** Binge reading, daily reading habits, completion rates
    │   │   │     * Reading frequency
    │   │   │     * Session duration
    │   │   │     * Time of day preferences
    │   │   │     * Binge reading indicators
    │   │   │   - **Demographics:** User profile data (age, location, preferences) - from Profile model
    │   │   │     * Age group
    │   │   │     * Geographic location
    │   │   │     * Language preferences
    │   │   │
    │   │   ├── **Event Emission:**
    │   │   │   - All behavior tracked via events emitted to Event Bus:
    │   │   │     * `user.clicked` - User clicked on story/chapter/button
    │   │   │     * `user.read` - User read chapter (with reading time)
    │   │   │     * `user.purchased` - User purchased story/chapter
    │   │   │     * `user.browsed` - User browsed genre/category
    │   │   │     * `user.liked` - User liked comment/story
    │   │   │   - Events contain: userId, storyId?, chapterId?, action, metadata, timestamp
    │   │   │   - Events consumed by ai-service for recommendation engine
    │   │   │
    │   │   ├── **Storage:**
    │   │   │   - **PostgreSQL:** Store recent behavior events (last 30 days) in `UserBehaviorEvent` table
    │   │   │   - **BigQuery/Data Warehouse:** Archive all events for ML training (Rule #7: PostgreSQL is truth)
    │   │   │   - **Redis:** Cache user behavior summaries (reading patterns, preferences)
    │   │   │
    │   │   └── **gRPC Endpoints:**
    │   │       - `TrackClick(userId, storyId?, chapterId?, action, metadata?)` - Track user click
    │   │       - `TrackReadingTime(userId, chapterId, readingTime, completionRate?)` - Track reading time
    │   │       - `TrackPurchase(userId, storyId, chapterId?, amount)` - Track purchase
    │   │       - `GetUserBehaviorSummary(userId)` - Get user behavior summary for recommendations
    │   │
    │   📝 **Development Steps:**
    │   │   │   * **Dev Steps:**
    │   │   │       1.  Setup NestJS, Prisma. Define `User`, `Profile`, `ReadingPreferences`, `Bookmark`, `Annotation`, `Library`, `Bookshelf`, `Wishlist`, `ReadingProgress`, `UserBehaviorEvent` in `prisma/schema.prisma` (at root level). Run `prisma generate`.
    │   │   │       2.  Build `AuthModule` (using `@nestjs/jwt` for token creation/validation) and `UsersModule` (CRUD).
    │   │   │       3.  Create a `users.controller.ts` in `src/modules/users/` (implementing the gRPC server using `@nestjs/microservices`).
        │   │   │       4.  **Bookshelf & Library Management (Enhanced - 2.1, 2.2, 2.3):** Add models to `schema.prisma`:
        │   │   │           - `Library` model (user's saved stories - Enhanced):
        │   │   │             - `id`, `userId` (FK), `storyId` (FK), `addedAt`, `lastReadAt`, `lastChapterId` (FK, optional)
        │   │   │             - `isDownloaded` (Boolean, for offline), `downloadProgress` (Int, 0-100)
        │   │   │             - `downloadStatus` (Enum: 'pending'|'downloading'|'completed'|'failed')
        │   │   │             - `downloadSize` (BigInt, optional - bytes), `downloadedAt` (DateTime, optional)
        │   │   │             - `lastSyncedAt` (DateTime, for sync tracking)
        │   │   │             - `deviceId` (String, optional - tracks which device last updated)
        │   │   │             - `customTags` (String array, deprecated - use Tag model), `notes` (String, optional)
        │   │   │             - `displayLayout` (Enum: 'grid'|'list', default: 'grid')
        │   │   │             - `sortOrder` (Enum: 'recent'|'title'|'progress'|'added', default: 'recent')
        │   │   │             - `createdAt`, `updatedAt`
        │   │   │           - `Bookshelf` model (virtual bookshelves for organization - Enhanced 2.1):
        │   │   │             - `id`, `userId` (FK), `name` (String), `description` (String, optional)
        │   │   │             - `displayOrder` (Int), `isDefault` (Boolean)
        │   │   │             - `createdAt`, `updatedAt`
        │   │   │           - `BookshelfItem` model (links Library entries to Bookshelves):
        │   │   │             - `id`, `bookshelfId` (FK), `libraryId` (FK)
        │   │   │             - `displayOrder` (Int), `addedAt`
        │   │   │           - `Tag` model (NEW - 2.1 - Flexible categorization):
        │   │   │             - `id`, `userId` (FK), `name` (String), `color` (String, optional - hex color)
        │   │   │             - `icon` (String, optional - icon identifier), `parentTagId` (FK, optional - for hierarchy)
        │   │   │             - `parentTag` (Tag, self-relation), `childTags` (Tag[], self-relation)
        │   │   │             - `libraryItems` (LibraryTag[] - many-to-many)
        │   │   │             - `createdAt`, `updatedAt`
        │   │   │           - `LibraryTag` model (NEW - 2.1 - Many-to-many: Library-Tag):
        │   │   │             - `id`, `libraryId` (FK), `tagId` (FK)
        │   │   │             - `library` (Library relation), `tag` (Tag relation)
        │   │   │             - `createdAt`
        │   │   │           - `FilteredView` model (NEW - 2.1 - Dynamic queries):
        │   │   │             - `id`, `userId` (FK), `name` (String), `description` (String, optional)
        │   │   │             - `query` (Json - filter query with tags, author, completion, date ranges, etc.)
        │   │   │             - `isAutoUpdating` (Boolean, default: false - auto-update when data changes)
        │   │   │             - `displayOrder` (Int)
        │   │   │             - `createdAt`, `updatedAt`
        │   │   │           - `SystemList` model (NEW - 2.1 - Predefined lists):
        │   │   │             - `id`, `userId` (FK), `listType` (Enum: 'favorites'|'to-read'|'have-read'|'currently-reading'|'recently-added')
        │   │   │             - `libraryItems` (LibrarySystemList[] - many-to-many)
        │   │   │             - `createdAt`, `updatedAt`
        │   │   │           - `LibrarySystemList` model (NEW - 2.1 - Many-to-many: Library-SystemList):
        │   │   │             - `id`, `libraryId` (FK), `systemListId` (FK)
        │   │   │             - `library` (Library relation), `systemList` (SystemList relation)
        │   │   │             - `createdAt`
        │   │   │           - `Wishlist` model (stories user wants to read):
        │   │   │             - `id`, `userId` (FK), `storyId` (FK)
        │   │   │             - `priority` (Int, optional), `notes` (String, optional)
        │   │   │             - `createdAt`, `updatedAt`
    │   │   │           - `ReadingProgress` model (tracks reading position per story - Enhanced):
    │   │   │             - `id`, `userId` (FK), `storyId` (FK), `chapterId` (FK)
    │   │   │             - `position` (Float - scroll position or page number)
    │   │   │             - `progressPercentage` (Float, 0-100), `lastReadAt`
    │   │   │             - `isCompleted` (Boolean)
    │   │   │             - `lastSyncedAt` (DateTime, for sync tracking)
    │   │   │             - `deviceId` (String, optional - tracks which device last updated)
    │   │   │             - `syncVersion` (Int, for conflict resolution - last-write-wins)
    │   │   │             - `createdAt`, `updatedAt`
    │   │   │           - Create `LibraryService`, `BookshelfService`, `WishlistService`, `ReadingProgressService`:
    │   │   │             * `LibraryService` (Enhanced):
    │   │   │               - `addToLibrary(userId, storyId)` -> Adds story to library
    │   │   │               - `removeFromLibrary(userId, storyId)` -> Removes story
    │   │   │               - `getLibrary(userId, bookshelfId?, tags?, layout?, sort?)` -> Returns library with filters
    │   │   │                 * Filters: bookshelfId (filter by bookshelf), tags (array of tags), layout ('grid'|'list')
    │   │   │                 * Sort: 'recent'|'title'|'progress'|'added' (default: 'recent')
    │   │   │               - `updateLibraryItem(userId, libraryId, tags?, notes?, layout?, sort?)` -> Updates tags/notes/layout
    │   │   │               - `getLibraryStats(userId)` -> Returns library statistics (total, completed, reading, etc.)
    │   │   │               - `searchLibrary(userId, query)` -> Search library by title/tags
            │   │   │             * `LibrarySyncService` (Enhanced - Cross-device Synchronization + MVP Phase 1):
            │   │   │               - `syncLibrary(userId, deviceId)` -> Syncs library across devices (Rule #8)
            │   │   │                 * Strategy: Last-write-wins with conflict resolution
            │   │   │                 * Syncs: Library items, tags, notes, download status
            │   │   │                 * Emits: `library.synced` event to Event Bus
            │   │   │               - `syncWithConflictResolution(userId, deviceId, localData, conflictStrategy?)` -> **NEW (MVP Phase 1)**
            │   │   │                 * Enhanced sync with explicit conflict handling
            │   │   │                 * Supports multiple conflict strategies: 'last-write-wins', 'server-wins', 'client-wins', 'merge'
            │   │   │                 * Returns conflicts array for items needing manual resolution
            │   │   │                 * Supports partial sync (only changed items since lastSyncAt)
            │   │   │               - `getPendingSyncQueue(userId, deviceId)` -> **NEW (MVP Phase 1)** Returns pending sync operations
            │   │   │               - `processSyncQueue(userId, deviceId, syncOperations[])` -> **NEW (MVP Phase 1)** Processes batch sync
            │   │   │               - `getSyncStatus(userId)` -> Returns sync status (last sync time, conflicts, etc.)
            │   │   │               - `resolveSyncConflict(userId, libraryId, resolution)` -> Resolves sync conflicts
            │   │   │             * `LibraryDownloadService` (Enhanced - 2.2 - Offline Management):
            │   │   │               - `downloadStory(userId, storyId, includePremium?)` -> Downloads story for offline
            │   │   │                 * Note: Premium chapters only downloaded if user has unlocked them
            │   │   │                 * Updates: `isDownloaded`, `downloadProgress`, `downloadStatus`
            │   │   │               - `downloadChapter(userId, chapterId)` -> Downloads single chapter
            │   │   │               - `batchDownload(userId, storyIds)` -> Batch download multiple stories
            │   │   │               - `cancelDownload(userId, storyId)` -> Cancels ongoing download
            │   │   │               - `updateDownloadProgress(userId, storyId, progress)` -> Updates download progress
            │   │   │               - `getDownloadedStories(userId)` -> Returns all downloaded stories
            │   │   │               - `deleteDownloadedStory(userId, storyId)` -> Removes downloaded content
            │   │   │               - `getDownloadQueue(userId)` -> Returns download queue with status
            │   │   │             * `LibraryStorageService` (NEW - 2.2 - Storage Management):
            │   │   │               - `getStorageUsage(userId)` -> Returns storage usage (bytes, percentage, breakdown)
            │   │   │               - `cleanupOldDownloads(userId, olderThanDays)` -> Cleanup old downloads
            │   │   │               - `getDownloadSettings(userId)` -> Get download preferences
            │   │   │               - `updateDownloadSettings(userId, autoDownloadNewChapters?, maxStorageMB?)` -> Update settings
            │   │   │               - `warnStorageFull(userId)` -> Check and warn if storage nearly full
            │   │   │             * `LibraryAutoOrganizationService` (NEW - 2.1 - Auto-Organization):
            │   │   │               - `autoGroupByAuthor(userId)` -> Auto-groups library items by author
            │   │   │               - `autoGroupBySeries(userId)` -> Auto-groups library items by series
            │   │   │               - `getSystemLists(userId)` -> Returns all system lists (Favorites, To Read, Have Read, Currently Reading, Recently Added)
            │   │   │               - `getBooksByAuthor(userId, authorId)` -> Returns all books by specific author
            │   │   │               - `getBooksBySeries(userId, seriesId)` -> Returns all books in specific series
            │   │   │               - `updateSystemList(userId, listType, libraryIds)` -> Updates system list (e.g., mark as favorite)
            │   │   │             * `TagsService` (NEW - 2.1 - Advanced Organization):
            │   │   │               - `createTag(userId, name, color?, icon?, parentTagId?)` -> Creates tag (supports hierarchy)
            │   │   │               - `updateTag(userId, tagId, name?, color?, icon?)` -> Updates tag
            │   │   │               - `deleteTag(userId, tagId)` -> Deletes tag (removes from all library items)
            │   │   │               - `getAllTags(userId)` -> Returns all user tags (with hierarchy)
            │   │   │               - `getTagHierarchy(userId)` -> Returns tag tree structure
            │   │   │               - `applyTagToLibrary(userId, libraryId, tagId)` -> Applies tag to library item
            │   │   │               - `removeTagFromLibrary(userId, libraryId, tagId)` -> Removes tag from library item
            │   │   │               - `getTagSuggestions(userId, libraryId)` -> Suggests tags based on story metadata
            │   │   │             * `FilteredViewsService` (NEW - 2.1 - Dynamic Queries):
            │   │   │               - `createFilteredView(userId, name, query, isAutoUpdating?)` -> Creates filtered view (saved query)
            │   │   │               - `updateFilteredView(userId, viewId, name?, query?)` -> Updates filtered view
            │   │   │               - `deleteFilteredView(userId, viewId)` -> Deletes filtered view
            │   │   │               - `getFilteredViews(userId)` -> Returns all filtered views
            │   │   │               - `executeFilter(userId, query)` -> Executes filter query and returns matching library items
            │   │   │                 * Query supports: tags (AND/OR/NOT), author, series, completion status, date ranges, progress percentage
            │   │   │                 * Example: "Philosophy books highlighted in last 30 days"
            │   │   │                 * Example: "Completed stories by Author X tagged 'fiction'"
            │   │   │                 * Example: "Stories with progress > 50% but not completed"
    │   │   │             * `BookshelfService` (Enhanced):
    │   │   │               - `createBookshelf(userId, name, description?)` -> Creates virtual bookshelf
    │   │   │               - `updateBookshelf(userId, bookshelfId, name?, description?)` -> Updates bookshelf
    │   │   │               - `deleteBookshelf(userId, bookshelfId)` -> Deletes bookshelf (moves items to default)
    │   │   │               - `getBookshelves(userId)` -> Returns all bookshelves (with item counts)
    │   │   │               - `getBookshelfItems(userId, bookshelfId, layout?, sort?)` -> Returns items in bookshelf
    │   │   │               - `addToBookshelf(userId, bookshelfId, libraryId)` -> Adds library item to bookshelf
    │   │   │               - `removeFromBookshelf(userId, bookshelfId, libraryId)` -> Removes from bookshelf
    │   │   │               - `reorderBookshelf(userId, bookshelfId, items)` -> Reorders items
    │   │   │               - `moveBetweenBookshelves(userId, libraryId, fromBookshelfId, toBookshelfId)` -> Moves item
    │   │   │             * `BookshelfOrganizationService` (NEW - Organization Features):
    │   │   │               - `applyTags(userId, libraryId, tags)` -> Applies custom tags to library item
    │   │   │               - `removeTags(userId, libraryId, tags)` -> Removes tags
    │   │   │               - `getAllTags(userId)` -> Returns all unique tags used by user
    │   │   │               - `filterByTags(userId, tags)` -> Filters library by tags
    │   │   │               - `setLayoutPreference(userId, layout)` -> Sets default layout ('grid'|'list')
    │   │   │               - `setSortPreference(userId, sort)` -> Sets default sort order
    │   │   │             * `WishlistService`:
    │   │   │               - `addToWishlist(userId, storyId, priority?, notes?)` -> Adds to wishlist
    │   │   │               - `removeFromWishlist(userId, storyId)` -> Removes from wishlist
    │   │   │               - `getWishlist(userId)` -> Returns wishlist
    │   │   │               - `moveToLibrary(userId, storyId)` -> Moves from wishlist to library
    │   │   │             * `ReadingProgressService` (Enhanced):
    │   │   │               - `updateProgress(userId, storyId, chapterId, position, progressPercentage)` -> Updates progress
    │   │   │                 * Auto-updates `lastReadAt` on Library model
    │   │   │                 * Emits `reading.progress.updated` event to Event Bus
    │   │   │               - `getProgress(userId, storyId?)` -> Returns reading progress
    │   │   │               - `getProgressHistory(userId, storyId)` -> Returns progress history (for analytics)
    │   │   │               - `markAsCompleted(userId, storyId)` -> Marks story as completed
    │   │   │               - `getReadingStats(userId)` -> Returns reading statistics (total time, chapters read, etc.)
            │   │   │             * `ReadingProgressSyncService` (Enhanced - 2.3 - Cross-device Sync):
            │   │   │               - `syncProgress(userId, deviceId)` -> Syncs progress across devices (Rule #8)
            │   │   │                 * Strategy: Last-write-wins with timestamp comparison
            │   │   │                 * Syncs: Position, progress percentage, completion status
            │   │   │                 * Emits: `reading.progress.synced` event to Event Bus
            │   │   │               - `getSyncStatus(userId)` -> Returns sync status (last sync time, conflicts, error count)
            │   │   │               - `resolveProgressConflict(userId, storyId, resolution)` -> Resolves conflicts
            │   │   │               - **Critical:** Never lose reading progress - this is retention mechanism
            │   │   │             * `BookmarkSyncService` (Enhanced - 2.3 + MVP Phase 1 - Bookmark Sync):
            │   │   │               - `syncBookmarks(userId, deviceId)` -> Syncs all bookmarks across devices
            │   │   │                 * Strategy: Last-write-wins, merge non-conflicting bookmarks
            │   │   │                 * Emits: `bookmark.synced` event to Event Bus
            │   │   │               - `syncWithConflictResolution(userId, deviceId, localData, conflictStrategy?)` -> **NEW (MVP Phase 1)**
            │   │   │                 * Enhanced sync with explicit conflict handling
            │   │   │                 * Supports partial sync for offline-first architecture
            │   │   │               - **Critical:** Losing bookmarks causes user churn
            │   │   │             * `AnnotationSyncService` (Enhanced - 2.3 + MVP Phase 1 - Annotation Sync):
            │   │   │               - `syncAnnotations(userId, deviceId)` -> Syncs all highlights/notes across devices
            │   │   │                 * Strategy: Last-write-wins, merge non-conflicting annotations
            │   │   │                 * Emits: `annotation.synced` event to Event Bus
            │   │   │               - `syncWithConflictResolution(userId, deviceId, localData, conflictStrategy?)` -> **NEW (MVP Phase 1)**
            │   │   │                 * Enhanced sync with explicit conflict handling
            │   │   │                 * Supports partial sync for offline-first architecture
            │   │   │               - **Critical:** Losing highlights/notes is catastrophic - user's intellectual property
            │   │   │               - This is the strongest retention mechanism - data loss = immediate churn
    │   │   │           - Update `users.proto` to add gRPC methods for bookshelf, library, wishlist, reading progress
    │   │   │       5.  **User Behavior Tracking (For Recommendation Engine) (NEW):**
    │   │   │           - Create `user-behavior` module with `UserBehaviorService`:
    │   │   │             * `trackClick(userId, storyId?, chapterId?, action, metadata?)` -> Tracks user click, emits `user.clicked` event
    │   │   │             * `trackReadingTime(userId, chapterId, readingTime, completionRate?)` -> Tracks reading time, emits `user.read` event
    │   │   │             * `trackPurchase(userId, storyId, chapterId?, amount)` -> Tracks purchase, emits `user.purchased` event
    │   │   │             * `getUserBehaviorSummary(userId)` -> Returns behavior summary for recommendations
    │   │   │           - Create `BehaviorEventEmitterService`:
    │   │   │             * Emits events to Event Bus: `user.clicked`, `user.read`, `user.purchased`, `user.browsed`, `user.liked`
    │   │   │             * Events consumed by ai-service for recommendation engine
    │   │   │           - Add `UserBehaviorEvent` model to `schema.prisma`:
    │   │   │             * `id`, `userId` (FK), `storyId` (FK, optional), `chapterId` (FK, optional)
    │   │   │             * `action` (String: 'click', 'read', 'purchase', 'browse', 'like')
    │   │   │             * `metadata` (JSON: additional data like reading time, genre, etc.)
    │   │   │             * `timestamp`
    │   │   │           - Store recent events (last 30 days) in PostgreSQL, archive to BigQuery
    │   │   │           - Update `users.proto` to add gRPC methods: `TrackClick()`, `TrackReadingTime()`, `TrackPurchase()`, `GetUserBehaviorSummary()`
    │   │   │           - **Rule #2:** Use Event Bus (BullMQ) for async event emission to ai-service
    │   │   │       6.  **Bookmarks & Annotations (Enhanced - Annotation Suite):** Add models to `schema.prisma`:
    │   │   │           - `Bookmark` model:
    │   │   │             - `id`, `userId` (FK), `storyId` (FK), `chapterId` (FK), `position` (Float - scroll position or page number)
    │   │   │             - `note` (String, optional), `createdAt`, `updatedAt`
    │   │   │           - `Annotation` model (Enhanced):
    │   │   │             - `id`, `userId` (FK), `storyId` (FK, optional), `chapterId` (FK, optional)
    │   │   │             - `selectedText` (String), `startOffset` (Int), `endOffset` (Int)
    │   │   │             - `note` (String), `color` (String - highlight color)
    │   │   │             - **Unification Fields (NEW):**
    │   │   │               - `sourceType` (Enum: 'epub'|'pdf'|'web'|'youtube'|'twitter'|'story'|'chapter', default: 'story')
    │   │   │               - `sourceId` (String, optional - ID of source document/content)
    │   │   │               - `sourceUrl` (String, optional - URL for web/YouTube/Twitter sources)
    │   │   │               - `unifiedAt` (DateTime, optional - when unified from external source)
    │   │   │             - **Revisitation Fields (NEW):**
    │   │   │               - `lastReviewedAt` (DateTime, optional - last review timestamp)
    │   │   │               - `reviewCount` (Int, default: 0 - number of times reviewed)
    │   │   │               - `nextReviewDate` (DateTime, optional - next scheduled review for spaced repetition)
    │   │   │               - `isArchived` (Boolean, default: false - archived highlights)
    │   │   │             - `createdAt`, `updatedAt`
    │   │   │           - `AnnotationSource` model (NEW - Source tracking):
    │   │   │             - `id`, `userId` (FK), `sourceType` (Enum), `sourceId` (String)
    │   │   │             - `sourceUrl` (String, optional), `sourceTitle` (String, optional)
    │   │   │             - `importedAt` (DateTime), `lastSyncedAt` (DateTime, optional)
    │   │   │             - `syncEnabled` (Boolean, default: true - auto-sync from source)
    │   │   │             - `createdAt`, `updatedAt`
    │   │   │           - Create `BookmarkService` and `AnnotationService` (Enhanced):
    │   │   │             * `createBookmark(userId, storyId, chapterId, position, note?)`
    │   │   │             * `getBookmarks(userId, storyId?)` -> Returns all bookmarks
    │   │   │             * `deleteBookmark(bookmarkId)`
    │   │   │             * **AnnotationService Core Methods:**
    │   │   │               - `createAnnotation(userId, storyId?, chapterId?, selectedText, startOffset, endOffset, note, color?, sourceType?, sourceId?, sourceUrl?)`
    │   │   │               - `getAnnotations(userId, storyId?, chapterId?, sourceType?)` -> Returns annotations (filtered by source)
    │   │   │               - `updateAnnotation(annotationId, note?, color?)`
    │   │   │               - `deleteAnnotation(annotationId)`
    │   │   │               - `getAnnotationStats(userId)` -> Returns stats (total, by source, review stats)
    │   │   │             * **AnnotationUnificationService (NEW):**
    │   │   │               - `unifyFromSource(userId, sourceType, sourceId, annotations)` -> Import annotations from external source
    │   │   │               - `syncFromGoogleDrive(userId, folderId)` -> Sync from Google Drive folder
    │   │   │               - `getUnifiedAnnotations(userId, query?)` -> Get all annotations from all sources (searchable)
    │   │   │               - `searchAnnotations(userId, query)` -> Full-text search across all annotations
    │   │   │               - `getAnnotationsBySource(userId, sourceType)` -> Get annotations grouped by source
    │   │   │             * **AnnotationRevisitationService (NEW):**
    │   │   │               - `getRevisitationQueue(userId, limit?)` -> Get highlights due for review (spaced repetition)
    │   │   │               - `markAsReviewed(annotationId, userId)` -> Mark annotation as reviewed, schedule next review
    │   │   │               - `getReviewStats(userId)` -> Get review statistics (total reviewed, review streak, etc.)
    │   │   │               - `scheduleReview(annotationId, daysUntilReview)` -> Manually schedule review
    │   │   │             * **AnnotationExportService (NEW - Workflow Integration):**
    │   │   │               - `exportToMarkdown(userId, annotationIds?, sourceType?)` -> Export annotations as Markdown
    │   │   │               - `exportToNotion(userId, notionPageId, annotationIds?)` -> Export to Notion page
    │   │   │               - `exportToObsidian(userId, vaultPath, annotationIds?)` -> Export to Obsidian vault
    │   │   │               - `exportToCapacities(userId, spaceId, annotationIds?)` -> Export to Capacities space
    │   │   │               - `getExportFormats()` -> Returns available export formats
    │   │   │             * **AnnotationAISummaryService (NEW - AI Summary from Highlights):**
    │   │   │               - `generateSummaryFromAnnotations(userId, annotationIds, context?)` -> Calls ai-service to generate summary from selected highlights
    │   │   │               - `generateSummaryFromSelectedText(userId, selectedText, surroundingText?, context?)` -> Generate summary from selected text
    │   │   │               - `getAnnotationSummary(annotationId)` -> Get cached summary for annotation
    │   │   │               - Uses ai-service `SummarizeAnnotations` gRPC method (Rule #2: gRPC for sync calls)
    │   │   │               - Caches summaries in Redis (key: `annotation_summary:${annotationId}`, TTL: 7 days)
    │   │   │           - Update `users.proto` to add gRPC methods for bookmarks and enhanced annotations (including AI Summary)
        │   │   │       5.  **Reading Preferences (Core Reader Interface - Enhanced with Market Analysis Features):** Add `ReadingPreferences` model to `schema.prisma`:
        │   │   │           - **Text Customization (1.1 - Enhanced):**
        │   │   │             - `fontSize` (Int, 12-24, default: 16) - Slider control via 'Aa' icon
        │   │   │             - `fontFamily` (String, enum: 'system'|'serif'|'sans-serif'|'monospace'|'custom', default: 'system')
        │   │   │             - `customFontUrl` (String, optional) - URL to uploaded custom font (OTF/TTF) - Delighter feature
        │   │   │             - `customFontName` (String, optional) - Name of custom font for display
        │   │   │             - `customFontData` (String, optional, Text) - Base64 encoded font data (for offline use)
        │   │   │             - `lineHeight` (Float, 1.0-2.5, default: 1.5)
        │   │   │             - `letterSpacing` (Float, -0.5 to 2.0, default: 0)
        │   │   │             - `paragraphSpacing` (Float, 0-2.0, default: 1.0)
        │   │   │             - `wordSpacing` (Float, 0-2.0, default: 0)
        │   │   │             - `textAlign` (String, enum: 'left'|'center'|'justify', default: 'left')
        │   │   │           - **Background & Theme Modes (1.2 - Enhanced with Blue Light Filtering):**
        │   │   │             - `backgroundColor` (String, enum: 'white'|'black'|'sepia'|'eye-protection'|'custom', default: 'white')
        │   │   │               - 'white' = Day mode (default)
        │   │   │               - 'black' = Night mode
        │   │   │               - 'sepia' = Sepia/brown tone
        │   │   │               - 'eye-protection' = Yellow/green tint (护眼模式)
        │   │   │               - 'custom' = User-defined color
        │   │   │             - `textColor` (String, optional, hex color)
        │   │   │             - `customBackgroundColor` (String, optional, hex color for 'custom' mode)
        │   │   │             - `brightness` (Int, 0-100, default: 100)
        │   │   │             - **Blue Light Filtering (NEW - Adaptive Eye Protection):**
        │   │   │               - `blueLightFilterEnabled` (Boolean, default: false) - Enable adaptive blue light filtering
        │   │   │               - `blueLightFilterStrength` (Int, 0-100, default: 50) - Filter intensity
        │   │   │               - `blueLightFilterAdaptive` (Boolean, default: true) - Auto-adjust based on time/location
        │   │   │               - `blueLightFilterScheduleStart` (String, optional) - Custom schedule start time (HH:mm)
        │   │   │               - `blueLightFilterScheduleEnd` (String, optional) - Custom schedule end time (HH:mm)
        │   │   │           - **Reading Mode (1.3 - Scroll vs Page Turn):**
        │   │   │             - `readingMode` (String, enum: 'scroll'|'page', default: 'scroll')
        │   │   │               - 'scroll' = Continuous scroll (web-native, arrow up/down icon)
        │   │   │               - 'page' = Page turn mode (book-like, arrow left/right icon)
        │   │   │             - `pageTurnAnimation` (Boolean, default: true)
        │   │   │             - `pageTurnDirection` (String, enum: 'horizontal'|'vertical', default: 'horizontal')
        │   │   │             - `scrollBehavior` (String, enum: 'smooth'|'instant'|'auto', default: 'smooth')
        │   │   │           - **Multi-Format Support (1.4 - NEW):**
        │   │   │             - `preferredFormats` (String[], optional) - Preferred formats: ['epub', 'pdf', 'mobi', 'fb2', 'docx', 'txt', 'cbr', 'cbz']
        │   │   │             - `formatProcessingPdfAutoCropMargins` (Boolean, default: true) - Auto-crop margins in PDF
        │   │   │             - `formatProcessingPdfAutoGenerateTOC` (Boolean, default: true) - Auto-generate TOC for PDF
        │   │   │             - `formatProcessingDocxAutoGenerateTOC` (Boolean, default: true) - Auto-generate TOC from DOCX headings
        │   │   │             - `formatProcessingArchiveReadFromZip` (Boolean, default: true) - Read EPUB/FB2 from ZIP
        │   │   │             - `formatProcessingArchiveReadFromRar` (Boolean, default: true) - Read from RAR archives
        │   │   │           - **UI Controls Behavior:**
        │   │   │             - `autoHideControls` (Boolean, default: true) - Auto-hide top/bottom bars after inactivity
        │   │   │             - `controlsTimeout` (Int, 1000-10000, default: 3000) - Milliseconds before auto-hide
        │   │   │             - `tapToToggleControls` (Boolean, default: true) - Tap center to show/hide controls
        │   │   │           - **Advanced Settings:**
        │   │   │             - `marginHorizontal` (Int, 0-100, default: 20)
        │   │   │             - `marginVertical` (Int, 0-100, default: 20)
        │   │   │           - **Sync & Persistence:**
        │   │   │             - `syncAcrossDevices` (Boolean, default: true)
        │   │   │             - `id`, `userId` (FK to User), `createdAt`, `updatedAt`
        │   │   │       6.  Create `ReadingPreferencesService` with methods:
        │   │   │           - `getPreferences(userId: string)` -> Returns user's reading preferences (with defaults if not set)
        │   │   │           - `updatePreferences(userId: string, dto: UpdateReadingPreferencesDto)` -> Updates preferences (partial updates supported)
        │   │   │           - Uses Redis cache (key: `reading_prefs:${userId}`) with 1-hour TTL for fast reads (Rule #7)
        │   │   │           - Emits `reading.preferences.updated` event to Event Bus when preferences change
        │   │   │       7.  Update `users.proto` (in 7-shared) to add gRPC methods:
        │   │   │           - `GetReadingPreferences(request: { userId: string })` -> Returns ReadingPreferences
        │   │   │           - `UpdateReadingPreferences(request: { userId, fontSize?, backgroundColor?, readingMode?, ... })` -> Updates and returns
        │   │   │           - All fields in UpdateReadingPreferencesRequest are optional for partial updates
        │   │   │       8.  Implement gRPC handlers in `users.controller.ts` that call `ReadingPreferencesService`
        │   │   │       9.  **Validation:** Use `UpdateReadingPreferencesDto` from 7-shared with class-validator decorators (Rule #3)
    │   │   │       8.  **Note:** The `users.proto` file is defined in `7-shared/src/proto/`.
    │   │   │   * **Speed Opt (Production):** This service should connect to a **Read Replica** of the PostgreSQL DB for read operations (Rule #7).
    │   │   ├── src/           # (Connects to PostgreSQL, Prisma)
    │   │   │   ├── modules/
    │   │   │   │   ├── reading-preferences/  # +++ NEW: Reading preferences module
    │   │   │   │   │   ├── reading-preferences.service.ts  # Business logic for preferences
    │   │   │   │   │   ├── reading-preferences.module.ts   # NestJS module
    │   │   │   │   │   └── dto/             # UpdateReadingPreferencesDto (using class-validator)
    │   │   │   │   ├── library/             # +++ NEW: Library management module
    │   │   │   │   │   ├── library.service.ts  # Business logic for library (saved stories)
    │   │   │   │   │   ├── library.module.ts   # NestJS module
    │   │   │   │   │   └── dto/             # AddToLibraryDto, UpdateLibraryItemDto
    │   │   │   │   ├── bookshelf/           # +++ NEW: Bookshelf organization module
    │   │   │   │   │   ├── bookshelf.service.ts  # Business logic for virtual bookshelves
    │   │   │   │   │   ├── bookshelf.module.ts   # NestJS module
    │   │   │   │   │   └── dto/             # CreateBookshelfDto, ReorderBookshelfDto
    │   │   │   │   ├── wishlist/            # +++ NEW: Wishlist module
    │   │   │   │   │   ├── wishlist.service.ts  # Business logic for wishlist
    │   │   │   │   │   ├── wishlist.module.ts   # NestJS module
    │   │   │   │   │   └── dto/             # AddToWishlistDto
    │   │   │   │   └── reading-progress/   # +++ NEW: Reading progress tracking module
    │   │   │   │       ├── reading-progress.service.ts  # Business logic for progress tracking
    │   │   │   │       ├── reading-progress.module.ts   # NestJS module
    │   │   │   │       └── dto/             # UpdateProgressDto
    │   │   ├── test/
    │   │   │   ├── unit/      # (Tests for services, logic)
    │   │   │   └── integration/ # (Tests integrating with the database)
    │   │   └── package.json
    │   │
    │

---

**Xem thêm:** [README](./README.md) | [Overview](./01-overview.md)
