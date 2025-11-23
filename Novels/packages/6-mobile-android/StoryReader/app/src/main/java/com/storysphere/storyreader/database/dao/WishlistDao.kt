package com.storysphere.storyreader.database.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.storysphere.storyreader.database.entity.WishlistEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface WishlistDao {
    @Query("SELECT * FROM wishlist WHERE userId = :userId ORDER BY addedAt DESC")
    fun getWishlist(userId: String): Flow<List<WishlistEntity>>

    @Query("SELECT * FROM wishlist WHERE userId = :userId AND storyId = :storyId")
    suspend fun getWishlistItem(userId: String, storyId: String): WishlistEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertWishlist(wishlist: WishlistEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertWishlist(wishlist: List<WishlistEntity>)

    @Query("DELETE FROM wishlist WHERE userId = :userId AND storyId = :storyId")
    suspend fun deleteWishlist(userId: String, storyId: String)

    @Query("SELECT * FROM wishlist WHERE syncStatus = :status")
    suspend fun getWishlistByStatus(status: com.storysphere.storyreader.model.SyncStatus): List<WishlistEntity>
}

