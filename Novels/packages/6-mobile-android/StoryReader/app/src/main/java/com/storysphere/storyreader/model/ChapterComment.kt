package com.storysphere.storyreader.model

enum class ChapterCommentSort(val label: String) {
    NEWEST("Newest"),
    MOST_LIKED("Most Liked"),
    AUTHOR("Author Replies")
}

data class ChapterComment(
    val id: String,
    val chapterId: String,
    val storyId: String,
    val userId: String,
    val username: String,
    val avatarUrl: String? = null,
    val content: String,
    val likeCount: Int = 0,
    val dislikeCount: Int = 0,
    val isAuthor: Boolean = false,
    val createdAt: Long = System.currentTimeMillis(),
    val replies: List<ChapterComment> = emptyList()
)

