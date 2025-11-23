---
alwaysApply: true
---

# 👥 Social Service

> **📋 Note:** For detailed Fan Economy structure, see [Community Service](./community/fan-economy/README.md)

└── 📦 social-service/              # 👥 SOCIAL SERVICE
    │       │
    │       ├── 📋 Service Info
    │       │   ├── **Purpose:** Manages Posts, Groups (Book Clubs), Follows, Feeds, Reading Challenges, Activity Tracking (Traditional Social Features)
    │       │   ├── **Database:** Own PostgreSQL database (Rule #1)
    │       │   ├── **Port:** 3008 (gRPC server)
    │       │   ├── **Events:** Emits post.created, user.followed, post.liked, group.created, reading-challenge.created, challenge.progress.updated
    │       │   └── **Speed Opt:** Redis cache for hot feeds, read replicas
    │       │
    │       ├── 📁 Source Code Structure
    │       │   └── src/
    │       │       ├── main.ts
    │       │       ├── app.module.ts
    │       │       │
    │       │       ├── 📁 common/
    │       │       │   └── cache/
    │       │       │       └── cache.module.ts
    │       │       │
    │       │       ├── 📁 events/
    │       │       │   ├── events.module.ts
    │       │       │   └── social.producer.ts
    │       │       │
    │       │       ├── 📁 modules/
    │       │       │   ├── 📁 posts/                    # Posts Module
    │       │       │   │   ├── posts.module.ts
    │       │       │   │   ├── posts.service.ts         # Post CRUD, feed generation
    │       │       │   │   └── dto/
    │       │       │   │       ├── create-post.dto.ts
    │       │       │   │       └── update-post.dto.ts
    │       │       │   │
    │       │       │   ├── 📁 groups/                    # Groups Module (Book Clubs)
    │       │       │   │   ├── groups.module.ts
    │       │       │   │   ├── groups.service.ts        # Group CRUD, member management
    │       │       │   │   ├── book-clubs.service.ts     # Book club-specific features (discussions, reading schedules)
    │       │       │   │   └── dto/
    │       │       │   │       ├── create-group.dto.ts
    │       │       │   │       ├── create-book-club.dto.ts  # Book club creation (NEW)
    │       │       │   │       ├── join-group.dto.ts
    │       │       │   │       └── schedule-reading.dto.ts  # Schedule group reading (NEW)
    │       │       │   │
    │       │       │   ├── 📁 follows/                   # Follows Module
    │       │       │   │   ├── follows.module.ts
    │       │       │   │   └── follows.service.ts       # Follow/unfollow logic
    │       │       │   │
    │       │       │   ├── 📁 feed/                      # Feed Module
    │       │       │   │   ├── feed.module.ts
    │       │       │   │   └── feed.service.ts          # Feed aggregation algorithm
    │       │       │   │
    │       │       │   ├── 📁 reading-challenges/        # Reading Challenges Module (NEW)
    │       │       │   │   ├── reading-challenges.module.ts
    │       │       │   │   ├── reading-challenges.service.ts  # Challenge CRUD, progress tracking
    │       │       │   │   ├── community-challenges.service.ts  # Community-wide challenges
    │       │       │   │   └── dto/
    │       │       │   │       ├── create-challenge.dto.ts
    │       │       │   │       ├── join-challenge.dto.ts
    │       │       │   │       └── update-progress.dto.ts
    │       │       │   │
    │       │       │   └── 📁 activity-tracking/        # Activity Tracking Module (NEW)
    │       │       │       ├── activity-tracking.module.ts
    │       │       │       ├── activity-tracking.service.ts  # Track reading activity, goals
    │       │       │       └── dto/
    │       │       │           ├── set-reading-goal.dto.ts
    │       │       │           └── get-activity-feed.dto.ts
    │       │       │
    │       │       ├── 📁 controllers/
    │       │       │   └── social.controller.ts         # gRPC controller (implements social.proto)
    │       │       │
    │       │       ├── 📁 prisma/
    │       │       │   ├── schema.prisma                # Post, Group (BookClub), GroupMember, Follow, PostLike, ReadingChallenge, ChallengeParticipant, ActivityTracking models
    │       │       │   └── migrations/
    │       │       │
    │       │       └── 📁 workers/                       # Event Bus Workers
    │       │           └── social-events.worker.ts      # Emits social events
    │       │
    │       ├── 📁 Configuration Files
    │       │   ├── package.json
    │       │   └── README.md
    │       │
    │       └── 📁 Database Models (Prisma Schema)
    │           └── Models: Post, Group (BookClub), GroupMember, Follow, PostLike, ReadingChallenge, ChallengeParticipant, ActivityTracking, ReadingGoal
    │       │
    │       ├── 📋 Traditional Social Features
    │       │   │
    │       │   ├── **Social Feeds:**
    │       │   │   - **Purpose:** View activity of friends (what they're reading, want to read, reviews)
    │       │   │   - **Features:**
    │       │   │     * Activity feed from followed users
    │       │   │     * Reading updates (started reading, finished chapter, added to library)
    │       │   │     * Review sharing
    │       │   │     * Challenge progress visibility (key feature - users love seeing friends' progress)
    │       │   │   - **Implementation:**
    │       │   │     * `FeedService` aggregates activities from followed users
    │       │   │     * Integrate with users-service for reading progress
    │       │   │     * Cache hot feeds in Redis (key: `feed:${userId}`, TTL: 5 minutes)
    │       │   │
    │       │   ├── **Book Clubs (Groups):**
    │       │   │   - **Purpose:** Virtual spaces for group book discussions
    │       │   │   - **Features:**
    │       │   │     * Create book clubs (groups focused on specific books/series)
    │       │   │     * Schedule group readings (read chapter X by date Y)
    │       │   │     * Group discussions (posts within book club)
    │       │   │     * Member management (join, leave, roles)
    │       │   │   - **Implementation:**
    │       │   │     * `BookClubsService` extends `GroupsService` with book-specific features
    │       │   │     * `Group` model: `type` field ('general'|'book-club'), `storyId` (optional - for book clubs)
    │       │   │     * `ReadingSchedule` model: groupId, storyId, chapterNumber, deadline, discussionDate
    │       │   │     * gRPC: `CreateBookClub()`, `ScheduleGroupReading()`, `GetBookClubSchedule()`
    │       │   │
    │       │   ├── **Reading Challenges:**
    │       │   │   - **Purpose:** Set personal reading goals and participate in community challenges
    │       │   │   - **Features:**
    │       │   │     * Personal reading goals (e.g., "Read 50 books this year")
    │       │   │     * Community challenges (platform-organized)
    │       │   │     * Progress tracking (books read, pages read, time spent)
    │       │   │     * Friend progress visibility (KEY FEATURE - users love this)
    │       │   │     * Challenge leaderboards
    │       │   │   - **Implementation:**
    │       │   │     * `ReadingChallenge` model: id, userId, challengeType ('personal'|'community'), goal (books/pages/time), timeRange, progress, status
    │       │   │     * `ChallengeParticipant` model: challengeId, userId, progress, joinedAt
    │       │   │     * `ReadingChallengesService`: Create, join, update progress
    │       │   │     * Integration with users-service for reading progress data
    │       │   │     * Background job to update progress daily
    │       │   │     * gRPC: `CreateReadingChallenge()`, `JoinChallenge()`, `GetChallengeProgress()`, `GetFriendProgress()`
    │       │   │     * **CRITICAL:** Friend progress visibility is a key feature - users want to see friends' challenge progress
    │       │   │
    │       │   └── **Activity Tracking:**
    │       │       - **Purpose:** Track and display reading activity
    │       │       - **Features:**
    │       │         * Reading goals (books, pages, time)
    │       │         * Activity timeline (what user read, when)
    │       │         * Statistics (total books read, pages read, reading streak)
    │       │       - **Implementation:**
    │       │         * `ActivityTracking` model: userId, activityType, storyId, chapterId, timestamp, metadata
    │       │         * `ReadingGoal` model: userId, goalType ('books'|'pages'|'time'), target, current, timeRange
    │       │         * `ActivityTrackingService`: Track activities, get statistics
    │       │         * Integration with users-service for reading progress
    │       │         * gRPC: `SetReadingGoal()`, `GetActivityFeed()`, `GetReadingStatistics()`
    │       │
    │       📝 **Development Steps:**
    │       │       1.  Setup NestJS, Prisma. Define models in `schema.prisma`. Run `prisma generate`.
    │       │       2.  Install `@nestjs/bull` to emit events to Event Bus (BullMQ).
    │       │       3.  **Traditional Social Features:**
    │       │           * **Book Clubs:**
    │       │             - Extend `Group` model: Add `type` field ('general'|'book-club'), `storyId` (optional)
    │       │             - Create `ReadingSchedule` model: groupId, storyId, chapterNumber, deadline, discussionDate
    │       │             - Create `BookClubsService`: Schedule group readings, manage book club discussions
    │       │           * **Reading Challenges:**
    │       │             - Create `ReadingChallenge` model: id, userId, challengeType, goal, timeRange, progress, status, isPublic
    │       │             - Create `ChallengeParticipant` model: challengeId, userId, progress, joinedAt
    │       │             - Create `ReadingChallengesService`: Create, join, update progress, get friend progress
    │       │             - **CRITICAL:** Implement friend progress visibility (users love this feature)
    │       │           * **Activity Tracking:**
    │       │             - Create `ActivityTracking` model: userId, activityType, storyId, chapterId, timestamp, metadata
    │       │             - Create `ReadingGoal` model: userId, goalType, target, current, timeRange
    │       │             - Create `ActivityTrackingService`: Track activities, get statistics
    │       │       4.  Implement gRPC server (based on `social.proto` from 7-shared) with methods:
    │       │           - `CreatePost(request)` -> Creates post, emits `post.created` event
    │       │           - `DeletePost(request)` -> Deletes post, emits `post.deleted` event
    │       │           - `CreateGroup(request)` -> Creates group, emits `group.created` event
    │       │           - `CreateBookClub(request)` -> Creates book club, emits `book-club.created` event (NEW)
    │       │           - `ScheduleGroupReading(request)` -> Schedules group reading (NEW)
    │       │           - `JoinGroup(request)` -> Adds member, emits `group.member.joined` event
    │       │           - `FollowUser(request)` -> Creates follow relationship, emits `user.followed` event
    │       │           - `UnfollowUser(request)` -> Removes follow relationship
    │       │           - `GetFeed(request)` -> Aggregates posts from followed users (complex logic)
    │       │           - `GetUserPosts(request)` -> Gets posts by a specific user
    │       │           - `GetGroupPosts(request)` -> Gets posts in a specific group
    │       │           - `LikePost(request)` -> Adds like, emits `post.liked` event
    │       │           - `CreateReadingChallenge(request)` -> Creates challenge (NEW)
    │       │           - `JoinChallenge(request)` -> Joins community challenge (NEW)
    │       │           - `GetChallengeProgress(request)` -> Gets challenge progress (NEW)
    │       │           - `GetFriendProgress(request)` -> Gets friends' challenge progress (NEW - KEY FEATURE)
    │       │           - `SetReadingGoal(request)` -> Sets personal reading goal (NEW)
    │       │           - `GetActivityFeed(request)` -> Gets activity feed (NEW)
    │       │       5.  On actions, emit events to Event Bus:
    │       │           - `CreatePost` -> Emit `post.created` (search-service, websocket-service listen)
    │       │           - `FollowUser` -> Emit `user.followed` (notification-service listens)
    │       │           - `LikePost` -> Emit `post.liked` (notification-service listens)
    │       │           - `CreateGroup` -> Emit `group.created`
    │       │           - `CreateReadingChallenge` -> Emit `reading-challenge.created` (NEW)
    │       │           - `UpdateChallengeProgress` -> Emit `challenge.progress.updated` (NEW - for friend visibility)
    │       │       6.  **Feed Algorithm:** Implement feed generation logic (chronological or algorithm-based from followed users).
    │       │       7.  **Integration:**
    │       │           * Integrate with users-service (gRPC) for reading progress data
    │       │           * Cache hot feeds in Redis (key: `feed:${userId}`, TTL: 5 minutes)
    │       │           * Cache challenge progress in Redis (key: `challenge:${challengeId}:progress`, TTL: 1 hour)
    │

---

**📚 Related Documentation:**
- **[Fan Economy Structure](./community/fan-economy/README.md)** - 💰 Tipping, Votes, Author-Fan interaction
- **[Community Interactions](./community/interactions/README.md)** - 💬 Hierarchical interaction system

**Xem thêm:** [README](./README.md) | [Overview](./01-overview.md)
