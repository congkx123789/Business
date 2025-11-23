package com.storysphere.storyreader.model

data class Library(
    val id: String,
    val userId: String,
    val storyId: String,
    val addedAt: Long = System.currentTimeMillis(),
    val lastReadAt: Long? = null,
    val isFavorite: Boolean = false,
    val syncStatus: SyncStatus = SyncStatus.SYNCED,
    val lastSyncedAt: Long? = null
)

enum class SyncStatus {
    SYNCED,
    SYNCING,
    PENDING,
    CONFLICT,
    ERROR
}

