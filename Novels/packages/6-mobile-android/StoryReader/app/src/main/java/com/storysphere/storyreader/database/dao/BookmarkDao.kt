package com.storysphere.storyreader.database.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.storysphere.storyreader.database.entity.BookmarkEntity
import com.storysphere.storyreader.model.SyncStatus
import kotlinx.coroutines.flow.Flow

@Dao
interface BookmarkDao {
    @Query("SELECT * FROM bookmarks WHERE userId = :userId AND (:storyId IS NULL OR storyId = :storyId) ORDER BY createdAt DESC")
    fun getBookmarks(userId: String, storyId: String? = null): Flow<List<BookmarkEntity>>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertBookmark(bookmark: BookmarkEntity)
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertBookmarks(bookmarks: List<BookmarkEntity>)
    
    @Query("DELETE FROM bookmarks WHERE id = :id")
    suspend fun deleteBookmark(id: String)

    @Query("SELECT * FROM bookmarks WHERE userId = :userId AND syncStatus = :syncStatus")
    suspend fun getBookmarksByStatus(
        userId: String,
        syncStatus: SyncStatus = SyncStatus.PENDING
    ): List<BookmarkEntity>
}

