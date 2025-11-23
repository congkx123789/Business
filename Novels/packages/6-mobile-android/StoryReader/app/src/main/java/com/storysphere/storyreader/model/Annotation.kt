package com.storysphere.storyreader.model

data class Annotation(
    val id: String,
    val userId: String,
    val storyId: String,
    val chapterId: String,
    val startPosition: Int,
    val endPosition: Int,
    val selectedText: String,
    val note: String? = null,
    val color: String? = null,
    val tags: List<String> = emptyList(),
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis(),
    val syncStatus: SyncStatus = SyncStatus.SYNCED,
    val lastSyncedAt: Long? = null
)

