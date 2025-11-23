package com.storysphere.storyreader.model

data class Tag(
    val id: String,
    val userId: String,
    val name: String,
    val color: String? = null,
    val icon: String? = null,
    val parentId: String? = null, // For hierarchical tags
    val order: Int = 0,
    val createdAt: Long = System.currentTimeMillis(),
    val syncStatus: SyncStatus = SyncStatus.SYNCED,
    val lastSyncedAt: Long? = null
)

