package com.storysphere.storyreader.model

data class ForumTag(
    val id: String,
    val label: String
)

data class ForumPost(
    val id: String,
    val threadId: String,
    val userId: String,
    val username: String,
    val content: String,
    val createdAt: Long = System.currentTimeMillis(),
    val isAuthor: Boolean = false
)

data class ForumThread(
    val id: String,
    val storyId: String,
    val title: String,
    val body: String,
    val userId: String,
    val username: String,
    val tag: ForumTag? = null,
    val replyCount: Int = 0,
    val createdAt: Long = System.currentTimeMillis(),
    val posts: List<ForumPost> = emptyList()
)

