package com.storysphere.storyreader.network

import com.apollographql.apollo3.ApolloClient
import com.apollographql.apollo3.api.ApolloCall
import com.apollographql.apollo3.api.ApolloResponse
import com.apollographql.apollo3.api.Optional
import com.apollographql.apollo3.api.Operation
import com.storysphere.storyreader.AddToLibraryMutation
import com.storysphere.storyreader.ActivityFeedQuery
import com.storysphere.storyreader.BookClubScheduleQuery
import com.storysphere.storyreader.ChallengeProgressQuery
import com.storysphere.storyreader.CreateAnnotationMutation
import com.storysphere.storyreader.CreateBookmarkMutation
import com.storysphere.storyreader.DeleteAnnotationMutation
import com.storysphere.storyreader.DeleteBookmarkMutation
import com.storysphere.storyreader.FriendChallengeProgressQuery
import com.storysphere.storyreader.GetAnnotationsQuery
import com.storysphere.storyreader.GetBookmarksQuery
import com.storysphere.storyreader.GetChapterQuery
import com.storysphere.storyreader.GetChaptersQuery
import com.storysphere.storyreader.GetLibraryQuery
import com.storysphere.storyreader.GetReadingPreferencesQuery
import com.storysphere.storyreader.GetReadingProgressQuery
import com.storysphere.storyreader.GetStoriesQuery
import com.storysphere.storyreader.GetStoryQuery
import com.storysphere.storyreader.ReadingStatisticsQuery
import com.storysphere.storyreader.RemoveFromLibraryMutation
import com.storysphere.storyreader.SetReadingGoalMutation
import com.storysphere.storyreader.UpdateAnnotationMutation
import com.storysphere.storyreader.UpdateReadingChallengeProgressMutation
import com.storysphere.storyreader.UpdateReadingPreferencesMutation
import com.storysphere.storyreader.UpdateReadingProgressMutation
import com.storysphere.storyreader.model.Annotation
import com.storysphere.storyreader.model.Bookmark
import com.storysphere.storyreader.model.BookClubScheduleItem
import com.storysphere.storyreader.model.ChallengeParticipant
import com.storysphere.storyreader.model.ChallengeProgress
import com.storysphere.storyreader.model.Chapter
import com.storysphere.storyreader.model.ChapterComment
import com.storysphere.storyreader.model.ForumPost
import com.storysphere.storyreader.model.ForumTag
import com.storysphere.storyreader.model.ForumThread
import com.storysphere.storyreader.model.ParagraphComment
import com.storysphere.storyreader.model.ParagraphReactionType
import com.storysphere.storyreader.model.Review
import com.storysphere.storyreader.model.ReviewRatings
import com.storysphere.storyreader.model.Library
import com.storysphere.storyreader.model.ReadingPreferences
import com.storysphere.storyreader.model.ReadingProgress
import com.storysphere.storyreader.model.ActivityFeed
import com.storysphere.storyreader.model.ActivityFeedItem
import com.storysphere.storyreader.model.ReadingChallenge
import com.storysphere.storyreader.model.ReadingGoal
import com.storysphere.storyreader.model.ReadingStatistics
import com.storysphere.storyreader.model.Story
import com.storysphere.storyreader.model.SyncStatus
import com.storysphere.storyreader.model.BackgroundMode
import com.storysphere.storyreader.model.ReadingMode
import com.storysphere.storyreader.model.StoryStatus
import com.storysphere.storyreader.type.AnnotationInput
import com.storysphere.storyreader.type.AnnotationUpdateInput
import com.storysphere.storyreader.type.BookmarkInput
import com.storysphere.storyreader.type.ReadingPreferencesInput
import com.storysphere.storyreader.type.ReadingProgressInput
import javax.inject.Inject
import javax.inject.Singleton
import java.time.OffsetDateTime

