package com.storysphere.storyreader.database.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.storysphere.storyreader.database.entity.BookshelfEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface BookshelfDao {
    @Query("SELECT * FROM bookshelves WHERE userId = :userId ORDER BY `order` ASC, createdAt DESC")
    fun getBookshelves(userId: String): Flow<List<BookshelfEntity>>
    
    @Query("SELECT * FROM bookshelves WHERE id = :id")
    suspend fun getBookshelf(id: String): BookshelfEntity?
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertBookshelf(bookshelf: BookshelfEntity)
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertBookshelves(bookshelves: List<BookshelfEntity>)
    
    @Query("DELETE FROM bookshelves WHERE id = :id")
    suspend fun deleteBookshelf(id: String)
    
    @Query("UPDATE bookshelves SET storyIds = :storyIds, updatedAt = :updatedAt WHERE id = :id")
    suspend fun updateStoryIds(id: String, storyIds: List<String>, updatedAt: Long)
}

