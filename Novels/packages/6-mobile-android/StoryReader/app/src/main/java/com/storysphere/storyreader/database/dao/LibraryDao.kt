package com.storysphere.storyreader.database.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.storysphere.storyreader.database.entity.LibraryEntity
import com.storysphere.storyreader.model.SyncStatus
import kotlinx.coroutines.flow.Flow

@Dao
interface LibraryDao {
    @Query("SELECT * FROM library WHERE userId = :userId ORDER BY lastReadAt DESC, addedAt DESC")
    fun getLibrary(userId: String): Flow<List<LibraryEntity>>
    
    @Query("SELECT * FROM library WHERE userId = :userId AND storyId = :storyId")
    suspend fun getLibraryItem(userId: String, storyId: String): LibraryEntity?
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertLibraryItem(item: LibraryEntity)
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertLibraryItems(items: List<LibraryEntity>)
    
    @Query("DELETE FROM library WHERE userId = :userId AND storyId = :storyId")
    suspend fun deleteLibraryItem(userId: String, storyId: String)
    
    @Query("UPDATE library SET lastReadAt = :lastReadAt WHERE userId = :userId AND storyId = :storyId")
    suspend fun updateLastReadAt(userId: String, storyId: String, lastReadAt: Long)
    
    @Query("UPDATE library SET isFavorite = :isFavorite WHERE userId = :userId AND storyId = :storyId")
    suspend fun updateFavorite(userId: String, storyId: String, isFavorite: Boolean)

    @Query("SELECT * FROM library WHERE userId = :userId AND syncStatus = :syncStatus")
    suspend fun getLibraryByStatus(
        userId: String,
        syncStatus: SyncStatus = SyncStatus.PENDING
    ): List<LibraryEntity>
    
    @Query("SELECT * FROM library WHERE userId = :userId AND isFavorite = 1 ORDER BY addedAt DESC")
    fun getWishlist(userId: String): Flow<List<LibraryEntity>>
}

