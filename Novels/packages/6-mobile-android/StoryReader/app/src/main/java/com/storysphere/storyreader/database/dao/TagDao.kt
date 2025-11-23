package com.storysphere.storyreader.database.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.storysphere.storyreader.database.entity.TagEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface TagDao {
    @Query("SELECT * FROM tags WHERE userId = :userId ORDER BY `order` ASC, name ASC")
    fun getTags(userId: String): Flow<List<TagEntity>>
    
    @Query("SELECT * FROM tags WHERE userId = :userId AND parentId IS NULL ORDER BY `order` ASC, name ASC")
    fun getRootTags(userId: String): Flow<List<TagEntity>>
    
    @Query("SELECT * FROM tags WHERE userId = :userId AND parentId = :parentId ORDER BY `order` ASC, name ASC")
    fun getChildTags(userId: String, parentId: String): Flow<List<TagEntity>>
    
    @Query("SELECT * FROM tags WHERE id = :id")
    suspend fun getTag(id: String): TagEntity?
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTag(tag: TagEntity)
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTags(tags: List<TagEntity>)
    
    @Query("DELETE FROM tags WHERE id = :id")
    suspend fun deleteTag(id: String)
}

