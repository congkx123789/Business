package com.storysphere.storyreader.database.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.storysphere.storyreader.model.DownloadStatus

@Entity(tableName = "chapter_metadata")
data class ChapterMetadataEntity(
    @PrimaryKey val id: String,
    val storyId: String,
    val title: String,
    val order: Int,
    val contentFilePath: String? = null, // Path to encrypted content file (NOT content itself)
    val wordCount: Int = 0,
    val isPaid: Boolean = false,
    val price: Int? = null, // Price in points
    val isUnlocked: Boolean = false,
    val isDownloaded: Boolean = false,
    val downloadStatus: DownloadStatus = DownloadStatus.NOT_DOWNLOADED,
    val downloadProgress: Int = 0,
    val lastDownloadedAt: Long? = null,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)

