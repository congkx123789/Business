---
alwaysApply: true
---

├── 📦 community-service/              # 👥 COMMUNITY SERVICE
    │   │   │
    │   │   ├── 📋 Service Info
    │   │   │   ├── **Purpose:** Manages Community Interactions (Hierarchical Comments System) & Fan Economy (Tipping, Rankings, Votes, Author-Fan)
    │   │   │   ├── **Database:** Own PostgreSQL database (Rule #1)
    │   │   │   ├── **Port:** 3009 (gRPC server)
    │   │   │   └── **Speed Opt:** Use Read Replica for read operations (Rule #7)
    │   │   │
    │   │   ├── 📁 Source Code Structure
    │   │   │   └── src/
    │   │   │       ├── main.ts                      # Service entry point (gRPC server)
    │   │   │       ├── app.module.ts                 # Root module
    │   │   │       │
    │   │   │       ├── 📁 modules/
    │   │   │       │   │
    │   │   │       │   ├── 📁 interactions/          # Community Interactions Module (Hierarchical)
    │   │   │       │   │   ├── interactions.module.ts
    │   │   │       │   │   ├── interactions.service.ts  # Wires micro/meso/macro/platform for gRPC handlers
    │   │   │       │   │   │
    │   │   │       │   │   ├── 📁 micro/             # Micro Level: Paragraph Comments (Duanping)
    │   │   │       │   │   │   ├── micro-comments.module.ts
    │   │   │       │   │   │   ├── micro-comments.service.ts  # Paragraph-level comments
    │   │   │       │   │   │   └── dto/
    │   │   │       │   │   │       ├── create-paragraph-comment.dto.ts
    │   │   │       │   │   │       └── update-paragraph-comment.dto.ts
    │   │   │       │   │   │
    │   │   │       │   │   ├── 📁 meso/              # Meso Level: Chapter-End Comments (本章说)
    │   │   │       │   │   │   ├── meso-comments.module.ts
    │   │   │       │   │   │   ├── meso-comments.service.ts  # Chapter-end comments with threading
    │   │   │       │   │   │   └── dto/
    │   │   │       │   │   │       ├── create-chapter-comment.dto.ts
    │   │   │       │   │   │       └── reply-comment.dto.ts
    │   │   │       │   │   │
    │   │   │       │   │   ├── 📁 macro/             # Macro Level: Reviews & Forums
    │   │   │       │   │   │   ├── macro-comments.module.ts
    │   │   │       │   │   │   ├── macro-comments.service.ts  # Book reviews & discussion forums
    │   │   │       │   │   │   └── dto/
    │   │   │       │   │   │       ├── create-review.dto.ts
    │   │   │       │   │   │       └── create-forum-post.dto.ts
    │   │   │       │   │   │
    │   │   │       │   │   └── 📁 platform/          # Platform Interactions: Polls & Quizzes
    │   │   │       │   │       ├── platform-interactions.module.ts
    │   │   │       │   │       ├── platform-interactions.service.ts  # Polls, quizzes, engagement tools
    │   │   │       │   │       └── dto/
    │   │   │       │   │           ├── create-poll.dto.ts
    │   │   │       │   │           └── create-quiz.dto.ts
    │   │   │       │   │
    │   │   │       │   ├── 📁 fan-economy/           # Fan Economy Module
    │   │   │       │   │   ├── fan-economy.module.ts
    │   │   │       │   │   ├── fan-economy.service.ts  # Main fan economy orchestrator
    │   │   │       │   │   │
    │   │   │       │   │   ├── 📁 tipping/            # Tipping System (打赏)
    │   │   │       │   │   │   ├── tipping.module.ts
    │   │   │       │   │   │   ├── tipping.service.ts  # Tipping logic with revenue sharing
    │   │   │       │   │   │   └── dto/
    │   │   │       │   │   │       └── create-tip.dto.ts
    │   │   │       │   │   │
    │   │   │       │   │   ├── 📁 rankings/          # Fan Rankings (粉丝榜)
    │   │   │       │   │   │   ├── rankings.module.ts
    │   │   │       │   │   │   ├── rankings.service.ts  # Top supporters leaderboard
    │   │   │       │   │   │   └── dto/
    │   │   │       │   │   │       └── get-rankings.dto.ts
    │   │   │       │   │   │
    │   │   │       │   │   ├── 📁 gamification/      # Gamification System
    │   │   │       │   │   │   ├── gamification.module.ts
    │   │   │       │   │   │   ├── gamification.service.ts  # Reward loop: Tipping → Rankings → Votes
    │   │   │       │   │   │   └── dto/
    │   │   │       │   │   │       └── calculate-bonus-votes.dto.ts
    │   │   │       │   │   │
    │   │   │       │   │   ├── 📁 votes/             # Monthly Votes System
    │   │   │       │   │   │   ├── votes.module.ts
    │   │   │       │   │   │   ├── votes.service.ts  # Voting & rankings integration
    │   │   │       │   │   │   └── dto/
    │   │   │       │   │   │       └── cast-vote.dto.ts
    │   │   │       │   │   │
    │   │   │       │   │   └── 📁 author-fan/        # Author-Fan Interactions
    │   │   │       │   │       ├── author-fan.module.ts
    │   │   │       │   │       ├── author-fan.service.ts  # Q&A, updates, analytics
    │   │   │       │   │       └── dto/
    │   │   │       │   │           ├── create-qa.dto.ts
    │   │   │       │   │           └── create-author-update.dto.ts
    │   │   │       │   │
    │   │   │       ├── 📁 controllers/                # gRPC Controllers
    │   │   │       │   └── community.controller.ts  # Implements community.proto gRPC methods
    │   │   │       │
    │   │   │       ├── 📁 common/queue/              # Event Bus integration (BullMQ)
    │   │   │       │   ├── queue.module.ts          # Redis/Bull configuration
    │   │   │       │   └── community-events.service.ts  # Publishes comment/fan economy events
    │   │   │       │
    │   │   │       ├── 📁 workers/
    │   │   │       │   └── community-events.worker.ts   # Forwards community-events queue jobs
    │   │   │       │
    │   │   │       └── 📁 prisma/                    # Database Schema
    │   │   │           ├── schema.prisma              # Prisma schema (all community models)
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
    │   │           ├── ParagraphComment              # Micro: Paragraph comments (Duanping) 🎯
    │   │           ├── ParagraphCommentLike          # Micro: Likes on paragraph comments
    │   │           ├── ParagraphCommentReply         # Micro: Replies to paragraph comments
    │   │           ├── ChapterComment                 # Meso: Chapter-end comments (本章说)
    │   │           ├── BookReview                    # Macro: Book reviews
    │   │           ├── ForumPost                     # Macro: Forum posts
    │   │           ├── Poll                          # Platform: Polls
    │   │           ├── Quiz                          # Platform: Quizzes
    │   │           ├── Tip                           # Fan Economy: Tips (打赏)
    │   │           ├── FanRanking                    # Fan Economy: Fan rankings (粉丝榜)
    │   │           ├── MonthlyVote                   # Fan Economy: Monthly votes
    │   │           ├── AuthorFanInteraction          # Fan Economy: Author-fan interactions
    │   │           └── GamificationReward            # Fan Economy: Gamification rewards
    │   │
    │   ├── 📋 Community Interactions (Hierarchical System)
    │   │   │
    │   │   ├── **Purpose:** Hierarchical interaction system serving different discussion needs
    │   │   │
    │   │   ├── **Micro Level (Paragraph Comments - Duanping):** 🎯 **KILLER FEATURE**
    │   │   │   - **Purpose:** Transform solitary reading into social experience - immediate reactions while reading
    │   │   │   - **Core Philosophy:** Comments anchored to specific paragraphs/lines, creating "reading together" feeling
    │   │   │   - **Psychological Impact:** Changes from "you and the book" to "you, author, and thousands of fans reading the same page"
    │   │   │   - **Features:**
    │   │   │     * **Anchored Comments:** Comments attached to specific paragraph index/position in chapter
    │   │   │     * **Real-time Indicators:** Bubble indicators showing comment count (e.g., "58 comments") on paragraphs
    │   │   │     * **Quick Reactions:** Predefined reaction types ('like', 'laugh', 'cry', 'angry', 'wow', 'love')
    │   │   │     * **Author Interaction:** Authors can like/reply directly to paragraph comments, creating direct communication channel
    │   │   │     * **Context Preservation:** Store paragraph text snippet for context (even if chapter content changes)
    │   │   │     * **Real-time Updates:** WebSocket integration for live comment updates as users read
    │   │   │     * **Popular Paragraphs:** Paragraphs with many comments (e.g., funny lines, shocking plot twists) can have hundreds of comments
    │   │   │   - **Use Case:** 
    │   │   │     * User reads a funny sentence → sees "58 comments" bubble → clicks → joins conversation with 58 others
    │   │   │     * User adds their own comment → hours later, author likes their comment → creates engagement loop
    │   │   │     * Users return to old books just to read new paragraph comments
    │   │   │   - **Storage:** 
    │   │   │     * Store paragraph index (Int), paragraph text snippet (String, for context)
    │   │   │     * Store comment text, reaction type, user ID, timestamps
    │   │   │     * Store author interaction (likes, replies) separately for fast queries
    │   │   │   - **Real-time Integration:**
    │   │   │     * WebSocket events: `paragraph.comment.created`, `paragraph.comment.liked`, `paragraph.comment.replied`
    │   │   │     * Clients subscribe to chapter-level comment updates
    │   │   │     * Comment count indicators update in real-time
    │   │   │   - **Performance:**
    │   │   │     * Cache comment counts per paragraph in Redis (key: `paragraph_comments:${chapterId}:${paragraphIndex}:count`, TTL: 5 minutes)
    │   │   │     * Batch load comments for visible paragraphs only (lazy loading)
    │   │   │     * Index on (chapterId, paragraphIndex) for fast queries
    │   │   │
    │   │   ├── **Meso Level (Chapter-End Comments - 本章说):**
    │   │   │   - **Purpose:** Analysis & predictions after reading chapter
    │   │   │   - **Features:** Threaded discussions, voting system, chapter-level comments
    │   │   │   - **Use Case:** Users discuss chapter content, make predictions, analyze plot
    │   │   │   - **Storage:** Store chapter ID, comment hierarchy, votes, replies
    │   │   │
    │   │   ├── **Macro Level (Reviews & Forums):**
    │   │   │   - **Purpose:** Overall critiques and structured evaluations
    │   │   │   - **Features:** Book reviews, discussion forums, structured evaluations
    │   │   │   - **Use Case:** Users write full book reviews, participate in forums
    │   │   │   - **Storage:** Store story ID, review content, ratings, forum threads
    │   │   │
    │   │   ├── **Platform Interactions (Polls & Quizzes):**
    │   │   │   - **Purpose:** Platform-organized engagement tools
    │   │   │   - **Features:** Polls, quizzes, leaderboards, interactive engagement
    │   │   │   - **Use Case:** Platform creates polls/quizzes to engage community
    │   │   │   - **Storage:** Store poll questions, options, votes, quiz questions, answers
    │   │   │
    │   │   └── **Event Emission:**
    │   │       - All interactions emit events to Event Bus (`community-events` queue via BullMQ):
    │   │         * **Paragraph Comments (Micro Level):**
    │   │           - `comment.paragraph.created` - Paragraph comment created (consumed by: notification-service, websocket-service)
    │   │           - `comment.paragraph.liked` - Paragraph comment liked (especially if author liked - consumed by: notification-service, websocket-service)
    │   │           - `comment.paragraph.replied` - Paragraph comment replied to (especially if author replied - consumed by: notification-service, websocket-service)
    │   │           - `comment.paragraph.count.updated` - Comment count updated for paragraph (consumed by: websocket-service for real-time updates)
    │   │         * **Chapter Comments (Meso Level):**
    │   │           - `comment.chapter.created` - Chapter comment created
    │   │           - `comment.replied` - Comment reply created
    │   │         * **Reviews & Forums (Macro Level):**
    │   │           - `review.created` - Book review created
    │   │           - `forum.post.created` - Forum post created
    │   │         * **Platform Interactions:**
    │   │           - `poll.created` - Poll created
    │   │           - `poll.voted` - Poll vote cast
    │   │           - `quiz.created` - Quiz created
    │   │           - `quiz.submitted` - Quiz submission stored
    │   │         * **Fan Economy:**
    │   │           - `tip.created` - Tip created (consumed by: monetization-service, notification-service)
    │   │           - `tip.large` - Large tip created (triggers bonus votes - consumed by: gamification-service)
    │   │           - `monthly.vote.cast` - Monthly vote cast (consumed by: stories-service for rankings)
    │   │       - Events consumed by: notification-service, search-service, social-service, websocket-service, monetization-service, stories-service
    │   │
    │   ├── 📋 Fan Economy (Author Support System)
    │   │   │
    │   │   ├── **Purpose:** Connect readers directly with authors, enable financial support and community interaction
    │   │   │
    │   │   ├── **Tipping System (打赏):**
    │   │   │   - **Purpose:** Direct financial support to authors
    │   │   │   - **Revenue Sharing:** Platform 50%, Tax 6%, Author 44%
    │   │   │   - **Features:** Tipping with virtual currency, gamification, public recognition
    │   │   │   - **Storage:** Store tip amount, story ID, author ID, timestamp
    │   │   │   - **Events:** `tip.created`, `tip.large` (triggers bonus votes)
    │   │   │
    │   │   ├── **Fan Rankings (粉丝榜):**
    │   │   │   - **Purpose:** Public leaderboard of top supporters
    │   │   │   - **Features:** Story fan rankings, author fan rankings, all-time & monthly rankings
    │   │   │   - **Scoring:** Activity-based scoring (tips, votes, engagement)
    │   │   │   - **Storage:** Store rankings, scores, ranking history
    │   │   │   - **Cache:** Cache rankings in Redis (TTL: 1 hour)
    │   │   │
    │   │   ├── **Gamification System:**
    │   │   │   - **Purpose:** Reward loop linking tipping, rankings, and votes
    │   │   │   - **Features:** Bonus Monthly Votes from large tips, badges, social status
    │   │   │   - **Loop:** Tipping → Rankings → Votes → More readers → More tips
    │   │   │   - **Storage:** Store gamification rewards, bonus votes, badges
    │   │   │
    │   │   ├── **Monthly Votes System:**
    │   │   │   - **Purpose:** Voting system for story rankings
    │   │   │   - **Features:** Monthly voting, ranking integration, competition cycles
    │   │   │   - **Bonus Votes:** Large tips grant bonus votes
    │   │   │   - **Storage:** Store votes, vote allocation, monthly resets
    │   │   │
    │   │   ├── **Author-Fan Interactions:**
    │   │   │   - **Purpose:** Communication & engagement between authors and fans
    │   │   │   - **Features:** Q&A sessions, author updates, fan analytics
    │   │   │   - **Storage:** Store Q&A, updates, interaction history
    │   │   │
    │   │   └── **gRPC Endpoints:**
    │   │       - **Paragraph Comments (Micro Level - Duanping):** 🎯
    │   │         * `CreateParagraphComment(request: {userId, storyId, chapterId, paragraphIndex, paragraphText, content, reactionType?})` - Create paragraph comment
    │   │         * `GetParagraphComments(request: {chapterId, paragraphIndex?, limit?, offset?, sortBy?})` - Get comments for paragraph(s)
    │   │         * `GetParagraphCommentCounts(request: {chapterId})` - Get comment counts for all paragraphs in chapter (for bubble indicators)
    │   │         * `LikeParagraphComment(request: {commentId, userId})` - Like a paragraph comment
    │   │         * `ReplyToParagraphComment(request: {commentId, userId, content})` - Reply to a paragraph comment
    │   │         * `DeleteParagraphComment(request: {commentId, userId})` - Delete paragraph comment
    │   │       - **Chapter Comments (Meso Level):**
    │   │         * `CreateChapterComment(userId, chapterId, content, parentId?)` - Create chapter comment
    │   │       - `CreateReview(userId, storyId, rating, content)` - Create book review
    │   │       - `CreatePoll(storyId, question, options)` - Create poll
    │   │       - `CastVote(pollId, optionId, userId)` - Vote on poll
    │   │       - `CreateTip(userId, storyId, amount)` - Tip author
    │   │       - `GetFanRankings(storyId?, authorId?, type, timeRange)` - Get fan rankings
    │   │       - `CastMonthlyVote(userId, storyId, votes)` - Cast monthly votes
    │   │       - `GetAuthorFanInteractions(authorId, userId?)` - Get author-fan interactions
    │   │
    │   📝 **Development Steps:**
    │   │   │   * **Dev Steps:**
    │   │   │       1.  Setup NestJS, Prisma. Define all interaction and fan economy models in `schema.prisma`. Run `prisma generate`.
    │   │   │       2.  **Micro Level (Paragraph Comments - Duanping):** 🎯 **KILLER FEATURE**
    │   │   │           - Create `ParagraphComment` model:
    │   │   │             - `id`, `userId` (FK), `storyId` (FK), `chapterId` (FK), `authorId` (FK - story author)
    │   │   │             - `paragraphIndex` (Int - 0-based index of paragraph in chapter), `paragraphText` (String, optional - snapshot of paragraph text for context)
    │   │   │             - `content` (String - comment text), `reactionType` (String: 'like', 'laugh', 'cry', 'angry', 'wow', 'love', null)
    │   │   │             - `likeCount` (Int, default: 0), `replyCount` (Int, default: 0)
    │   │   │             - `isAuthorLiked` (Boolean, default: false - if author liked this comment)
    │   │   │             - `isAuthorReplied` (Boolean, default: false - if author replied to this comment)
    │   │   │             - `createdAt`, `updatedAt`
    │   │   │             - **Indexes:** 
    │   │   │               * Composite index on `(chapterId, paragraphIndex)` for fast paragraph queries
    │   │   │               * Index on `chapterId` for chapter-level queries
    │   │   │               * Index on `userId` for user's comments
    │   │   │           - Create `ParagraphCommentLike` model (for tracking likes):
    │   │   │             - `id`, `commentId` (FK), `userId` (FK), `isAuthor` (Boolean - true if author liked)
    │   │   │             - `createdAt`
    │   │   │             - **Unique constraint:** `(commentId, userId)` - one like per user per comment
    │   │   │           - Create `ParagraphCommentReply` model (for threaded replies):
    │   │   │             - `id`, `commentId` (FK), `userId` (FK), `content` (String)
    │   │   │             - `isAuthorReply` (Boolean - true if author replied)
    │   │   │             - `createdAt`, `updatedAt`
    │   │   │           - Create `MicroCommentsService`:
    │   │   │             * `createParagraphComment(userId, storyId, chapterId, paragraphIndex, paragraphText, content, reactionType?)`
    │   │   │               - Validates paragraphIndex exists in chapter (calls stories-service via gRPC)
    │   │   │               - Stores paragraphText snapshot for context
    │   │   │               - Emits `comment.paragraph.created` event
    │   │   │               - Invalidates Redis cache for comment count
    │   │   │             * `getParagraphComments(chapterId, paragraphIndex?, limit?, offset?)` -> Returns comments for paragraph(s)
    │   │   │               - If paragraphIndex provided: returns comments for that paragraph only
    │   │   │               - If paragraphIndex null: returns all comments for chapter (for bulk loading)
    │   │   │               - Includes likeCount, replyCount, isAuthorLiked, isAuthorReplied
    │   │   │               - Sorted by createdAt (newest first) or likeCount (most liked first)
    │   │   │             * `getParagraphCommentCounts(chapterId)` -> Returns map of paragraphIndex -> comment count
    │   │   │               - Used for displaying bubble indicators
    │   │   │               - Cached in Redis (key: `paragraph_comments:${chapterId}:counts`, TTL: 5 minutes)
    │   │   │             * `likeParagraphComment(commentId, userId)` -> Likes a comment
    │   │   │               - If author likes: sets isAuthorLiked = true
    │   │   │               - Emits `comment.paragraph.liked` event
    │   │   │               - Invalidates cache
    │   │   │             * `replyToParagraphComment(commentId, userId, content)` -> Replies to a comment
    │   │   │               - If author replies: sets isAuthorReplied = true
    │   │   │               - Increments replyCount
    │   │   │               - Emits `comment.paragraph.replied` event
    │   │   │             * `deleteParagraphComment(commentId, userId)` -> Deletes comment (only by owner or admin)
    │   │   │               - Invalidates cache
    │   │   │           - **WebSocket Integration:**
    │   │   │             * Subscribe to chapter: `subscribe:paragraph-comments:${chapterId}`
    │   │   │             * Events emitted via WebSocket:
    │   │   │               - `paragraph.comment.created` - New comment added
    │   │   │               - `paragraph.comment.liked` - Comment liked (especially if author liked)
    │   │   │               - `paragraph.comment.replied` - Comment replied to (especially if author replied)
    │   │   │               - `paragraph.comment.count.updated` - Comment count updated for paragraph
    │   │   │           - **Integration with stories-service:**
    │   │   │             * Call `GetChapterContent(chapterId)` via gRPC to validate paragraphIndex
    │   │   │             * Get paragraph text from chapter content for context preservation
    │   │   │           - **Performance Optimizations:**
    │   │   │             * Cache comment counts in Redis (key: `paragraph_comments:${chapterId}:${paragraphIndex}:count`, TTL: 5 minutes)
    │   │   │             * Batch load comments for multiple paragraphs in one query
    │   │   │             * Lazy load: Only fetch comments for visible paragraphs (viewport-based loading)
    │   │   │             * Use read replica for read operations (Rule #7)
    │   │   │       3.  **Meso Level (Chapter Comments):**
    │   │   │           - Create `ChapterComment` model:
    │   │   │             - `id`, `userId` (FK), `chapterId` (FK), `storyId` (FK)
    │   │   │             - `content` (String), `parentId` (FK, optional - for threading)
    │   │   │             - `upvotes` (Int, default: 0), `downvotes` (Int, default: 0)
    │   │   │             - `isPinned` (Boolean, default: false)
    │   │   │             - `createdAt`, `updatedAt`
    │   │   │           - Create `MesoCommentsService`:
    │   │   │             * `createChapterComment(userId, chapterId, content, parentId?)`
    │   │   │             * `getChapterComments(chapterId, parentId?, sortBy?, limit?, offset?)` -> Returns threaded comments
    │   │   │             * `voteComment(commentId, userId, voteType: 'upvote'|'downvote')`
    │   │   │             * `replyToComment(commentId, userId, content)`
    │   │   │             * `deleteComment(commentId)`
    │   │   │           - Emit `comment.chapter.created`, `comment.replied` events
    │   │   │       4.  **Macro Level (Reviews & Forums):**
    │   │   │           - Create `BookReview` model:
    │   │   │             - `id`, `userId` (FK), `storyId` (FK)
    │   │   │             - `rating` (Int, 1-5), `title` (String), `content` (String)
    │   │   │             - `isSpoiler` (Boolean), `helpfulCount` (Int, default: 0)
    │   │   │             - `createdAt`, `updatedAt`
    │   │   │           - Create `ForumPost` model:
    │   │   │             - `id`, `userId` (FK), `storyId` (FK, optional)
    │   │   │             - `title` (String), `content` (String)
    │   │   │             - `category` (String), `isPinned` (Boolean)
    │   │   │             - `viewCount` (Int, default: 0), `replyCount` (Int, default: 0)
    │   │   │             - `createdAt`, `updatedAt`
    │   │   │           - Create `MacroCommentsService`:
    │   │   │             * `createReview(userId, storyId, rating, title, content, isSpoiler?)`
    │   │   │             * `getReviews(storyId, sortBy?, limit?, offset?)` -> Returns reviews
    │   │   │             * `markReviewHelpful(reviewId, userId)`
    │   │   │             * `createForumPost(userId, storyId?, title, content, category)`
    │   │   │             * `getForumPosts(storyId?, category?, limit?, offset?)` -> Returns forum posts
    │   │   │           - Emit `review.created`, `forum.post.created` events
    │   │   │       5.  **Platform Interactions (Polls & Quizzes):**
    │   │   │           - Create `Poll` model:
    │   │   │             - `id`, `storyId` (FK, optional), `createdBy` (FK to User)
    │   │   │             - `question` (String), `options` (JSON array)
    │   │   │             - `isActive` (Boolean), `endsAt` (DateTime, optional)
    │   │   │             - `totalVotes` (Int, default: 0)
    │   │   │             - `createdAt`, `updatedAt`
    │   │   │           - Create `PollVote` model:
    │   │   │             - `id`, `pollId` (FK), `userId` (FK)
    │   │   │             - `optionId` (String), `votedAt` (DateTime)
    │   │   │           - Create `Quiz` model:
    │   │   │             - `id`, `storyId` (FK, optional), `createdBy` (FK)
    │   │   │             - `title` (String), `questions` (JSON array)
    │   │   │             - `isActive` (Boolean), `createdAt`
    │   │   │           - Create `PlatformInteractionsService`:
    │   │   │             * `createPoll(storyId?, question, options, endsAt?)`
    │   │   │             * `getPolls(storyId?, isActive?)` -> Returns polls
    │   │   │             * `votePoll(pollId, userId, optionId)`
    │   │   │             * `getPollResults(pollId)` -> Returns poll results
    │   │   │             * `createQuiz(storyId?, title, questions)`
    │   │   │             * `submitQuizAnswers(quizId, userId, answers)`
    │   │   │           - Emit `poll.created`, `poll.voted` events
    │   │   │       6.  **Tipping System (打赏):**
    │   │   │           - Create `Tip` model:
    │   │   │             - `id`, `userId` (FK), `storyId` (FK), `authorId` (FK)
    │   │   │             - `amount` (Decimal - in points), `message` (String, optional)
    │   │   │             - `platformShare` (Decimal), `taxShare` (Decimal), `authorShare` (Decimal)
    │   │   │             - `isLargeTip` (Boolean - triggers bonus votes if > threshold)
    │   │   │             - `createdAt`
    │   │   │           - Create `TippingService`:
    │   │   │             * `createTip(userId, storyId, amount, message?)` -> Creates tip, calculates revenue sharing
    │   │   │             * `getTipHistory(storyId?, authorId?, userId?)` -> Returns tip history
    │   │   │             * `getTotalTips(storyId?, authorId?)` -> Returns total tips
    │   │   │           - Integration with Virtual Currency Service (deduct points)
    │   │   │           - Emit `tip.created`, `tip.large` (if large) events
    │   │   │       7.  **Fan Rankings (粉丝榜):**
    │   │   │           - Create `FanRanking` model:
    │   │   │             - `id`, `userId` (FK), `storyId` (FK, optional), `authorId` (FK, optional)
    │   │   │             - `rankingType` (String: 'story'|'author'|'all-time'|'monthly')
    │   │   │             - `score` (Decimal - calculated from tips, votes, engagement)
    │   │   │             - `rank` (Int), `timeRange` (String: 'all-time'|'monthly'|'weekly')
    │   │   │             - `updatedAt`
    │   │   │           - Create `RankingsService`:
    │   │   │             * `calculateFanRankings(storyId?, authorId?, type, timeRange)` -> Calculates and updates rankings
    │   │   │             * `getFanRankings(storyId?, authorId?, type, timeRange, limit?)` -> Returns rankings
    │   │   │             * `getUserRanking(userId, storyId?, authorId?)` -> Returns user's ranking
    │   │   │           - Background job (cron) to recalculate rankings (hourly/daily)
    │   │   │           - Cache rankings in Redis (key: `fan_rankings:${storyId}:${type}:${timeRange}`, TTL: 1 hour)
    │   │   │       8.  **Gamification System:**
    │   │   │           - Create `GamificationReward` model:
    │   │   │             - `id`, `userId` (FK), `storyId` (FK, optional)
    │   │   │             - `rewardType` (String: 'bonus_votes'|'badge'|'status')
    │   │   │             - `amount` (Decimal - for bonus votes), `badgeName` (String, optional)
    │   │   │             - `triggeredBy` (String: 'large_tip'|'ranking'|'engagement')
    │   │   │             - `createdAt`
    │   │   │           - Create `GamificationService`:
    │   │   │             * `calculateBonusVotes(tipAmount)` -> Calculates bonus votes from large tips
    │   │   │             * `awardReward(userId, storyId, rewardType, amount?)` -> Awards gamification reward
    │   │   │             * `getUserRewards(userId)` -> Returns user's rewards
    │   │   │           - Integration: Large tips → Bonus votes → Story rankings
    │   │   │       9.  **Monthly Votes System:**
    │   │   │           - Create `MonthlyVote` model:
    │   │   │             - `id`, `userId` (FK), `storyId` (FK)
    │   │   │             - `votes` (Int), `month` (Int), `year` (Int)
    │   │   │             - `bonusVotes` (Int, default: 0 - from large tips)
    │   │   │             - `createdAt`, `updatedAt`
    │   │   │           - Create `VotesService`:
    │   │   │             * `castVote(userId, storyId, votes)` -> Casts monthly votes
    │   │   │             * `getMonthlyVotes(storyId, month, year)` -> Returns total votes for story
    │   │   │             * `getUserVotes(userId, month, year)` -> Returns user's votes
    │   │   │             * `resetMonthlyVotes()` -> Resets votes at start of month (cron job)
    │   │   │           - Integration with Gamification: Large tips grant bonus votes
    │   │   │       10. **Author-Fan Interactions:**
    │   │   │           - Create `AuthorFanInteraction` model:
    │   │   │             - `id`, `authorId` (FK), `userId` (FK, optional - for Q&A)
    │   │   │             - `interactionType` (String: 'qa'|'update'|'announcement')
    │   │   │             - `title` (String), `content` (String)
    │   │   │             - `question` (String, optional), `answer` (String, optional)
    │   │   │             - `createdAt`, `updatedAt`
    │   │   │           - Create `AuthorFanService`:
    │   │   │             * `createQASession(authorId, question, answer?)` -> Creates Q&A
    │   │   │             * `createAuthorUpdate(authorId, title, content)` -> Creates author update
    │   │   │             * `getAuthorInteractions(authorId, type?, limit?)` -> Returns interactions
    │   │   │             * `getFanAnalytics(authorId)` -> Returns fan analytics (tips, votes, engagement)
    │   │   │       11. Update `community.proto` (in 7-shared) to add gRPC methods for all features
    │   │   │       12. Implement gRPC handlers in `community.controller.ts`
    │   │   │       13. **Rule #2:** Use Event Bus (BullMQ) for async event emission
    │   │   │       14. **Rule #7:** Cache hot data (rankings, polls) in Redis
    │   │   │   * **Speed Opt (Production):** This service should connect to a **Read Replica** of the PostgreSQL DB for read operations (Rule #7).
    │   │   ├── src/           # (Connects to PostgreSQL, Prisma)
    │   │   │   ├── modules/
    │   │   │   │   ├── interactions/  # Community interactions (hierarchical)
    │   │   │   │   │   ├── micro/     # Paragraph comments
    │   │   │   │   │   ├── meso/      # Chapter comments
    │   │   │   │   │   ├── macro/     # Reviews & forums
    │   │   │   │   │   └── platform/   # Polls & quizzes
    │   │   │   │   └── fan-economy/   # Fan economy features
    │   │   │   │       ├── tipping/   # Tipping system
    │   │   │   │       ├── rankings/  # Fan rankings
    │   │   │   │       ├── gamification/  # Gamification
    │   │   │   │       ├── votes/     # Monthly votes
    │   │   │   │       └── author-fan/  # Author-fan interactions
    │   │   ├── test/
    │   │   │   ├── unit/      # (Tests for services, logic)
    │   │   │   └── integration/ # (Tests integrating with the database)
    │   │   └── package.json
    │   │

---

**Xem thêm:** [README](./README.md) | [Overview](./01-overview.md)

