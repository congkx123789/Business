package com.storysphere.storyreader.database.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.storysphere.storyreader.database.entity.WalletEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface WalletDao {
    @Query("SELECT * FROM wallet WHERE userId = :userId")
    fun getWallet(userId: String): Flow<WalletEntity?>
    
    @Query("SELECT * FROM wallet WHERE userId = :userId")
    suspend fun getWalletSync(userId: String): WalletEntity?
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertWallet(wallet: WalletEntity)
    
    @Query("UPDATE wallet SET balance = :balance, lastUpdatedAt = :lastUpdatedAt WHERE userId = :userId")
    suspend fun updateBalance(userId: String, balance: Int, lastUpdatedAt: Long)
}


