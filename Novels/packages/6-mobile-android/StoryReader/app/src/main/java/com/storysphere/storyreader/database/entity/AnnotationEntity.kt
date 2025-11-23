package com.storysphere.storyreader.database.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import androidx.room.TypeConverters
import com.storysphere.storyreader.database.converter.StringListConverter
import com.storysphere.storyreader.model.SyncStatus

@Entity(tableName = "annotations")
@TypeConverters(StringListConverter::class)
data class AnnotationEntity(
    @PrimaryKey val id: String,
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

