package com.storysphere.storyreader.database.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.storysphere.storyreader.database.entity.ReadingProgressEntity
import com.storysphere.storyreader.model.SyncStatus
import kotlinx.coroutines.flow.Flow

@Dao
interface ReadingProgressDao {
    @Query("SELECT * FROM reading_progress WHERE userId = :userId AND storyId = :storyId")
    suspend fun getProgress(userId: String, storyId: String): ReadingProgressEntity?
    
    @Query("SELECT * FROM reading_progress WHERE userId = :userId AND storyId = :storyId")
    fun getProgressFlow(userId: String, storyId: String): Flow<ReadingProgressEntity?>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertProgress(progress: ReadingProgressEntity)
    
    @Query("DELETE FROM reading_progress WHERE userId = :userId AND storyId = :storyId")
    suspend fun deleteProgress(userId: String, storyId: String)

    @Query("SELECT * FROM reading_progress WHERE userId = :userId AND syncStatus = :syncStatus")
    suspend fun getProgressByStatus(
        userId: String,
        syncStatus: SyncStatus = SyncStatus.PENDING
    ): List<ReadingProgressEntity>
    
    @Query("SELECT * FROM reading_progress WHERE userId = :userId")
    suspend fun getAllProgressByUserId(userId: String): List<ReadingProgressEntity>
}

