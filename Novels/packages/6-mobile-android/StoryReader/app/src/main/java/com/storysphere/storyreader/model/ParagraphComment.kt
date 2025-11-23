package com.storysphere.storyreader.model

enum class ParagraphReactionType(val emoji: String) {
    LIKE("👍"),
    LAUGH("😂"),
    CRY("😭"),
    ANGRY("😡"),
    WOW("😮"),
    LOVE("❤️")
}

data class ParagraphComment(
    val id: String,
    val chapterId: String,
    val paragraphIndex: Int,
    val userId: String,
    val username: String,
    val avatarUrl: String? = null,
    val content: String,
    val reaction: ParagraphReactionType? = null,
    val reactionBreakdown: Map<ParagraphReactionType, Int> = emptyMap(),
    val likeCount: Int = 0,
    val isAuthor: Boolean = false,
    val createdAt: Long = System.currentTimeMillis()
)


