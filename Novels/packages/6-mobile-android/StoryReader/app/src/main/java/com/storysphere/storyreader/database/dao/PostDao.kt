package com.storysphere.storyreader.database.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.storysphere.storyreader.database.entity.PostEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface PostDao {
    @Query("SELECT * FROM posts WHERE userId = :userId OR userId IN (SELECT followingId FROM follows WHERE followerId = :userId) ORDER BY createdAt DESC LIMIT :limit")
    fun getFeed(userId: String, limit: Int): Flow<List<PostEntity>>
    
    @Query("SELECT * FROM posts WHERE id = :id")
    suspend fun getPost(id: String): PostEntity?
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPost(post: PostEntity)
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPosts(posts: List<PostEntity>)
    
    @Query("DELETE FROM posts WHERE id = :id")
    suspend fun deletePost(id: String)
}

