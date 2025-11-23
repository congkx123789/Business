package com.storysphere.storyreader.database.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.storysphere.storyreader.database.entity.StoryEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface StoryDao {
    @Query("SELECT * FROM stories WHERE id = :id")
    suspend fun getStory(id: String): StoryEntity?
    
    @Query("SELECT * FROM stories WHERE id = :id")
    fun getStoryFlow(id: String): Flow<StoryEntity?>
    
    @Query("SELECT * FROM stories ORDER BY updatedAt DESC LIMIT :limit OFFSET :offset")
    fun getStories(limit: Int = 20, offset: Int = 0): Flow<List<StoryEntity>>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertStory(story: StoryEntity)
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertStories(stories: List<StoryEntity>)
    
    @Query("DELETE FROM stories WHERE id = :id")
    suspend fun deleteStory(id: String)
    
    // Discovery & Rankings
    @Query("SELECT * FROM stories WHERE genre = :genre ORDER BY updatedAt DESC LIMIT :limit OFFSET :offset")
    fun getStoriesByGenre(genre: String, limit: Int = 20, offset: Int = 0): Flow<List<StoryEntity>>
    
    @Query("SELECT * FROM stories WHERE isEditorPick = 1 AND (:genre IS NULL OR genre = :genre) ORDER BY updatedAt DESC LIMIT :limit")
    fun getEditorPicks(limit: Int = 20, genre: String? = null): Flow<List<StoryEntity>>
    
    @Query("SELECT * FROM stories WHERE rankingType = :rankingType AND (:genre IS NULL OR genre = :genre) AND (:timeRange IS NULL OR timeRange = :timeRange) ORDER BY rankingPosition ASC LIMIT 50")
    fun getRankings(rankingType: String, genre: String? = null, timeRange: String? = null): Flow<List<StoryEntity>>
    
    // Recommendations
    @Query("SELECT * FROM stories WHERE isRecommended = 1 AND userId = :userId ORDER BY recommendationScore DESC LIMIT :limit")
    fun getRecommendations(userId: String, limit: Int = 20): Flow<List<StoryEntity>>
    
    @Query("SELECT * FROM stories WHERE similarToStoryId = :storyId ORDER BY similarityScore DESC LIMIT :limit")
    fun getSimilarStories(storyId: String, limit: Int = 10): Flow<List<StoryEntity>>
    
    @Query("SELECT * FROM stories WHERE isTrending = 1 ORDER BY trendingScore DESC LIMIT :limit")
    fun getTrending(limit: Int = 20): Flow<List<StoryEntity>>
    
    // Search
    @Query("SELECT * FROM stories WHERE title LIKE '%' || :query || '%' OR author LIKE '%' || :query || '%' OR description LIKE '%' || :query || '%' ORDER BY updatedAt DESC LIMIT 50")
    suspend fun searchStories(query: String): List<StoryEntity>
}

