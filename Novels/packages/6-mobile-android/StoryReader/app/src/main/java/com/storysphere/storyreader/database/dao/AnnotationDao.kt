package com.storysphere.storyreader.database.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.storysphere.storyreader.database.entity.AnnotationEntity
import com.storysphere.storyreader.model.SyncStatus
import kotlinx.coroutines.flow.Flow

@Dao
interface AnnotationDao {
    @Query("SELECT * FROM annotations WHERE userId = :userId AND (:chapterId IS NULL OR chapterId = :chapterId) ORDER BY createdAt DESC")
    fun getAnnotations(userId: String, chapterId: String? = null): Flow<List<AnnotationEntity>>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAnnotation(annotation: AnnotationEntity)
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAnnotations(annotations: List<AnnotationEntity>)
    
    @Query("UPDATE annotations SET syncStatus = :syncStatus, lastSyncedAt = :lastSyncedAt WHERE id = :id")
    suspend fun updateSyncStatus(id: String, syncStatus: com.storysphere.storyreader.model.SyncStatus, lastSyncedAt: Long?)
    
    @Query("DELETE FROM annotations WHERE id = :id")
    suspend fun deleteAnnotation(id: String)

    @Query("SELECT * FROM annotations WHERE userId = :userId AND syncStatus = :syncStatus")
    suspend fun getAnnotationsByStatus(
        userId: String,
        syncStatus: SyncStatus = SyncStatus.PENDING
    ): List<AnnotationEntity>
}

