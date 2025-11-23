package com.storysphere.storyreader.database.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.storysphere.storyreader.database.entity.ReadingStatsEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface ReadingStatsDao {
    @Query("SELECT * FROM reading_stats WHERE userId = :userId LIMIT 1")
    fun observeStats(userId: String): Flow<ReadingStatsEntity?>

    @Query("SELECT * FROM reading_stats WHERE userId = :userId LIMIT 1")
    suspend fun getStats(userId: String): ReadingStatsEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdate(entity: ReadingStatsEntity)

    @Query("DELETE FROM reading_stats WHERE userId = :userId")
    suspend fun deleteByUserId(userId: String)
}

