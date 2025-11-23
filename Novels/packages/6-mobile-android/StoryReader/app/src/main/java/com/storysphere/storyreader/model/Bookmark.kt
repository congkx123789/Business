package com.storysphere.storyreader.model

data class Bookmark(
    val id: String,
    val userId: String,
    val storyId: String,
    val chapterId: String,
    val position: Int = 0,
    val note: String? = null,
    val createdAt: Long = System.currentTimeMillis(),
    val syncStatus: SyncStatus = SyncStatus.SYNCED,
    val lastSyncedAt: Long? = null
)

