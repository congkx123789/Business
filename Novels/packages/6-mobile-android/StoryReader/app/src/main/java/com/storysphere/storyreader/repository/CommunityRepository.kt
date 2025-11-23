package com.storysphere.storyreader.repository

import com.storysphere.storyreader.database.AppDatabase
import com.storysphere.storyreader.model.ChapterComment
import com.storysphere.storyreader.model.ForumPost
import com.storysphere.storyreader.model.ForumThread
import com.storysphere.storyreader.model.ParagraphComment
import com.storysphere.storyreader.model.ParagraphReactionType
import com.storysphere.storyreader.model.Review
import com.storysphere.storyreader.model.ReviewRatings
import com.storysphere.storyreader.network.GraphQLService
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class CommunityRepository @Inject constructor(
    private val database: AppDatabase,
    private val graphQLService: GraphQLService
) {
    private val backgroundScope = CoroutineScope(SupervisorJob())
    private val paragraphComments = MutableStateFlow<Map<Int, List<ParagraphComment>>>(emptyMap())
    private val chapterComments = MutableStateFlow<List<ChapterComment>>(emptyList())
    private val reviews = MutableStateFlow<List<Review>>(emptyList())
    private val forumThreads = MutableStateFlow<List<ForumThread>>(emptyList())
    private val _activeChapterId = MutableStateFlow<String?>(null)

    fun observeParagraphComments(): Flow<Map<Int, List<ParagraphComment>>> = paragraphComments.asStateFlow()

    fun observeCommentCounts(): Flow<Map<Int, Int>> = paragraphComments.map { grouped ->
        grouped.mapValues { it.value.size }
    }

    suspend fun refreshParagraphComments(chapterId: String, paragraphIndex: Int? = null) {
        if (_activeChapterId.value != chapterId && paragraphIndex == null) {
            paragraphComments.value = emptyMap()
        }
        _activeChapterId.value = chapterId
        graphQLService.getParagraphComments(chapterId, paragraphIndex).fold(
            onSuccess = { comments ->
                val grouped = comments.groupBy { it.paragraphIndex }
                if (paragraphIndex == null) {
                    paragraphComments.value = grouped
                } else {
                    paragraphComments.update { current ->
                        current.toMutableMap().apply { putAll(grouped) }
                    }
                }
            },
            onFailure = { error ->
                println("Failed to refresh paragraph comments: ${error.message}")
            }
        )
    }

    suspend fun createParagraphComment(
        chapterId: String,
        paragraphIndex: Int,
        content: String,
        reactionType: ParagraphReactionType? = null
    ): Result<Unit> {
        return graphQLService.createParagraphComment(
            chapterId = chapterId,
            paragraphIndex = paragraphIndex,
            content = content,
            reactionType = reactionType
        ).onSuccess {
            val newComment = ParagraphComment(
                id = "local-${System.currentTimeMillis()}",
                chapterId = chapterId,
                paragraphIndex = paragraphIndex,
                userId = "me",
                username = "You",
                content = content,
                reaction = reactionType
            )
            paragraphComments.update { current ->
                current.toMutableMap().apply {
                    val updatedList = get(paragraphIndex).orEmpty() + newComment
                    put(paragraphIndex, updatedList)
                }
            }
        }
    }

    suspend fun likeParagraphComment(commentId: String): Result<Unit> {
        return graphQLService.likeParagraphComment(commentId).onSuccess {
            paragraphComments.update { current ->
                current.mapValues { entry ->
                    entry.value.map { comment ->
                        if (comment.id == commentId) {
                            comment.copy(likeCount = comment.likeCount + 1)
                        } else comment
                    }
                }
            }
    }
    }

    suspend fun replyToParagraphComment(commentId: String, content: String): Result<Unit> {
        return graphQLService.replyToParagraphComment(commentId, content)
    }

    suspend fun loadCommentCounts(chapterId: String) {
                    graphQLService.getParagraphCommentCounts(chapterId).fold(
                        onSuccess = { counts ->
                paragraphComments.update { current ->
                    val merged = current.toMutableMap()
                    counts.forEach { (index, count) ->
                        if (!merged.containsKey(index)) {
                            merged[index] = emptyList()
                        }
                        val existing = merged[index].orEmpty()
                        if (existing.size != count) {
                            merged[index] = existing
                        }
                    }
                    merged
                }
                        },
            onFailure = { error ->
                println("Failed to load comment counts: ${error.message}")
                }
        )
    }

    fun observeChapterComments(): Flow<List<ChapterComment>> = chapterComments.asStateFlow()
    fun observeReviews(): Flow<List<Review>> = reviews.asStateFlow()
    fun observeForumThreads(): Flow<List<ForumThread>> = forumThreads.asStateFlow()

    suspend fun refreshChapterComments(chapterId: String) {
        graphQLService.getChapterComments(chapterId).fold(
            onSuccess = { comments -> chapterComments.value = comments },
            onFailure = { error -> println("Failed to load chapter comments: ${error.message}") }
        )
    }
    
    suspend fun createChapterComment(
        chapterId: String,
        storyId: String,
        content: String
    ): Result<Unit> {
        return graphQLService.createChapterComment(chapterId, content).onSuccess {
            val newComment = ChapterComment(
                id = "local-${System.currentTimeMillis()}",
                chapterId = chapterId,
                storyId = storyId,
                userId = "me",
                username = "You",
                content = content
            )
            chapterComments.update { current -> listOf(newComment) + current }
        }
    }

    suspend fun voteChapterComment(commentId: String, isUpVote: Boolean): Result<Unit> {
        return graphQLService.voteChapterComment(commentId, isUpVote).onSuccess {
            chapterComments.update { current ->
                current.map { comment ->
                    if (comment.id == commentId) {
                        if (isUpVote) {
                            comment.copy(likeCount = comment.likeCount + 1)
                        } else {
                            comment.copy(dislikeCount = comment.dislikeCount + 1)
                        }
                    } else comment
                }
            }
        }
    }
    
    // Tipping
    suspend fun createTip(
        storyId: String,
        authorId: String,
        amount: Int,
        message: String? = null
    ): Result<com.storysphere.storyreader.model.Tip> {
        return graphQLService.createTip(storyId, authorId, amount, message)
    }

    fun getFanRankings(
        storyId: String? = null,
        authorId: String? = null
    ): Flow<List<com.storysphere.storyreader.model.TipSupporter>> {
        val cache = MutableStateFlow<List<com.storysphere.storyreader.model.TipSupporter>>(emptyList())
                backgroundScope.launch {
            graphQLService.getFanRankings(storyId, authorId).onSuccess { cache.value = it }
        }
        return cache.asStateFlow()
    }
    
    suspend fun castMonthlyVote(storyId: String, votes: Int): Result<Unit> {
        return graphQLService.castMonthlyVote(storyId, votes)
    }

    suspend fun refreshReviews(storyId: String) {
        graphQLService.getReviews(storyId).fold(
            onSuccess = { reviews.value = it },
            onFailure = { error -> println("Failed to load reviews: ${error.message}") }
        )
    }

    suspend fun createReview(
        storyId: String,
        content: String,
        ratings: ReviewRatings
    ): Result<Unit> {
        return graphQLService.createReview(storyId, content, ratings).onSuccess {
            val review = Review(
                id = "local-${System.currentTimeMillis()}",
                storyId = storyId,
                userId = "me",
                username = "You",
                content = content,
                ratings = ratings
            )
            reviews.update { listOf(review) + it }
        }
    }

    suspend fun voteReviewHelpful(reviewId: String, isHelpful: Boolean): Result<Unit> {
        return graphQLService.voteReviewHelpful(reviewId, isHelpful).onSuccess {
            reviews.update { current ->
                current.map { review ->
                    if (review.id == reviewId) {
                        if (isHelpful) {
                            review.copy(likeCount = review.likeCount + 1)
                        } else {
                            review.copy(dislikeCount = review.dislikeCount + 1)
                        }
                    } else review
                }
            }
        }
    }

    suspend fun refreshForumThreads(storyId: String) {
        graphQLService.getForumThreads(storyId).fold(
            onSuccess = { forumThreads.value = it },
            onFailure = { error -> println("Failed to load forum threads: ${error.message}") }
        )
    }

    suspend fun createForumThread(storyId: String, title: String, body: String, tagId: String?): Result<Unit> {
        return graphQLService.createForumThread(storyId, title, body, tagId).onSuccess {
            val thread = ForumThread(
                id = "local-${System.currentTimeMillis()}",
                storyId = storyId,
                title = title,
                body = body,
                userId = "me",
                username = "You"
            )
            forumThreads.update { listOf(thread) + it }
        }
    }

    suspend fun replyToForumThread(threadId: String, content: String): Result<Unit> {
        return graphQLService.replyToForumThread(threadId, content).onSuccess {
            forumThreads.update { current ->
                current.map { thread ->
                    if (thread.id == threadId) {
                        val reply = ForumPost(
                            id = "local-reply-${System.currentTimeMillis()}",
                            threadId = threadId,
                            userId = "me",
                            username = "You",
                            content = content
                        )
                        thread.copy(
                            posts = thread.posts + reply,
                            replyCount = thread.replyCount + 1
                        )
                    } else thread
                }
            }
        }
    }
}
