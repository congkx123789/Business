package com.storysphere.storyreader.database.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.storysphere.storyreader.model.SyncStatus

@Entity(tableName = "reading_progress")
data class ReadingProgressEntity(
    @PrimaryKey val id: String,
    val userId: String,
    val storyId: String,
    val chapterId: String,
    val position: Int = 0,
    val progress: Float = 0f,
    val wordsPerMinute: Int? = null,
    val readingTime: Long = 0L,
    val lastReadAt: Long = System.currentTimeMillis(),
    val syncStatus: SyncStatus = SyncStatus.SYNCED,
    val lastSyncedAt: Long? = null
)

