package com.storysphere.storyreader.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.storysphere.storyreader.model.ChapterComment
import com.storysphere.storyreader.model.ChapterCommentSort
import com.storysphere.storyreader.model.ForumThread
import com.storysphere.storyreader.model.ParagraphReactionType
import com.storysphere.storyreader.model.Review
import com.storysphere.storyreader.model.ReviewRatings
import com.storysphere.storyreader.repository.CommunityRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class CommunityViewModel @Inject constructor(
    private val communityRepository: CommunityRepository
) : ViewModel() {
    
    val paragraphComments = communityRepository.observeParagraphComments()
        .stateIn(viewModelScope, SharingStarted.Eagerly, emptyMap())

    val commentCounts = communityRepository.observeCommentCounts()
        .stateIn(viewModelScope, SharingStarted.Eagerly, emptyMap())

    private val chapterCommentSort = MutableStateFlow(ChapterCommentSort.NEWEST)
    val chapterCommentSortState: StateFlow<ChapterCommentSort> = chapterCommentSort.asStateFlow()

    val chapterComments = communityRepository.observeChapterComments()
        .combine(chapterCommentSort) { comments, sort ->
            when (sort) {
                ChapterCommentSort.NEWEST -> comments.sortedByDescending { it.createdAt }
                ChapterCommentSort.MOST_LIKED -> comments.sortedByDescending { it.likeCount }
                ChapterCommentSort.AUTHOR -> comments.sortedByDescending { it.isAuthor }
            }
        }
        .stateIn(viewModelScope, SharingStarted.Eagerly, emptyList())

    val reviews = communityRepository.observeReviews()
        .stateIn(viewModelScope, SharingStarted.Eagerly, emptyList())

    val forumThreads = communityRepository.observeForumThreads()
        .stateIn(viewModelScope, SharingStarted.Eagerly, emptyList())
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    fun bindChapter(chapterId: String) {
        viewModelScope.launch {
            _isLoading.value = true
            communityRepository.refreshParagraphComments(chapterId)
            communityRepository.loadCommentCounts(chapterId)
            communityRepository.refreshChapterComments(chapterId)
                _isLoading.value = false
            }
        }

    fun bindStory(storyId: String) {
        viewModelScope.launch {
            communityRepository.refreshReviews(storyId)
            communityRepository.refreshForumThreads(storyId)
        }
    }
    
    fun openParagraphThread(chapterId: String, paragraphIndex: Int) {
        viewModelScope.launch {
            communityRepository.refreshParagraphComments(chapterId, paragraphIndex)
        }
    }

    fun createParagraphComment(
        chapterId: String,
        paragraphIndex: Int,
        content: String,
        reactionType: ParagraphReactionType? = null
    ) {
        viewModelScope.launch {
            communityRepository.createParagraphComment(
                chapterId = chapterId,
                paragraphIndex = paragraphIndex,
                content = content,
                reactionType = reactionType
            )
        }
    }
    
    fun likeParagraphComment(commentId: String) {
        viewModelScope.launch {
            communityRepository.likeParagraphComment(commentId)
        }
    }

    fun submitChapterComment(chapterId: String, storyId: String, content: String) {
        viewModelScope.launch {
            communityRepository.createChapterComment(chapterId, storyId, content)
        }
    }

    fun voteChapterComment(commentId: String, isUpVote: Boolean) {
        viewModelScope.launch {
            communityRepository.voteChapterComment(commentId, isUpVote)
            }
        }

    fun setChapterCommentSort(sort: ChapterCommentSort) {
        chapterCommentSort.value = sort
    }

    fun submitReview(storyId: String, content: String, ratings: ReviewRatings) {
        viewModelScope.launch {
            communityRepository.createReview(storyId, content, ratings)
        }
    }

    fun voteReviewHelpful(reviewId: String, isHelpful: Boolean) {
        viewModelScope.launch {
            communityRepository.voteReviewHelpful(reviewId, isHelpful)
        }
    }

    fun createForumThread(storyId: String, title: String, body: String, tagId: String?) {
        viewModelScope.launch {
            communityRepository.createForumThread(storyId, title, body, tagId)
        }
    }

    fun replyToForumThread(threadId: String, content: String) {
        viewModelScope.launch {
            communityRepository.replyToForumThread(threadId, content)
        }
    }
}

