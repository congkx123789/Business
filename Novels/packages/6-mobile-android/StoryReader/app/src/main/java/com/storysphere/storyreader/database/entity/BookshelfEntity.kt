package com.storysphere.storyreader.database.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import androidx.room.TypeConverters
import com.storysphere.storyreader.database.converter.StringListConverter
import com.storysphere.storyreader.model.SyncStatus

@Entity(tableName = "bookshelves")
@TypeConverters(StringListConverter::class)
data class BookshelfEntity(
    @PrimaryKey val id: String,
    val userId: String,
    val name: String,
    val description: String? = null,
    val color: String? = null,
    val icon: String? = null,
    val storyIds: List<String> = emptyList(),
    val order: Int = 0,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis(),
    val syncStatus: SyncStatus = SyncStatus.SYNCED,
    val lastSyncedAt: Long? = null
)

