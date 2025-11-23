package com.storysphere.storyreader.database.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.storysphere.storyreader.database.entity.ChapterMetadataEntity
import com.storysphere.storyreader.model.DownloadStatus
import kotlinx.coroutines.flow.Flow

@Dao
interface ChapterDao {
    @Query("SELECT * FROM chapter_metadata WHERE id = :id")
    suspend fun getChapter(id: String): ChapterMetadataEntity?
    
    @Query("SELECT * FROM chapter_metadata WHERE id = :id")
    fun getChapterFlow(id: String): Flow<ChapterMetadataEntity?>
    
    @Query("SELECT * FROM chapter_metadata WHERE storyId = :storyId ORDER BY `order` ASC")
    fun getChaptersByStory(storyId: String): Flow<List<ChapterMetadataEntity>>

    @Query("SELECT * FROM chapter_metadata WHERE storyId = :storyId ORDER BY `order` ASC")
    suspend fun getChaptersByStoryOnce(storyId: String): List<ChapterMetadataEntity>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertChapter(chapter: ChapterMetadataEntity)
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertChapters(chapters: List<ChapterMetadataEntity>)
    
    @Query("UPDATE chapter_metadata SET isDownloaded = :isDownloaded, contentFilePath = :filePath, downloadStatus = :status, downloadProgress = :progress, lastDownloadedAt = :lastDownloadedAt WHERE id = :id")
    suspend fun updateDownloadStatus(
        id: String,
        isDownloaded: Boolean,
        filePath: String?,
        status: DownloadStatus,
        progress: Int,
        lastDownloadedAt: Long?
    )

    @Query("UPDATE chapter_metadata SET downloadStatus = :status, downloadProgress = :progress WHERE id = :id")
    suspend fun updateDownloadProgress(
        id: String,
        status: DownloadStatus,
        progress: Int
    )
    
    @Query("UPDATE chapter_metadata SET isUnlocked = :isUnlocked WHERE id = :id")
    suspend fun updateUnlockStatus(id: String, isUnlocked: Boolean)
    
    @Query("SELECT * FROM chapter_metadata WHERE isUnlocked = 1 AND storyId IN (SELECT storyId FROM library WHERE userId = :userId) ORDER BY createdAt DESC")
    fun getPurchasedChapters(userId: String): Flow<List<ChapterMetadataEntity>>
    
    @Query("SELECT * FROM chapter_metadata WHERE storyId = :storyId AND `order` = :order")
    suspend fun getChapterByOrder(storyId: String, order: Int): ChapterMetadataEntity?
}

