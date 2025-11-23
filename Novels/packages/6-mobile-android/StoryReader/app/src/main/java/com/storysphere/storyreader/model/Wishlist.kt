package com.storysphere.storyreader.model

data class Wishlist(
    val id: String,
    val userId: String,
    val storyId: String,
    val addedAt: Long = System.currentTimeMillis(),
    val syncStatus: SyncStatus = SyncStatus.SYNCED,
    val lastSyncedAt: Long? = null
)