@Singleton
class GraphQLService @Inject constructor(
    private val apolloClient: ApolloClient
) {
    // region Stories
    suspend fun getStory(id: String): Result<Story> =
        apolloClient.query(GetStoryQuery(id))
            .toResult { data ->
                val story = data.story ?: throw GraphQLException("Story $id not found")
                story.toDomain()
            }

    suspend fun getStories(limit: Int = 20, offset: Int = 0): Result<List<Story>> =
        apolloClient.query(
            GetStoriesQuery(
                limit = Optional.presentIfNotNull(limit),
                offset = Optional.presentIfNotNull(offset)
            )
        ).toResult { data -> data.stories.map { it.toDomain() } }
    // endregion
    
    private fun mockParagraphComments(chapterId: String): List<ParagraphComment> {
        return listOf(
            ParagraphComment(
                id = "pc-1",
                chapterId = chapterId,
                paragraphIndex = 0,
                userId = "user-iron",
                username = "Iron Quill",
                content = "This cliffhanger is brutal. The author really knows how to build tension.",
                reaction = ParagraphReactionType.WOW,
                reactionBreakdown = mapOf(
                    ParagraphReactionType.WOW to 12,
                    ParagraphReactionType.LOVE to 4
                ),
                likeCount = 18,
                isAuthor = false
            ),
            ParagraphComment(
                id = "pc-2",
                chapterId = chapterId,
                paragraphIndex = 2,
                userId = "user-lotus",
                username = "Lotus Bloom",
                content = "Foreshadowing spotted! The jade pendant is clearly more than a keepsake.",
                reaction = ParagraphReactionType.LIKE,
                reactionBreakdown = mapOf(
                    ParagraphReactionType.LIKE to 9,
                    ParagraphReactionType.WOW to 2
                ),
                likeCount = 11,
                isAuthor = false
            ),
            ParagraphComment(
                id = "pc-3",
                chapterId = chapterId,
                paragraphIndex = 2,
                userId = "author-1",
                username = "Author",
                content = "Fun fact: this paragraph was rewritten five times to get the tone right.",
                reaction = ParagraphReactionType.LOVE,
                reactionBreakdown = mapOf(
                    ParagraphReactionType.LOVE to 21
                ),
                likeCount = 24,
                isAuthor = true
            )
        )
    }

private fun mockChapterComments(chapterId: String): List<ChapterComment> {
    val baseTime = System.currentTimeMillis()
    return listOf(
        ChapterComment(
            id = "cc-1",
            chapterId = chapterId,
            storyId = "story-1",
            userId = "reader-alpha",
            username = "Reader Alpha",
            content = "Incredible pacing. The duel felt cinematic and I could picture every move.",
            likeCount = 42,
            dislikeCount = 3,
            createdAt = baseTime - 1000 * 60 * 60
        ),
        ChapterComment(
            id = "cc-2",
            chapterId = chapterId,
            storyId = "story-1",
            userId = "author-1",
            username = "Author",
            content = "Thanks for reading! Fun fact: this chapter was inspired by a wuxia film I rewatched last year.",
            likeCount = 65,
            dislikeCount = 1,
            isAuthor = true,
            createdAt = baseTime - 1000 * 60 * 20,
            replies = listOf(
                ChapterComment(
                    id = "cc-2-r1",
                    chapterId = chapterId,
                    storyId = "story-1",
                    userId = "reader-bravo",
                    username = "Reader Bravo",
                    content = "Please keep the trivia coming, it's awesome seeing the inspirations!",
                    likeCount = 12,
                    createdAt = baseTime - 1000 * 60 * 10
                )
            )
        )
    )
}

private fun mockReviews(storyId: String): List<Review> {
    return listOf(
        Review(
            id = "review-1",
            storyId = storyId,
            userId = "reader-omega",
            username = "Reader Omega",
            content = "Solid character growth and the politics remain gripping. Writing quality really jumped after chapter 200.",
            ratings = ReviewRatings(
                plot = 5,
                characters = 4,
                worldBuilding = 4,
                writingStyle = 5
            ),
            likeCount = 32,
            dislikeCount = 1
        ),
        Review(
            id = "review-2",
            storyId = storyId,
            userId = "reader-delta",
            username = "Reader Delta",
            content = "Great premise but pacing slows in the middle arcs. Still worth sticking with for the payoffs.",
            ratings = ReviewRatings(
                plot = 4,
                characters = 3,
                worldBuilding = 5,
                writingStyle = 3
            ),
            likeCount = 12,
            dislikeCount = 3
        )
    )
}

private fun mockForumThreads(storyId: String): List<ForumThread> {
    val cultivationTag = ForumTag(id = "tag-cultivation", label = "Cultivation Theory")
    val loreTag = ForumTag(id = "tag-lore", label = "Lore & Timeline")
    return listOf(
        ForumThread(
            id = "thread-1",
            storyId = storyId,
            title = "Chapter 520 speculation thread",
            body = "What do you think the jade slip actually contains? I'm leaning toward techniques from the vanished sect.",
            userId = "reader-x",
            username = "Reader X",
            tag = cultivationTag,
            replyCount = 8,
            posts = listOf(
                ForumPost(
                    id = "post-1",
                    threadId = "thread-1",
                    userId = "reader-y",
                    username = "Scholar Y",
                    content = "There's a line in chapter 400 hinting at cursed knowledge, so maybe it's forbidden techniques."
                )
            )
        ),
        ForumThread(
            id = "thread-2",
            storyId = storyId,
            title = "Timeline recap for newcomers",
            body = "Compiled a quick summary of arcs 1-5 with key factions.",
            userId = "reader-z",
            username = "Archivist Z",
            tag = loreTag,
            replyCount = 3
        )
    )
}

    // region Chapters
    suspend fun getChapter(id: String): Result<Chapter> =
        apolloClient.query(GetChapterQuery(id))
            .toResult { data ->
                val chapter = data.chapter ?: throw GraphQLException("Chapter $id not found")
                chapter.toDomain()
            }

    suspend fun getChapters(storyId: String): Result<List<Chapter>> =
        apolloClient.query(GetChaptersQuery(storyId))
            .toResult { data -> data.chapters.map { it.toDomain() } }
    // endregion

    // region Library
    suspend fun getLibrary(userId: String): Result<List<Library>> =
        apolloClient.query(GetLibraryQuery(userId))
            .toResult { data -> data.library.map { it.toDomain() } }

    suspend fun addToLibrary(userId: String, storyId: String): Result<Library> =
        apolloClient.mutation(AddToLibraryMutation(userId, storyId))
            .toResult { data -> data.addToLibrary.toDomain() }

    suspend fun removeFromLibrary(userId: String, storyId: String): Result<Boolean> =
        apolloClient.mutation(RemoveFromLibraryMutation(userId, storyId))
            .toResult { data -> data.removeFromLibrary }
    // endregion

    // region Reading Preferences
    suspend fun getReadingPreferences(userId: String): Result<ReadingPreferences?> =
        apolloClient.query(GetReadingPreferencesQuery(userId))
            .toResult { data ->
                data.readingPreferences?.let { pref ->
                    mapReadingPreferences(
                        userId = pref.userId,
                        backgroundMode = pref.backgroundColor,
                        customBackgroundColor = pref.customBackgroundColor,
                        fontSize = pref.fontSize,
                        lineHeight = pref.lineHeight,
                        readingMode = pref.readingMode,
                        brightness = pref.brightness,
                        tapToToggleControls = pref.tapToToggleControls,
                        autoHideControls = pref.autoHideControls,
                        controlsTimeout = pref.controlsTimeout,
                        syncStatus = pref.syncStatus,
                        lastSyncedAt = pref.lastSyncedAt
                    )
                }
            }

    suspend fun updateReadingPreferences(preferences: ReadingPreferences): Result<ReadingPreferences> =
        apolloClient.mutation(
            UpdateReadingPreferencesMutation(
                preferences.toInput()
            )
        ).toResult { data ->
            val pref = data.updateReadingPreferences
            mapReadingPreferences(
                userId = pref.userId,
                backgroundMode = pref.backgroundColor,
                customBackgroundColor = pref.customBackgroundColor,
                fontSize = pref.fontSize,
                lineHeight = pref.lineHeight,
                readingMode = pref.readingMode,
                brightness = pref.brightness,
                tapToToggleControls = pref.tapToToggleControls,
                autoHideControls = pref.autoHideControls,
                controlsTimeout = pref.controlsTimeout,
                syncStatus = pref.syncStatus,
                lastSyncedAt = pref.lastSyncedAt
            )
        }
    // endregion

    // region Reading Progress
    suspend fun getReadingProgress(userId: String, storyId: String): Result<ReadingProgress?> =
        apolloClient.query(GetReadingProgressQuery(userId, storyId))
            .toResult { data ->
                data.readingProgress?.let { progress ->
                    mapReadingProgress(
                        id = progress.id,
                        userId = progress.userId,
                        storyId = progress.storyId,
                        chapterId = progress.chapterId,
                        position = progress.position,
                        progressValue = progress.progress,
                        wordsPerMinute = progress.wordsPerMinute,
                        readingTime = progress.readingTime,
                        lastReadAt = progress.lastReadAt,
                        syncStatus = progress.syncStatus,
                        lastSyncedAt = progress.lastSyncedAt
                    )
                }
            }

    suspend fun updateReadingProgress(progress: ReadingProgress): Result<ReadingProgress> =
        apolloClient.mutation(
            UpdateReadingProgressMutation(progress.toInput())
        ).toResult { data ->
            val payload = data.updateReadingProgress
            mapReadingProgress(
                id = payload.id,
                userId = payload.userId,
                storyId = payload.storyId,
                chapterId = payload.chapterId,
                position = payload.position,
                progressValue = payload.progress,
                wordsPerMinute = payload.wordsPerMinute,
                readingTime = payload.readingTime,
                lastReadAt = payload.lastReadAt,
                syncStatus = payload.syncStatus,
                lastSyncedAt = payload.lastSyncedAt
            )
        }
    // endregion

    // region Bookmarks
    suspend fun getBookmarks(userId: String, storyId: String? = null): Result<List<Bookmark>> =
        apolloClient.query(
            GetBookmarksQuery(
                userId = userId,
                storyId = Optional.presentIfNotNull(storyId)
            )
        ).toResult { data ->
            data.bookmarks.map { bookmark ->
                mapBookmark(
                    id = bookmark.id,
                    userId = bookmark.userId,
                    storyId = bookmark.storyId,
                    chapterId = bookmark.chapterId,
                    position = bookmark.position,
                    note = bookmark.note,
                    createdAt = bookmark.createdAt,
                    syncStatus = bookmark.syncStatus,
                    lastSyncedAt = bookmark.lastSyncedAt
                )
            }
        }

    suspend fun createBookmark(bookmark: Bookmark): Result<Bookmark> =
        apolloClient.mutation(
            CreateBookmarkMutation(bookmark.toInput())
        ).toResult { data ->
            val payload = data.createBookmark
            mapBookmark(
                id = payload.id,
                userId = payload.userId,
                storyId = payload.storyId,
                chapterId = payload.chapterId,
                position = payload.position,
                note = payload.note,
                createdAt = payload.createdAt,
                syncStatus = payload.syncStatus,
                lastSyncedAt = payload.lastSyncedAt
            )
        }

    suspend fun deleteBookmark(bookmarkId: String): Result<Boolean> =
        apolloClient.mutation(DeleteBookmarkMutation(bookmarkId))
            .toResult { data -> data.deleteBookmark }
    // endregion

    // region Annotations
    suspend fun getAnnotations(userId: String, chapterId: String? = null): Result<List<Annotation>> =
        apolloClient.query(
            GetAnnotationsQuery(
                userId = userId,
                chapterId = Optional.presentIfNotNull(chapterId)
            )
        ).toResult { data ->
            data.annotations.map { annotation ->
                mapAnnotation(
                    id = annotation.id,
                    userId = annotation.userId,
                    storyId = annotation.storyId,
                    chapterId = annotation.chapterId,
                    startPosition = annotation.startPosition,
                    endPosition = annotation.endPosition,
                    selectedText = annotation.selectedText,
                    note = annotation.note,
                    color = annotation.color,
                    tags = annotation.tags,
                    createdAt = annotation.createdAt,
                    updatedAt = annotation.updatedAt,
                    syncStatus = annotation.syncStatus,
                    lastSyncedAt = annotation.lastSyncedAt
                )
            }
        }

    suspend fun createAnnotation(annotation: Annotation): Result<Annotation> =
        apolloClient.mutation(CreateAnnotationMutation(annotation.toInput()))
            .toResult { data ->
                val payload = data.createAnnotation
                mapAnnotation(
                    id = payload.id,
                    userId = payload.userId,
                    storyId = payload.storyId,
                    chapterId = payload.chapterId,
                    startPosition = payload.startPosition,
                    endPosition = payload.endPosition,
                    selectedText = payload.selectedText,
                    note = payload.note,
                    color = payload.color,
                    tags = payload.tags,
                    createdAt = payload.createdAt,
                    updatedAt = payload.updatedAt,
                    syncStatus = payload.syncStatus,
                    lastSyncedAt = payload.lastSyncedAt
                )
            }

    suspend fun updateAnnotation(annotation: Annotation): Result<Annotation> =
        apolloClient.mutation(
            UpdateAnnotationMutation(annotation.toUpdateInput())
        ).toResult { data ->
            val payload = data.updateAnnotation
            mapAnnotation(
                id = payload.id,
                userId = payload.userId,
                storyId = payload.storyId,
                chapterId = payload.chapterId,
                startPosition = payload.startPosition,
                endPosition = payload.endPosition,
                selectedText = payload.selectedText,
                note = payload.note,
                color = payload.color,
                tags = payload.tags,
                createdAt = payload.createdAt,
                updatedAt = payload.updatedAt,
                syncStatus = payload.syncStatus,
                lastSyncedAt = payload.lastSyncedAt
            )
        }

    suspend fun deleteAnnotation(annotationId: String): Result<Boolean> =
        apolloClient.mutation(DeleteAnnotationMutation(annotationId))
            .toResult { data -> data.deleteAnnotation }
    // endregion

    // region Book Clubs & Reading Challenges
    suspend fun getBookClubSchedule(groupId: String): Result<List<BookClubScheduleItem>> =
        apolloClient.query(BookClubScheduleQuery(groupId))
            .toResult { data ->
                data.bookClubSchedule.map { it.toDomain() }
            }

    suspend fun getChallengeProgress(challengeId: String): Result<ChallengeProgress> =
        apolloClient.query(ChallengeProgressQuery(challengeId))
            .toResult { data ->
                val payload = data.challengeProgress
                    ?: throw GraphQLException("Challenge $challengeId not found")
                ChallengeProgress(
                    challenge = payload.challenge.toDomain(),
                    participants = payload.participants.map { it.toDomain() }
                )
            }

    suspend fun getFriendChallengeProgress(challengeId: String): Result<List<ChallengeParticipant>> =
        apolloClient.query(FriendChallengeProgressQuery(challengeId))
            .toResult { data ->
                data.friendChallengeProgress.map { it.toDomain() }
            }

    suspend fun updateReadingChallengeProgress(challengeId: String, progress: Int): Result<Boolean> =
        apolloClient.mutation(UpdateReadingChallengeProgressMutation(challengeId, progress))
            .toResult { response -> response.updateReadingChallengeProgress }

    suspend fun setReadingGoal(
        goalType: String,
        target: Int,
        timeRange: String,
        startDate: String,
        endDate: String
    ): Result<ReadingGoal> =
        apolloClient.mutation(
            SetReadingGoalMutation(
                goalType = goalType,
                target = target,
                timeRange = timeRange,
                startDate = startDate,
                endDate = endDate
            )
        ).toResult { data ->
            data.setReadingGoal.goal.toDomain()
        }

    suspend fun getActivityFeed(page: Int? = null, limit: Int? = null): Result<ActivityFeed> =
        apolloClient.query(
            ActivityFeedQuery(
                page = Optional.presentIfNotNull(page),
                limit = Optional.presentIfNotNull(limit)
            )
        ).toResult { data ->
            val feed = data.activityFeed
            ActivityFeed(
                items = feed.items.map { it.toDomain() },
                total = feed.total,
                page = feed.page,
                limit = feed.limit
            )
        }

    suspend fun getReadingStatistics(): Result<ReadingStatistics> =
        apolloClient.query(ReadingStatisticsQuery())
            .toResult { data ->
                val stats = data.readingStatistics
                ReadingStatistics(
                    activityCounts = stats.activityCounts.map {
                        ReadingStatistics.ActivityCount(
                            activityType = it.activityType,
                            count = it.count
                        )
                    },
                    activeGoals = stats.activeGoals.map { it.toDomain() }
                )
            }
    // endregion
    
    // region Community & Fan Economy
    suspend fun createParagraphComment(
        chapterId: String,
        paragraphIndex: Int,
        content: String,
        reactionType: ParagraphReactionType? = null
    ): Result<Unit> {
        // Placeholder implementation until backend endpoints are available
        return Result.success(Unit)
    }
    
    suspend fun getParagraphComments(
        chapterId: String,
        paragraphIndex: Int? = null
    ): Result<List<ParagraphComment>> {
        val comments = mockParagraphComments(chapterId)
        val filtered = paragraphIndex?.let { index ->
            comments.filter { it.paragraphIndex == index }
        } ?: comments
        return Result.success(filtered)
    }
    
    suspend fun getParagraphCommentCounts(chapterId: String): Result<Map<Int, Int>> {
        val counts = mockParagraphComments(chapterId)
            .groupingBy { it.paragraphIndex }
            .eachCount()
        return Result.success(counts)
    }
    
    suspend fun likeParagraphComment(commentId: String): Result<Unit> {
        return Result.success(Unit)
    }
    
    suspend fun replyToParagraphComment(commentId: String, content: String): Result<Unit> {
        return Result.success(Unit)
    }
    
    // region Fan Economy
    suspend fun createTip(
        storyId: String,
        authorId: String,
        amount: Int,
        message: String? = null
    ): Result<com.storysphere.storyreader.model.Tip> {
        // TODO: When backend is ready, implement GraphQL mutation:
        // apolloClient.mutation(CreateTipMutation(storyId, authorId, amount, message))
        //     .toResult { data -> data.createTip.toDomain() }
        return Result.failure(Exception("Not implemented yet"))
    }
    
    suspend fun getFanRankings(
        storyId: String? = null,
        authorId: String? = null
    ): Result<List<com.storysphere.storyreader.model.TipSupporter>> {
        // TODO: When backend is ready, implement GraphQL query:
        // apolloClient.query(GetFanRankingsQuery(storyId, authorId))
        //     .toResult { data -> data.fanRankings.map { it.toDomain() } }
        return Result.success(emptyList())
    }
    
    suspend fun castMonthlyVote(storyId: String, votes: Int): Result<Unit> {
        // TODO: When backend is ready, implement GraphQL mutation:
        // apolloClient.mutation(CastMonthlyVoteMutation(storyId, votes))
        //     .toResult { data -> Unit }
        return Result.success(Unit)
    }
    // endregion

    suspend fun getChapterComments(chapterId: String): Result<List<ChapterComment>> {
        return Result.success(mockChapterComments(chapterId))
    }

    suspend fun createChapterComment(chapterId: String, content: String): Result<Unit> {
        return Result.success(Unit)
    }

    suspend fun voteChapterComment(commentId: String, isUpVote: Boolean): Result<Unit> {
        return Result.success(Unit)
    }

    suspend fun getReviews(storyId: String): Result<List<Review>> {
        return Result.success(mockReviews(storyId))
    }

    suspend fun createReview(
        storyId: String,
        content: String,
        ratings: ReviewRatings
    ): Result<Unit> {
        return Result.success(Unit)
    }

    suspend fun voteReviewHelpful(reviewId: String, isHelpful: Boolean): Result<Unit> {
        return Result.success(Unit)
    }

    suspend fun getForumThreads(storyId: String): Result<List<ForumThread>> {
        return Result.success(mockForumThreads(storyId))
    }

    suspend fun createForumThread(
        storyId: String,
        title: String,
        body: String,
        tagId: String?
    ): Result<Unit> {
        return Result.success(Unit)
    }

    suspend fun replyToForumThread(threadId: String, content: String): Result<Unit> {
        return Result.success(Unit)
    }
    // endregion
    
    // region Monetization - Wallet
    suspend fun getWalletBalance(userId: String): Result<com.storysphere.storyreader.model.Wallet> {
        // TODO: When backend is ready, implement GraphQL query:
        // apolloClient.query(GetWalletBalanceQuery(userId))
        //     .toResult { data -> data.wallet.toDomain() }
        // For now, return mock data
        return Result.success(
            com.storysphere.storyreader.model.Wallet(
                userId = userId,
                balance = 1000, // points
                currency = "Points",
                lastUpdated = System.currentTimeMillis()
            )
        )
    }
    
    suspend fun topUpWallet(userId: String, amount: Int): Result<com.storysphere.storyreader.model.Wallet> {
        // TODO: When backend is ready, implement GraphQL mutation:
        // apolloClient.mutation(TopUpWalletMutation(userId, amount))
        //     .toResult { data -> data.topUpWallet.toDomain() }
        // For now, return mock data
        val currentBalance = getWalletBalance(userId).getOrNull()?.balance ?: 0
        return Result.success(
            com.storysphere.storyreader.model.Wallet(
                userId = userId,
                balance = currentBalance + amount,
                currency = "Points",
                lastUpdated = System.currentTimeMillis()
            )
        )
    }
    
    suspend fun getTransactionHistory(userId: String, limit: Int = 50): Result<List<com.storysphere.storyreader.model.Transaction>> {
        // TODO: When backend is ready, implement GraphQL query:
        // apolloClient.query(GetTransactionHistoryQuery(userId, limit))
        //     .toResult { data -> data.transactions.map { it.toDomain() } }
        // For now, return empty list
        return Result.success(emptyList())
    }
    // endregion
    
    // region Monetization - Paywall (PPC)
    suspend fun purchaseChapter(chapterId: String): Result<Chapter> {
        // TODO: When backend is ready, implement GraphQL mutation:
        // apolloClient.mutation(PurchaseChapterMutation(chapterId))
        //     .toResult { data -> data.purchaseChapter.chapter.toDomain() }
        // For now, return the chapter (assuming it's already unlocked)
        return getChapter(chapterId)
    }
    
    suspend fun purchaseBulk(chapterIds: List<String>): Result<List<Chapter>> {
        // TODO: When backend is ready, implement GraphQL mutation:
        // apolloClient.mutation(PurchaseBulkChaptersMutation(chapterIds))
        //     .toResult { data -> data.purchaseBulkChapters.map { it.toDomain() } }
        // For now, fetch chapters individually
        val results = chapterIds.mapNotNull { getChapter(it).getOrNull() }
        return Result.success(results)
    }
    
    suspend fun getPurchaseHistory(userId: String): Result<List<Chapter>> {
        // TODO: When backend is ready, implement GraphQL query:
        // apolloClient.query(GetPurchaseHistoryQuery(userId))
        //     .toResult { data -> data.purchasedChapters.map { it.toDomain() } }
        // For now, return empty list
        return Result.success(emptyList())
    }
    // endregion
    
    // region Monetization - Subscriptions
    suspend fun getMembership(userId: String): Result<com.storysphere.storyreader.model.Membership?> {
        // TODO: When backend is ready, implement GraphQL query:
        // apolloClient.query(GetMembershipQuery(userId))
        //     .toResult { data -> data.membership?.toDomain() }
        return Result.success(null)
    }
    
    suspend fun createMembership(userId: String, planId: String): Result<com.storysphere.storyreader.model.Membership> {
        // TODO: When backend is ready, implement GraphQL mutation:
        // apolloClient.mutation(CreateMembershipMutation(userId, planId))
        //     .toResult { data -> data.createMembership.toDomain() }
        return Result.failure(Exception("Not implemented yet"))
    }
    
    suspend fun cancelMembership(userId: String): Result<Boolean> {
        // TODO: When backend is ready, implement GraphQL mutation:
        // apolloClient.mutation(CancelMembershipMutation(userId))
        //     .toResult { data -> data.cancelMembership }
        return Result.failure(Exception("Not implemented yet"))
    }
    // endregion
    
    // region Monetization - Privilege
    suspend fun purchasePrivilege(storyId: String): Result<com.storysphere.storyreader.model.Privilege> {
        // TODO: When backend is ready, implement GraphQL mutation:
        // apolloClient.mutation(PurchasePrivilegeMutation(storyId))
        //     .toResult { data -> data.purchasePrivilege.toDomain() }
        return Result.failure(Exception("Not implemented yet"))
    }
    
    suspend fun getPrivilege(storyId: String): Result<com.storysphere.storyreader.model.Privilege?> {
        // TODO: When backend is ready, implement GraphQL query:
        // apolloClient.query(GetPrivilegeQuery(storyId))
        //     .toResult { data -> data.privilege?.toDomain() }
        return Result.success(null)
    }
    
    suspend fun getAdvancedChapters(storyId: String): Result<List<Chapter>> {
        // TODO: When backend is ready, implement GraphQL query:
        // apolloClient.query(GetAdvancedChaptersQuery(storyId))
        //     .toResult { data -> data.advancedChapters.map { it.toDomain() } }
        return Result.success(emptyList())
    }
    // endregion
    
    // region Discovery & Recommendations
    suspend fun getRankings(
        rankingType: com.storysphere.storyreader.repository.RankingType,
        genre: String? = null,
        timeRange: String? = null
    ): Result<List<Story>> {
        // TODO: Implement GraphQL query for rankings
        return Result.failure(Exception("Not implemented yet"))
    }
    
    suspend fun getEditorPicks(limit: Int = 20, genre: String? = null): Result<List<Story>> {
        // TODO: Implement GraphQL query for editor picks
        return Result.failure(Exception("Not implemented yet"))
    }
    
    suspend fun getGenreStories(genre: String, page: Int = 1, limit: Int = 20): Result<List<Story>> {
        // TODO: Implement GraphQL query for genre stories
        return Result.failure(Exception("Not implemented yet"))
    }
    
    suspend fun getRecommendations(userId: String, limit: Int = 20): Result<List<Story>> {
        // TODO: Implement GraphQL query for recommendations
        return Result.failure(Exception("Not implemented yet"))
    }
    
    suspend fun getSimilarStories(storyId: String, limit: Int = 10): Result<List<Story>> {
        // TODO: Implement GraphQL query for similar stories
        return Result.failure(Exception("Not implemented yet"))
    }
    
    suspend fun getTrending(limit: Int = 20): Result<List<Story>> {
        // TODO: Implement GraphQL query for trending stories
        return Result.failure(Exception("Not implemented yet"))
    }
    // endregion
    
    // region Wishlist
    suspend fun getWishlist(userId: String): Result<List<Library>> {
        // TODO: When backend is ready, implement GraphQL query:
        // apolloClient.query(GetWishlistQuery(userId))
        //     .toResult { data -> data.wishlist.map { it.toDomain() } }
        return Result.success(emptyList())
    }
    
    suspend fun removeFromWishlist(userId: String, storyId: String): Result<Unit> {
        // TODO: When backend is ready, implement GraphQL mutation:
        // apolloClient.mutation(RemoveFromWishlistMutation(userId, storyId))
        //     .toResult { data -> Unit }
        return Result.success(Unit)
    }
    // endregion
    
    // region AI Operations
    suspend fun translateText(
        text: String,
        sourceLanguage: String,
        targetLanguage: String
    ): Result<String> {
        // TODO: When backend is ready, implement GraphQL mutation:
        // apolloClient.mutation(TranslateTextMutation(text, sourceLanguage, targetLanguage))
        //     .toResult { data -> data.translateText.translatedText }
        return Result.failure(Exception("Not implemented yet"))
    }
    
    suspend fun synthesizeSpeech(
        text: String,
        voiceId: String? = null,
        emotion: String? = null,
        speed: Float = 1.0f
    ): Result<String> { // Returns audio URL
        // TODO: When backend is ready, implement GraphQL mutation:
        // apolloClient.mutation(SynthesizeSpeechMutation(text, voiceId, emotion, speed))
        //     .toResult { data -> data.synthesizeSpeech.audioUrl }
        return Result.failure(Exception("Not implemented yet"))
    }
    
    suspend fun lookupWord(word: String, language: String = "en"): Result<com.storysphere.storyreader.model.DictionaryEntry> {
        // TODO: When backend is ready, implement GraphQL query:
        // apolloClient.query(LookupWordQuery(word, language))
        //     .toResult { data -> data.lookupWord.toDomain() }
        return Result.failure(Exception("Not implemented yet"))
    }
    
    suspend fun summarize(
        text: String,
        maxLength: Int = 200
    ): Result<String> {
        // TODO: When backend is ready, implement GraphQL mutation:
        // apolloClient.mutation(SummarizeMutation(text, maxLength))
        //     .toResult { data -> data.summarize.summary }
        return Result.failure(Exception("Not implemented yet"))
    }
    // endregion
}

