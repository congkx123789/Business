package com.storysphere.storyreader.model

data class Chapter(
    val id: String,
    val storyId: String,
    val title: String,
    val order: Int,
    val content: String? = null, // Content loaded from encrypted file
    val contentFilePath: String? = null, // Path to encrypted content file
    val wordCount: Int = 0,
    val isPaid: Boolean = false,
    val price: Int? = null, // Price in points
    val isUnlocked: Boolean = false,
    val downloadStatus: DownloadStatus = DownloadStatus.NOT_DOWNLOADED,
    val downloadProgress: Int = 0,
    val lastDownloadedAt: Long? = null,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)

enum class DownloadStatus {
    NOT_DOWNLOADED,
    QUEUED,
    DOWNLOADING,
    DOWNLOADED,
    FAILED
}

