---
alwaysApply: true
---

└── 📦 7-shared/                         # 📚 SHARED LIBRARY (CRITICALLY IMPORTANT)
        │
        ├── 📋 Package Info
        │   ├── **Goal:** The "Common Dictionary" for `1-gateway`, `2-services`, `3-web`, `4-desktop`, `5-mobile-ios`, `6-mobile-android`
        │   ├── **Key Tech:**
        │   │   - `class-validator` (backend DTOs validation)
        │   │   - `zod` (frontend validation schemas)
        │   │   - `@grpc/grpc-js` & `ts-proto` (compile .proto to TypeScript)
        │   │   - `protobufjs` (protobuf runtime)
        │   └── **Rule #3:** ALL contracts MUST be defined here first!
        │
        ├── 📁 Source Code Structure
        │   └── src/
        │       │
        │       ├── 📁 types/                      # TypeScript Interfaces & Types
        │       │   ├── index.ts                   # Re-exports all types
        │       │   │
    │       │   ├── 📁 user/                    # User-related types
    │       │   │   ├── user.types.ts          # User, Profile interfaces
    │       │   │   ├── reading-preferences.types.ts  # ReadingPreferences interface
    │       │   │   ├── desktop-preferences.types.ts  # DesktopPreferences interface (NEW)
    │       │   │   ├── gamification.types.ts   # F2P Gamification types (NEW)
    │       │   │   │   │                        # - DailyMission: userId, missionType, date, completed, claimed
    │       │   │   │   │                        # - MissionReward: missionId, rewardType, amount, claimed
    │       │   │   │   │                        # - FastPass: userId, storyId?, chapterId?, expiresAt, used
    │       │   │   │   │                        # - GamificationReward: userId, rewardType, amount, source
    │       │   │   │   │                        # - MissionType: 'check-in' | 'reading' | 'ad' | 'voting'
    │       │   │   │   │                        # - RewardType: 'power-stone' | 'fast-pass' | 'points'
        │       │   │   │   │                            # - TabState: open tabs, active tab, tab groups
        │       │   │   │   │                            # - LayoutPreset: saved layout configurations
        │       │   │   │   │                            # - FocusMode: max-width, alignment, reading line guide
        │       │   │   │   │                            # - SplitViewState: left/right chapters, split position
        │       │   │   │   │                            # - KeyboardShortcuts: custom shortcut mappings
        │       │   │   ├── bookmark.types.ts      # Bookmark interface
    │       │   │   ├── annotation.types.ts    # Annotation interface (Enhanced - Annotation Suite)
    │       │   │   │   │                        # - Annotation: Core annotation with unification & revisitation fields
    │       │   │   │   │                        # - AnnotationSource: Source tracking (EPUB, PDF, web, YouTube, Twitter)
    │       │   │   │   │                        # - AnnotationSummary: AI-generated summary from highlights
    │       │   │   │   │                        # - ExportFormat: Export formats (Markdown, Notion, Obsidian, Capacities)
    │       │   │   │   │                        # - AnnotationAISummary: AI summary from selected highlights (NEW)
    │       │   │   │   │                        # - AnnotationExportResult: Export result with format and content (NEW)
        │       │   │   ├── library.types.ts        # Library, Bookshelf, Wishlist interfaces
        │       │   │   └── reading-progress.types.ts  # ReadingProgress interface
        │       │   │
    │       │   ├── 📁 story/                   # Story-related types
    │       │   │   ├── story.types.ts         # Story, Chapter interfaces
    │       │   │   ├── genre.types.ts         # Genre interface
    │       │   │   ├── ranking.types.ts       # Ranking types (NEW)
    │       │   │   ├── voting.types.ts        # Voting types (NEW)
    │       │   │   │   │                        # - PowerStone: userId, amount, date, resetAt
    │       │   │   │   │                        # - StoryVote: userId, storyId, voteType, votes, castAt
    │       │   │   │   │                        # - VoteType: 'power-stone' | 'monthly-vote'
    │       │   │   ├── author-ecosystem.types.ts  # Author Ecosystem types (NEW)
    │       │   │   │   │                        # - AuthorDashboard: authorId, storyId?, metrics
    │       │   │   │   │                        # - AuthorAnalytics: authorId, storyId, date, views, reads, revenue, engagement
    │       │   │   │   │                        # - AuthorRevenue: revenue breakdown (PPC, tips, subscriptions)
    │       │   │   │   │                        # - ReaderInsights: reading patterns, drop-off points, engagement
        │       │   │   │   │                        # - Ranking: ranking type, genre, timeRange, stories
        │       │   │   │   │                        # - RankingType: 'monthly-votes' | 'recommendations' | 'sales' | 'popularity'
        │       │   │   │   │                        # - TimeRange: 'daily' | 'weekly' | 'monthly' | 'all-time'
        │       │   │   ├── editor-pick.types.ts   # Editor's Pick types (NEW)
        │       │   │   │   │                        # - EditorPick: story, priority, featuredUntil, bannerImage
        │       │   │   └── drm.types.ts           # DRM types (Rule #27)
        │       │   │   │   │                        # - DRMStatus: isProtected, watermarkEnabled
        │       │   │   │   │                        # - WatermarkInfo: user ID, encoding method
        │       │   │   │   │                        # - CopyProtectionConfig: disableSelection, disableCopy
        │       │   │
    │       │   ├── 📁 social/                  # Social-related types
    │       │   │   ├── post.types.ts          # Post interface
    │       │   │   ├── group.types.ts         # Group interface (BookClub)
    │       │   │   ├── follow.types.ts        # Follow interface
    │       │   │   ├── reading-challenge.types.ts  # Reading Challenge types (NEW)
    │       │   │   │   │                        # - ReadingChallenge: id, userId, challengeType, goal, timeRange, progress, status
    │       │   │   │   │                        # - ChallengeParticipant: challengeId, userId, progress, joinedAt
    │       │   │   ├── activity-tracking.types.ts  # Activity Tracking types (NEW)
    │       │   │   │   │                        # - ActivityTracking: userId, activityType, storyId, chapterId, timestamp
    │       │   │   │   │                        # - ReadingGoal: userId, goalType, target, current, timeRange
    │       │   │   └── book-club.types.ts     # Book Club types (NEW)
    │       │   │       │                        # - BookClub: Group with type='book-club', storyId
    │       │   │       │                        # - ReadingSchedule: groupId, storyId, chapterNumber, deadline, discussionDate
        │       │   │
        │       │   ├── 📁 ai/                      # AI-related types (Enhanced)
    │       │   │   ├── tts.types.ts           # TTSAudio interface (Enhanced - Emotional AI Narration)
    │       │   │   │   │                        # - TTSAudio: audio URL, duration, format
    │       │   │   │   │                        # - NarrationType: 'ai' | 'human'
    │       │   │   │   │                        # - NarrationOptions: voice, speed, language
    │       │   │   │   │                        # - EmotionControl: emotion control string ("emotional and dramatic", "calm and soothing") (NEW)
    │       │   │   │   │                        # - VoiceStyle: 'terrified'|'sad'|'shouting'|'whispering'|'cheerful'|'angry' (NEW)
    │       │   │   │   │                        # - ContextualAwareness: surrounding text for context-aware narration (NEW)
    │       │   │   │   │                        # - TTSSyncData: sync timestamps for text highlighting (word-by-word or sentence-by-sentence) (NEW)
    │       │   │   │   │                        # - SyncMode: 'word-by-word' | 'sentence-by-sentence' (NEW)
        │       │   │   ├── translation.types.ts   # Translation interface (Enhanced - Language Learning)
        │       │   │   │   │                        # - Translation: translated text, fromLang, toLang
        │       │   │   │   │                        # - TranslationContext: story context for better translation
        │       │   │   │   │                        # - ChapterTranslation: full chapter translation
        │       │   │   │   │                        # - SentenceTranslation: sentence-level translation (NEW)
        │       │   │   │   │                        # - ParallelTranslation: original + translated side-by-side (NEW)
        │       │   │   │   │                        # - ParallelDisplayMode: 'line-by-line'|'side-by-side'|'interleaved' (NEW)
        │       │   │   ├── dictionary.types.ts     # DictionaryEntry interface (Enhanced - Language Learning)
        │       │   │   │   │                        # - DictionaryEntry: word, definitions, pronunciation
        │       │   │   │   │                        # - Pronunciation: audio URL, pinyin (for Chinese)
        │       │   │   │   │                        # - ExampleSentence: usage examples
        │       │   │   │   │                        # - RelatedWord: synonyms, related terms
        │       │   │   │   │                        # - TouchTranslateResult: instant translation on tap (NEW)
        │       │   │   │   │                        # - DictionarySource: 'default'|'abbyy'|'oxford'|'custom' (NEW)
    │       │   │   └── recommendation.types.ts # Recommendation types (Enhanced)
    │       │   │   │   │                        # - Recommendation: story, score, explanation, source
    │       │   │   │   │                        # - RecommendationSource: 'collaborative' | 'content-based' | 'hybrid' | 'mood-based' | 'natural-language'
    │       │   │   │   │                        # - RecommendationContext: 'home' | 'story' | 'chapter'
    │       │   │   │   │                        # - SimilarStory: story, similarity score
    │       │   │   │   │                        # - TrendingStory: story, trend score, timeRange
    │       │   │   │   │                        # - MoodBasedRecommendation: mood-based recommendation (NEW)
    │       │   │   │   │                        # - Mood: 'action' | 'romance' | 'mystery' | 'comedy' | 'drama' | 'thriller' | etc. (NEW)
    │       │   │   │   │                        # - NaturalLanguageQuery: natural language search query (NEW)
    │       │   │   │   │                        # - FilterBubbleBreaker: "Explore New Territories" recommendation (NEW)
        │       │   │
    │       │   ├── 📁 monetization/            # Monetization types (NEW)
    │       │   │   ├── virtual-currency.types.ts  # Virtual Currency types
    │       │   │   │   │                        # - Wallet: userId, balance, totalEarned, totalSpent
    │       │   │   │   │                        # - CurrencyTransaction: walletId, type, amount, balanceBefore, balanceAfter
    │       │   │   ├── membership.types.ts     # Membership types (Coin Packages)
    │       │   │   │   │                        # - Membership: userId, planId, status, startDate, endDate, autoRenew
    │       │   │   │   │                        # - MembershipPlan: name, price, coinsGranted, dailyBonus, billingPeriod
    │       │   │   │   │                        # - MembershipDailyBonus: membershipId, date, coinsAwarded, claimed
    │       │   │   ├── privilege.types.ts      # Privilege types (Advanced Chapters)
    │       │   │   │   │                        # - Privilege: userId, storyId, purchasedAt, expiresAt, status
    │       │   │   │   │                        # - AdvancedChapter: storyId, chapterId, chapterNumber, releaseDate, privilegeRequired, premiumPrice
    │       │   │   │   │                        # - PrivilegePurchase: privilegeId, userId, storyId, coinsSpent, purchasedAt
    │       │   │   └── pricing.types.ts       # Pricing types
    │       │   │       │                        # - ChapterPrice: chapterId, characterCount, basePrice, currentPrice
    │       │   │       │                        # - PricingRule: storyId?, ruleType, pricePer1000, discountPercent
    │       │   │
    │       │   └── 📁 comment/                  # Comment-related types
    │       │       ├── comment.types.ts       # Comment interface
    │       │       ├── paragraph-comment.types.ts  # Paragraph Comment types (NEW - Duanping) 🎯
        │       │       │   │                        # - ParagraphComment: id, userId, storyId, chapterId, paragraphIndex, paragraphText, content, reactionType, likeCount, replyCount, isAuthorLiked, isAuthorReplied, createdAt
        │       │       │   │                        # - ParagraphCommentLike: id, commentId, userId, isAuthor, createdAt
        │       │       │   │                        # - ParagraphCommentReply: id, commentId, userId, content, isAuthorReply, createdAt
        │       │       │   │                        # - ReactionType: 'like' | 'laugh' | 'cry' | 'angry' | 'wow' | 'love' | null
        │       │       ├── chapter-comment.types.ts   # Chapter Comment types (NEW)
        │       │       │   │                        # - ChapterComment: id, userId, chapterId, content, parentId, upvotes, downvotes, createdAt
        │       │       └── rating.types.ts        # Rating interface
        │       │
        │       ├── 📁 validation/                  # Validation DTOs & Schemas
        │       │   ├── index.ts                    # Re-exports all DTOs
        │       │   ├── community/                  # Community Interactions & Fan Economy DTOs (NEW)
        │       │   │   └── community.dto.ts        # Polls, quizzes, tips, rankings, votes, author-fan interactions
        │       │   │
    │       │   ├── 📁 user/                     # User DTOs
    │       │   │   ├── create-user.dto.ts     # @IsString(), @IsEmail() decorators
    │       │   │   ├── update-user.dto.ts
    │       │   │   ├── update-reading-preferences.dto.ts
    │       │   │   ├── get-daily-missions.dto.ts  # Get daily missions (NEW)
    │       │   │   ├── claim-daily-mission.dto.ts  # Claim mission reward (NEW)
    │       │   │   ├── get-power-stones.dto.ts    # Get Power Stones (NEW)
    │       │   │   ├── get-fast-passes.dto.ts     # Get Fast Passes (NEW)
    │       │   │   ├── use-fast-pass.dto.ts      # Use Fast Pass (NEW)
    │       │   │   └── exchange-points.dto.ts    # Exchange Points for Fast Pass (NEW)
        │       │   │   ├── update-desktop-preferences.dto.ts  # Desktop preferences (NEW)
        │       │   │   ├── update-tab-state.dto.ts            # Tab state sync (NEW)
        │       │   │   ├── update-layout-preferences.dto.ts    # Layout presets (NEW)
        │       │   │   ├── update-focus-mode.dto.ts            # Focus mode settings (NEW)
        │       │   │   ├── update-keyboard-shortcuts.dto.ts    # Custom shortcuts (NEW)
    │       │   │   ├── create-bookmark.dto.ts
    │       │   │   ├── create-annotation.dto.ts
    │       │   │   ├── generate-annotation-summary.dto.ts  # AI summary request (NEW)
    │       │   │   │   │                            # - annotationIds, highlights, context?
    │       │   │   ├── export-annotations.dto.ts  # Export annotations (NEW)
    │       │   │   │   │                            # - annotationIds?, sourceType?, format? ('markdown'|'notion'|'obsidian'|'capacities')
    │       │   │   ├── unify-annotations.dto.ts  # Unify from multiple sources (NEW)
    │       │   │   │   │                            # - sourceType, sourceId, annotations[]
    │       │   │   ├── add-to-library.dto.ts
        │       │   │   ├── sync-with-conflict-resolution.dto.ts  # Enhanced sync with conflict resolution (NEW - MVP Phase 1)
        │       │   │   │   │                            # - userId, deviceId, localData, conflictStrategy?
        │       │   │   │   │                            # - conflictStrategy: 'last-write-wins'|'server-wins'|'client-wins'|'merge'
        │       │   │   │   │                            # - Returns: syncedData, conflicts (items needing manual resolution)
        │       │   │   ├── get-pending-sync-queue.dto.ts  # Get pending sync operations (NEW - MVP Phase 1)
        │       │   │   │   │                            # - userId, deviceId
        │       │   │   │   │                            # - Returns: pendingOperations[]
        │       │   │   ├── process-sync-queue.dto.ts      # Process batch sync operations (NEW - MVP Phase 1)
        │       │   │   │   │                            # - userId, deviceId, syncOperations[]
        │       │   │   │   │                            # - Returns: syncResults[]
        │       │   │   ├── create-bookshelf.dto.ts
        │       │   │   ├── add-to-wishlist.dto.ts
        │       │   │   └── update-reading-progress.dto.ts
        │       │   │
    │       │   ├── 📁 story/                    # Story DTOs
    │       │   │   ├── create-story.dto.ts
    │       │   │   ├── update-story.dto.ts
    │       │   │   ├── create-chapter.dto.ts
    │       │   │   ├── download-chapter.dto.ts  # Download chapter for offline (NEW - MVP Phase 1)
    │       │   │   ├── cast-power-stone.dto.ts  # Cast Power Stone vote (NEW)
    │       │   │   ├── cast-monthly-vote.dto.ts  # Cast Monthly Vote (NEW)
    │       │   │   ├── get-user-votes.dto.ts    # Get user's available votes (NEW)
    │       │   │   ├── get-author-dashboard.dto.ts  # Author dashboard (NEW)
    │       │   │   ├── get-author-analytics.dto.ts  # Author analytics (NEW)
    │       │   │   └── get-author-revenue.dto.ts  # Author revenue (NEW)
        │       │   │   │   │                            # - chapterId, format? (json|text|epub)
        │       │   │   │   │                            # - Returns: downloadUrl or content stream
        │       │   │   ├── create-genre.dto.ts
        │       │   │   ├── ranking-query.dto.ts     # Ranking query DTO (NEW)
        │       │   │   │   │                            # - rankingType, genre?, timeRange?
        │       │   │   ├── editor-pick-query.dto.ts  # Editor's pick query DTO (NEW)
        │       │   │   │   │                            # - limit?, genre?
    │       │   │   ├── genre-stories-query.dto.ts # Genre stories query DTO (NEW)
    │       │   │   │   │                            # - genreId, page?, limit?, sort?, filters?
    │       │   │   ├── storefront-query.dto.ts   # Storefront homepage query DTO (NEW)
    │       │   │   │   │                            # - userId? (for personalization)
    │       │   │   └── drm/                      # DRM DTOs (Rule #27)
        │       │   │       ├── check-drm-status.dto.ts  # Check DRM status
        │       │   │       │   │                            # - chapterId, userId
        │       │   │       ├── get-watermarked-content.dto.ts  # Get watermarked content
        │       │   │       │   │                            # - chapterId, userId
        │       │   │       └── detect-watermark.dto.ts  # Detect watermark in leaked content
        │       │   │       │   │                            # - content (leaked text)
        │       │   │
    │       │   ├── 📁 social/                   # Social DTOs
    │       │   │   ├── create-post.dto.ts
    │       │   │   ├── create-group.dto.ts
    │       │   │   ├── create-book-club.dto.ts  # Book club creation (NEW)
    │       │   │   ├── schedule-reading.dto.ts   # Schedule group reading (NEW)
    │       │   │   ├── follow-user.dto.ts
    │       │   │   ├── create-reading-challenge.dto.ts  # Reading challenge (NEW)
    │       │   │   ├── join-challenge.dto.ts    # Join challenge (NEW)
    │       │   │   ├── update-challenge-progress.dto.ts  # Update progress (NEW)
    │       │   │   ├── set-reading-goal.dto.ts   # Set reading goal (NEW)
    │       │   │   └── get-activity-feed.dto.ts  # Get activity feed (NEW)
        │       │   │
    │       │   ├── 📁 ai/                       # AI DTOs (Enhanced)
    │       │   │   ├── synthesize-speech.dto.ts  # TTS synthesis request (Enhanced)
    │       │   │   │   │                            # - text, language, voice?, speed?, emotion?, voiceStyle?, context?
    │       │   │   ├── synthesize-emotional-speech.dto.ts  # Emotional AI narration request (NEW)
    │       │   │   │   │                            # - text, language, emotion, voiceStyle?, speed?
    │       │   │   ├── get-tts-with-sync.dto.ts  # TTS with text highlighting sync (NEW)
    │       │   │   │   │                            # - text, language, voice?, syncMode? ('word-by-word'|'sentence-by-sentence')
    │       │   │   ├── get-narration.dto.ts      # Get narration (AI or Human)
    │       │   │   │   │                            # - storyId, chapterId, narrationType?
    │       │   │   ├── translate-text.dto.ts     # Translation request (Enhanced)
    │       │   │   │   │                            # - text, fromLang, toLang, context?
    │       │   │   ├── translate-chapter.dto.ts  # Chapter translation request
    │       │   │   │   │                            # - chapterId, fromLang, toLang
    │       │   │   ├── translate-sentence.dto.ts  # Sentence-level translation (NEW)
    │       │   │   │   │                            # - sentence, fromLang, toLang, context?
    │       │   │   ├── parallel-translation.dto.ts  # Parallel translation request (NEW)
    │       │   │   │   │                            # - text, fromLang, toLang, displayMode? ('line-by-line'|'side-by-side'|'interleaved')
    │       │   │   ├── lookup-word.dto.ts        # Dictionary lookup (Enhanced)
    │       │   │   │   │                            # - word, fromLang, toLang, dictionarySource? ('default'|'abbyy'|'oxford'|'custom')
    │       │   │   ├── touch-translate.dto.ts    # Touch-to-translate request (NEW)
    │       │   │   │   │                            # - word, fromLang, toLang, position?
    │       │   │   ├── get-pronunciation.dto.ts  # Pronunciation audio request
    │       │   │   │   │                            # - word, language
    │       │   │   ├── summarize-annotations.dto.ts  # AI summary from highlights (NEW)
    │       │   │   │   │                            # - annotationIds, highlights, context?
    │       │   │   ├── get-annotation-summary.dto.ts  # Get summary from selected text (NEW)
    │       │   │   │   │                            # - selectedText, surroundingText?, context?
    │       │   │   ├── recommendation-request.dto.ts  # Recommendation request (Enhanced)
    │       │   │   │   │                            # - userId, limit?, context?, mood?
    │       │   │   ├── mood-based-recommendation-request.dto.ts  # Mood-based recommendation request (NEW)
    │       │   │   │   │                            # - userId, mood, limit?
    │       │   │   ├── natural-language-search.dto.ts  # Natural language search request (NEW)
    │       │   │   │   │                            # - userId, query, limit?
    │       │   │   ├── explore-new-territories.dto.ts  # Breaking filter bubbles request (NEW)
    │       │   │   │   │                            # - userId, limit?
    │       │   │   ├── recommendation-response.dto.ts # Recommendation response (NEW)
    │       │   │   │   │                            # - recommendations: Recommendation[]
    │       │   │   ├── similar-stories-request.dto.ts # Similar stories request (NEW)
    │       │   │   │   │                            # - storyId, limit?
    │       │   │   └── trending-stories-request.dto.ts # Trending stories request (NEW)
    │       │   │   │   │                            # - genre?, timeRange?
        │       │   │
        │       │   └── 📁 comment/                   # Comment DTOs
        │       │       ├── create-comment.dto.ts
        │       │       ├── paragraph-comment/         # Paragraph Comment DTOs (NEW - Duanping) 🎯
        │       │       │   ├── create-paragraph-comment.dto.ts  # Create paragraph comment
        │       │       │   │   │                        # - userId, storyId, chapterId, paragraphIndex, paragraphText, content, reactionType?
        │       │       │   ├── get-paragraph-comments.dto.ts    # Get paragraph comments
        │       │       │   │   │                        # - chapterId, paragraphIndex?, limit?, offset?, sortBy?
        │       │       │   ├── get-paragraph-comment-counts.dto.ts  # Get comment counts for bubble indicators
        │       │       │   │   │                        # - chapterId
        │       │       │   ├── like-paragraph-comment.dto.ts    # Like paragraph comment
        │       │       │   │   │                        # - commentId, userId
        │       │       │   ├── reply-to-paragraph-comment.dto.ts  # Reply to paragraph comment
        │       │       │   │   │                        # - commentId, userId, content
        │       │       │   └── delete-paragraph-comment.dto.ts   # Delete paragraph comment
        │       │       │       │                        # - commentId, userId
        │       │       ├── chapter-comment/           # Chapter Comment DTOs (NEW)
        │       │       │   ├── create-chapter-comment.dto.ts
        │       │       │   └── reply-to-chapter-comment.dto.ts
    │       │       └── create-rating.dto.ts
    │       │
    │       │   ├── 📁 monetization/             # Monetization DTOs (NEW)
    │       │   │   ├── virtual-currency/
    │       │   │   │   ├── top-up.dto.ts        # Top-up request
    │       │   │   │   ├── deduct-points.dto.ts  # Deduct points
    │       │   │   │   └── get-balance.dto.ts    # Get wallet balance
    │       │   │   ├── membership/
    │       │   │   │   ├── create-membership.dto.ts  # Create membership (coin package)
    │       │   │   │   ├── claim-daily-bonus.dto.ts  # Claim daily bonus
    │       │   │   │   └── cancel-membership.dto.ts  # Cancel membership
    │       │   │   ├── privilege/
    │       │   │   │   ├── purchase-privilege.dto.ts  # Purchase privilege
    │       │   │   │   ├── get-privilege.dto.ts       # Get privilege status
    │       │   │   │   ├── get-advanced-chapters.dto.ts  # Get advanced chapters
    │       │   │   │   └── check-privilege-access.dto.ts  # Check privilege access
    │       │   │   ├── pricing/
    │       │   │   │   ├── calculate-price.dto.ts     # Calculate chapter price
    │       │   │   │   └── update-pricing-rule.dto.ts  # Update pricing rules
    │       │   │   └── payments/
    │       │   │       ├── purchase-chapter.dto.ts     # Purchase chapter
    │       │   │       └── purchase-bulk.dto.ts        # Bulk purchase
    │       │   │
    │       ├── 📁 constants/                    # Constants & Enums
        │       │   ├── index.ts                    # Re-exports all constants
        │       │   │
    │       │   ├── 📁 events/                   # Event Bus Topics
    │       │   │   ├── user-events.ts          # USER_REGISTERED, USER_UPDATED
    │       │   │   ├── story-events.ts         # STORY_CREATED, STORY_UPDATED
    │       │   │   ├── comment-events.ts        # COMMENT_CREATED, COMMENT_REPLIED
    │       │   │   │   │                        # - comment.paragraph.created (NEW - Duanping) 🎯
    │       │   │   │   │                        # - comment.paragraph.liked (NEW)
    │       │   │   │   │                        # - comment.paragraph.replied (NEW)
    │       │   │   │   │                        # - comment.paragraph.count.updated (NEW)
    │       │   │   │   │                        # - comment.chapter.created
    │       │   │   │   │                        # - comment.replied
    │       │   │   ├── community-events.ts      # Community & Fan Economy Events (NEW)
    │       │   │   │   │                        # - tip.created, tip.large
    │       │   │   │   │                        # - monthly.vote.cast
    │       │   │   │   │                        # - review.created, forum.post.created
    │       │   │   │   │                        # - poll.created, poll.voted
    │       │   │   ├── social-events.ts        # POST_CREATED, USER_FOLLOWED, POST_LIKED
    │       │   │   ├── notification-events.ts  # NOTIFICATION_CREATED
    │       │   │   └── behavior-events.ts      # User Behavior Events (NEW - for Recommendation Engine)
    │       │   │       │                        # - user.clicked (story, chapter, button clicked)
    │       │   │       │                        # - user.read (chapter reading started, with readingTime)
    │       │   │       │                        # - user.read.completed (chapter finished)
    │       │   │       │                        # - user.read.abandoned (chapter abandoned, with drop-off point)
    │       │   │       │                        # - user.purchased (chapter/story purchased)
    │       │   │       │                        # - user.browsed (genre, ranking, category browsed)
    │       │   │       │                        # - user.liked (comment, story liked)
    │       │   │       │                        # - user.recommended (story recommended to others)
    │       │   │       │                        # - user.searched (search query performed)
        │       │   │
        │       │   ├── 📁 roles/                    # User Roles
        │       │   │   └── roles.ts                 # ADMIN, USER, MODERATOR, etc.
        │       │   │
        │       │   ├── 📁 reading/                   # Reading Constants
        │       │   │   └── reading-constants.ts    # DEFAULT_FONT_SIZE, DEFAULT_LINE_HEIGHT, etc.
        │       │   │
        │       │   └── 📁 api/                       # API Constants
        │       │       └── api-constants.ts        # Rate limits, timeouts, etc.
        │       │
        │       └── 📁 proto/                         # gRPC Protocol Buffers (CRITICAL!)
        │           ├── index.ts                    # Re-exports compiled proto types
        │           │
        │           ├── 📁 definitions/              # .proto source files
        │           │   ├── users.proto             # UsersService gRPC contract
        │           │   ├── stories.proto           # StoriesService gRPC contract
        │           │   ├── comments.proto          # CommentsService gRPC contract
        │           │   ├── community.proto         # CommunityService gRPC contract (NEW) 🎯
        │           │   │   │                        # - Paragraph Comments (Duanping), Chapter Comments, Reviews, Forums
        │           │   │   │                        # - Fan Economy (Tipping, Rankings, Votes, Author-Fan)
        │           │   ├── monetization.proto       # MonetizationService gRPC contract (NEW) ⭐
        │           │   │   │                        # - Virtual Currency (Wallet, TopUp, Transactions)
        │           │   │   │                        # - Pricing Engine (ChapterPrice, PricingRule)
        │           │   │   │                        # - Paywall System (PaywallInfo, ChapterAccess)
        │           │   │   │                        # - Payment Processing (Purchase, Receipt)
        │           │   │   │                        # - Subscriptions (Membership, Privilege, VIP Levels)
        │           │   ├── search.proto            # SearchService gRPC contract
        │           │   ├── ai.proto                # AIService gRPC contract
        │           │   ├── social.proto            # SocialService gRPC contract
        │           │   ├── notification.proto      # NotificationService gRPC contract
        │           │   └── websocket.proto         # WebSocketService gRPC contract (if needed)
        │           │
        │           └── 📁 generated/                # Generated TypeScript (from ts-proto)
        │               ├── users.pb.ts              # Compiled users.proto
        │               ├── stories.pb.ts            # Compiled stories.proto
        │               ├── comments.pb.ts         # Compiled comments.proto
        │               ├── community.pb.ts        # Compiled community.proto (NEW) 🎯
        │               ├── monetization.pb.ts     # Compiled monetization.proto (NEW) ⭐
        │               ├── search.pb.ts           # Compiled search.proto
        │               ├── ai.pb.ts                # Compiled ai.proto
        │               ├── social.pb.ts            # Compiled social.proto
        │               └── notification.pb.ts      # Compiled notification.proto
        │
        ├── 📁 Configuration Files
        │   ├── package.json                       # Dependencies (class-validator, zod, ts-proto)
        │   ├── tsconfig.json                      # TypeScript config
        │   └── README.md                          # How to add new types/DTOs/proto
        │
        ├── 📁 Build Scripts
        │   ├── generate-proto.ts                  # Script to compile .proto to TS
        │   └── validate-contracts.ts              # Script to validate all contracts
        │
        └── 📁 Documentation
            ├── PROTO_GUIDE.md                    # How to define new .proto files
            ├── DTO_GUIDE.md                      # How to create DTOs
            └── TYPE_GUIDE.md                     # How to add new types
        │
        📝 **Development Steps:** **DEVELOP THIS FIRST!**
        │       1.  Define all `types/` (interfaces for Story, User, Comment, **Post, Group, Follow**, **ReadingPreferences**, **Bookmark**, **Annotation**, **TTSAudio**, **DictionaryEntry**, **Translation**, **Library**, **Bookshelf**, **Wishlist**, **ReadingProgress**).
        │           - **ReadingPreferences Interface (Core Reader Interface - Enhanced with Market Analysis Features):**
        │             ```typescript
        │             interface ReadingPreferences {
        │               // Text Customization (1.1 - Enhanced)
        │               fontSize: number;           // 12-24, default: 16 (slider control via 'Aa' icon)
        │               fontFamily: string;        // 'system' | 'serif' | 'sans-serif' | 'monospace' | 'custom', default: 'system'
        │               customFontUrl?: string;    // URL to uploaded custom font (OTF/TTF) - Delighter feature
        │               customFontName?: string;   // Name of custom font for display
        │               customFontData?: string;   // Base64 encoded font data (for offline use)
        │               lineHeight: number;        // 1.0-2.5, default: 1.5
        │               letterSpacing: number;     // -0.5 to 2.0, default: 0 (character spacing)
        │               paragraphSpacing: number;  // 0-2.0, default: 1.0 (space between paragraphs)
        │               wordSpacing: number;       // 0-2.0, default: 0 (space between words)
        │               textAlign: 'left' | 'center' | 'justify'; // Text alignment, default: 'left'
        │               
        │               // Background & Theme Modes (1.2 - Enhanced with Blue Light Filtering)
        │               backgroundColor: 'white' | 'black' | 'sepia' | 'eye-protection' | 'custom';
        │               // 'white' = Day mode (default)
        │               // 'black' = Night mode
        │               // 'sepia' = Sepia/brown tone
        │               // 'eye-protection' = Yellow/green tint (护眼模式)
        │               // 'custom' = User-defined color
        │               textColor?: string;         // Optional override (hex color)
        │               customBackgroundColor?: string; // Hex color for 'custom' mode
        │               brightness: number;        // 0-100, default: 100 (screen brightness adjustment)
        │               
        │               // Blue Light Filtering (1.2 - Adaptive Eye Protection)
        │               blueLightFilterEnabled: boolean; // Enable adaptive blue light filtering, default: false
        │               blueLightFilterStrength: number; // 0-100, default: 50 (filter intensity)
        │               blueLightFilterAdaptive: boolean; // Auto-adjust based on time/location, default: true
        │               blueLightFilterSchedule?: {      // Custom schedule (if adaptive disabled)
        │                 startTime: string;            // HH:mm format
        │                 endTime: string;              // HH:mm format
        │               };
        │               
        │               // Reading Mode (1.3 - Scroll vs Page Turn)
        │               readingMode: 'scroll' | 'page';
        │               // 'scroll' = Continuous vertical scroll (web-native, arrow up/down icon)
        │               // 'page' = Page turn mode (book-like, arrow left/right icon)
        │               // Both options available - user preference
        │               pageTurnAnimation: boolean; // Enable/disable page turn animation, default: true
        │               pageTurnDirection: 'horizontal' | 'vertical'; // Page turn direction, default: 'horizontal'
        │               scrollBehavior: 'smooth' | 'instant' | 'auto'; // Scroll behavior for scroll mode, default: 'smooth'
        │               
        │               // Multi-Format Support (1.4 - Format Preferences)
        │               preferredFormats: string[];  // Preferred formats: ['epub', 'pdf', 'mobi', 'fb2', 'docx', 'txt', 'cbr', 'cbz']
        │               formatProcessing: {          // Format-specific processing preferences
        │                 pdf: {
        │                   autoCropMargins: boolean;    // Auto-crop margins in PDF, default: true
        │                   autoGenerateTOC: boolean;   // Auto-generate table of contents, default: true
        │                 };
        │                 docx: {
        │                   autoGenerateTOC: boolean;   // Auto-generate TOC from headings, default: true
        │                 };
        │                 archive: {
        │                   readFromZip: boolean;        // Read EPUB/FB2 from ZIP/RAR, default: true
        │                   readFromRar: boolean;        // Read from RAR archives, default: true
        │                 };
        │               };
        │               
        │               // UI Controls Behavior
        │               autoHideControls: boolean; // Auto-hide top/bottom bars after inactivity, default: true
        │               controlsTimeout: number;    // Milliseconds before auto-hide, default: 3000
        │               tapToToggleControls: boolean; // Tap center to show/hide controls, default: true
        │               
        │               // Advanced Settings
        │               marginHorizontal: number;  // 0-100, default: 20 (horizontal margin in pixels)
        │               marginVertical: number;    // 0-100, default: 20 (vertical margin in pixels)
        │               
        │               // Sync & Persistence
        │               syncAcrossDevices: boolean; // Sync preferences across devices, default: true
        │               createdAt: Date;
        │               updatedAt: Date;
        │             }
        │             ```
        │           - **Library Interface (NEW):**
        │             ```typescript
        │             interface Library {
        │               id: string;
        │               userId: string;
        │               storyId: string;
        │               story?: Story;              // Populated from stories-service via gRPC
        │               addedAt: Date;
        │               lastReadAt?: Date;
        │               lastChapterId?: string;
        │               isDownloaded: boolean;
        │               downloadProgress: number;  // 0-100
        │               customTags: string[];
        │               notes?: string;
        │               createdAt: Date;
        │               updatedAt: Date;
        │             }
        │             ```
        │           - **Bookshelf Interface (Enhanced - 2.1):**
        │             ```typescript
        │             interface Bookshelf {
        │               id: string;
        │               userId: string;
        │               name: string;
        │               description?: string;
        │               displayOrder: number;
        │               isDefault: boolean;
        │               items?: BookshelfItem[];   // Library items in this bookshelf
        │               createdAt: Date;
        │               updatedAt: Date;
        │             }
        │             
        │             interface BookshelfItem {
        │               id: string;
        │               bookshelfId: string;
        │               libraryId: string;
        │               library?: Library;         // Populated from library
        │               displayOrder: number;
        │               addedAt: Date;
        │             }
        │             ```
        │           - **Tag Interface (NEW - 2.1 - Flexible Categorization):**
        │             ```typescript
        │             interface Tag {
        │               id: string;
        │               userId: string;
        │               name: string;
        │               color?: string;        // Hex color for UI
        │               icon?: string;        // Icon identifier
        │               parentTagId?: string; // For tag hierarchy
        │               parentTag?: Tag;      // Parent tag (if hierarchical)
        │               childTags?: Tag[];    // Child tags (if hierarchical)
        │               createdAt: Date;
        │               updatedAt: Date;
        │             }
        │             ```
        │           - **FilteredView Interface (NEW - 2.1 - Dynamic Queries):**
        │             ```typescript
        │             interface FilteredView {
        │               id: string;
        │               userId: string;
        │               name: string;
        │               description?: string;
        │               query: FilterQuery;    // Filter query (tags, author, completion, date ranges, etc.)
        │               isAutoUpdating: boolean; // Auto-update when data changes
        │               displayOrder: number;
        │               createdAt: Date;
        │               updatedAt: Date;
        │             }
        │             
        │             interface FilterQuery {
        │               tags?: {
        │                 operator: 'AND' | 'OR' | 'NOT';
        │                 values: string[];   // Tag IDs
        │               };
        │               authorId?: string;
        │               seriesId?: string;
        │               completionStatus?: 'completed' | 'in-progress' | 'not-started';
        │               progressRange?: {
        │                 min: number;        // 0-100
        │                 max: number;       // 0-100
        │               };
        │               dateRange?: {
        │                 field: 'addedAt' | 'lastReadAt' | 'completedAt';
        │                 start: Date;
        │                 end: Date;
        │               };
        │               hasHighlights?: boolean; // Stories with highlights
        │               hasBookmarks?: boolean; // Stories with bookmarks
        │             }
        │             ```
        │           - **SystemList Interface (NEW - 2.1 - Predefined Lists):**
        │             ```typescript
        │             interface SystemList {
        │               id: string;
        │               userId: string;
        │               listType: 'favorites' | 'to-read' | 'have-read' | 'currently-reading' | 'recently-added';
        │               libraryItems?: LibrarySystemListItem[];
        │               createdAt: Date;
        │               updatedAt: Date;
        │             }
        │             
        │             interface LibrarySystemListItem {
        │               id: string;
        │               libraryId: string;
        │               systemListId: string;
        │               createdAt: Date;
        │             }
        │             ```
        │           - **Wishlist Interface (NEW):**
        │             ```typescript
        │             interface Wishlist {
        │               id: string;
        │               userId: string;
        │               storyId: string;
        │               story?: Story;             // Populated from stories-service via gRPC
        │               priority?: number;          // 1-10, higher = more important
        │               notes?: string;
        │               createdAt: Date;
        │               updatedAt: Date;
        │             }
        │             ```
        │           - **ReadingProgress Interface (NEW):**
        │             ```typescript
        │             interface ReadingProgress {
        │               id: string;
        │               userId: string;
        │               storyId: string;
        │               chapterId: string;
        │               position: number;          // Scroll position or page number
        │               progressPercentage: number; // 0-100
        │               lastReadAt: Date;
        │               isCompleted: boolean;
        │               createdAt: Date;
        │               updatedAt: Date;
        │             }
        │             ```
        │       2.  Define all `validation/` (DTOs using `class-validator` decorators), including **CreatePostDto, CreateGroupDto, FollowUserDto**, **UpdateReadingPreferencesDto**, **CreateBookmarkDto**, **CreateAnnotationDto**, **SynthesizeSpeechDto**, **TranslateTextDto**, **LookupWordDto**, **AddToLibraryDto**, **UpdateLibraryItemDto**, **CreateBookshelfDto**, **AddToWishlistDto**, **UpdateReadingProgressDto**.
        │           - **UpdateReadingPreferencesDto (Core Reader Interface - Enhanced):**
        │             ```typescript
        │             class UpdateReadingPreferencesDto {
        │               // All fields optional for partial updates
        │               @IsOptional()
        │               @IsInt()
        │               @Min(12)
        │               @Max(24)
        │               fontSize?: number;
        │               
        │               @IsOptional()
        │               @IsIn(['system', 'serif', 'sans-serif', 'monospace', 'custom'])
        │               fontFamily?: string;
        │               
        │               // Custom Font Upload (1.1 - Delighter Feature)
        │               @IsOptional()
        │               @IsString()
        │               @IsUrl()
        │               customFontUrl?: string;  // URL to uploaded font file
        │               
        │               @IsOptional()
        │               @IsString()
        │               @MaxLength(100)
        │               customFontName?: string;  // Display name of custom font
        │               
        │               @IsOptional()
        │               @IsString()
        │               customFontData?: string;  // Base64 encoded font data (for offline)
        │               
        │               @IsOptional()
        │               @IsNumber()
        │               @Min(1.0)
        │               @Max(2.5)
        │               lineHeight?: number;
        │               
        │               @IsOptional()
        │               @IsNumber()
        │               @Min(-0.5)
        │               @Max(2.0)
        │               letterSpacing?: number;
        │               
        │               @IsOptional()
        │               @IsNumber()
        │               @Min(0)
        │               @Max(2.0)
        │               paragraphSpacing?: number;
        │               
        │               @IsOptional()
        │               @IsNumber()
        │               @Min(0)
        │               @Max(2.0)
        │               wordSpacing?: number;
        │               
        │               @IsOptional()
        │               @IsIn(['white', 'black', 'sepia', 'eye-protection', 'custom'])
        │               backgroundColor?: 'white' | 'black' | 'sepia' | 'eye-protection' | 'custom';
        │               
        │               @IsOptional()
        │               @IsString()
        │               @Matches(/^#[0-9A-Fa-f]{6}$/)
        │               textColor?: string;
        │               
        │               @IsOptional()
        │               @IsString()
        │               @Matches(/^#[0-9A-Fa-f]{6}$/)
        │               customBackgroundColor?: string;
        │               
        │               @IsOptional()
        │               @IsInt()
        │               @Min(0)
        │               @Max(100)
        │               brightness?: number;
        │               
        │               // Blue Light Filtering (1.2 - Adaptive Eye Protection)
        │               @IsOptional()
        │               @IsBoolean()
        │               blueLightFilterEnabled?: boolean;
        │               
        │               @IsOptional()
        │               @IsInt()
        │               @Min(0)
        │               @Max(100)
        │               blueLightFilterStrength?: number;
        │               
        │               @IsOptional()
        │               @IsBoolean()
        │               blueLightFilterAdaptive?: boolean;
        │               
        │               @IsOptional()
        │               @ValidateNested()
        │               @Type(() => BlueLightFilterScheduleDto)
        │               blueLightFilterSchedule?: BlueLightFilterScheduleDto;
        │               
        │               @IsOptional()
        │               @IsIn(['scroll', 'page'])
        │               readingMode?: 'scroll' | 'page';
        │               
        │               @IsOptional()
        │               @IsBoolean()
        │               pageTurnAnimation?: boolean;
        │               
        │               @IsOptional()
        │               @IsIn(['horizontal', 'vertical'])
        │               pageTurnDirection?: 'horizontal' | 'vertical';
        │               
        │               @IsOptional()
        │               @IsIn(['smooth', 'instant', 'auto'])
        │               scrollBehavior?: 'smooth' | 'instant' | 'auto';
        │               
        │               // Multi-Format Support (1.4)
        │               @IsOptional()
        │               @IsArray()
        │               @IsString({ each: true })
        │               @IsIn(['epub', 'pdf', 'mobi', 'azw3', 'fb2', 'docx', 'doc', 'rtf', 'odt', 'txt', 'cbr', 'cbz'], { each: true })
        │               preferredFormats?: string[];
        │               
        │               @IsOptional()
        │               @ValidateNested()
        │               @Type(() => FormatProcessingDto)
        │               formatProcessing?: FormatProcessingDto;
        │               
        │               @IsOptional()
        │               @IsBoolean()
        │               autoHideControls?: boolean;
        │               
        │               @IsOptional()
        │               @IsBoolean()
        │               tapToToggleControls?: boolean;
        │               
        │               @IsOptional()
        │               @IsIn(['left', 'center', 'justify'])
        │               textAlign?: 'left' | 'center' | 'justify';
        │               
        │               @IsOptional()
        │               @IsInt()
        │               @Min(0)
        │               @Max(100)
        │               marginHorizontal?: number;
        │               
        │               @IsOptional()
        │               @IsInt()
        │               @Min(0)
        │               @Max(100)
        │               marginVertical?: number;
        │               
        │               @IsOptional()
        │               @IsInt()
        │               @Min(1000)
        │               @Max(10000)
        │               controlsTimeout?: number;
        │               
        │               @IsOptional()
        │               @IsBoolean()
        │               syncAcrossDevices?: boolean;
        │             }
        │             
        │             class BlueLightFilterScheduleDto {
        │               @IsString()
        │               @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
        │               startTime: string;  // HH:mm format
        │               
        │               @IsString()
        │               @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
        │               endTime: string;    // HH:mm format
        │             }
        │             
        │             class FormatProcessingDto {
        │               @IsOptional()
        │               @ValidateNested()
        │               @Type(() => PDFProcessingDto)
        │               pdf?: PDFProcessingDto;
        │               
        │               @IsOptional()
        │               @ValidateNested()
        │               @Type(() => DOCXProcessingDto)
        │               docx?: DOCXProcessingDto;
        │               
        │               @IsOptional()
        │               @ValidateNested()
        │               @Type(() => ArchiveProcessingDto)
        │               archive?: ArchiveProcessingDto;
        │             }
        │             
        │             class PDFProcessingDto {
        │               @IsOptional()
        │               @IsBoolean()
        │               autoCropMargins?: boolean;
        │               
        │               @IsOptional()
        │               @IsBoolean()
        │               autoGenerateTOC?: boolean;
        │             }
        │             
        │             class DOCXProcessingDto {
        │               @IsOptional()
        │               @IsBoolean()
        │               autoGenerateTOC?: boolean;
        │             }
        │             
        │             class ArchiveProcessingDto {
        │               @IsOptional()
        │               @IsBoolean()
        │               readFromZip?: boolean;
        │               
        │               @IsOptional()
        │               @IsBoolean()
        │               readFromRar?: boolean;
        │             }
        │             ```
        │             
        │             **Note:** All fields are optional to support partial updates. Validation ensures:
        │             - fontSize: 12-24 range
        │             - backgroundColor: Valid enum values ('white', 'black', 'sepia', 'eye-protection', 'custom')
        │             - Colors: Valid hex format (#RRGGBB)
        │             - readingMode: 'scroll' or 'page'
        │             - Brightness: 0-100 range
        │             - Timeouts: 1000-10000ms range
        │             - All numeric fields have appropriate min/max constraints
        │             ```
        │           - **Bookshelf & Library DTOs (NEW):**
        │             ```typescript
        │             class AddToLibraryDto {
        │               @IsString() @IsNotEmpty() storyId: string;
        │             }
        │             
        │             class UpdateLibraryItemDto {
        │               @IsOptional() @IsArray() @IsString({ each: true }) customTags?: string[];
        │               @IsOptional() @IsString() notes?: string;
        │             }
        │             
        │             class CreateBookshelfDto {
        │               @IsString() @IsNotEmpty() @MinLength(1) @MaxLength(50) name: string;
        │               @IsOptional() @IsString() @MaxLength(200) description?: string;
        │             }
        │             
        │             class UpdateBookshelfDto {
        │               @IsOptional() @IsString() @MinLength(1) @MaxLength(50) name?: string;
        │               @IsOptional() @IsString() @MaxLength(200) description?: string;
        │             }
        │             
        │             class ReorderBookshelfDto {
        │               @IsArray() @ValidateNested({ each: true }) items: BookshelfItemOrderDto[];
        │             }
        │             
        │             class BookshelfItemOrderDto {
        │               @IsString() @IsNotEmpty() libraryId: string;
        │               @IsInt() @Min(0) displayOrder: number;
        │             }
        │             
        │             class AddToWishlistDto {
        │               @IsString() @IsNotEmpty() storyId: string;
        │               @IsOptional() @IsInt() @Min(1) @Max(10) priority?: number;
        │               @IsOptional() @IsString() @MaxLength(500) notes?: string;
        │             }
        │             
        │             class UpdateReadingProgressDto {
        │               @IsString() @IsNotEmpty() storyId: string;
        │               @IsString() @IsNotEmpty() chapterId: string;
        │               @IsNumber() @Min(0) position: number;
        │               @IsNumber() @Min(0) @Max(100) progressPercentage: number;
        │             }
        │             ```
        │       3.  Define all `constants/` (Event Bus topic names, Roles), including new social events:
        │           - `POST_CREATED`, `POST_DELETED`, `POST_LIKED`
        │           - `GROUP_CREATED`, `GROUP_MEMBER_JOINED`, `GROUP_INVITE`
        │           - `USER_FOLLOWED`, `USER_UNFOLLOWED`
        │           - **Reading Constants (Core Reader Interface):**
        │             - `DEFAULT_FONT_SIZE = 16` (12-24 range, slider control via 'Aa' icon)
        │             - `DEFAULT_LINE_HEIGHT = 1.5` (1.0-2.5 range)
        │             - `DEFAULT_BACKGROUND = 'white'` (white|black|sepia|eye-protection|custom)
        │             - `DEFAULT_READING_MODE = 'scroll'` (scroll|page)
        │             - `DEFAULT_AUTO_HIDE_CONTROLS = true`
        │             - `DEFAULT_CONTROLS_TIMEOUT = 3000` (milliseconds)
        │             - `DEFAULT_TAP_TO_TOGGLE = true`
        │             - `DEFAULT_BRIGHTNESS = 100` (0-100 range)
        │             - `DEFAULT_PAGE_TURN_ANIMATION = true`
        │             - `MIN_FONT_SIZE = 12`, `MAX_FONT_SIZE = 24`
        │             - `MIN_LINE_HEIGHT = 1.0`, `MAX_LINE_HEIGHT = 2.5`
        │       4.  **Define all `proto/` (gRPC contracts) here.** (Use `ts-proto` to auto-compile to TS code).
        │       5.  **New:** Create `proto/social.proto` defining gRPC services:
        │           - `SocialService` with methods: `CreatePost`, `DeletePost`, `CreateGroup`, `JoinGroup`, `FollowUser`, `UnfollowUser`, `GetFeed`, `GetUserPosts`, `GetGroupPosts`, `LikePost`
        │       6a. **Update `proto/stories.proto` (NEW - Storefront & Curation):** Add Discovery & Engagement methods:
        │           ```protobuf
        │           // Ranking Charts
        │           message GetRankingsRequest {
        │             string rankingType = 1;  // 'monthly-votes'|'recommendations'|'sales'|'popularity'
        │             optional string genre = 2;
        │             optional string timeRange = 3;  // 'daily'|'weekly'|'monthly'|'all-time'
        │             optional int32 limit = 4;
        │           }
        │           
        │           message Ranking {
        │             string storyId = 1;
        │             int32 position = 2;
        │             double score = 3;
        │             Story story = 4;
        │           }
        │           
        │           message GetRankingsResponse {
        │             repeated Ranking rankings = 1;
        │           }
        │           
        │           // Editor's Picks
        │           message GetEditorPicksRequest {
        │             optional int32 limit = 1;
        │             optional string genre = 2;
        │           }
        │           
        │           message EditorPick {
        │             string storyId = 1;
        │             int32 priority = 2;
        │             int64 featuredUntil = 3;
        │             optional string bannerImage = 4;
        │             optional string description = 5;
        │             Story story = 6;
        │           }
        │           
        │           message GetEditorPicksResponse {
        │             repeated EditorPick editorPicks = 1;
        │           }
        │           
        │           // Genre Browsing
        │           message GetGenresRequest {}
        │           message Genre {
        │             string id = 1;
        │             string name = 2;
        │             string slug = 3;
        │             optional string parentId = 4;
        │             optional string description = 5;
        │             optional string icon = 6;
        │           }
        │           message GetGenresResponse {
        │             repeated Genre genres = 1;
        │           }
        │           
        │           message GetStoriesByGenreRequest {
        │             string genreId = 1;
        │             optional int32 page = 2;
        │             optional int32 limit = 3;
        │             optional string sort = 4;  // 'recent'|'popular'|'rating'
        │             optional string filters = 5;  // JSON string
        │           }
        │           
        │           // Storefront Homepage
        │           message GetStorefrontDataRequest {
        │             optional string userId = 1;  // For personalization
        │           }
        │           message StorefrontData {
        │             repeated EditorPick editorPicks = 1;
        │             repeated Ranking topRankings = 2;
        │             repeated Genre genres = 3;
        │             repeated Story trendingStories = 4;
        │           }
        │           
        │           service StoriesService {
        │             // ... existing methods ...
        │             rpc GetRankings(GetRankingsRequest) returns (GetRankingsResponse);
        │             rpc GetEditorPicks(GetEditorPicksRequest) returns (GetEditorPicksResponse);
        │             rpc GetGenres(GetGenresRequest) returns (GetGenresResponse);
        │             rpc GetStoriesByGenre(GetStoriesByGenreRequest) returns (GetStoriesResponse);
        │             rpc GetStorefrontData(GetStorefrontDataRequest) returns (StorefrontData);
        │             rpc GetReadingProgress(GetReadingProgressRequest) returns (ReadingProgressResponse);
        │             rpc UpdateReadingProgress(UpdateReadingProgressRequest) returns (ReadingProgressResponse);
        │             rpc GetAuthorEngagement(GetAuthorEngagementRequest) returns (AuthorEngagementResponse);
        │             rpc GetReaderInsights(GetReaderInsightsRequest) returns (ReaderInsightsResponse);
        │           }
        │           ```
        │       6a.1 **Extend `proto/stories.proto` (Reading Progress & Author Ecosystem):**
        │           ```protobuf
        │           message GetReadingProgressRequest {
        │             string userId = 1;
        │             string storyId = 2;
        │           }
        │
        │           message UpdateReadingProgressRequest {
        │             string userId = 1;
        │             string storyId = 2;
        │             string chapterId = 3;
        │             double progress = 4;
        │           }
        │
        │           message ReadingProgress {
        │             string storyId = 1;
        │             string chapterId = 2;
        │             double progress = 3;
        │             google.protobuf.Timestamp updatedAt = 4;
        │           }
        │
        │           message ReadingProgressResponse {
        │             bool success = 1;
        │             optional ReadingProgress data = 2;
        │             string message = 3;
        │           }
        │
        │           message GetAuthorEngagementRequest {
        │             string authorId = 1;
        │             optional string storyId = 2;
        │           }
        │
        │           message AuthorEngagementResponse {
        │             int64 votes = 1;
        │             int64 comments = 2;
        │             int64 tips = 3;
        │             int64 followers = 4;
        │           }
        │
        │           message GetReaderInsightsRequest {
        │             string authorId = 1;
        │             optional string storyId = 2;
        │           }
        │
        │           message ReaderInsightsResponse {
        │             double completionRate = 1;
        │             repeated double dropOffPoints = 2;
        │             repeated string readingPatterns = 3;
        │           }
        │           ```
        │       6b. **Update `proto/ai.proto` (Enhanced - Recommendations + TTS + Translation):** Add Recommendation Engine, TTS, and Translation methods:
        │           ```protobuf
        │           // Personalized Recommendations (Enhanced)
        │           message GetRecommendationsRequest {
        │             string userId = 1;
        │             optional int32 limit = 2;
        │             optional string context = 3;  // 'home'|'story'|'chapter'
        │             optional string mood = 4;      // Optional mood for mood-based recommendations (NEW)
        │           }
        │           
        │           message Recommendation {
        │             Story story = 1;
        │             double score = 2;
        │             string explanation = 3;
        │             string source = 4;  // 'collaborative'|'content-based'|'hybrid'|'mood-based'|'natural-language'
        │           }
        │           
        │           message GetRecommendationsResponse {
        │             repeated Recommendation recommendations = 1;
        │           }
        │           
        │           // Mood-based Recommendations (NEW)
        │           message GetMoodBasedRecommendationsRequest {
        │             string userId = 1;
        │             string mood = 2;  // 'action'|'romance'|'mystery'|'comedy'|'drama'|'thriller'
        │             optional int32 limit = 3;
        │           }
        │           
        │           // Natural Language Search (NEW)
        │           message SearchByNaturalLanguageRequest {
        │             string userId = 1;
        │             string query = 2;  // "sci-fi with advanced AI and ethical issues"
        │             optional int32 limit = 3;
        │           }
        │           
        │           // Breaking Filter Bubbles (NEW)
        │           message ExploreNewTerritoriesRequest {
        │             string userId = 1;
        │             optional int32 limit = 2;
        │           }
        │           
        │           // Emotional TTS (NEW)
        │           message SynthesizeEmotionalSpeechRequest {
        │             string text = 1;
        │             string language = 2;
        │             string emotion = 3;  // "emotional and dramatic", "calm and soothing"
        │             optional string voiceStyle = 4;  // 'terrified'|'sad'|'shouting'|'whispering'|'cheerful'|'angry'
        │             optional double speed = 5;  // 0.5-2.0
        │           }
        │           
        │           // TTS with Sync (NEW)
        │           message GetTTSWithSyncRequest {
        │             string text = 1;
        │             string language = 2;
        │             optional string voice = 3;
        │             optional string syncMode = 4;  // 'word-by-word'|'sentence-by-sentence'
        │           }
        │           
        │           message TTSSyncData {
        │             string audioUrl = 1;
        │             repeated SyncTimestamp timestamps = 2;  // Word/sentence positions with timestamps
        │           }
        │           
        │           message SyncTimestamp {
        │             int32 startOffset = 1;  // Character offset
        │             int32 endOffset = 2;
        │             double timestamp = 3;  // Audio timestamp in seconds
        │           }
        │           
        │           // Sentence-level Translation (NEW)
        │           message TranslateSentenceRequest {
        │             string sentence = 1;
        │             string fromLang = 2;
        │             string toLang = 3;
        │             optional string context = 4;  // Surrounding text for context
        │           }
        │           
        │           // Parallel Translation (NEW)
        │           message GetParallelTranslationRequest {
        │             string text = 1;
        │             string fromLang = 2;
        │             string toLang = 3;
        │             optional string displayMode = 4;  // 'line-by-line'|'side-by-side'|'interleaved'
        │           }
        │           
        │           message ParallelTranslation {
        │             repeated TranslationPair pairs = 1;  // Original + translated pairs
        │           }
        │           
        │           message TranslationPair {
        │             string original = 1;
        │             string translated = 2;
        │           }
        │           
        │           // Dictionary with Third-party (NEW)
        │           message LookupWordRequest {
        │             string word = 1;
        │             string fromLang = 2;
        │             string toLang = 3;
        │             optional string dictionarySource = 4;  // 'default'|'abbyy'|'oxford'|'custom'
        │           }
        │           
        │           // Touch-to-translate (NEW)
        │           message TouchTranslateRequest {
        │             string word = 1;
        │             string fromLang = 2;
        │             string toLang = 3;
        │             optional Position position = 4;  // Screen position for context
        │           }
        │           
        │           message Position {
        │             double x = 1;
        │             double y = 2;
        │           }
        │           
        │           // Annotation AI Summary (NEW)
        │           message SummarizeAnnotationsRequest {
        │             repeated string annotationIds = 1;
        │             repeated string highlights = 2;  // Selected text
        │             optional string context = 3;  // Surrounding text
        │           }
        │           
        │           message GetAnnotationSummaryRequest {
        │             string selectedText = 1;
        │             optional string surroundingText = 2;  // Surrounding text for context
        │             optional string context = 3;  // Additional context (story, chapter info)
        │           }
        │           
        │           message AnnotationSummary {
        │             string summary = 1;
        │             repeated string keyPoints = 2;
        │             repeated string insights = 3;
        │           }
        │           
        │           // Similar Stories
        │           message GetSimilarStoriesRequest {
        │             string storyId = 1;
        │             optional int32 limit = 2;
        │           }
        │           
        │           message SimilarStory {
        │             Story story = 1;
        │             double similarityScore = 2;
        │           }
        │           
        │           message GetSimilarStoriesResponse {
        │             repeated SimilarStory similarStories = 1;
        │           }
        │           
        │           // Trending Stories
        │           message GetTrendingStoriesRequest {
        │             optional string genre = 1;
        │             optional string timeRange = 2;  // 'daily'|'weekly'|'monthly'
        │           }
        │           
        │           message TrendingStory {
        │             Story story = 1;
        │             double trendScore = 2;
        │           }
        │           
        │           message GetTrendingStoriesResponse {
        │             repeated TrendingStory trendingStories = 1;
        │           }
        │           
        │           // Recommendation Explanation
        │           message ExplainRecommendationRequest {
        │             string storyId = 1;
        │             string userId = 2;
        │           }
        │           message ExplainRecommendationResponse {
        │             string explanation = 1;
        │           }
        │           
        │           service AIService {
        │             // TTS Methods (Enhanced)
        │             rpc SynthesizeSpeech(SynthesizeSpeechRequest) returns (SynthesizeSpeechResponse);
        │             rpc SynthesizeEmotionalSpeech(SynthesizeEmotionalSpeechRequest) returns (SynthesizeSpeechResponse);  // NEW
        │             rpc GetTTSWithSync(GetTTSWithSyncRequest) returns (TTSSyncData);  // NEW
        │             rpc GetHumanNarration(GetHumanNarrationRequest) returns (SynthesizeSpeechResponse);
        │             
        │             // Translation Methods (Enhanced)
        │             rpc TranslateText(TranslateTextRequest) returns (TranslateTextResponse);
        │             rpc TranslateChapter(TranslateChapterRequest) returns (TranslateTextResponse);
        │             rpc TranslateSentence(TranslateSentenceRequest) returns (TranslateTextResponse);  // NEW
        │             rpc GetParallelTranslation(GetParallelTranslationRequest) returns (ParallelTranslation);  // NEW
        │             
        │             // Dictionary Methods (Enhanced)
        │             rpc LookupWord(LookupWordRequest) returns (DictionaryEntry);
        │             rpc TouchTranslate(TouchTranslateRequest) returns (DictionaryEntry);  // NEW
        │             rpc GetPronunciation(GetPronunciationRequest) returns (PronunciationResponse);
        │             
        │             // Summarization Methods (Enhanced)
        │             rpc SummarizeAnnotations(SummarizeAnnotationsRequest) returns (AnnotationSummary);  // NEW
        │             rpc GetAnnotationSummary(GetAnnotationSummaryRequest) returns (AnnotationSummary);  // NEW
        │             
        │             // Recommendation Methods (Enhanced)
        │             rpc GetRecommendations(GetRecommendationsRequest) returns (GetRecommendationsResponse);
        │             rpc GetMoodBasedRecommendations(GetMoodBasedRecommendationsRequest) returns (GetRecommendationsResponse);  // NEW
        │             rpc SearchByNaturalLanguage(SearchByNaturalLanguageRequest) returns (GetRecommendationsResponse);  // NEW
        │             rpc ExploreNewTerritories(ExploreNewTerritoriesRequest) returns (GetRecommendationsResponse);  // NEW
        │             rpc GetSimilarStories(GetSimilarStoriesRequest) returns (GetSimilarStoriesResponse);
        │             rpc GetTrendingStories(GetTrendingStoriesRequest) returns (GetTrendingStoriesResponse);
        │             rpc ExplainRecommendation(ExplainRecommendationRequest) returns (ExplainRecommendationResponse);
        │           }
        │           ```
        │       6c. **Update `proto/ai.proto` (Enhanced):** Add TTS, Translation, Dictionary messages and service methods:
        │           ```protobuf
        │           message SynthesizeSpeechRequest {
        │             string text = 1;
        │             string language = 2;
        │             optional string voice = 3;
        │             optional double speed = 4;  // 0.5-2.0
        │             optional string emotion = 5;  // "emotional and dramatic", "calm and soothing" (NEW)
        │             optional string voiceStyle = 6;  // 'terrified'|'sad'|'shouting'|'whispering'|'cheerful'|'angry' (NEW)
        │             optional string context = 7;  // Surrounding text for contextual awareness (NEW)
        │           }
        │           
        │           message SynthesizeSpeechResponse {
        │             string audioUrl = 1;
        │             int32 duration = 2; // in seconds
        │           }
        │           
        │           message GetHumanNarrationRequest {
        │             string storyId = 1;
        │             string chapterId = 2;
        │           }
        │           
        │           message GetNarrationOptionsRequest {
        │             string storyId = 1;
        │             string chapterId = 2;
        │           }
        │           
        │           message GetNarrationOptionsResponse {
        │             repeated string availableTypes = 1;  // ['ai', 'human'] or ['ai']
        │           }
        │           
        │           message TranslateChapterRequest {
        │             string chapterId = 1;
        │             string fromLang = 2;
        │             string toLang = 3;
        │           }
        │           
        │           message GetPronunciationRequest {
        │             string word = 1;
        │             string language = 2;
        │           }
        │           
        │           message PronunciationResponse {
        │             string audioUrl = 1;
        │             optional string pinyin = 2;  // For Chinese
        │           }
        │           
        │           message TranslateTextRequest {
        │             string text = 1;
        │             string fromLang = 2;
        │             string toLang = 3;
        │           }
        │           
        │           message TranslateTextResponse {
        │             string translatedText = 1;
        │           }
        │           
        │           message LookupWordRequest {
        │             string word = 1;
        │             string fromLang = 2;
        │             string toLang = 3;
        │           }
        │           
        │           message DictionaryEntry {
        │             string word = 1;
        │             string pronunciation = 2;
        │             optional string pinyin = 3; // for Chinese
        │             repeated string definitions = 4;
        │             repeated string examples = 5;
        │           }
        │           
        │           service AIService {
        │             rpc SynthesizeSpeech(SynthesizeSpeechRequest) returns (SynthesizeSpeechResponse);
        │             rpc GetHumanNarration(GetHumanNarrationRequest) returns (SynthesizeSpeechResponse);
        │             rpc TranslateText(TranslateTextRequest) returns (TranslateTextResponse);
        │             rpc LookupWord(LookupWordRequest) returns (DictionaryEntry);
        │           }
        │           ```
        │       7.  **Update `proto/users.proto` (NEW):** Add ReadingPreferences, Bookmarks, Annotations messages and service methods:
        │           ```protobuf
        │           message ReadingPreferences {
        │             string userId = 1;
        │             // Text Customization
        │             int32 fontSize = 2;              // 12-24, default: 16
        │             string fontFamily = 3;          // 'system'|'serif'|'sans-serif'|'monospace'
        │             double lineHeight = 4;          // 1.0-2.5, default: 1.5
        │             double letterSpacing = 5;       // -0.5 to 2.0, default: 0
        │             double paragraphSpacing = 6;    // 0-2.0, default: 1.0
        │             
        │             // Background & Theme Modes
        │             string backgroundColor = 7;     // 'white'|'black'|'sepia'|'eye-protection'|'custom'
        │             optional string textColor = 8;  // Hex color override
        │             optional string customBackgroundColor = 9; // Hex color for 'custom' mode
        │             int32 brightness = 10;          // 0-100, default: 100
        │             
        │             // Reading Mode (Scroll vs Page Turn)
        │             string readingMode = 11;       // 'scroll'|'page'
        │             bool pageTurnAnimation = 12;    // Enable/disable animation
        │             string pageTurnDirection = 13;  // 'horizontal'|'vertical'
        │             
        │             // UI Controls Behavior
        │             bool autoHideControls = 14;     // Auto-hide after inactivity
        │             int32 controlsTimeout = 15;     // Milliseconds, default: 3000
        │             bool tapToToggleControls = 16;  // Tap center to show/hide
        │             
        │             // Advanced Settings
        │             double wordSpacing = 17;         // 0-2.0, default: 0
        │             string textAlign = 18;          // 'left'|'center'|'justify'
        │             int32 marginHorizontal = 19;    // 0-100, default: 20
        │             int32 marginVertical = 20;      // 0-100, default: 20
        │             
        │             // Sync & Persistence
        │             bool syncAcrossDevices = 21;     // Sync across devices
        │             int64 createdAt = 22;
        │             int64 updatedAt = 23;
        │           }
        │           
        │           message GetReadingPreferencesRequest {
        │             string userId = 1;
        │           }
        │           
        │           message UpdateReadingPreferencesRequest {
        │             string userId = 1;
        │             // All fields optional for partial updates
        │             optional int32 fontSize = 2;
        │             optional string fontFamily = 3;
        │             optional double lineHeight = 4;
        │             optional double letterSpacing = 5;
        │             optional double paragraphSpacing = 6;
        │             optional string backgroundColor = 7;
        │             optional string textColor = 8;
        │             optional string customBackgroundColor = 9;
        │             optional int32 brightness = 10;
        │             optional string readingMode = 11;
        │             optional bool pageTurnAnimation = 12;
        │             optional string pageTurnDirection = 13;
        │             optional bool autoHideControls = 14;
        │             optional int32 controlsTimeout = 15;
        │             optional bool tapToToggleControls = 16;
        │             optional double wordSpacing = 17;
        │             optional string textAlign = 18;
        │             optional int32 marginHorizontal = 19;
        │             optional int32 marginVertical = 20;
        │             optional bool syncAcrossDevices = 21;
        │           }
        │           
        │           message Bookmark {
        │             string id = 1;
        │             string storyId = 2;
        │             string chapterId = 3;
        │             double position = 4;
        │             optional string note = 5;
        │             int64 createdAt = 6;
        │           }
        │           
        │           message CreateBookmarkRequest {
        │             string userId = 1;
        │             string storyId = 2;
        │             string chapterId = 3;
        │             double position = 4;
        │             optional string note = 5;
        │           }
        │           
        │           message Annotation {
        │             string id = 1;
        │             optional string storyId = 2;
        │             optional string chapterId = 3;
        │             string selectedText = 4;
        │             int32 startOffset = 5;
        │             int32 endOffset = 6;
        │             string note = 7;
        │             optional string color = 8;
        │             // Unification Fields (NEW)
        │             optional string sourceType = 9;  // 'epub'|'pdf'|'web'|'youtube'|'twitter'|'story'|'chapter'
        │             optional string sourceId = 10;  // ID of source document/content
        │             optional string sourceUrl = 11;  // URL for web/YouTube/Twitter sources
        │             optional int64 unifiedAt = 12;  // When unified from external source
        │             // Revisitation Fields (NEW)
        │             optional int64 lastReviewedAt = 13;  // Last review timestamp
        │             int32 reviewCount = 14;  // Number of times reviewed
        │             optional int64 nextReviewDate = 15;  // Next scheduled review (spaced repetition)
        │             bool isArchived = 16;  // Archived highlights
        │             int64 createdAt = 17;
        │             int64 updatedAt = 18;
        │           }
        │           
        │           message CreateAnnotationRequest {
        │             string userId = 1;
        │             optional string storyId = 2;
        │             optional string chapterId = 3;
        │             string selectedText = 4;
        │             int32 startOffset = 5;
        │             int32 endOffset = 6;
        │             string note = 7;
        │             optional string color = 8;
        │             optional string sourceType = 9;  // 'epub'|'pdf'|'web'|'youtube'|'twitter'|'story'|'chapter'
        │             optional string sourceId = 10;  // ID of source document/content
        │             optional string sourceUrl = 11;  // URL for web/YouTube/Twitter sources
        │           }
        │           
        │           // Annotation Suite Messages (NEW)
        │           message GenerateAnnotationSummaryRequest {
        │             string userId = 1;
        │             repeated string annotationIds = 2;
        │             repeated string highlights = 3;  // Selected text
        │             optional string context = 4;  // Surrounding text
        │           }
        │           
        │           message ExportAnnotationsRequest {
        │             string userId = 1;
        │             repeated string annotationIds = 2;  // Optional: if empty, export all
        │             optional string sourceType = 3;  // Filter by source type
        │             string format = 4;  // 'markdown'|'notion'|'obsidian'|'capacities'
        │             optional string targetId = 5;  // Notion page ID, Obsidian vault path, Capacities space ID
        │           }
        │           
        │           message ExportAnnotationsResponse {
        │             string format = 1;
        │             string content = 2;  // Exported content (Markdown, JSON, etc.)
        │             optional string url = 3;  // URL if exported to external service
        │             int32 exportedCount = 4;
        │           }
        │           
        │           message UnifyAnnotationsRequest {
        │             string userId = 1;
        │             string sourceType = 2;  // 'epub'|'pdf'|'web'|'youtube'|'twitter'
        │             string sourceId = 3;
        │             repeated Annotation annotations = 4;  // Annotations to import
        │             optional string sourceUrl = 5;
        │           }
        │           
        │           message UnifyAnnotationsResponse {
        │             int32 importedCount = 1;
        │             int32 duplicateCount = 2;
        │             repeated string annotationIds = 3;  // IDs of imported annotations
        │           }
        │           
        │           message GetRevisitationQueueRequest {
        │             string userId = 1;
        │             optional int32 limit = 2;  // Number of highlights to review
        │           }
        │           
        │           message GetRevisitationQueueResponse {
        │             repeated Annotation annotations = 1;  // Highlights due for review
        │             int32 totalDue = 2;  // Total number of highlights due for review
        │             int32 reviewStreak = 3;  // Current review streak
        │           }
        │           
        │           message GetAnnotationsRequest {
        │             string userId = 1;
        │             optional string storyId = 2;
        │             optional string chapterId = 3;
        │             optional string sourceType = 4;  // Filter by source type
        │           }
        │           
        │           message GetAnnotationsResponse {
        │             repeated Annotation annotations = 1;
        │           }
        │           
        │           message UpdateAnnotationRequest {
        │             string annotationId = 1;
        │             optional string note = 2;
        │             optional string color = 3;
        │           }
        │           
        │           message DeleteAnnotationRequest {
        │             string annotationId = 1;
        │           }
        │           
        │           // Note: AnnotationSummary is defined in ai.proto (imported)
        │           
        │           // Bookshelf & Library Messages (NEW)
        │           message Library {
        │             string id = 1;
        │             string userId = 2;
        │             string storyId = 3;
        │             int64 addedAt = 4;
        │             optional int64 lastReadAt = 5;
        │             optional string lastChapterId = 6;
        │             bool isDownloaded = 7;
        │             int32 downloadProgress = 8; // 0-100
        │             repeated string customTags = 9;
        │             optional string notes = 10;
        │             int64 createdAt = 11;
        │             int64 updatedAt = 12;
        │           }
        │           
        │           message Bookshelf {
        │             string id = 1;
        │             string userId = 2;
        │             string name = 3;
        │             optional string description = 4;
        │             int32 displayOrder = 5;
        │             bool isDefault = 6;
        │             int64 createdAt = 7;
        │             int64 updatedAt = 8;
        │           }
        │           
        │           message BookshelfItem {
        │             string id = 1;
        │             string bookshelfId = 2;
        │             string libraryId = 3;
        │             int32 displayOrder = 4;
        │             int64 addedAt = 5;
        │           }
        │           
        │           message Wishlist {
        │             string id = 1;
        │             string userId = 2;
        │             string storyId = 3;
        │             optional int32 priority = 4; // 1-10
        │             optional string notes = 5;
        │             int64 createdAt = 6;
        │             int64 updatedAt = 7;
        │           }
        │           
        │           message ReadingProgress {
        │             string id = 1;
        │             string userId = 2;
        │             string storyId = 3;
        │             string chapterId = 4;
        │             double position = 5;
        │             double progressPercentage = 6; // 0-100
        │             int64 lastReadAt = 7;
        │             bool isCompleted = 8;
        │             int64 createdAt = 9;
        │             int64 updatedAt = 10;
        │           }
        │           
        │           // Library Requests/Responses
        │           message GetLibraryRequest {
        │             string userId = 1;
        │             optional string bookshelfId = 2;
        │             repeated string tags = 3;
        │             optional string layout = 4; // 'grid' | 'list'
        │             optional string sort = 5; // 'recent' | 'title' | 'progress'
        │           }
        │           
        │           message GetLibraryResponse {
        │             repeated Library items = 1;
        │           }
        │           
        │           message AddToLibraryRequest {
        │             string userId = 1;
        │             string storyId = 2;
        │           }
        │           
        │           message UpdateLibraryItemRequest {
        │             string userId = 1;
        │             string libraryId = 2;
        │             repeated string customTags = 3;
        │             optional string notes = 4;
        │           }
        │           
        │           message SyncLibraryRequest {
        │             string userId = 1;
        │             string deviceId = 2;
        │           }
        │           
        │           // Bookshelf Requests/Responses
        │           message GetBookshelvesRequest {
        │             string userId = 1;
        │           }
        │           
        │           message GetBookshelvesResponse {
        │             repeated Bookshelf bookshelves = 1;
        │           }
        │           
        │           message CreateBookshelfRequest {
        │             string userId = 1;
        │             string name = 2;
        │             optional string description = 3;
        │           }
        │           
        │           message UpdateBookshelfRequest {
        │             string userId = 1;
        │             string bookshelfId = 2;
        │             optional string name = 3;
        │             optional string description = 4;
        │           }
        │           
        │           message AddToBookshelfRequest {
        │             string userId = 1;
        │             string bookshelfId = 2;
        │             string libraryId = 3;
        │           }
        │           
        │           message ReorderBookshelfRequest {
        │             string userId = 1;
        │             string bookshelfId = 2;
        │             repeated BookshelfItemOrder items = 3;
        │           }
        │           
        │           message BookshelfItemOrder {
        │             string libraryId = 1;
        │             int32 displayOrder = 2;
        │           }
        │           
        │           // Tag Messages (NEW - 2.1)
        │           message Tag {
        │             string id = 1;
        │             string userId = 2;
        │             string name = 3;
        │             optional string color = 4;        // Hex color for UI
        │             optional string icon = 5;          // Icon identifier
        │             optional string parentTagId = 6;  // For tag hierarchy
        │             int64 createdAt = 7;
        │             int64 updatedAt = 8;
        │           }
        │           
        │           message CreateTagRequest {
        │             string userId = 1;
        │             string name = 2;
        │             optional string color = 3;
        │             optional string icon = 4;
        │             optional string parentTagId = 5;
        │           }
        │           
        │           message UpdateTagRequest {
        │             string userId = 1;
        │             string tagId = 2;
        │             optional string name = 3;
        │             optional string color = 4;
        │             optional string icon = 5;
        │           }
        │           
        │           message DeleteTagRequest {
        │             string userId = 1;
        │             string tagId = 2;
        │           }
        │           
        │           message GetTagsRequest {
        │             string userId = 1;
        │           }
        │           
        │           message GetTagsResponse {
        │             repeated Tag tags = 1;
        │           }
        │           
        │           message ApplyTagToLibraryRequest {
        │             string userId = 1;
        │             string libraryId = 2;
        │             string tagId = 3;
        │           }
        │           
        │           message RemoveTagFromLibraryRequest {
        │             string userId = 1;
        │             string libraryId = 2;
        │             string tagId = 3;
        │           }
        │           
        │           // FilteredView Messages (NEW - 2.1)
        │           message FilteredView {
        │             string id = 1;
        │             string userId = 2;
        │             string name = 3;
        │             optional string description = 4;
        │             string query = 5;                 // JSON string of FilterQuery
        │             bool isAutoUpdating = 6;
        │             int32 displayOrder = 7;
        │             int64 createdAt = 8;
        │             int64 updatedAt = 9;
        │           }
        │           
        │           message FilterQuery {
        │             optional TagFilter tags = 1;
        │             optional string authorId = 2;
        │             optional string seriesId = 3;
        │             optional string completionStatus = 4; // 'completed' | 'in-progress' | 'not-started'
        │             optional ProgressRange progressRange = 5;
        │             optional DateRange dateRange = 6;
        │             optional bool hasHighlights = 7;
        │             optional bool hasBookmarks = 8;
        │           }
        │           
        │           message TagFilter {
        │             string operator = 1;              // 'AND' | 'OR' | 'NOT'
        │             repeated string values = 2;       // Tag IDs
        │           }
        │           
        │           message ProgressRange {
        │             double min = 1;                   // 0-100
        │             double max = 2;                   // 0-100
        │           }
        │           
        │           message DateRange {
        │             string field = 1;                 // 'addedAt' | 'lastReadAt' | 'completedAt'
        │             int64 start = 2;                   // Unix timestamp
        │             int64 end = 3;                     // Unix timestamp
        │           }
        │           
        │           message CreateFilteredViewRequest {
        │             string userId = 1;
        │             string name = 2;
        │             optional string description = 3;
        │             FilterQuery query = 4;
        │             optional bool isAutoUpdating = 5;
        │           }
        │           
        │           message UpdateFilteredViewRequest {
        │             string userId = 1;
        │             string viewId = 2;
        │             optional string name = 3;
        │             optional FilterQuery query = 4;
        │           }
        │           
        │           message DeleteFilteredViewRequest {
        │             string userId = 1;
        │             string viewId = 2;
        │           }
        │           
        │           message GetFilteredViewsRequest {
        │             string userId = 1;
        │           }
        │           
        │           message GetFilteredViewsResponse {
        │             repeated FilteredView views = 1;
        │           }
        │           
        │           message ExecuteFilterRequest {
        │             string userId = 1;
        │             FilterQuery query = 2;
        │           }
        │           
        │           message ExecuteFilterResponse {
        │             repeated Library items = 1;
        │           }
        │           
        │           // SystemList Messages (NEW - 2.1)
        │           message SystemList {
        │             string id = 1;
        │             string userId = 2;
        │             string listType = 3;              // 'favorites' | 'to-read' | 'have-read' | 'currently-reading' | 'recently-added'
        │             int64 createdAt = 4;
        │             int64 updatedAt = 5;
        │           }
        │           
        │           message GetSystemListsRequest {
        │             string userId = 1;
        │           }
        │           
        │           message GetSystemListsResponse {
        │             repeated SystemList lists = 1;
        │           }
        │           
        │           message GetBooksByAuthorRequest {
        │             string userId = 1;
        │             string authorId = 2;
        │           }
        │           
        │           message GetBooksBySeriesRequest {
        │             string userId = 1;
        │             string seriesId = 2;
        │           }
        │           
        │           message UpdateSystemListRequest {
        │             string userId = 1;
        │             string listType = 2;              // 'favorites' | 'to-read' | etc.
        │             repeated string libraryIds = 3;
        │           }
        │           
        │           // Download Management Messages (Enhanced - 2.2)
        │           message DownloadStoryRequest {
        │             string userId = 1;
        │             string storyId = 2;
        │             optional bool includePremium = 3;
        │           }
        │           
        │           message BatchDownloadRequest {
        │             string userId = 1;
        │             repeated string storyIds = 2;
        │           }
        │           
        │           message GetDownloadQueueRequest {
        │             string userId = 1;
        │           }
        │           
        │           message GetDownloadQueueResponse {
        │             repeated Library items = 1;      // Items with downloadStatus
        │           }
        │           
        │           message GetStorageUsageRequest {
        │             string userId = 1;
        │           }
        │           
        │           message GetStorageUsageResponse {
        │             int64 totalBytes = 1;
        │             int64 usedBytes = 2;
        │             double percentage = 3;             // 0-100
        │             int32 itemCount = 4;
        │           }
        │           
        │           // Sync Messages (Enhanced - 2.3)
        │           message SyncBookmarksRequest {
        │             string userId = 1;
        │             string deviceId = 2;
        │           }
        │           
        │           message SyncBookmarksResponse {
        │             repeated Bookmark bookmarks = 1;
        │             int64 lastSyncedAt = 2;
        │             int32 conflictCount = 3;
        │           }
        │           
        │           message SyncAnnotationsRequest {
        │             string userId = 1;
        │             string deviceId = 2;
        │           }
        │           
        │           message SyncAnnotationsResponse {
        │             repeated Annotation annotations = 1;
        │             int64 lastSyncedAt = 2;
        │             int32 conflictCount = 3;
        │           }
        │           
        │           // Wishlist Requests/Responses
        │           message GetWishlistRequest {
        │             string userId = 1;
        │           }
        │           
        │           message GetWishlistResponse {
        │             repeated Wishlist items = 1;
        │           }
        │           
        │           message AddToWishlistRequest {
        │             string userId = 1;
        │             string storyId = 2;
        │             optional int32 priority = 3;
        │             optional string notes = 4;
        │           }
        │           
        │           // Reading Progress Requests/Responses
        │           message GetReadingProgressRequest {
        │             string userId = 1;
        │             optional string storyId = 2;
        │           }
        │           
        │           message GetReadingProgressResponse {
        │             repeated ReadingProgress progress = 1;
        │           }
        │           
        │           message UpdateReadingProgressRequest {
        │             string userId = 1;
        │             string storyId = 2;
        │             string chapterId = 3;
        │             double position = 4;
        │             double progressPercentage = 5;
        │           }
        │           
        │           message SyncReadingProgressRequest {
        │             string userId = 1;
        │             string deviceId = 2;
        │           }
        │           
        │           message RemoveFromLibraryRequest {
        │             string userId = 1;
        │             string storyId = 2;
        │           }
        │           
        │           message DeleteBookshelfRequest {
        │             string userId = 1;
        │             string bookshelfId = 2;
        │           }
        │           
        │           message RemoveFromBookshelfRequest {
        │             string userId = 1;
        │             string bookshelfId = 2;
        │             string libraryId = 3;
        │           }
        │           
        │           message RemoveFromWishlistRequest {
        │             string userId = 1;
        │             string storyId = 2;
        │           }
        │           
        │           message MoveToLibraryRequest {
        │             string userId = 1;
        │             string storyId = 2;
        │           }
        │           
        │           message MarkStoryCompletedRequest {
        │             string userId = 1;
        │             string storyId = 2;
        │           }
        │           
        │           service UsersService {
        │             rpc GetReadingPreferences(GetReadingPreferencesRequest) returns (ReadingPreferences);
        │             rpc UpdateReadingPreferences(UpdateReadingPreferencesRequest) returns (ReadingPreferences);
        │             rpc GetBookmarks(GetBookmarksRequest) returns (GetBookmarksResponse);
        │             rpc CreateBookmark(CreateBookmarkRequest) returns (Bookmark);
        │             rpc DeleteBookmark(DeleteBookmarkRequest) returns (Empty);
        │             rpc GetAnnotations(GetAnnotationsRequest) returns (GetAnnotationsResponse);
        │             rpc CreateAnnotation(CreateAnnotationRequest) returns (Annotation);
        │             rpc UpdateAnnotation(UpdateAnnotationRequest) returns (Annotation);
        │             rpc DeleteAnnotation(DeleteAnnotationRequest) returns (Empty);
        │             // Annotation Suite (Enhanced - NEW)
        │             rpc GenerateAnnotationSummary(GenerateAnnotationSummaryRequest) returns (AnnotationSummary);  // AI summary from highlights
        │             rpc ExportAnnotations(ExportAnnotationsRequest) returns (ExportAnnotationsResponse);  // Export to Notion/Obsidian/Capacities
        │             rpc UnifyAnnotations(UnifyAnnotationsRequest) returns (UnifyAnnotationsResponse);  // Unify from multiple sources
        │             rpc GetRevisitationQueue(GetRevisitationQueueRequest) returns (GetRevisitationQueueResponse);  // Spaced repetition queue
        │             // Bookshelf & Library RPCs (NEW)
        │             rpc GetLibrary(GetLibraryRequest) returns (GetLibraryResponse);
        │             rpc AddToLibrary(AddToLibraryRequest) returns (Library);
        │             rpc RemoveFromLibrary(RemoveFromLibraryRequest) returns (Empty);
        │             rpc UpdateLibraryItem(UpdateLibraryItemRequest) returns (Library);
        │             rpc SyncLibrary(SyncLibraryRequest) returns (GetLibraryResponse);
        │             rpc GetBookshelves(GetBookshelvesRequest) returns (GetBookshelvesResponse);
        │             rpc CreateBookshelf(CreateBookshelfRequest) returns (Bookshelf);
        │             rpc UpdateBookshelf(UpdateBookshelfRequest) returns (Bookshelf);
        │             rpc DeleteBookshelf(DeleteBookshelfRequest) returns (Empty);
        │             rpc AddToBookshelf(AddToBookshelfRequest) returns (BookshelfItem);
        │             rpc RemoveFromBookshelf(RemoveFromBookshelfRequest) returns (Empty);
        │             rpc ReorderBookshelf(ReorderBookshelfRequest) returns (Empty);
        │             rpc GetWishlist(GetWishlistRequest) returns (GetWishlistResponse);
        │             rpc AddToWishlist(AddToWishlistRequest) returns (Wishlist);
        │             rpc RemoveFromWishlist(RemoveFromWishlistRequest) returns (Empty);
        │             rpc MoveToLibrary(MoveToLibraryRequest) returns (Library);
        │             rpc GetReadingProgress(GetReadingProgressRequest) returns (GetReadingProgressResponse);
        │             rpc UpdateReadingProgress(UpdateReadingProgressRequest) returns (ReadingProgress);
        │             rpc SyncReadingProgress(SyncReadingProgressRequest) returns (GetReadingProgressResponse);
        │             rpc MarkStoryCompleted(MarkStoryCompletedRequest) returns (Empty);
        │             // Tag RPCs (NEW - 2.1)
        │             rpc CreateTag(CreateTagRequest) returns (Tag);
        │             rpc UpdateTag(UpdateTagRequest) returns (Tag);
        │             rpc DeleteTag(DeleteTagRequest) returns (Empty);
        │             rpc GetTags(GetTagsRequest) returns (GetTagsResponse);
        │             rpc ApplyTagToLibrary(ApplyTagToLibraryRequest) returns (Empty);
        │             rpc RemoveTagFromLibrary(RemoveTagFromLibraryRequest) returns (Empty);
        │             // FilteredView RPCs (NEW - 2.1)
        │             rpc CreateFilteredView(CreateFilteredViewRequest) returns (FilteredView);
        │             rpc UpdateFilteredView(UpdateFilteredViewRequest) returns (FilteredView);
        │             rpc DeleteFilteredView(DeleteFilteredViewRequest) returns (Empty);
        │             rpc GetFilteredViews(GetFilteredViewsRequest) returns (GetFilteredViewsResponse);
        │             rpc ExecuteFilter(ExecuteFilterRequest) returns (ExecuteFilterResponse);
        │             // SystemList & Auto-Organization RPCs (NEW - 2.1)
        │             rpc GetSystemLists(GetSystemListsRequest) returns (GetSystemListsResponse);
        │             rpc GetBooksByAuthor(GetBooksByAuthorRequest) returns (GetLibraryResponse);
        │             rpc GetBooksBySeries(GetBooksBySeriesRequest) returns (GetLibraryResponse);
        │             rpc UpdateSystemList(UpdateSystemListRequest) returns (Empty);
        │             // Download Management RPCs (Enhanced - 2.2)
        │             rpc DownloadStory(DownloadStoryRequest) returns (Library);
        │             rpc BatchDownload(BatchDownloadRequest) returns (GetDownloadQueueResponse);
        │             rpc GetDownloadQueue(GetDownloadQueueRequest) returns (GetDownloadQueueResponse);
        │             rpc GetStorageUsage(GetStorageUsageRequest) returns (GetStorageUsageResponse);
        │             // Sync RPCs (Enhanced - 2.3)
        │             rpc SyncBookmarks(SyncBookmarksRequest) returns (SyncBookmarksResponse);
        │             rpc SyncAnnotations(SyncAnnotationsRequest) returns (SyncAnnotationsResponse);
        │           }
        │           ```
        ├── src/
        │   ├── types/
        │   ├── validation/
        │   ├── constants/
        │   └── proto/           # <-- Central location for all .proto (gRPC) contracts
        │       ├── users.proto
        │       ├── stories.proto
        │       ├── search.proto
        │       ├── social.proto  # +++ NEW: gRPC contract for social-service (Posts, Groups, Follows, Feeds)
        │       └── ...
        └── package.json

---

**Xem thêm:** [README](./README.md) | [Overview](./01-overview.md)