// region Mapping helpers
private fun GetStoryQuery.Story.toDomain(): Story = Story(
    id = id,
    title = title,
    author = author,
    description = description,
    coverImage = coverImage,
    genreId = genreId,
    genre = genre,
    status = storyStatus.toDomain(),
    totalChapters = totalChapters,
    createdAt = createdAt.toEpochMillis(),
    updatedAt = updatedAt.toEpochMillis()
)

private fun GetStoriesQuery.Story.toDomain(): Story = Story(
    id = id,
    title = title,
    author = author,
    description = description,
    coverImage = coverImage,
    genreId = genreId,
    genre = genre,
    status = storyStatus.toDomain(),
    totalChapters = totalChapters,
    createdAt = createdAt.toEpochMillis(),
    updatedAt = updatedAt.toEpochMillis()
)

private fun GetChapterQuery.Chapter.toDomain(): Chapter = Chapter(
    id = id,
    storyId = storyId,
    title = title,
    order = order,
    content = content,
    wordCount = wordCount ?: 0,
    isPaid = isPaid,
    price = price,
    isUnlocked = isUnlocked,
    createdAt = createdAt.toEpochMillis(),
    updatedAt = updatedAt.toEpochMillis()
)

private fun GetChaptersQuery.Chapter.toDomain(): Chapter = Chapter(
    id = id,
    storyId = storyId,
    title = title,
    order = order,
    content = content,
    wordCount = wordCount ?: 0,
    isPaid = isPaid,
    price = price,
    isUnlocked = isUnlocked,
    createdAt = createdAt.toEpochMillis(),
    updatedAt = updatedAt.toEpochMillis()
)

