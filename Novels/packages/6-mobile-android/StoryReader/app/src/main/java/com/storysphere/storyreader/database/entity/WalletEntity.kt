package com.storysphere.storyreader.database.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "wallet")
data class WalletEntity(
    @PrimaryKey val userId: String,
    val balance: Int = 0,
    val currency: Currency = Currency.POINTS,
    val lastUpdatedAt: Long = System.currentTimeMillis()
)

enum class Currency {
    POINTS,
    COINS
}


