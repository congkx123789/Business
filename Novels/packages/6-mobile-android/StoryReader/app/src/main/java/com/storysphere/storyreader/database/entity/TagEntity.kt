package com.storysphere.storyreader.database.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.storysphere.storyreader.model.SyncStatus

@Entity(tableName = "tags")
data class TagEntity(
    @PrimaryKey val id: String,
    val userId: String,
    val name: String,
    val color: String? = null,
    val icon: String? = null,
    val parentId: String? = null,
    val order: Int = 0,
    val createdAt: Long = System.currentTimeMillis(),
    val syncStatus: SyncStatus = SyncStatus.SYNCED,
    val lastSyncedAt: Long? = null
)