private fun GetLibraryQuery.Library.toDomain(): Library = Library(
    id = id,
    userId = userId,
    storyId = storyId,
    addedAt = addedAt.toEpochMillis(),
    lastReadAt = lastReadAt.toEpochMillisOrNull(),
    isFavorite = isFavorite,
    syncStatus = syncStatus.toDomain(),
    lastSyncedAt = lastSyncedAt.toEpochMillisOrNull()
)

private fun BookClubScheduleQuery.BookClubSchedule.toDomain(): BookClubScheduleItem =
    BookClubScheduleItem(
        id = id,
        chapterNumber = chapterNumber,
        deadline = deadline.toOffsetDateTime(),
        discussionDate = discussionDate?.toOffsetDateTime()
    )

private fun ChallengeProgressQuery.Challenge.toDomain(): ReadingChallenge =
    ReadingChallenge(
        id = id,
        name = name,
        description = description,
        challengeType = challengeType,
        goal = goal,
        goalType = goalType,
        timeRange = timeRange,
        startDate = startDate.toOffsetDateTime(),
        endDate = endDate.toOffsetDateTime(),
        progress = progress,
        status = status,
        isPublic = isPublic
    )

private fun ChallengeProgressQuery.Participant.toDomain(): ChallengeParticipant =
    ChallengeParticipant(
        userId = userId,
        progress = progress,
        joinedAt = joinedAt.toOffsetDateTime(),
        updatedAt = updatedAt.toOffsetDateTime()
    )

