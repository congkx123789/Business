---
alwaysApply: true
---

# 💬 Comments Service

> **📋 Note:** For detailed Community Interactions structure, see [Community Service](./community/README.md)

├── 📦 comments-service/            # 💬 COMMENTS SERVICE
    │   │   │
    │   │   ├── 📋 Service Info
    │   │   │   ├── **Purpose:** Manages Comments, Ratings, Reviews, Community Interactions (Hierarchical System)
    │   │   │   ├── **Database:** Own PostgreSQL database (Rule #1)
    │   │   │   ├── **Port:** 3003 (gRPC server)
    │   │   │   └── **Events:** Emits `comment.paragraph.*`, `comment.chapter.created`, `review.created`, `forum.post.created`, `poll.created`, `poll.voted`, `quiz.created`, `quiz.submitted`, `rating.updated`, `comment.deleted`
    │   │   │
    │   │   ├── 📁 Source Code Structure
    │   │   │   └── src/
    │   │   │       ├── main.ts                         # Bootstraps NestJS + gRPC
    │   │   │       ├── app.module.ts                  # Wires Config + Prisma + feature modules
    │   │   │       ├── config/configuration.ts        # App + DATABASE_URL config helpers
    │   │   │       ├── database/
    │   │   │       │   ├── prisma.module.ts           # Global Prisma provider
    │   │   │       │   └── prisma.service.ts          # Extends PrismaClient (connect/disconnect)
    │   │   │       ├── controllers/
    │   │   │       │   └── comments.controller.ts     # Single gRPC surface (REST removed)
    │   │   │       ├── common/
    │   │   │       │   └── queue/
    │   │   │       │       ├── queue.module.ts        # BullMQ connection + queue registration
    │   │   │       │       └── comment-events.service.ts # Event Bus publisher (paragraph/chapter/review/forum/poll/quiz/rating)
    │   │   │       ├── modules/
    │   │   │           ├── comments/
    │   │   │           │   ├── comments.module.ts
    │   │   │           │   ├── comments.service.ts     # Cross-cutting helpers (lookup/delete/feed)
    │   │   │           │   ├── paragraph-comments.service.ts  # Micro level (Duanping bubbles)
    │   │   │           │   └── chapter-comments.service.ts    # Meso level (本章说 threads)
    │   │   │           ├── reviews/
    │   │   │           │   ├── reviews.module.ts
    │   │   │           │   └── reviews.service.ts      # Book reviews + helpful votes
    │   │   │           ├── forums/
    │   │   │           │   ├── forums.module.ts
    │   │   │           │   ├── forums.service.ts       # Posts/replies per thread
    │   │   │           │   └── forum-threads.service.ts# Thread state (pin/lock/touch)
    │   │   │           ├── polls/
    │   │   │           │   ├── polls.module.ts
    │   │   │           │   └── polls.service.ts        # Create/vote/list polls
    │   │   │           ├── quizzes/
    │   │   │           │   ├── quizzes.module.ts
    │   │   │           │   └── quizzes.service.ts      # Quiz builder, submissions, leaderboard
    │   │   │           └── ratings/
    │   │   │               ├── ratings.module.ts
    │   │   │               └── ratings.service.ts      # Story rating aggregate + upsert (+ event emit)
    │   │   │       └── workers/
    │   │   │           └── comment-events.worker.ts    # Bull processor (forwards comment-events queue)
    │   │   │
    │   │   ├── 📁 Prisma Layer
    │   │   │   ├── prisma/schema.prisma                # Source of truth for all models
    │   │   │   └── prisma/migrations/                  # Generated via `prisma migrate` (one-per change)
    │   │   │
    │   │   └── 📁 gRPC Contract
    │   │       └── 7-shared/src/proto/definitions/comments.proto  # Full method list (must stay in sync)
    │   │   │
    │   │   ├── 📁 Configuration Files
    │   │   │   ├── package.json
    │   │   │   └── README.md
    │   │   │
    │   │   └── 📁 Database Models (Prisma)
    │   │       └── `ParagraphComment`, `ParagraphCommentLike`, `ParagraphCommentReply`, `ChapterComment`, `ChapterCommentVote`, `Review`, `ReviewHelpfulVote`, `ForumThread`, `ForumPost`, `Poll`, `PollOption`, `PollVote`, `Quiz`, `QuizQuestion`, `QuizOption`, `QuizSubmission`, `QuizSubmissionAnswer`, `Rating`
    │   │
    │   ├── 📋 Hierarchical Community Interaction System
    │   │   │
    │   │   ├── **Micro Level (Paragraph Comments - Duanping):**
    │   │   │   - **Purpose:** Immediate, emotional reactions to specific paragraphs
    │   │   │   - **Use Cases:** "Haha!", "WTF?!", "So cool!", quick reactions
    │   │   │   - **Features:**
    │   │   │     * Attach comment to specific paragraph (by paragraph index/position)
    │   │   │     * Quick reaction buttons (predefined reactions)
    │   │   │     * Real-time display (show comments as user reads)
    │   │   │     * Lightweight, fast interactions
    │   │   │   - **Implementation:**
    │   │   │     * `ParagraphComment` model: storyId, chapterId, paragraphIndex, userId, content, reactionType, timestamp
    │   │   │     * gRPC: `CreateParagraphComment()`, `GetParagraphComments(chapterId, paragraphIndex?)`
    │   │   │     * Real-time updates via WebSocket
    │   │   │
    │   │   ├── **Meso Level (Chapter-End Comments - 本章说):**
    │   │   │   - **Purpose:** Small analysis and plot predictions after reading chapter
    │   │   │   - **Use Cases:** "I think the villain will do X in next chapter", chapter analysis, predictions
    │   │   │   - **Features:**
    │   │   │     * Comments attached to end of chapter
    │   │   │     * Threaded discussions (reply to comments)
    │   │   │     * Upvote/downvote system
    │   │   │     * Sort by time, popularity, relevance
    │   │   │   - **Implementation:**
    │   │   │     * `ChapterComment` model: storyId, chapterId, userId, content, parentCommentId?, upvotes, downvotes, timestamp
    │   │   │     * gRPC: `CreateChapterComment()`, `GetChapterComments(chapterId, sort?)`, `ReplyToComment()`
    │   │   │     * Pagination for large comment threads
    │   │   │
    │   │   ├── **Macro Level (Book Reviews & Discussion Forums):**
    │   │   │   - **Purpose:** Overall critiques, structured evaluations, deep discussions
    │   │   │   - **Book Reviews:**
    │   │   │     * Full book evaluation (not chapter-specific)
    │   │   │     * Structured format (plot, characters, writing style, overall rating)
    │   │   │     * Helpful/Not helpful voting
    │   │   │     * Featured reviews (editor picks)
    │   │   │     * `Review` model: storyId, userId, title, content, ratings (plot, characters, style, overall), helpfulCount, timestamp
    │   │   │   - **Discussion Forums:**
    │   │   │     * Forum threads for story discussions
    │   │   │     * Thread categories (General Discussion, Character Analysis, Plot Theories, etc.)
    │   │   │     * Threaded posts (reply to posts)
    │   │   │     * Thread pinning, locking, moderation
    │   │   │     * `ForumThread` model: storyId, userId, title, content, category, isPinned, isLocked, postCount, lastPostAt
    │   │   │     * `ForumPost` model: threadId, userId, content, parentPostId?, upvotes, timestamp
    │   │   │   - **gRPC Endpoints:**
    │   │   │     * Reviews: `CreateReview()`, `GetReviews(storyId, sort?)`, `VoteReviewHelpful()`
    │   │   │     * Forums: `CreateForumThread()`, `GetForumThreads(storyId, category?)`, `CreateForumPost()`, `GetForumPosts(threadId)`
    │   │   │
    │   │   └── **Platform Interactions (Polls & Quizzes):**
    │   │       - **Polls:**
    │   │         * Platform-organized polls to engage readers
    │   │         * Story-related questions (e.g., "Who is your favorite character?")
    │   │         * Multiple choice options
    │   │         * Real-time vote counts
    │   │         * `Poll` model: storyId?, title, description, options[], endDate, voteCount
    │   │         * `PollVote` model: pollId, userId, optionIndex, timestamp
    │   │       - **Quizzes:**
    │   │         * Interactive quizzes about story content
    │   │         * Questions with multiple choice answers
    │   │         * Score calculation
    │   │         * Leaderboard
    │   │         * `Quiz` model: storyId?, title, description, questions[], timeLimit?
    │   │         * `QuizSubmission` model: quizId, userId, answers[], score, timeSpent, timestamp
    │   │       - **gRPC Endpoints:**
    │   │         * Polls: `CreatePoll()`, `GetPolls(storyId?)`, `VotePoll()`, `GetPollResults()`
    │   │         * Quizzes: `CreateQuiz()`, `GetQuizzes(storyId?)`, `SubmitQuiz()`, `GetQuizLeaderboard()`
    │   │
    │   📝 **Development Steps:**
    │   │   │       1.  Setup NestJS, Prisma. Define models: `Comment`, `ParagraphComment`, `ChapterComment`, `Review`, `ForumThread`, `ForumPost`, `Poll`, `PollVote`, `Quiz`, `QuizSubmission`, `Rating` in `schema.prisma`.
    │   │   │       2.  Create hierarchical comment modules:
    │   │   │           * `paragraph-comments` module for Micro level (Duanping)
    │   │   │           * `chapter-comments` module for Meso level (本章说)
    │   │   │           * `reviews` module for Macro level (Book Reviews)
    │   │   │           * `forums` module for Macro level (Discussion Forums)
    │   │   │       3.  Create platform interaction modules:
    │   │   │           * `polls` module for polls
    │   │   │           * `quizzes` module for quizzes
    │   │   │       4.  Implement real-time updates for paragraph comments (WebSocket integration)
    │   │   │       5.  Implement threaded discussions for chapter comments and forum posts
    │   │   │       6.  Implement voting systems (upvote/downvote, helpful/not helpful)
    │   │   │       7.  Update `comments.proto` to add gRPC methods for all interaction types
    │   │   │       8.  **Rule #2:** Use Event Bus for async events (comment.created, review.created, poll.created)
    │   │   │       9.  **Rule #7:** PostgreSQL is truth, cache hot comments/reviews in Redis
    │   │
    │

---

**📚 Related Documentation:**
- **[Community Service Structure](./community/README.md)** - 📱 Complete Community Interactions & Fan Economy structure
- **[Micro Level (Paragraph Comments)](./community/interactions/micro/README.md)** - Immediate reactions
- **[Meso Level (Chapter Comments)](./community/interactions/meso/README.md)** - Analysis & predictions
- **[Macro Level (Reviews & Forums)](./community/interactions/macro/README.md)** - Structured evaluations
- **[Platform Interactions](./community/interactions/platform/README.md)** - Polls & Quizzes
- **[Fan Economy](./community/fan-economy/README.md)** - Tipping, Votes, Author-Fan interaction

**Xem thêm:** [README](./README.md) | [Overview](./01-overview.md)
