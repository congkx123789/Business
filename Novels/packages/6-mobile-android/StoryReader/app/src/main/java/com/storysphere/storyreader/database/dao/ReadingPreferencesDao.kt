package com.storysphere.storyreader.database.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.storysphere.storyreader.database.entity.ReadingPreferencesEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface ReadingPreferencesDao {
    @Query("SELECT * FROM reading_preferences WHERE userId = :userId")
    suspend fun getPreferences(userId: String): ReadingPreferencesEntity?
    
    @Query("SELECT * FROM reading_preferences WHERE userId = :userId")
    fun getPreferencesFlow(userId: String): Flow<ReadingPreferencesEntity?>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPreferences(preferences: ReadingPreferencesEntity)
    
    @Query("UPDATE reading_preferences SET syncStatus = :syncStatus, lastSyncedAt = :lastSyncedAt WHERE userId = :userId")
    suspend fun updateSyncStatus(userId: String, syncStatus: com.storysphere.storyreader.model.SyncStatus, lastSyncedAt: Long?)
}