private fun FriendChallengeProgressQuery.FriendChallengeProgress.toDomain(): ChallengeParticipant =
    ChallengeParticipant(
        userId = userId,
        progress = progress,
        joinedAt = joinedAt.toOffsetDateTime(),
        updatedAt = updatedAt.toOffsetDateTime()
    )

private fun SetReadingGoalMutation.Goal.toDomain(): ReadingGoal =
    ReadingGoal(
        id = id,
        goalType = goalType,
        target = target,
        current = current,
        timeRange = timeRange,
        startDate = startDate.toOffsetDateTime(),
        endDate = endDate.toOffsetDateTime(),
        status = status
    )

private fun ReadingStatisticsQuery.ActiveGoal.toDomain(): ReadingGoal =
    ReadingGoal(
        id = id,
        goalType = goalType,
        target = target,
        current = current,
        timeRange = timeRange,
        startDate = startDate.toOffsetDateTime(),
        endDate = endDate.toOffsetDateTime(),
        status = status
    )

private fun ActivityFeedQuery.Item.toDomain(): ActivityFeedItem =
    ActivityFeedItem(
        id = id ?: timestamp,
        activityType = activityType,
        timestamp = timestamp.toOffsetDateTime(),
        storyId = storyId,
        chapterId = chapterId,
        metadata = metadata?.entries?.associate { it.key to it.value }
    )

