package com.storysphere.storyreader.database.dao

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.storysphere.storyreader.database.entity.FilterPresetEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface FilterPresetDao {
    @Query("SELECT * FROM filter_presets WHERE userId = :userId ORDER BY lastUsedAt DESC")
    fun observePresets(userId: String): Flow<List<FilterPresetEntity>>

    @Query("SELECT * FROM filter_presets WHERE id = :id LIMIT 1")
    suspend fun findById(id: String): FilterPresetEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(entity: FilterPresetEntity)

    @Update
    suspend fun update(entity: FilterPresetEntity)

    @Query("UPDATE filter_presets SET lastUsedAt = :timestamp WHERE id = :id")
    suspend fun updateLastUsed(id: String, timestamp: Long)

    @Delete
    suspend fun delete(entity: FilterPresetEntity)

    @Query("DELETE FROM filter_presets WHERE id = :id")
    suspend fun delete(id: String)
}

