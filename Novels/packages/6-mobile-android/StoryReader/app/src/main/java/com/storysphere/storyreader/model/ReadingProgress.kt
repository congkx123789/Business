package com.storysphere.storyreader.model

data class ReadingProgress(
    val id: String,
    val userId: String,
    val storyId: String,
    val chapterId: String,
    val position: Int = 0, // Scroll position or page number
    val progress: Float = 0f, // 0.0 to 1.0
    val wordsPerMinute: Int? = null,
    val readingTime: Long = 0L, // milliseconds
    val lastReadAt: Long = System.currentTimeMillis(),
    val syncStatus: SyncStatus = SyncStatus.SYNCED,
    val lastSyncedAt: Long? = null
)