// endregion

// region Mapping utilities
private fun mapReadingPreferences(
    userId: String,
    backgroundMode: com.storysphere.storyreader.type.BackgroundMode,
    customBackgroundColor: String?,
    fontSize: Int,
    lineHeight: Double,
    readingMode: com.storysphere.storyreader.type.ReadingMode,
    brightness: Int,
    tapToToggleControls: Boolean,
    autoHideControls: Boolean,
    controlsTimeout: Long,
    syncStatus: com.storysphere.storyreader.type.SyncStatus,
    lastSyncedAt: String?
): ReadingPreferences = ReadingPreferences(
    userId = userId,
    backgroundColor = backgroundMode.toDomain(),
    customBackgroundColor = customBackgroundColor,
    fontSize = fontSize,
    lineHeight = lineHeight.toFloat(),
    readingMode = readingMode.toDomain(),
    brightness = brightness,
    tapToToggleControls = tapToToggleControls,
    autoHideControls = autoHideControls,
    controlsTimeout = controlsTimeout,
    syncStatus = syncStatus.toDomain(),
    lastSyncedAt = lastSyncedAt.toEpochMillisOrNull()
)

private fun mapReadingProgress(
    id: String,
    userId: String,
    storyId: String,
    chapterId: String,
    position: Int,
    progressValue: Float,
    wordsPerMinute: Int?,
    readingTime: Long,
    lastReadAt: String,
    syncStatus: com.storysphere.storyreader.type.SyncStatus,
    lastSyncedAt: String?
): ReadingProgress = ReadingProgress(
    id = id,
    userId = userId,
    storyId = storyId,
    chapterId = chapterId,
    position = position,
    progress = progressValue,
    wordsPerMinute = wordsPerMinute,
    readingTime = readingTime,
    lastReadAt = lastReadAt.toEpochMillis(),
    syncStatus = syncStatus.toDomain(),
    lastSyncedAt = lastSyncedAt.toEpochMillisOrNull()
)

