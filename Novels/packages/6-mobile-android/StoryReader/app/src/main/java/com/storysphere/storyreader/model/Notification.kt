package com.storysphere.storyreader.model

data class Notification(
    val id: String,
    val userId: String,
    val type: NotificationType,
    val title: String,
    val message: String,
    val relatedId: String? = null, // Story ID, Chapter ID, Comment ID, etc.
    val isRead: Boolean = false,
    val createdAt: Long = System.currentTimeMillis()
)

enum class NotificationType {
    COMMENT_REPLY,
    STORY_UPDATE,
    CHAPTER_NEW,
    FOLLOW,
    LIKE,
    TIP,
    SYSTEM
}

