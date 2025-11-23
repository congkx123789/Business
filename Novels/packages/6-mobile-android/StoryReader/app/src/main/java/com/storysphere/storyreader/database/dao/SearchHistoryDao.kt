package com.storysphere.storyreader.database.dao

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.storysphere.storyreader.database.entity.SearchHistoryEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface SearchHistoryDao {
    @Query("SELECT * FROM search_history WHERE userId = :userId ORDER BY searchedAt DESC LIMIT :limit")
    fun observeHistory(userId: String, limit: Int): Flow<List<SearchHistoryEntity>>

    @Query("SELECT * FROM search_history WHERE userId = :userId ORDER BY searchedAt DESC LIMIT :limit")
    suspend fun getRecentQueries(userId: String, limit: Int): List<SearchHistoryEntity>

    @Query("SELECT * FROM search_history WHERE userId = :userId AND query = :query AND queryType = :queryType LIMIT 1")
    suspend fun findQuery(userId: String, query: String, queryType: String): SearchHistoryEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(entity: SearchHistoryEntity)

    @Query("UPDATE search_history SET searchedAt = :timestamp WHERE id = :id")
    suspend fun updateTimestamp(id: String, timestamp: Long)

    @Delete
    suspend fun delete(entity: SearchHistoryEntity)

    @Query("DELETE FROM search_history WHERE id = :id")
    suspend fun delete(id: String)

    @Query("DELETE FROM search_history WHERE userId = :userId")
    suspend fun deleteByUserId(userId: String)

    @Query("DELETE FROM search_history WHERE userId = :userId AND searchedAt < (SELECT searchedAt FROM search_history WHERE userId = :userId ORDER BY searchedAt DESC LIMIT 1 OFFSET :limit)")
    suspend fun trimHistory(userId: String, limit: Int)
}