private fun mapBookmark(
    id: String,
    userId: String,
    storyId: String,
    chapterId: String,
    position: Int,
    note: String?,
    createdAt: String,
    syncStatus: com.storysphere.storyreader.type.SyncStatus,
    lastSyncedAt: String?
): Bookmark = Bookmark(
    id = id,
    userId = userId,
    storyId = storyId,
    chapterId = chapterId,
    position = position,
    note = note,
    createdAt = createdAt.toEpochMillis(),
    syncStatus = syncStatus.toDomain(),
    lastSyncedAt = lastSyncedAt.toEpochMillisOrNull()
)

private fun mapAnnotation(
    id: String,
    userId: String,
    storyId: String,
    chapterId: String,
    startPosition: Int,
    endPosition: Int,
    selectedText: String,
    note: String?,
    color: String?,
    tags: List<String?>?,
    createdAt: String,
    updatedAt: String,
    syncStatus: com.storysphere.storyreader.type.SyncStatus,
    lastSyncedAt: String?
): Annotation = Annotation(
    id = id,
    userId = userId,
    storyId = storyId,
    chapterId = chapterId,
    startPosition = startPosition,
    endPosition = endPosition,
    selectedText = selectedText,
    note = note,
    color = color,
    tags = tags?.filterNotNull() ?: emptyList(),
    createdAt = createdAt.toEpochMillis(),
    updatedAt = updatedAt.toEpochMillis(),
    syncStatus = syncStatus.toDomain(),
    lastSyncedAt = lastSyncedAt.toEpochMillisOrNull()
)
// endregion

