package com.storysphere.storyreader.database.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.storysphere.storyreader.model.SyncStatus

@Entity(tableName = "wishlist")
data class WishlistEntity(
    @PrimaryKey val id: String,
    val userId: String,
    val storyId: String,
    val addedAt: Long = System.currentTimeMillis(),
    val syncStatus: SyncStatus = SyncStatus.SYNCED,
    val lastSyncedAt: Long? = null
)