// region Input helpers
private fun ReadingPreferences.toInput(): ReadingPreferencesInput =
    ReadingPreferencesInput(
        userId = userId,
        backgroundColor = com.storysphere.storyreader.type.BackgroundMode.valueOf(backgroundColor.name),
        customBackgroundColor = Optional.presentIfNotNull(customBackgroundColor),
        fontSize = fontSize,
        lineHeight = lineHeight.toDouble(),
        readingMode = com.storysphere.storyreader.type.ReadingMode.valueOf(readingMode.name),
        brightness = brightness,
        tapToToggleControls = tapToToggleControls,
        autoHideControls = autoHideControls,
        controlsTimeout = controlsTimeout
    )

private fun ReadingProgress.toInput(): ReadingProgressInput =
    ReadingProgressInput(
        id = id,
        userId = userId,
        storyId = storyId,
        chapterId = chapterId,
        position = position,
        progress = progress,
        wordsPerMinute = Optional.presentIfNotNull(wordsPerMinute),
        readingTime = readingTime,
        lastReadAt = lastReadAt.toString()
    )

private fun Bookmark.toInput(): BookmarkInput =
    BookmarkInput(
        id = id,
        userId = userId,
        storyId = storyId,
        chapterId = chapterId,
        position = position,
        note = Optional.presentIfNotNull(note)
    )

private fun Annotation.toInput(): AnnotationInput =
    AnnotationInput(
        id = id,
        userId = userId,
        storyId = storyId,
        chapterId = chapterId,
        startPosition = startPosition,
        endPosition = endPosition,
        selectedText = selectedText,
        note = Optional.presentIfNotNull(note),
        color = Optional.presentIfNotNull(color),
        tags = Optional.presentIfNotNull(tags)
    )

private fun Annotation.toUpdateInput(): AnnotationUpdateInput =
    AnnotationUpdateInput(
        id = id,
        startPosition = Optional.presentIfNotNull(startPosition),
        endPosition = Optional.presentIfNotNull(endPosition),
        selectedText = Optional.presentIfNotNull(selectedText),
        note = Optional.presentIfNotNull(note),
        color = Optional.presentIfNotNull(color),
        tags = Optional.presentIfNotNull(tags)
    )
// endregion

// region Enum helpers
private fun com.storysphere.storyreader.type.StoryStatus.toDomain(): StoryStatus =
    StoryStatus.valueOf(name)

private fun com.storysphere.storyreader.type.BackgroundMode.toDomain(): BackgroundMode =
    BackgroundMode.valueOf(name)

private fun com.storysphere.storyreader.type.ReadingMode.toDomain(): ReadingMode =
    ReadingMode.valueOf(name)

private fun com.storysphere.storyreader.type.SyncStatus.toDomain(): SyncStatus =
    SyncStatus.valueOf(name)
// endregion

// region Apollo helpers
private suspend fun <D : Operation.Data, T> ApolloCall<D>.toResult(
    mapper: (D) -> T
): Result<T> {
    return runCatching {
        val response = execute()
        response.throwOnErrors()
        val data = response.data ?: throw GraphQLException("No data returned from GraphQL")
        mapper(data)
    }
}

private fun ApolloResponse<*>.throwOnErrors() {
    if (!errors.isNullOrEmpty()) {
        throw GraphQLException(errors!!.joinToString { it.message })
    }
}
// endregion

// region Utility
private fun String.toOffsetDateTime(): OffsetDateTime = OffsetDateTime.parse(this)

private fun String?.toEpochMillis(default: Long = System.currentTimeMillis()): Long =
    this?.toLongOrNull() ?: default

private fun String?.toEpochMillisOrNull(): Long? = this?.toLongOrNull()

private class GraphQLException(message: String) : RuntimeException(message)
// endregion
